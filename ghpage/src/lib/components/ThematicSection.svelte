<!-- ThematicSection.svelte — Curated Horizontal Carousel matching Screenshots 2, 3, 4 -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { audioPlayer } from '$lib/player/audioService.js';
	import { currentTrack, isPlaying } from '$lib/player/playerStore.js';

	export let title = '';
	export let items = [];

	const dispatch = createEventDispatcher();
	let scrollContainer;

	function scroll(direction) {
		if (scrollContainer) {
			const scrollAmount = direction === 'left' ? -360 : 360;
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}

	function handleItemClick(item, idx) {
		if (item.streamUrl || item.duration || item.artist) {
			// It's a playable track or track-like object
			audioPlayer.playTrack(item, items, idx);
		} else if (item.type === 'album' || item.albumId) {
			dispatch('selectAlbum', { album: item });
		} else {
			dispatch('selectPlaylist', { playlist: item });
		}
	}

	function isItemPlaying(item) {
		return $isPlaying && $currentTrack && ($currentTrack.id === item.id || $currentTrack.title === item.title);
	}
</script>

{#if items && items.length > 0}
	<section class="space-y-3 relative group/section select-none">
		<!-- Section Header matching Screenshots 2, 3, 4 -->
		<div class="flex items-center justify-between px-1">
			<h3 class="text-base sm:text-lg font-bold text-[#FF2D78] flex items-center gap-2">
				<span>{title}</span>
			</h3>
		</div>

		<!-- Carousel with Floating Navigation Arrows -->
		<div class="relative">
			<!-- Left Arrow Button -->
			<button
				type="button"
				on:click={() => scroll('left')}
				class="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#141418]/90 hover:bg-[#1E1E24] text-white border border-[#2A2A32] flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
				aria-label="Scroll left"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
			</button>

			<!-- Right Arrow Button -->
			<button
				type="button"
				on:click={() => scroll('right')}
				class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#141418]/90 hover:bg-[#1E1E24] text-white border border-[#2A2A32] flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
				aria-label="Scroll right"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
			</button>

			<!-- Horizontal Items List -->
			<div
				bind:this={scrollContainer}
				class="flex items-start gap-4 overflow-x-auto pb-3 custom-scrollbar scroll-smooth"
			>
				{#each items as item, idx}
					<button
						type="button"
						on:click={() => handleItemClick(item, idx)}
						class="shrink-0 w-[140px] sm:w-[150px] text-left group/card cursor-pointer focus:outline-none"
					>
						<!-- Artwork with rounded corners and play button overlay -->
						<div class="w-full aspect-square rounded-2xl overflow-hidden mb-2.5 relative bg-[#181822] border border-white/[0.06] shadow-md group-hover/card:shadow-lg group-hover/card:border-[#FF2D78]/40 transition-all duration-300">
							<img
								src={item.artwork || item.image || '/placeholder-artwork.svg'}
								alt={item.title || item.name}
								class="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
								loading="lazy"
								on:error={(e) => (e.target.src = '/placeholder-artwork.svg')}
							/>

							<!-- Floating Circular Play Button on hover or playing -->
							<div
								class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all duration-200 shadow-md group-hover/card:scale-110 {isItemPlaying(item) ? 'opacity-100 bg-[#FF2D78]' : 'opacity-0 group-hover/card:opacity-100'}"
							>
								{#if isItemPlaying(item)}
									<!-- Animated Equalizer Bars -->
									<div class="flex items-end gap-0.5 h-3.5">
										<span class="w-0.5 bg-white animate-equalizer-1 rounded-full h-full"></span>
										<span class="w-0.5 bg-white animate-equalizer-2 rounded-full h-full"></span>
										<span class="w-0.5 bg-white animate-equalizer-3 rounded-full h-full"></span>
									</div>
								{:else}
									<svg class="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
								{/if}
							</div>
						</div>

						<!-- Title & Subtitle matching Screenshot 2, 3, 4 -->
						<h4 class="text-[13px] font-bold text-white truncate leading-tight group-hover/card:text-[#FF2D78] transition-colors">
							{item.title || item.name || 'Unknown'}
						</h4>
						<p class="text-[11.5px] font-medium text-[#9CA3AF] truncate mt-0.5">
							{item.subtitle || item.artist || item.desc || 'Featured'}
						</p>
					</button>
				{/each}
			</div>
		</div>
	</section>
{/if}
