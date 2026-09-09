<!-- ArtistView.svelte — Artist detail view matching media_1788883887875.png EXE screenshot -->
<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { audioPlayer } from '$lib/player/audioService.js';
	import TrackRow from './TrackRow.svelte';

	export let artistData = null; // { id, name, image, subtitle, topSongs, topAlbums }
	export let artistId = null;

	const dispatch = createEventDispatcher();

	let loading = false;
	let artist = artistData;
	let error = null;
	let activeTab = 'albums'; // 'songs' | 'albums' (default to albums like screenshot)
	let isLiked = false;

	async function loadArtistDetails(id) {
		if (!id) return;
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/artist?id=${encodeURIComponent(id)}`);
			if (!res.ok) throw new Error('Failed to load artist details');
			const data = await res.json();
			artist = {
				id: data.id || id,
				name: data.name || data.title || 'Unknown Artist',
				image: data.image || data.artwork || '/placeholder-artwork.svg',
				subtitle: data.subtitle || `${data.topSongs?.length || 5} Top Tracks • ${data.topAlbums?.length || 10} Albums`,
				topSongs: data.topSongs || data.songs || [],
				topAlbums: data.topAlbums || data.albums || []
			};
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (artistId && (!artist || !artist.topSongs?.length)) {
			loadArtistDetails(artistId);
		}
	});

	$: if (artistId && (!artist || artist.id !== artistId)) {
		loadArtistDetails(artistId);
	}

	function playTopSongs(shuffle = false) {
		if (!artist || !artist.topSongs?.length) return;
		audioPlayer.playQueue(artist.topSongs, 0, shuffle);
	}

	function handleAlbumClick(album) {
		dispatch('selectAlbum', { album });
	}

	function handleImgError(e) {
		e.target.src = '/placeholder-artwork.svg';
	}
</script>

<div class="h-full flex flex-col p-4 sm:p-6 lg:p-8 animate-fade-in overflow-y-auto custom-scrollbar select-none">
	<!-- Top Circular Back Button (Matching media_1788883887875.png) -->
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

	{#if loading}
		<div class="py-24 flex flex-col items-center justify-center gap-4 text-[#9CA3AF]">
			<svg class="w-10 h-10 animate-spin text-[#FF2D78]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
			<span class="text-sm">Loading artist...</span>
		</div>
	{:else if error}
		<div class="py-16 text-center text-[#9CA3AF] bg-[#141418] rounded-2xl border border-[#2A2A32] p-8">
			<p class="text-base text-red-400 mb-2">Error loading artist</p>
			<p class="text-xs text-[#6B7280]">{error}</p>
			<button type="button" on:click={() => loadArtistDetails(artistId)} class="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold">Retry</button>
		</div>
	{:else if artist}
		<!-- Artist Hero Section (Matching media_1788883887875.png) -->
		<div class="flex flex-col sm:flex-row items-center gap-8 py-6 px-4">
			<!-- Large Circular Artist Photo -->
			<div class="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-[#1E1E26] shadow-[0_12px_36px_rgba(0,0,0,0.6)] shrink-0 border border-white/10 relative group">
				<img
					src={artist.image || '/placeholder-artwork.svg'}
					alt={artist.name}
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					on:error={handleImgError}
				/>
			</div>

			<!-- Artist Info & Action Buttons -->
			<div class="flex-1 text-center sm:text-left min-w-0">
				<h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight truncate">
					{artist.name}
				</h1>
				<p class="text-sm font-medium text-[#9CA3AF] mt-2">
					{artist.subtitle || '5 Top Tracks • 90 Albums'}
				</p>

				<!-- Buttons Row (Matching EXE Screenshot) -->
				<div class="flex items-center justify-center sm:justify-start gap-3.5 mt-5">
					<!-- Red/Pink Outlined Pill Play Button -->
					<button
						type="button"
						on:click={() => playTopSongs(false)}
						disabled={!artist.topSongs?.length}
						class="flex items-center gap-2.5 px-7 py-2 rounded-full border border-[#FF2D78] bg-[#FF2D78]/15 hover:bg-[#FF2D78]/25 text-[#FF2D78] text-sm font-bold transition-all cursor-pointer disabled:opacity-40 hover:scale-105 active:scale-95"
					>
						<svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
						<span>Play</span>
					</button>

					<!-- Circular Heart Button -->
					<button
						type="button"
						on:click={() => (isLiked = !isLiked)}
						class="w-10 h-10 rounded-full bg-[#1C1C26] hover:bg-[#282836] border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-md {isLiked ? 'text-[#FF2D78]' : 'text-white/80 hover:text-white'} hover:scale-105 active:scale-95"
						title="Favourite"
					>
						<svg class="w-4.5 h-4.5 {isLiked ? 'fill-current' : 'fill-none stroke-current stroke-2'}" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
					</button>

					<!-- Circular Share Button -->
					<button
						type="button"
						class="w-10 h-10 rounded-full bg-[#1C1C26] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
						title="Share"
					>
						<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Segmented Capsule Tab Bar (Matching media_1788883887875.png: [ Top Songs ] [ Albums ]) -->
		<div class="flex justify-center my-6">
			<div class="flex items-center p-1 rounded-full bg-[#161622] border border-white/10 shadow-inner">
				<button
					type="button"
					on:click={() => (activeTab = 'songs')}
					class="px-8 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer {activeTab === 'songs' ? 'bg-[#2A2A38] text-white shadow-sm border border-white/10' : 'text-[#8A8A98] hover:text-white'}"
				>
					Top Songs
				</button>
				<button
					type="button"
					on:click={() => (activeTab = 'albums')}
					class="px-8 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer {activeTab === 'albums' ? 'border border-[#FF2D78] bg-[#FF2D78]/20 text-white shadow-[0_0_12px_rgba(255,45,120,0.3)]' : 'text-[#8A8A98] hover:text-white'}"
				>
					Albums
				</button>
			</div>
		</div>

		<!-- Content: Albums Grid OR Top Songs List -->
		{#if activeTab === 'albums'}
			{#if artist.topAlbums && artist.topAlbums.length > 0}
				<!-- Grid of 6 Columns matching Screenshot -->
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
					{#each artist.topAlbums as alb}
						<div
							on:click={() => handleAlbumClick(alb)}
							on:keydown={(e) => e.key === 'Enter' && handleAlbumClick(alb)}
							role="button"
							tabindex="0"
							class="group cursor-pointer text-center flex flex-col items-center"
						>
							<!-- Square Album Card with 18px rounded corners -->
							<div class="w-full aspect-square rounded-[18px] overflow-hidden mb-2.5 bg-[#1B1B26] shadow-md border border-white/5 relative group-hover:border-[#FF2D78]/50 transition-all duration-300 group-hover:scale-103">
								<img
									src={alb.image || alb.artwork || '/placeholder-artwork.svg'}
									alt={alb.title || alb.name}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									on:error={handleImgError}
								/>
							</div>
							<h4 class="text-[13px] font-bold text-white truncate w-full group-hover:text-[#FF2D78] transition-colors">{alb.title || alb.name}</h4>
							<p class="text-[11px] text-[#6B7280] truncate mt-0.5">{alb.year || '2026'}</p>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center text-[#6B7280]">
					<p class="text-sm">No albums available for this artist.</p>
				</div>
			{/if}
		{:else}
			<!-- Top Songs List -->
			<div class="space-y-1 max-w-4xl mx-auto w-full bg-[#14151D] p-4 rounded-2xl border border-white/5">
				{#each artist.topSongs as track, idx (track.id || idx)}
					<TrackRow {track} index={idx} playlist={artist.topSongs} />
				{/each}
			</div>
		{/if}
	{/if}
</div>

