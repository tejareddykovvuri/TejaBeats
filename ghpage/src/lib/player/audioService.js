import {
	currentTrack,
	isPlaying,
	isLoadingAudio,
	currentTime,
	duration,
	buffered,
	volume,
	isMuted,
	queue,
	queueIndex,
	shuffle,
	repeat,
	recordRecentTrack,
	showNotification
} from './playerStore.js';

/**
 * AudioPlayerService — matches BloomeeMusicPlayer from the EXE.
 * Wraps HTML5 Audio with queue management, shuffle, repeat, seek, volume,
 * fallback stream URLs, and Media Session API integration.
 */
class AudioPlayerService {
	constructor() {
		this.audio = null;
		this.isInitialized = false;
		this.hasTriedFallback = false;
	}

	init() {
		if (typeof window === 'undefined' || this.isInitialized) return;

		this.audio = new Audio();
		this.audio.preload = 'auto';

		// Sync initial volume
		let currentVol = 0.85;
		let currentMute = false;
		volume.subscribe((v) => {
			currentVol = v;
			if (this.audio && !currentMute) this.audio.volume = v;
		});
		isMuted.subscribe((m) => {
			currentMute = m;
			if (this.audio) this.audio.muted = m;
		});

		// Attach audio event listeners
		this.audio.addEventListener('play', () => {
			isPlaying.set(true);
			isLoadingAudio.set(false);
		});

		this.audio.addEventListener('pause', () => {
			isPlaying.set(false);
		});

		this.audio.addEventListener('waiting', () => {
			isLoadingAudio.set(true);
		});

		this.audio.addEventListener('playing', () => {
			isLoadingAudio.set(false);
			isPlaying.set(true);
		});

		this.audio.addEventListener('timeupdate', () => {
			if (this.audio) {
				currentTime.set(this.audio.currentTime);
				this.updateBuffered();
			}
		});

		this.audio.addEventListener('durationchange', () => {
			if (this.audio && !isNaN(this.audio.duration)) {
				duration.set(this.audio.duration);
			}
		});

		this.audio.addEventListener('loadedmetadata', () => {
			if (this.audio && !isNaN(this.audio.duration)) {
				duration.set(this.audio.duration);
			}
			isLoadingAudio.set(false);
		});

		this.audio.addEventListener('ended', () => {
			this.handleTrackEnded();
		});

		this.audio.addEventListener('error', (e) => {
			console.error('Audio playback error:', e, this.audio?.error);
			isLoadingAudio.set(false);
			this.handlePlaybackError();
		});

		this.isInitialized = true;
	}

	updateBuffered() {
		if (!this.audio || !this.audio.buffered || this.audio.buffered.length === 0) return;
		const dur = this.audio.duration;
		if (!dur || isNaN(dur)) return;

		try {
			const end = this.audio.buffered.end(this.audio.buffered.length - 1);
			buffered.set(Math.min(100, (end / dur) * 100));
		} catch (e) {
			// ignore range errors during fast seeks
		}
	}

	/**
	 * Play a track. If it's already current, toggle playback.
	 * If it's new, set audio src and begin playback.
	 */
	async playTrack(track, newQueueList = null, indexInQueue = -1) {
		this.init();

		if (!track) return;

		let activeStreamUrl = track.streamUrl;
		if (!activeStreamUrl && track.id) {
			isLoadingAudio.set(true);
			try {
				const res = await fetch(`/api/resolve?id=${encodeURIComponent(track.id)}`);
				const json = await res.json();
				if (json.success && json.track?.streamUrl) {
					activeStreamUrl = json.track.streamUrl;
					track.streamUrl = activeStreamUrl;
					track.fallbackStreamUrl = json.track.fallbackStreamUrl;
				}
			} catch (err) {
				console.warn('On-demand stream resolution error:', err);
			}
		}

		if (!track || !activeStreamUrl) {
			showNotification('Unable to play: Missing stream source', 'error');
			isLoadingAudio.set(false);
			return;
		}

		let activeTrack = null;
		currentTrack.subscribe((t) => (activeTrack = t))();

		// If clicking the same track, just resume if paused
		if (activeTrack && activeTrack.id === track.id && this.audio?.src) {
			if (this.audio.paused) {
				try {
					await this.audio.play();
				} catch (err) {
					console.warn('Playback resume failed:', err);
				}
			}
			return;
		}

		// Update queue if provided
		if (newQueueList && Array.isArray(newQueueList)) {
			queue.set(newQueueList);
			queueIndex.set(indexInQueue >= 0 ? indexInQueue : 0);
		} else {
			// If playing an individual song not in queue, ensure queue contains it
			let currentQueue = [];
			queue.subscribe((q) => (currentQueue = q))();
			const existingIdx = currentQueue.findIndex((t) => t.id === track.id);
			if (existingIdx >= 0) {
				queueIndex.set(existingIdx);
			} else {
				queue.set([track, ...currentQueue]);
				queueIndex.set(0);
			}
		}

		this.hasTriedFallback = false;
		currentTrack.set(track);
		recordRecentTrack(track);
		isLoadingAudio.set(true);
		currentTime.set(0);
		duration.set(track.duration || 0);

		try {
			this.audio.pause();
			this.audio.src = activeStreamUrl;
			this.audio.load();
			await this.audio.play();
			this.updateMediaSession(track);
		} catch (err) {
			console.warn('Initial audio.play() failed:', err);
			this.handlePlaybackError(err);
		}
	}

