<!-- PlaylistView.svelte — Playlist detail view matching media_1788883874662.png EXE screenshot -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { playlists, deletePlaylist, removeTrackFromPlaylist } from '$lib/player/playlistStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';
	import { currentTrack, isPlaying } from '$lib/player/playerStore.js';

	export let playlist = null;

	const dispatch = createEventDispatcher();

	let searchQuery = '';

	$: currentPlaylist = $playlists.find((p) => p.id === playlist?.id) || playlist;
	$: tracks = (currentPlaylist?.tracks || []).filter((t) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q));
	});

	function playAll(shuffle = false) {
		if (!currentPlaylist || !currentPlaylist.tracks?.length) return;
		audioPlayer.playQueue(currentPlaylist.tracks, 0, shuffle);
	}

	function playTrack(idx) {
		if (!currentPlaylist || !currentPlaylist.tracks?.length) return;
		audioPlayer.playQueue(currentPlaylist.tracks, idx);
	}

	function handleDelete() {
		if (confirm(`Delete playlist "${currentPlaylist.name}"?`)) {
			deletePlaylist(currentPlaylist.id);
			dispatch('back');
		}
	}

	function handleRemoveTrack(trackId) {
		removeTrackFromPlaylist(currentPlaylist.id, trackId);
	}

	function handleImgError(e) {
		e.target.src = '/placeholder-artwork.svg';
	}
</script>

