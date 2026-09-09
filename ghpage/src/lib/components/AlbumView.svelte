<!-- AlbumView.svelte — Album detail view matching Flutter album page -->
<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { audioPlayer } from '$lib/player/audioService.js';
	import TrackRow from './TrackRow.svelte';

	export let albumData = null; // { id, title, artist, artwork, year, songs }
	export let albumId = null;

	const dispatch = createEventDispatcher();

	let loading = false;
	let album = albumData;
	let error = null;

	async function loadAlbumDetails(id) {
		if (!id) return;
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/album?id=${encodeURIComponent(id)}`);
			if (!res.ok) throw new Error('Failed to load album details');
			const data = await res.json();
			album = {
				id: data.id || id,
				title: data.title || data.name || 'Unknown Album',
				artist: data.artist || data.primaryArtists || 'Various Artists',
				artwork: data.image || data.artwork || '/placeholder-artwork.svg',
				year: data.year || '',
				songs: data.songs || data.tracks || []
			};
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (albumId && (!album || !album.songs?.length)) {
			loadAlbumDetails(albumId);
		}
	});

	$: if (albumId && (!album || album.id !== albumId)) {
		loadAlbumDetails(albumId);
	}

	function playAll(shuffle = false) {
		if (!album || !album.songs?.length) return;
		audioPlayer.playQueue(album.songs, 0, shuffle);
	}
</script>

<div class="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
	<!-- Back button -->
	<button
		type="button"
		on:click={() => dispatch('back')}
		class="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer text-sm font-medium"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
		Back
	</button>

	{#if loading}
		<div class="py-24 flex flex-col items-center justify-center gap-4 text-[#9CA3AF]">
			<svg class="w-10 h-10 animate-spin text-[#FF2D78]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
			<span class="text-sm">Loading album...</span>
		</div>
	{:else if error}
		<div class="py-16 text-center text-[#9CA3AF] bg-[#141418] rounded-2xl border border-[#2A2A32] p-8">
			<p class="text-base text-red-400 mb-2">Error loading album</p>
			<p class="text-xs text-[#6B7280]">{error}</p>
			<button type="button" on:click={() => loadAlbumDetails(albumId)} class="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold">Retry</button>
		</div>
	{:else if album}
		<!-- Album Header Banner -->
		<div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-[#1E1E24] to-[#141418] p-6 sm:p-8 rounded-3xl border border-[#2A2A32] shadow-xl relative overflow-hidden">
			<div class="absolute -top-24 -right-24 w-96 h-96 bg-[#FF2D78]/10 rounded-full blur-3xl pointer-events-none"></div>

			<!-- Artwork -->
			<div class="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden bg-[#2A2A32] shadow-2xl shrink-0 border border-white/10">
				<img src={album.artwork || '/placeholder-artwork.svg'} alt={album.title} class="w-full h-full object-cover" on:error={(e) => (e.target.src = '/placeholder-artwork.svg')} />
			</div>

			<!-- Info -->
			<div class="flex-1 text-center sm:text-left min-w-0">
				<span class="text-xs font-bold uppercase tracking-widest text-[#FF2D78]">Album</span>
				<h1 class="text-2xl sm:text-4xl font-extrabold text-white mt-1 mb-2 truncate">{album.title}</h1>
				<p class="text-sm font-medium text-[#9CA3AF]">{album.artist} {#if album.year} • {album.year}{/if} • {album.songs?.length || 0} songs</p>

				<!-- Controls -->
				<div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
					<button
						type="button"
						on:click={() => playAll(false)}
						disabled={!album.songs?.length}
						class="flex items-center gap-2 px-6 py-2.5 rounded-full teja-gradient-btn text-white text-sm font-bold shadow-lg shadow-[#FF2D78]/25 hover:shadow-[#FF2D78]/40 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					>
						<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
						Play All
					</button>

					<button
						type="button"
						on:click={() => playAll(true)}
						disabled={!album.songs?.length}
						class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					>
						<svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
						Shuffle
					</button>
				</div>
			</div>
		</div>

		<!-- Songs List -->
		<div class="space-y-3">
			<h3 class="text-lg font-bold text-white">Tracks</h3>
			{#if !album.songs || album.songs.length === 0}
				<div class="py-12 text-center text-[#6B7280]">
					<p class="text-sm">No tracks available in this album.</p>
				</div>
			{:else}
				<div class="space-y-1">
					{#each album.songs as track, idx (track.id || idx)}
						<TrackRow {track} index={idx} playlist={album.songs} />
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
