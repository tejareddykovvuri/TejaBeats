import { writable, derived } from 'svelte/store';

// Helper to safely load from localStorage in browser
function loadLocalStorage(key, fallback) {
	if (typeof window === 'undefined') return fallback;
	try {
		const val = localStorage.getItem(key);
		return val ? JSON.parse(val) : fallback;
	} catch (e) {
		console.warn(`Error reading localStorage ${key}:`, e);
		return fallback;
	}
}

// Helper to safely write to localStorage
function saveLocalStorage(key, val) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(val));
	} catch (e) {
		console.warn(`Error writing localStorage ${key}:`, e);
	}
}

// Player state stores (matching BloomeePlayerCubit / MiniPlayerCubit)
export const currentTrack = writable(null);
export const isPlaying = writable(false);
export const isLoadingAudio = writable(false);
export const currentTime = writable(0);
export const duration = writable(0);
export const buffered = writable(0);
export const volume = writable(loadLocalStorage('tejabeats_volume', 0.85));
export const isMuted = writable(loadLocalStorage('tejabeats_muted', false));

export const queue = writable(loadLocalStorage('tejabeats_queue', []));
export const queueIndex = writable(-1);
export const shuffle = writable(loadLocalStorage('tejabeats_shuffle', false));
export const repeat = writable(loadLocalStorage('tejabeats_repeat', 'off')); // 'off' | 'all' | 'one'

export const likedTracks = writable(loadLocalStorage('tejabeats_liked', []));
export const recentlyPlayed = writable(loadLocalStorage('tejabeats_recents', []));

export const notification = writable(null);

// Derived progress percentage (0 - 100)
export const progress = derived([currentTime, duration], ([$cur, $dur]) => {
	if (!$dur || $dur <= 0) return 0;
	return Math.min(100, Math.max(0, ($cur / $dur) * 100));
});

// Sync persistable stores to localStorage
if (typeof window !== 'undefined') {
	volume.subscribe((val) => saveLocalStorage('tejabeats_volume', val));
	isMuted.subscribe((val) => saveLocalStorage('tejabeats_muted', val));
	shuffle.subscribe((val) => saveLocalStorage('tejabeats_shuffle', val));
	repeat.subscribe((val) => saveLocalStorage('tejabeats_repeat', val));
	likedTracks.subscribe((val) => saveLocalStorage('tejabeats_liked', val));
	recentlyPlayed.subscribe((val) => saveLocalStorage('tejabeats_recents', val));
	queue.subscribe((val) => saveLocalStorage('tejabeats_queue', val));
}

/**
 * Trigger a toast notification (matching SnackbarService).
 */
export function showNotification(message, type = 'info', timeout = 3000) {
	const id = Date.now();
	notification.set({ message, type, id });
	setTimeout(() => {
		notification.update((curr) => (curr?.id === id ? null : curr));
	}, timeout);
}

export const showToast = showNotification;

/**
 * Toggle favorite / liked status (matching PlaylistDAO liked operations).
 */
export function toggleLike(track) {
	if (!track || !track.id) return;
	likedTracks.update((items) => {
		const exists = items.some((t) => String(t.id) === String(track.id));
		let updated;
		if (exists) {
			updated = items.filter((t) => String(t.id) !== String(track.id));
			showNotification(`Removed "${track.title}" from Liked Songs`, 'info');
		} else {
			updated = [track, ...items];
			showNotification(`Added "${track.title}" to Liked Songs`, 'success');
		}
		return updated;
	});
}

/**
 * Add a track to Recently Played (matching HistoryDAO, max 50).
 */
export function recordRecentTrack(track) {
	if (!track || !track.id) return;
	recentlyPlayed.update((items) => {
		const filtered = items.filter((t) => t.id !== track.id);
		return [track, ...filtered].slice(0, 50);
	});
}

/**
 * Add track to the end of the Up Next queue.
 */
export function addToQueue(track) {
	if (!track || !track.id) return;
	queue.update((items) => {
		const exists = items.some((t) => t.id === track.id);
		if (exists) {
			showNotification(`"${track.title}" is already in queue`, 'info');
			return items;
		}
		showNotification(`Added "${track.title}" to Up Next`, 'success');
		return [...items, track];
	});
}

/**
 * Play a track next (matching Up Next panel behavior).
 */
export function playNextInQueue(track) {
	if (!track || !track.id) return;
	queue.update((items) => {
		let curIdx = -1;
		queueIndex.subscribe((i) => (curIdx = i))();
		const without = items.filter((t) => t.id !== track.id);
		const insertAt = curIdx >= 0 ? curIdx + 1 : 0;
		without.splice(insertAt, 0, track);
		showNotification(`"${track.title}" will play next`, 'success');
		return without;
	});
}

/**
 * Remove track from queue by id.
 */
export function removeFromQueue(id) {
	queue.update((items) => items.filter((t) => t.id !== id));
}

/**
 * Clear queue completely.
 */
export function clearQueue() {
	queue.set([]);
	queueIndex.set(-1);
	showNotification('Queue cleared', 'info');
}
