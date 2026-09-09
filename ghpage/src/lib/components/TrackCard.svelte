<!-- TrackCard.svelte — Vertical card matching square_card.dart / horizontal_card_view.dart -->
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

	function handlePlay(e) {
		if (!track) return;
		audioPlayer.playTrack(track, effectiveTracks, index);
	}

	function handleImgError(e) {
		e.target.src = '/placeholder-artwork.svg';
	}
</script>

{#if track}
	<div class="group relative text-left w-full select-none">
		<!-- Card Artwork Container with Vinyl Record Peek -->
		<div
			on:click={handlePlay}
			on:keydown={(e) => e.key === 'Enter' && handlePlay(e)}
			role="button"
			tabindex="0"
			class="relative rounded-2xl overflow-hidden teja-card mb-2.5 cursor-pointer {isActive ? 'border-[#FF2D78] shadow-[0_0_24px_rgba(255,45,120,0.4)]' : ''}"
		>
			<!-- Artwork Image with Zoom -->
			<div class="relative aspect-square overflow-hidden bg-[#1E1E24]">
				<img
					src={track.artwork || '/placeholder-artwork.svg'}
					alt={track.title}
					class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
					loading="lazy"
					on:error={handleImgError}
				/>

				<!-- Subtle vinyl groove ring background on hover -->
				<div class="absolute -right-8 top-1/2 -translate-y-1/2 w-28 h-28 vinyl-disc opacity-0 group-hover:opacity-40 transition-all duration-500 pointer-events-none group-hover:translate-x-2"></div>

				<!-- Ambient glow behind image -->
				{#if isActive}
					<div class="absolute inset-0 bg-gradient-to-t from-[#FF2D78]/40 via-transparent to-transparent"></div>
				{/if}
			</div>

			<!-- Playing / Hover Overlay -->
			<div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
				{#if isActive && $isPlaying}
					<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] flex items-center justify-center shadow-xl animate-pulse-glow">
						<div class="flex items-end gap-[3px] h-4">
							<div class="w-[3px] bg-white rounded-full eq-bar-1"></div>
							<div class="w-[3px] bg-white rounded-full eq-bar-2"></div>
							<div class="w-[3px] bg-white rounded-full eq-bar-3"></div>
							<div class="w-[3px] bg-white rounded-full eq-bar-4"></div>
						</div>
					</div>
				{:else if isActive}
					<div class="w-11 h-11 rounded-full bg-[#FF2D78] flex items-center justify-center shadow-lg">
						<svg class="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					</div>
				{:else}
					<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95">
						<svg class="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					</div>
				{/if}
			</div>

			<!-- Top Floating Like Button on Hover -->
			<button
				type="button"
				on:click|stopPropagation={() => toggleLike(track)}
				class="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-md transition-all duration-200 cursor-pointer {isLiked ? 'opacity-100 text-[#FF2D78] animate-heart-pop' : 'opacity-0 group-hover:opacity-100 text-white/80 hover:text-[#FF2D78]'}"
				title={isLiked ? 'Unlike' : 'Like'}
			>
				{#if isLiked}
					<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
				{:else}
					<svg class="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
				{/if}
			</button>
		</div>

		<!-- Title & Artist -->
		<div class="px-0.5">
			<h4
				on:click={handlePlay}
				on:keydown={(e) => e.key === 'Enter' && handlePlay(e)}
				role="button"
				tabindex="0"
				class="text-[13.5px] font-bold truncate leading-tight transition-colors cursor-pointer {isActive ? 'text-[#FF2D78]' : 'text-white group-hover:text-white/90'}"
				title={track.title}
			>
				{track.title}
			</h4>
			<p class="text-[11.5px] text-[#9CA3AF] truncate mt-1">{track.artist || 'Unknown Artist'}</p>
		</div>
	</div>
{/if}
