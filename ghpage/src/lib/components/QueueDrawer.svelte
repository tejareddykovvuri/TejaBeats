<!-- QueueDrawer.svelte — Slide-over queue panel matching up_next_panel.dart -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { queue, queueIndex, currentTrack, removeFromQueue, clearQueue, playNextInQueue } from '$lib/player/playerStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';
	import TrackRow from './TrackRow.svelte';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handlePlayTrack(index) {
		audioPlayer.playTrackFromQueue(index);
	}

	function handleRemove(index) {
		removeFromQueue(index);
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		on:click={close}
		on:keydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="0"
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
	></div>

	<!-- Drawer Panel -->
	<aside
		class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#141418] border-l border-[#2A2A32] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-left"
	>
		<!-- Header -->
		<div class="p-5 border-b border-[#2A2A32] flex items-center justify-between shrink-0">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-lg bg-[#FF2D78]/15 flex items-center justify-center text-[#FF2D78]">
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
				</div>
				<div>
					<h3 class="text-base font-bold text-white leading-tight">Playing Queue</h3>
					<span class="text-xs text-[#9CA3AF]">{$queue.length} {$queue.length === 1 ? 'track' : 'tracks'}</span>
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#if $queue.length > 0}
					<button
						type="button"
						on:click={() => clearQueue()}
						class="text-xs text-[#9CA3AF] hover:text-[#FF2D78] px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
					>
						Clear
					</button>
				{/if}
				<button
					type="button"
					on:click={close}
					class="p-2 text-[#9CA3AF] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			</div>
		</div>

		<!-- Track List -->
		<div class="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
			{#if $queue.length === 0}
				<div class="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B7280]">
					<div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-[#9CA3AF]">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
					</div>
					<p class="text-sm font-semibold text-white/80">Your queue is empty</p>
					<p class="text-xs text-[#9CA3AF] mt-1 max-w-xs">Play a song, album, or playlist to start listening</p>
				</div>
			{:else}
				{#each $queue as track, idx (track.id + '-' + idx)}
					<div class="group relative flex items-center rounded-xl p-2 transition-all {idx === $queueIndex ? 'bg-[#FF2D78]/10 border border-[#FF2D78]/30' : 'hover:bg-white/5'}">
						<!-- Index / Playing indicator -->
						<div class="w-7 text-center shrink-0">
							{#if idx === $queueIndex}
								<div class="flex items-end justify-center gap-[2px] h-3.5">
									<span class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-1"></span>
									<span class="w-[2px] bg-[#FF6B35] rounded-full eq-bar-2"></span>
									<span class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-3"></span>
									<span class="w-[2px] bg-[#FF6B35] rounded-full eq-bar-4"></span>
								</div>
							{:else}
								<span class="text-xs text-[#6B7280] group-hover:hidden">{idx + 1}</span>
								<button
									type="button"
									on:click={() => handlePlayTrack(idx)}
									class="hidden group-hover:flex items-center justify-center text-white hover:text-[#FF2D78] cursor-pointer"
								>
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
								</button>
							{/if}
						</div>

						<!-- Artwork -->
						<div
							on:click={() => handlePlayTrack(idx)}
							on:keydown={(e) => e.key === 'Enter' && handlePlayTrack(idx)}
							role="button"
							tabindex="0"
							class="w-10 h-10 rounded-lg overflow-hidden shrink-0 mx-2.5 cursor-pointer bg-[#1E1E24]"
						>
							<img src={track.artwork || '/placeholder-artwork.svg'} alt={track.title} class="w-full h-full object-cover" on:error={(e) => (e.target.src = '/placeholder-artwork.svg')} />
						</div>

						<!-- Info -->
						<div
							on:click={() => handlePlayTrack(idx)}
							on:keydown={(e) => e.key === 'Enter' && handlePlayTrack(idx)}
							role="button"
							tabindex="0"
							class="flex-1 min-w-0 cursor-pointer"
						>
							<h4 class="text-xs font-semibold truncate {idx === $queueIndex ? 'text-[#FF2D78]' : 'text-white'}">{track.title}</h4>
							<p class="text-[11px] text-[#9CA3AF] truncate">{track.artist || 'Unknown'}</p>
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								on:click={() => handleRemove(idx)}
								class="p-1.5 text-[#9CA3AF] hover:text-[#FF2D78] rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
								title="Remove from queue"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Footer -->
		{#if $queue.length > 0}
			<div class="p-3 border-t border-[#2A2A32] bg-[#0A0A0F]/50 flex items-center justify-between text-xs text-[#9CA3AF]">
				<span>Current Track: {$queueIndex + 1} / {$queue.length}</span>
				<button
					type="button"
					on:click={() => audioPlayer.nextTrack()}
					class="text-[#FF2D78] hover:underline font-semibold cursor-pointer"
				>
					Play Next Track &rarr;
				</button>
			</div>
		{/if}
	</aside>
{/if}