	async togglePlayPause() {
		this.init();
		if (!this.audio || !this.audio.src) {
			// If no current track, try playing first track in queue
			let q = [];
			queue.subscribe((items) => (q = items))();
			if (q.length > 0) {
				this.playTrack(q[0], q, 0);
			}
			return;
		}

		if (this.audio.paused) {
			try {
				await this.audio.play();
			} catch (err) {
				console.error('Failed to resume playback:', err);
				showNotification('Playback error: Click anywhere on page and try again', 'error');
			}
		} else {
			this.audio.pause();
		}
	}

	seek(timeInSeconds) {
		if (!this.audio || isNaN(timeInSeconds)) return;
		try {
			const target = Math.max(0, Math.min(timeInSeconds, this.audio.duration || timeInSeconds));
			this.audio.currentTime = target;
			currentTime.set(target);
		} catch (e) {
			console.warn('Seek error:', e);
		}
	}

	setVolume(newVol) {
		const clamped = Math.max(0, Math.min(1, newVol));
		volume.set(clamped);
		if (this.audio) {
			this.audio.volume = clamped;
			if (clamped > 0 && this.audio.muted) {
				this.toggleMute();
			}
		}
	}

	toggleMute() {
		isMuted.update((muted) => {
			const next = !muted;
			if (this.audio) this.audio.muted = next;
			return next;
		});
	}

	toggleShuffle() {
		shuffle.update((s) => {
			const next = !s;
			showNotification(next ? 'Shuffle turned ON' : 'Shuffle turned OFF', 'info');
			return next;
		});
	}

	cycleRepeat() {
		repeat.update((r) => {
			let next = 'off';
			if (r === 'off') next = 'all';
			else if (r === 'all') next = 'one';
			else next = 'off';

			const label = next === 'all' ? 'Repeat ALL' : next === 'one' ? 'Repeat ONE' : 'Repeat OFF';
			showNotification(label, 'info');
			return next;
		});
	}

	async nextTrack() {
		let q = [];
		let idx = 0;
		let isShuffled = false;
		let rep = 'off';

		queue.subscribe((items) => (q = items))();
		queueIndex.subscribe((i) => (idx = i))();
		shuffle.subscribe((s) => (isShuffled = s))();
		repeat.subscribe((r) => (rep = r))();

		if (q.length === 0) return;

		let nextIdx = idx + 1;
		if (isShuffled) {
			if (q.length > 1) {
				do {
					nextIdx = Math.floor(Math.random() * q.length);
				} while (nextIdx === idx);
			} else {
				nextIdx = 0;
			}
		}

		if (nextIdx >= q.length) {
			if (rep === 'all' || rep === 'one') {
				nextIdx = 0;
			} else {
				showNotification('End of queue reached', 'info');
				return;
			}
		}

		queueIndex.set(nextIdx);
		await this.playTrack(q[nextIdx], q, nextIdx);
	}

	async previousTrack() {
		if (this.audio && this.audio.currentTime > 3) {
			this.seek(0);
			return;
		}

		let q = [];
		let idx = 0;
		queue.subscribe((items) => (q = items))();
		queueIndex.subscribe((i) => (idx = i))();

		if (q.length === 0) return;

		let prevIdx = idx - 1;
		if (prevIdx < 0) {
			prevIdx = q.length - 1;
		}

		queueIndex.set(prevIdx);
		await this.playTrack(q[prevIdx], q, prevIdx);
	}

	handleTrackEnded() {
		let rep = 'off';
		repeat.subscribe((r) => (rep = r))();

		if (rep === 'one') {
			this.seek(0);
			this.audio?.play();
			return;
		}

		this.nextTrack();
	}

	async handlePlaybackError(err = null) {
		let track = null;
		currentTrack.subscribe((t) => (track = t))();

		if (!track) return;

		// Try re-resolving via API first (handles expired CDN URLs)
		if (!this.hasTriedFallback && track.id) {
			console.log('Attempting to re-resolve stream for:', track.title);
			this.hasTriedFallback = true;
			try {
				const res = await fetch(`/api/resolve?id=${encodeURIComponent(track.id)}`);
				const json = await res.json();
				if (json.success && json.track?.streamUrl) {
					track.streamUrl = json.track.streamUrl;
					track.fallbackStreamUrl = json.track.fallbackStreamUrl;
					currentTrack.set(track);
					this.audio.src = json.track.streamUrl;
					this.audio.load();
					await this.audio.play();
					return;
				}
			} catch (resolveErr) {
				console.warn('Re-resolve failed:', resolveErr);
			}
		}

		// Try fallback stream URL
		if (track.fallbackStreamUrl && track.fallbackStreamUrl !== this.audio?.src) {
			console.log('Attempting fallback audio stream for:', track.title);
			this.audio.src = track.fallbackStreamUrl;
			this.audio.load();
			this.audio.play().catch((e) => {
				console.error('Fallback audio stream also failed:', e);
				showNotification(`Playback error: "${track.title}" is unavailable right now`, 'error');
			});
			return;
		}

		showNotification(`Unable to play "${track.title}". Please try another song.`, 'error');
	}

	updateMediaSession(track) {
		if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.title,
			artist: track.artist,
			album: track.album || 'TejaBeats',
			artwork: [
				{ src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
				{ src: track.artwork, sizes: '128x128', type: 'image/jpeg' },
				{ src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
				{ src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
			]
		});

		navigator.mediaSession.setActionHandler('play', () => this.togglePlayPause());
		navigator.mediaSession.setActionHandler('pause', () => this.togglePlayPause());
		navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
		navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
		navigator.mediaSession.setActionHandler('seekto', (details) => {
			if (details.seekTime != null) this.seek(details.seekTime);
		});
	}
}

export const audioPlayer = new AudioPlayerService();
