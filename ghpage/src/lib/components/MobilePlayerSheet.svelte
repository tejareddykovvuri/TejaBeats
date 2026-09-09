<!-- MobilePlayerSheet.svelte — Player screen matching media_1788883874374.png (Desktop) and media_1788883887560.png (Mobile) -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { currentTrack, isPlaying, isLoadingAudio, currentTime, duration, progress, volume, isMuted, shuffle, repeat, likedTracks, toggleLike, queue, queueIndex, showToast } from '$lib/player/playerStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';
	import tejabeatsLogo from '$lib/assets/tejabeats_logo.png';

	export let isOpen = false;
	export let activeTab = 'player'; // 'player' | 'lyrics' | 'queue'

	const dispatch = createEventDispatcher();

	$: isLiked = $likedTracks.some((t) => String(t.id) === String($currentTrack?.id));
	$: seekPercent = $duration > 0 ? Math.min(100, Math.max(0, ($currentTime / $duration) * 100)) : 0;
	$: volPercent = ($isMuted ? 0 : $volume) * 100;

	let lyrics = [];
	let lyricsLoading = false;

	async function fetchLyrics(track) {
		if (!track?.id) return;
		lyricsLoading = true;
		try {
			const res = await fetch(`/api/lyrics?id=${encodeURIComponent(track.id)}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`);
			const data = await res.json();
			if (data && data.lyrics && data.lyrics.length > 0) {
				lyrics = data.lyrics;
			} else {
				lyrics = ['No lyrics available for this song.'];
			}
		} catch (e) {
			lyrics = ['Failed to load lyrics.'];
		} finally {
			lyricsLoading = false;
		}
	}

	$: if (isOpen && $currentTrack) {
		fetchLyrics($currentTrack);
	}

	function formatTime(sec) {
		if (!sec || isNaN(sec)) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handleSeek(e) {
		const val = parseFloat(e.target.value);
		audioPlayer.seek(val);
	}

	function handleVolume(e) {
		audioPlayer.setVolume(parseFloat(e.target.value));
	}

	function handleImgError(e) {
		e.target.src = '/placeholder-artwork.svg';
	}
</script>

{#if isOpen && $currentTrack}
	<div class="fixed inset-0 z-[100] bg-[#0A0A0F] flex flex-col justify-between overflow-hidden animate-fade-slide select-none">
		<!-- Dynamic Background Ambient Glow -->
		<div
			class="absolute inset-0 opacity-20 blur-3xl pointer-events-none scale-150 transition-all duration-1000 bg-cover bg-center"
			style="background-image: url('{$currentTrack.artwork || '/placeholder-artwork.svg'}')"
		></div>
		<div class="absolute inset-0 bg-[#0A0A0F]/90 backdrop-blur-2xl pointer-events-none"></div>

		<!-- Window Title Bar (Desktop Only) -->
		<div class="hidden lg:flex items-center justify-between h-8 bg-transparent px-4 select-none z-20 shrink-0 border-b border-white/[0.04]">
			<div class="flex items-center gap-2">
				<img src={tejabeatsLogo} alt="TejaBeats" class="w-4 h-4 rounded-sm object-cover" />
				<span class="text-[12px] font-bold tracking-wider text-white/90" style="font-family: Unageo, sans-serif;">TejaBeats</span>
			</div>

			<!-- Center: Enjoying From -->
			<div class="text-center">
				<p class="text-[10px] text-[#8A8A93] uppercase font-bold tracking-wider">Enjoying From</p>
				<p class="text-[12px] font-bold text-white leading-none">{$currentTrack.album || 'TejaBeats'}</p>
			</div>

			<!-- Right: Window controls -->
			<div class="flex items-center">
				<button type="button" on:click={() => dispatch('close')} class="w-10 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
					<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M3.146 3.854a.5.5 0 0 1 .708 0L8 8l4.146-4.146a.5.5 0 0 1 .708.708L8.707 8.707l4.147 4.147a.5.5 0 0 1-.708.708L8 9.414l-4.146 4.147a.5.5 0 0 1-.708-.708L7.293 8.707 3.146 4.56a.5.5 0 0 1 0-.708z"/></svg>
				</button>
			</div>
		</div>

		<!-- Mobile Header (Visible only on mobile/tablet) -->
		<div class="lg:hidden relative z-10 flex items-center justify-between px-5 py-4 shrink-0">
			<button
				type="button"
				on:click={() => dispatch('close')}
				class="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/5 active:scale-95 transition-all cursor-pointer"
			>
				<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
			</button>

			<div class="text-center flex-1 px-3">
				<span class="text-[10px] font-bold tracking-[1.5px] text-[#9CA3AF] uppercase block">ENJOYING FROM</span>
				<span class="text-[13px] font-bold text-white truncate block">{$currentTrack.album || 'TejaBeats'}</span>
			</div>

			<!-- Mobile Tabs -->
			<div class="flex items-center gap-1 bg-white/10 rounded-full p-1">
				<button
					type="button"
					on:click={() => (activeTab = 'player')}
					class="px-2.5 py-1 text-[11px] font-bold rounded-full {activeTab === 'player' ? 'bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white shadow-sm' : 'text-[#9CA3AF]'}"
				>
					Song
				</button>
				<button
					type="button"
					on:click={() => (activeTab = 'lyrics')}
					class="px-2.5 py-1 text-[11px] font-bold rounded-full {activeTab === 'lyrics' ? 'bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white shadow-sm' : 'text-[#9CA3AF]'}"
				>
					Lyrics
				</button>
				<button
					type="button"
					on:click={() => (activeTab = 'queue')}
					class="px-2.5 py-1 text-[11px] font-bold rounded-full {activeTab === 'queue' ? 'bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white shadow-sm' : 'text-[#9CA3AF]'}"
				>
					Queue
				</button>
			</div>
		</div>

		<!-- Main Content Area: Two Columns on Desktop (media_1788883874374.png) -->
		<div class="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-4 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 max-w-7xl mx-auto w-full">
			<!-- LEFT COLUMN: Album Art, Info, Scrubber, Play Controls -->
			<div class="w-full max-w-[420px] flex flex-col justify-center">
				<!-- Down chevron button for desktop -->
				<div class="hidden lg:block mb-3">
					<button
						type="button"
						on:click={() => dispatch('close')}
						class="text-white/80 hover:text-white cursor-pointer"
						title="Collapse"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
					</button>
				</div>

				<!-- Large Square Artwork (Matching EXE: rounded-3xl, shadow, NO spindle hole) -->
				<div class="w-full aspect-square rounded-[26px] overflow-hidden bg-[#161622] shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-white/10 relative mx-auto mb-6">
					<img
						src={$currentTrack.artwork || '/placeholder-artwork.svg'}
						alt={$currentTrack.title}
						class="w-full h-full object-cover"
						on:error={handleImgError}
					/>
				</div>

				<!-- Track Title, Artist, Heart (Matching EXE screenshot) -->
				<div class="flex items-center justify-between mb-4">
					<div class="min-w-0 flex-1 pr-3">
						<h2 class="text-xl sm:text-2xl font-black text-white truncate tracking-tight">{$currentTrack.title}</h2>
						<p class="text-xs sm:text-sm font-semibold text-[#8A8A93] truncate mt-1">
							{$currentTrack.artist || 'Unknown Artist'}{#if $currentTrack.album}, {$currentTrack.album}{/if}
						</p>
					</div>

					<button
						type="button"
						on:click={() => toggleLike($currentTrack)}
						class="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer {isLiked ? 'text-[#FF2D78]' : 'text-white/60 hover:text-white'}"
					>
						<svg class="w-6 h-6 {isLiked ? 'fill-current' : 'fill-none stroke-current stroke-2'}" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
					</button>
				</div>

				<!-- Progress Slider (Pink Scrubber matching Image 2) -->
				<div class="mb-5">
					<div class="flex justify-between text-[11px] font-medium text-[#8A8A93] mb-1.5 tabular-nums">
						<span>{formatTime($currentTime)}</span>
						<span>{formatTime($duration)}</span>
					</div>
					<input
						type="range"
						min="0"
						max={$duration || 1}
						step="0.1"
						value={$currentTime}
						on:input={handleSeek}
						style="background: linear-gradient(to right, #FF2D78 0%, #FF2D78 {seekPercent}%, rgba(255,255,255,0.18) {seekPercent}%, rgba(255,255,255,0.18) 100%)"
						class="w-full h-1.5 rounded-lg cursor-pointer accent-[#FF2D78]"
					/>
				</div>

				<!-- Primary Player Controls Row (Timer, Prev, Vibrant Play/Pause, Next, Shuffle) -->
				<div class="flex items-center justify-between px-2 mb-6">
					<!-- Timer Icon -->
					<button
						type="button"
						on:click={() => dispatch('openTimer')}
						class="p-2 text-white/70 hover:text-white cursor-pointer hover:scale-110 transition-transform"
						title="Sleep Timer"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
					</button>

					<!-- Prev -->
					<button
						type="button"
						on:click={() => audioPlayer.previousTrack()}
						class="p-2 text-white active:scale-90 transition-transform cursor-pointer"
						title="Previous Track"
					>
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
					</button>

					<!-- Play / Pause Primary (TejaBeats Vibrant Magenta Gradient - Replaced Blue) -->
					<button
						type="button"
						on:click={() => audioPlayer.togglePlayPause()}
						class="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,45,120,0.6)] active:scale-95 transition-all cursor-pointer hover:scale-105"
						title={$isPlaying ? 'Pause' : 'Play'}
					>
						{#if $isLoadingAudio}
							<svg class="w-7 h-7 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
						{:else if $isPlaying}
							<svg class="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
						{:else}
							<svg class="w-7 h-7 fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
						{/if}
					</button>

					<!-- Next -->
					<button
						type="button"
						on:click={() => audioPlayer.nextTrack()}
						class="p-2 text-white active:scale-90 transition-transform cursor-pointer"
						title="Next Track"
					>
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
					</button>

					<!-- Shuffle -->
					<button
						type="button"
						on:click={() => audioPlayer.toggleShuffle()}
						class="p-2 transition-colors cursor-pointer {$shuffle ? 'text-[#FF2D78]' : 'text-white/70 hover:text-white'}"
						title="Shuffle"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
					</button>
				</div>

				<!-- Secondary Controls Row (Repeat, Lyrics, Equalizer, Share) -->
				<div class="flex items-center justify-around px-4 text-[#8A8A93]">
					<!-- Repeat Button -->
					<button
						type="button"
						on:click={() => audioPlayer.cycleRepeat()}
						class="p-2 hover:text-white cursor-pointer hover:scale-110 transition-all {$repeat !== 'off' ? 'text-[#FF2D78]' : ''}"
						title="Repeat ({$repeat})"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
					</button>

					<!-- Lyrics Toggle Button -->
					<button
						type="button"
						on:click={() => (activeTab = activeTab === 'lyrics' ? 'queue' : 'lyrics')}
						class="p-2 hover:text-white cursor-pointer hover:scale-110 transition-all {activeTab === 'lyrics' ? 'text-[#FF2D78]' : ''}"
						title="Toggle Lyrics"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
					</button>

					<!-- Equalizer Button -->
					<button
						type="button"
						on:click={() => showToast('Audio Equalizer Profile Active')}
						class="p-2 hover:text-white cursor-pointer hover:scale-110 transition-all"
						title="Equalizer"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
					</button>

					<!-- Share / Copy Link Button -->
					<button
						type="button"
						on:click={() => {
							if (navigator.clipboard) {
								navigator.clipboard.writeText(window.location.href);
								showToast('Copied song link to clipboard');
							}
						}}
						class="p-2 hover:text-white cursor-pointer hover:scale-110 transition-all"
						title="Share Track"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
					</button>
				</div>
			</div>

			<!-- RIGHT COLUMN: Up Next Queue or Lyrics (Premium Glassmorphic Card) -->
			<div class="hidden lg:flex flex-col w-[480px] h-[580px] bg-[#121018]/90 backdrop-blur-2xl rounded-[28px] border border-white/[0.08] p-6 shadow-2xl relative">
				<!-- Segmented Switcher Header: Up Next / Lyrics -->
				<div class="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-3 shrink-0">
					<div class="flex items-center gap-1.5 p-1 bg-white/[0.06] rounded-xl border border-white/[0.06]">
						<button
							type="button"
							on:click={() => (activeTab = 'queue')}
							class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {activeTab === 'queue' ? 'bg-[#FF2D78] text-white shadow-md shadow-[#FF2D78]/30' : 'text-[#8A8A93] hover:text-white'}"
						>
							Up Next ({$queue.length})
						</button>
						<button
							type="button"
							on:click={() => (activeTab = 'lyrics')}
							class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {activeTab === 'lyrics' ? 'bg-[#FF2D78] text-white shadow-md shadow-[#FF2D78]/30' : 'text-[#8A8A93] hover:text-white'}"
						>
							Lyrics
						</button>
					</div>

					{#if activeTab === 'queue'}
						<button
							type="button"
							on:click={() => audioPlayer.clearQueue()}
							class="flex items-center gap-1 text-xs text-[#8A8A93] hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5"
						>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
							Clear
						</button>
					{/if}
				</div>

				{#if activeTab === 'lyrics'}
					<!-- Lyrics View with Smooth Typography -->
					<div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 py-3 text-center">
						{#if lyricsLoading}
							<div class="py-24 flex flex-col items-center justify-center gap-3 text-[#9CA3AF]">
								<svg class="w-7 h-7 animate-spin text-[#FF2D78]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
								<span class="text-xs">Loading lyrics...</span>
							</div>
						{:else if lyrics && lyrics.length > 0}
							<div class="space-y-3.5 py-4">
								{#each lyrics as line}
									<p class="text-base sm:text-lg font-medium text-white/80 hover:text-white hover:scale-105 transition-all cursor-default leading-relaxed">
										{line}
									</p>
								{/each}
							</div>
						{:else}
							<div class="py-24 text-[#8A8A93] text-sm">
								No lyrics found for this track.
							</div>
						{/if}
					</div>
				{:else}
					<!-- Up Next Queue Track List (Premium Style) -->
					<div class="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
						{#each $queue as track, idx}
							{@const isCurrent = $currentTrack?.id === track.id}
							<div
								on:click={() => audioPlayer.playQueueTrack(idx)}
								on:keydown={(e) => e.key === 'Enter' && audioPlayer.playQueueTrack(idx)}
								role="button"
								tabindex="0"
								class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer group relative {isCurrent ? 'bg-gradient-to-r from-[#FF2D78]/20 via-[#FF2D78]/5 to-transparent border border-[#FF2D78]/40 shadow-md' : 'hover:bg-white/[0.05] border border-transparent'}"
							>
								<div class="flex items-center gap-3 min-w-0 flex-1">
									<!-- Artwork -->
									<div class="w-11 h-11 rounded-xl overflow-hidden bg-[#20202C] shrink-0 border border-white/5 relative">
										<img src={track.artwork || '/placeholder-artwork.svg'} alt={track.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform" on:error={handleImgError} />
										{#if isCurrent && $isPlaying}
											<div class="absolute inset-0 bg-black/50 flex items-center justify-center">
												<div class="flex items-end gap-0.5 h-3">
													<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-1"></div>
													<div class="w-[2px] bg-[#FF6B35] rounded-full eq-bar-2"></div>
													<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-3"></div>
												</div>
											</div>
										{/if}
									</div>

									<!-- Title & Artist -->
									<div class="min-w-0 flex-1">
										<h4 class="text-[13.5px] font-bold truncate {isCurrent ? 'text-[#FF2D78]' : 'text-white group-hover:text-white'}">{track.title}</h4>
										<p class="text-[11.5px] text-[#8A8A93] truncate mt-0.5">{track.artist || 'Unknown Artist'}</p>
									</div>
								</div>

								<!-- Right Actions: Duration & Remove from Queue -->
								<div class="flex items-center gap-2 text-[#6B7280]">
									{#if track.duration}
										<span class="text-[11px] tabular-nums font-medium text-[#8A8A93]">{formatTime(track.duration)}</span>
									{/if}
									<button
										type="button"
										on:click|stopPropagation={() => audioPlayer.removeFromQueue(idx)}
										class="p-1 rounded-full hover:text-[#FF2D78] hover:bg-white/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
										title="Remove from queue"
									>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

