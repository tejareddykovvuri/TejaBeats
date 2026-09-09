<!-- TrackRow.svelte — Horizontal track row matching song_tile.dart -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { currentTrack, isPlaying, likedTracks, toggleLike, addToQueue, playNextInQueue } from '$lib/player/playerStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';

	export let track;
	export let allTracks = [];
	export let playlist = [];
	export let index = 0;

	const dispatch = createEventDispatcher();

	$: effectiveTracks = (allTracks && allTracks.length > 0) ? allTracks : (playlist && playlist.length > 0) ? playlist : (track ? [track] : []);
	$: isActive = $currentTrack?.id === track?.id;
	$: isLiked = $likedTracks.some((t) => t.id === track?.id);

	let showMenu = false;

	function handlePlay() {
		if (!track) return;
		audioPlayer.playTrack(track, effectiveTracks, index);
	}

	function formatDur(sec) {
		if (!sec) return '';
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handleImgError(e) {
		e.target.src = '/placeholder-artwork.svg';
	}
</script>

{#if track}
	<div
		class="flex items-center gap-3 py-2.5 px-3 rounded-2xl transition-all duration-200 group cursor-pointer select-none
			{isActive ? 'bg-gradient-to-r from-[#FF2D78]/15 via-white/[0.03] to-transparent border-l-4 border-[#FF2D78] shadow-sm' : 'hover:bg-white/[0.04] hover:translate-x-1 border-l-4 border-transparent'}"
		on:click={handlePlay}
		on:keydown={(e) => e.key === 'Enter' && handlePlay()}
		role="button"
		tabindex="0"
	>
		<!-- Index / Animated Equalizer Indicator -->
		<div class="w-7 text-center shrink-0 flex items-center justify-center">
			{#if isActive && $isPlaying}
				<div class="flex items-end justify-center gap-[2.5px] h-4">
					<div class="w-[2.5px] bg-[#FF2D78] rounded-full eq-bar-1"></div>
					<div class="w-[2.5px] bg-[#FF6B35] rounded-full eq-bar-2"></div>
					<div class="w-[2.5px] bg-[#FF2D78] rounded-full eq-bar-3"></div>
					<div class="w-[2.5px] bg-[#FF6B35] rounded-full eq-bar-4"></div>
				</div>
			{:else if isActive}
				<svg class="w-4 h-4 text-[#FF2D78] fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
			{:else}
				<span class="text-xs font-semibold text-[#6B7280] group-hover:hidden tabular-nums">{index + 1}</span>
				<svg class="w-4 h-4 text-white hidden group-hover:block transition-transform hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
			{/if}
		</div>

		<!-- Thumbnail with subtle border & zoom -->
		<div class="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#1E1E24] relative shadow-md">
			<img
				src={track.artwork || '/placeholder-artwork.svg'}
				alt={track.title}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				loading="lazy"
				on:error={handleImgError}
			/>
		</div>

		<!-- Title & Artist -->
		<div class="flex-1 min-w-0">
			<h4 class="text-[13.5px] font-semibold truncate transition-colors {isActive ? 'text-[#FF2D78] font-bold' : 'text-white group-hover:text-white/95'}">{track.title}</h4>
			<p class="text-[11.5px] text-[#9CA3AF] truncate mt-0.5">{track.artist || 'Unknown Artist'}</p>
		</div>

		<!-- Album (Desktop only) -->
		{#if track.album}
			<span class="text-[12px] text-[#6B7280] truncate max-w-[160px] hidden md:block shrink-0 px-2">{track.album}</span>
		{/if}

		<!-- Duration -->
		{#if track.durationFormatted || track.duration}
			<span class="text-[11px] font-medium text-[#6B7280] hidden sm:block shrink-0 tabular-nums">{track.durationFormatted || formatDur(track.duration)}</span>
		{/if}

		<!-- Like Button -->
		<button
			type="button"
			on:click|stopPropagation={() => toggleLike(track)}
			class="p-2 rounded-full transition-all cursor-pointer shrink-0 {isLiked ? 'text-[#FF2D78] animate-heart-pop' : 'text-[#6B7280] hover:text-[#FF2D78] hover:scale-110'}"
			title={isLiked ? 'Unlike' : 'Like'}
		>
			{#if isLiked}
				<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
			{:else}
				<svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
			{/if}
		</button>

		<!-- More Menu -->
		<div class="relative shrink-0">
			<button
				type="button"
				on:click|stopPropagation={() => (showMenu = !showMenu)}
				class="p-2 rounded-full text-[#6B7280] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
			>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
			</button>

			{#if showMenu}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="fixed inset-0 z-40" on:click|stopPropagation={() => (showMenu = false)} role="presentation"></div>
				<div class="absolute right-0 top-full mt-1 w-48 bg-[#1E1E24] border border-[#2A2A32] rounded-2xl shadow-2xl z-50 py-1.5 animate-scale-up">
					<button
						type="button"
						on:click|stopPropagation={() => { playNextInQueue(track); showMenu = false; }}
						class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F5F5F7] hover:bg-white/[0.08] transition-colors flex items-center gap-2.5 cursor-pointer"
					>
						<svg class="w-4 h-4 text-[#FF2D78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
						Play Next
					</button>
					<button
						type="button"
						on:click|stopPropagation={() => { addToQueue(track); showMenu = false; }}
						class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F5F5F7] hover:bg-white/[0.08] transition-colors flex items-center gap-2.5 cursor-pointer"
					>
						<svg class="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
						Add to Queue
					</button>
					<button
						type="button"
						on:click|stopPropagation={() => { dispatch('addToPlaylist', { track }); showMenu = false; }}
						class="w-full text-left px-4 py-2.5 text-[13px] font-medium text-[#F5F5F7] hover:bg-white/[0.08] transition-colors flex items-center gap-2.5 cursor-pointer"
					>
						<svg class="w-4 h-4 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
						Add to Playlist
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