{#if currentPlaylist}
	<div class="h-full flex flex-col p-4 sm:p-6 lg:p-8 animate-fade-in overflow-y-auto custom-scrollbar select-none">
		<!-- Top Circular Back Button (Matching EXE Screenshot) -->
		<div class="mb-4">
			<button
				type="button"
				on:click={() => dispatch('back')}
				class="w-10 h-10 rounded-full bg-[#1A1A24] hover:bg-[#252533] border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
				title="Back"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
			</button>
		</div>

		<!-- Two-Column Layout (Matching media_1788883874662.png EXE screenshot) -->
		<div class="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 flex-1">
			<!-- Left Column: Big Artwork, Title, Subtitle, Action Buttons -->
			<div class="w-full lg:w-[360px] xl:w-[400px] flex flex-col items-center text-center shrink-0">
				<!-- Big Square Artwork with 20px Rounded Corners and Glow Shadow -->
				<div class="w-[240px] sm:w-[280px] lg:w-[320px] aspect-square rounded-[22px] overflow-hidden bg-[#161622] shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-white/[0.08] relative group">
					{#if currentPlaylist.tracks && currentPlaylist.tracks.length > 0 && currentPlaylist.tracks[0].artwork}
						<img
							src={currentPlaylist.tracks[0].artwork}
							alt={currentPlaylist.name}
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							on:error={handleImgError}
						/>
					{:else}
						<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E1E28] to-[#121218]">
							<svg class="w-24 h-24 text-[#FF2D78]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
						</div>
					{/if}
				</div>

				<!-- Playlist Title (Bold White) -->
				<h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-6 tracking-tight leading-snug">
					{currentPlaylist.name}
				</h1>

				<!-- Subtitles (e.g. "132 Songs", "by You") -->
				<p class="text-sm font-medium text-[#9CA3AF] mt-1.5">
					{currentPlaylist.tracks?.length || 0} Songs
				</p>
				<p class="text-xs font-medium text-[#6B7280] mt-0.5">
					by You
				</p>

				<!-- Action Buttons Row (Matching EXE Screenshot) -->
				<div class="flex items-center justify-center gap-3.5 mt-6">
					<!-- Shuffle Button -->
					<button
						type="button"
						on:click={() => playAll(true)}
						disabled={!currentPlaylist.tracks?.length}
						class="w-10 h-10 rounded-full bg-[#1C1C26] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md disabled:opacity-40 hover:scale-105 active:scale-95"
						title="Shuffle"
					>
						<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
					</button>

					<!-- Download Button -->
					<button
						type="button"
						class="w-10 h-10 rounded-full bg-[#1C1C26] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
						title="Download Playlist"
					>
						<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
					</button>

					<!-- Large Glowing Pink Play Button (Centerpiece) -->
					<button
						type="button"
						on:click={() => playAll(false)}
						disabled={!currentPlaylist.tracks?.length}
						class="w-14 h-14 rounded-full bg-[#FF2D78] hover:bg-[#FF3B85] text-white flex items-center justify-center shadow-[0_0_24px_rgba(255,45,120,0.55)] transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-108 active:scale-95 shrink-0"
						title="Play All"
					>
						<svg class="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					</button>

					<!-- Info (i) Button -->
					<button
						type="button"
						class="w-10 h-10 rounded-full bg-[#1C1C26] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
						title="Playlist Info"
					>
						<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-width="2" d="M12 8h.01M12 12v4"/></svg>
					</button>

					<!-- More (...) Button -->
					<button
						type="button"
						on:click={handleDelete}
						class="w-10 h-10 rounded-full bg-[#1C1C26] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
						title="More options / Delete"
					>
						<svg class="w-5 h-5 fill-currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
					</button>
				</div>
			</div>

			<!-- Right Column: Dark Rounded Card Container with Songs List -->
			<div class="flex-1 w-full min-w-0 bg-[#14151D] rounded-[24px] border border-white/[0.05] p-4 sm:p-6 shadow-2xl">
				<!-- Search / Filter in Playlist -->
				{#if currentPlaylist.tracks?.length > 4}
					<div class="mb-4 flex items-center gap-3 bg-[#1B1B27] border border-white/5 rounded-xl px-3.5 py-2">
						<svg class="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search in playlist..."
							class="bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none flex-1"
						/>
					</div>
				{/if}

				{#if tracks.length === 0}
					<div class="py-16 text-center text-[#6B7280]">
						<p class="text-sm font-semibold text-white/80">No tracks in this playlist</p>
						<p class="text-xs text-[#9CA3AF] mt-1">Search for music and add songs to this playlist</p>
					</div>
				{:else}
					<div class="space-y-1">
						{#each tracks as track, idx (track.id + '-' + idx)}
							{@const isCurrent = $currentTrack?.id === track.id}
							<div
								on:click={() => playTrack(idx)}
								on:keydown={(e) => e.key === 'Enter' && playTrack(idx)}
								role="button"
								tabindex="0"
								class="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group {isCurrent ? 'bg-[#FF2D78]/12 text-[#FF2D78]' : 'text-white'}"
							>
								<!-- Index Number (1, 2, 3...) -->
								<span class="w-6 text-center text-xs font-semibold {isCurrent ? 'text-[#FF2D78]' : 'text-[#6B7280]'} shrink-0">
									{idx + 1}
								</span>

								<!-- Track Thumbnail (Square, rounded-lg, 42x42) -->
								<div class="w-11 h-11 rounded-xl overflow-hidden bg-[#20202C] shrink-0 border border-white/5 relative">
									<img
										src={track.artwork || '/placeholder-artwork.svg'}
										alt={track.title}
										class="w-full h-full object-cover"
										on:error={handleImgError}
									/>
									{#if isCurrent && $isPlaying}
										<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
											<div class="flex items-end gap-[1.5px] h-3">
												<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-1"></div>
												<div class="w-[2px] bg-[#FF6B35] rounded-full eq-bar-2"></div>
												<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-3"></div>
											</div>
										</div>
									{/if}
								</div>

								<!-- Title & Artist -->
								<div class="min-w-0 flex-1">
									<h4 class="text-[13.5px] font-bold truncate {isCurrent ? 'text-[#FF2D78]' : 'text-white group-hover:text-[#FF2D78]'} transition-colors">
										{track.title}
									</h4>
									<p class="text-[11.5px] text-[#9CA3AF] truncate mt-0.5">
										{track.artist || 'Unknown Artist'}
									</p>
								</div>

								<!-- Three Dots Menu (...) -->
								<button
									type="button"
									on:click|stopPropagation={() => handleRemoveTrack(track.id)}
									class="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/10 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
									title="Remove from playlist"
								>
									<svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

