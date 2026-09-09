<!-- +page.svelte — TejaBeats Web Player Main Application matching Flutter EXE -->
<script>
	import { onMount } from 'svelte';
	import WindowTitleBar from '$lib/components/WindowTitleBar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import ChartCarousel from '$lib/components/ChartCarousel.svelte';
	import ThematicSection from '$lib/components/ThematicSection.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import TrackRow from '$lib/components/TrackRow.svelte';
	import PlayerBar from '$lib/components/PlayerBar.svelte';
	import MobilePlayerSheet from '$lib/components/MobilePlayerSheet.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import QueueDrawer from '$lib/components/QueueDrawer.svelte';
	import PlaylistView from '$lib/components/PlaylistView.svelte';
	import AlbumView from '$lib/components/AlbumView.svelte';
	import ArtistView from '$lib/components/ArtistView.svelte';
	import LyricsPanel from '$lib/components/LyricsPanel.svelte';
	import TimerModal from '$lib/components/TimerModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import AddToPlaylistModal from '$lib/components/AddToPlaylistModal.svelte';
	import ImportExportModal from '$lib/components/ImportExportModal.svelte';
	import ToastNotification from '$lib/components/ToastNotification.svelte';

	import { currentTrack, isPlaying, likedTracks, recentlyPlayed, showToast } from '$lib/player/playerStore.js';
	import { playlists, createPlaylist } from '$lib/player/playlistStore.js';
	import { searchHistory, addSearchQuery, removeSearchQuery, clearSearchHistory } from '$lib/player/searchHistoryStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';
	import { initKeyboardShortcuts } from '$lib/player/keyboardShortcuts.js';

	export let data;

	// Navigation State: 'trending' | 'search' | 'library' | 'liked' | 'recent' | 'playlist' | 'album' | 'artist'
	let currentTab = 'trending';
	let selectedPlaylist = null;
	let selectedAlbum = null;
	let selectedArtist = null;
	let trackToAddToPlaylist = null;

	// UI Drawers & Modals
	let isQueueOpen = false;
	let isMobileExpanded = false;
	let isLyricsOpen = false;
	let isTimerOpen = false;
	let isSettingsOpen = false;
	let isAboutOpen = false;
	let isAddToPlaylistOpen = false;
	let isImportExportOpen = false;

	// Search State (matching Screenshot 5)
	let searchQuery = '';
	let isSearching = false;
	let searchResults = { tracks: [], albums: [], artists: [], playlists: [] };
	let searchFilter = 'all'; // 'all' | 'songs' | 'albums' | 'artists' | 'playlists'
	let activeSource = 'jiosaavn'; // 'jiosaavn' | 'ytmusic' | 'ytvideo'
	let searchTimeout = null;
	let trendingScrollContainer;
	let searchInputEl;

	// Category Pills (Screenshot 4)
	const categoryPills = [
		'Bollywood Recharger',
		'Bollywood Fire',
		'Punjabi Party',
		'Bollywood Party',
		'Desi Pop Party',
		'Haryanvi Party',
		'Tollywood Party'
	];
	let activeCategory = 'Bollywood Recharger';

	// Trending Searches Gradient Cards (Screenshot 5)
	const trendingSearchesList = [
		{
			title: 'Trending Now',
			subtitle: 'Hot Right Now',
			gradient: 'from-[#512DA8] via-[#673AB7] to-[#3F51B5]',
			icon: 'fire',
			query: 'Trending Superhits'
		},
		{
			title: 'Top 50 - India',
			subtitle: 'Daily Update',
			gradient: 'from-[#8D6E63] via-[#5D4037] to-[#3E2723]',
			icon: 'trophy',
			query: 'Top 50 India'
		},
		{
			title: 'Lo-Fi Chill',
			subtitle: 'Relax & Unwind',
			gradient: 'from-[#E64A19] via-[#F57C00] to-[#FFB300]',
			icon: 'headphone',
			query: 'Lo-Fi Chill Beats'
		},
		{
			title: 'Viral Hits',
			subtitle: 'Viral on Reels',
			gradient: 'from-[#AD1457] via-[#6A1B9A] to-[#283593]',
			icon: 'music',
			query: 'Viral Hits'
		},
		{
			title: 'Telugu Hits',
			subtitle: 'Superhits',
			gradient: 'from-[#455A64] via-[#263238] to-[#1A237E]',
			icon: 'star',
			query: 'Telugu Top Hits'
		},
		{
			title: 'Party Anthems',
			subtitle: 'Turn It Up',
			gradient: 'from-[#C2185B] via-[#7B1FA2] to-[#512DA8]',
			icon: 'disc',
			query: 'Party Anthems'
		}
	];

	// Real Distinct Home / Thematic Sections Data
	let trendingTracks = data?.trendingTracks || [];
	let chartTitle = data?.chartTitle || 'Trending Superhits';
	let rainTherapyTracks = data?.rainTherapy || [];
	let communityPlaylists = data?.communityPlaylists || [];
	let indiaBiggestHits = data?.indiaHits || [];
	let newReleasesList = data?.newReleases || [];
	let nostalgicTracks = data?.nostalgic || [];
	let danceHitsTracks = data?.danceHits || [];
	let easyMornings = data?.easyMornings || [];
	let isTrendingLoading = false;

	function filterUniqueArtwork(arr) {
		if (!arr || !arr.length) return [];
		const seen = new Set();
		return arr.filter((t) => {
			if (!t || !t.artwork) return true;
			const key = t.artwork.split('?')[0].replace(/-\d+x\d+\./, '.');
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	onMount(() => {
		const cleanupShortcuts = initKeyboardShortcuts();

		// Listen for Ctrl+K search shortcut
		function onGoToSearch() {
			handleGoToSearch();
		}
		window.addEventListener('tejabeats:goToSearch', onGoToSearch);

		// If server data was empty, fetch on client
		if (!trendingTracks || trendingTracks.length === 0 || rainTherapyTracks.length === 0) {
			fetchTrending();
		}

		return () => {
			if (cleanupShortcuts) cleanupShortcuts();
			window.removeEventListener('tejabeats:goToSearch', onGoToSearch);
		};
	});

	async function fetchTrending() {
		isTrendingLoading = true;
		try {
			const res = await fetch('/api/launch');
			const json = await res.json();
			if (json.success) {
				trendingTracks = json.trendingTracks || json.tracks || [];
				chartTitle = json.chartTitle || 'Trending Superhits';
				if (json.rainTherapy && json.rainTherapy.length > 0) rainTherapyTracks = json.rainTherapy;
				if (json.communityPlaylists && json.communityPlaylists.length > 0) communityPlaylists = json.communityPlaylists;
				if (json.indiaHits && json.indiaHits.length > 0) indiaBiggestHits = json.indiaHits;
				if (json.newReleases && json.newReleases.length > 0) newReleasesList = json.newReleases;
				if (json.nostalgic && json.nostalgic.length > 0) nostalgicTracks = json.nostalgic;
				if (json.danceHits && json.danceHits.length > 0) danceHitsTracks = json.danceHits;
				if (json.easyMornings && json.easyMornings.length > 0) easyMornings = json.easyMornings;
			}
		} catch (e) {
			console.error('Client trending fetch error:', e);
		} finally {
			isTrendingLoading = false;
		}
	}

	async function performSearch(query) {
		if (!query || !query.trim()) {
			searchResults = { tracks: [], albums: [], artists: [], playlists: [] };
			isSearching = false;
			return;
		}
		isSearching = true;
		addSearchQuery(query.trim());

		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=${searchFilter}`);
			const data = await res.json();
			if (data && data.success) {
				searchResults = {
					tracks: data.tracks || data.results || [],
					albums: data.albums || [],
					artists: data.artists || [],
					playlists: data.playlists || []
				};
			} else {
				searchResults = { tracks: [], albums: [], artists: [], playlists: [] };
			}
		} catch (err) {
			console.error('Search error:', err);
			searchResults = { tracks: [], albums: [], artists: [], playlists: [] };
		} finally {
			isSearching = false;
		}
	}

	function handleSearchInput(e) {
		const q = e.detail?.query !== undefined ? e.detail.query : (e.target?.value !== undefined ? e.target.value : searchQuery);
		searchQuery = q;
		if (searchTimeout) clearTimeout(searchTimeout);
		if (currentTab !== 'search') currentTab = 'search';

		searchTimeout = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);
	}

	function handleSearchSubmit(e) {
		const q = e.detail?.query !== undefined ? e.detail.query : (e.target?.value !== undefined ? e.target.value : searchQuery);
		searchQuery = q;
		if (searchTimeout) clearTimeout(searchTimeout);
		if (currentTab !== 'search') currentTab = 'search';
		performSearch(searchQuery);
	}

	function handleQuickPick(e) {
		const q = e.detail.query;
		searchQuery = q;
		currentTab = 'search';
		performSearch(q);
	}

	function handleChartSelect(e) {
		const chart = e.detail.chart;
		searchQuery = chart.title;
		currentTab = 'search';
		performSearch(chart.title);
	}

	function handleThematicSelect(item) {
		if (item.query) {
			searchQuery = item.query;
			currentTab = 'search';
			performSearch(item.query);
		} else if (item.streamUrl || item.artist) {
			audioPlayer.playTrack(item, [item], 0);
		}
	}

	function handleNavSelect(e) {
		const tab = e.detail.tab;
		currentTab = tab;
		window.scrollTo({ top: 0, behavior: 'smooth' });
		if (tab === 'search') {
			setTimeout(() => searchInputEl?.focus(), 100);
		}
	}

	function handleGoToSearch() {
		currentTab = 'search';
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setTimeout(() => searchInputEl?.focus(), 100);
	}

	function handlePlaylistSelect(e) {
		selectedPlaylist = e.detail.playlist;
		currentTab = 'playlist';
	}

	function handleAlbumSelect(e) {
		selectedAlbum = e.detail.album;
		currentTab = 'album';
	}

	function handleArtistSelect(e) {
		selectedArtist = e.detail.artist;
		currentTab = 'artist';
	}

	function handleCreatePlaylist() {
		const name = prompt('Enter playlist name:');
		if (name && name.trim()) {
			createPlaylist(name.trim());
			showToast(`Playlist "${name.trim()}" created`);
		}
	}

	function handleOpenAddToPlaylist(e) {
		trackToAddToPlaylist = e.detail.track;
		isAddToPlaylistOpen = true;
	}

	function playAllTrending(shuffle = false) {
		if (trendingTracks.length > 0) {
			audioPlayer.playQueue(trendingTracks, 0, shuffle);
		}
	}

	function playLikedTracks(shuffle = false) {
		if ($likedTracks.length > 0) {
			audioPlayer.playQueue($likedTracks, 0, shuffle);
		}
	}

	function scrollTrendingRight() {
		if (trendingScrollContainer) {
			trendingScrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
		}
	}
</script>

<div class="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-['Gilroy',sans-serif] flex flex-col antialiased selection:bg-[#FF2D78] selection:text-white">
	<!-- Desktop Window Title Bar -->
	<WindowTitleBar />

	<!-- App Main Wrapper -->
	<div class="flex-1 flex overflow-hidden">
		<!-- Desktop 230px Sidebar -->
		<Sidebar
			activeTab={currentTab}
			on:selectTab={handleNavSelect}
			on:selectPlaylist={handlePlaylistSelect}
			on:createPlaylist={handleCreatePlaylist}
			on:quickSearch={(e) => {
				searchQuery = e.detail.query;
				currentTab = 'search';
				performSearch(e.detail.query);
			}}
			on:openSettings={() => (isSettingsOpen = true)}
			on:openAbout={() => (isAboutOpen = true)}
		/>

		<!-- Scrollable Main Viewport -->
		<main class="flex-1 overflow-y-auto pb-28 lg:pb-28 custom-scrollbar">
			<!-- Content Area based on current tab -->
			<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-9">
				{#if currentTab === 'trending'}
					<!-- =================== EXPLORE / HOME TAB (Screenshots 1 - 4) =================== -->

					<!-- Header (Top Greeting + Search Pill + Quick Action Icons) exclusively on Home tab -->
					<!-- Search pill is tap-only (matching EXE GestureDetector), navigates to Search tab -->
					<Header
						on:goToSearch={handleGoToSearch}
						on:openTimer={() => (isTimerOpen = true)}
						on:openSettings={() => (isSettingsOpen = true)}
						on:openAbout={() => (isAboutOpen = true)}
						on:openLyrics={() => (isLyricsOpen = true)}
					/>


					<!-- Billboard Chart Carousel Banner matching Screenshot 1 -->
					<ChartCarousel on:selectChart={handleChartSelect} />

					<!-- Recently Played Section with pink "See All >" link matching Screenshot 1 -->
					{#if $recentlyPlayed && $recentlyPlayed.length > 0}
						<section class="space-y-3 select-none">
							<div class="flex items-center justify-between px-1">
								<h3 class="text-base sm:text-lg font-bold text-white">Recently Played</h3>
								<button
									type="button"
									on:click={() => (currentTab = 'recent')}
									class="text-xs font-bold text-[#FF2D78] hover:underline flex items-center gap-1 cursor-pointer"
								>
									<span>See All</span>
									<span>&gt;</span>
								</button>
							</div>

							<div class="flex items-center gap-3.5 overflow-x-auto pb-2 custom-scrollbar">
								{#each $recentlyPlayed.slice(0, 10) as track, idx (track.id + '-' + idx)}
									<button
										type="button"
										on:click={() => audioPlayer.playTrack(track, $recentlyPlayed, idx)}
										class="shrink-0 w-28 text-left group cursor-pointer"
									>
										<div class="w-28 h-28 rounded-2xl overflow-hidden mb-2 bg-[#181822] border border-white/10 relative group-hover:border-[#FF2D78]/40 shadow-md transition-all">
											<img src={track.artwork || '/placeholder-artwork.svg'} alt={track.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
											<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
												<div class="w-8 h-8 rounded-full bg-[#FF2D78] text-white flex items-center justify-center shadow-lg">
													<svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
												</div>
											</div>
										</div>
										<p class="text-xs font-bold text-white truncate">{track.title}</p>
										<p class="text-[11px] text-[#9CA3AF] truncate">{track.artist}</p>
									</button>
								{/each}
							</div>
						</section>
					{/if}

					<!-- Rain Therapy 🍀 🌧️ Section (Real Distinct Songs) matching Screenshot 2 -->
					<ThematicSection
						title="Rain Therapy 🍀 🌧️"
						items={filterUniqueArtwork(rainTherapyTracks)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- Trending community playlists Section (Real Distinct Songs) matching Screenshot 2 -->
					<ThematicSection
						title="Trending community playlists"
						items={filterUniqueArtwork(communityPlaylists)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- India's biggest hits Section (Real Distinct Songs) matching Screenshot 2 -->
					<ThematicSection
						title="India's biggest hits"
						items={filterUniqueArtwork(indiaBiggestHits)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- New releases Section (Real Distinct Songs) matching Screenshot 3 -->
					<ThematicSection
						title="New releases"
						items={filterUniqueArtwork(newReleasesList)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- Brb, Being Nostalgic! Section (Real Distinct Songs) matching Screenshot 3 -->
					<ThematicSection
						title="Brb, Being Nostalgic!"
						items={filterUniqueArtwork(nostalgicTracks)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- Dancing on your own Section (Real Distinct Songs) matching Screenshot 3 -->
					<ThematicSection
						title="Dancing on your own"
						items={filterUniqueArtwork(danceHitsTracks)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- Easy Mornings Section (Real Distinct Songs) matching Screenshot 4 -->
					<ThematicSection
						title="Easy Mornings"
						items={filterUniqueArtwork(easyMornings)}
						on:selectPlaylist={(e) => handleThematicSelect(e.detail.playlist)}
					/>

					<!-- Featured / Trending Superhits Grid -->
					{#if trendingTracks && trendingTracks.length > 0}
						<section class="space-y-4 pt-2">
							<div class="flex items-center justify-between">
								<div>
									<span class="text-xs font-bold uppercase tracking-widest text-[#FF2D78]">Superhits</span>
									<h2 class="text-xl sm:text-2xl font-black text-white">{chartTitle}</h2>
								</div>

								<div class="flex items-center gap-2">
									<button
										type="button"
										on:click={() => playAllTrending(false)}
										disabled={!trendingTracks.length}
										class="flex items-center gap-1.5 px-4 py-2 rounded-full teja-gradient-btn text-white text-xs font-bold shadow-md shadow-[#FF2D78]/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
									>
										<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
										Play All
									</button>
									<button
										type="button"
										on:click={() => playAllTrending(true)}
										disabled={!trendingTracks.length}
										class="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
										title="Shuffle Play"
									>
										<svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
									</button>
								</div>
							</div>

							<!-- Cards Grid -->
							<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
								{#each trendingTracks as track, idx (track.id || idx)}
									<TrackCard
										{track}
										playlist={trendingTracks}
										index={idx}
										on:addToPlaylist={handleOpenAddToPlaylist}
									/>
								{/each}
							</div>
						</section>
					{/if}

				{:else if currentTab === 'search'}
					<!-- =================== SEARCH TAB (Matching Flutter SearchScreen) =================== -->
					<!-- =================== SEARCH TAB (Matching EXE Screenshot Image 2) =================== -->
					<section class="space-y-4 select-none animate-fade-slide max-w-6xl mx-auto pt-2">
						<!-- Top Search Bar + Filter Button matching Image 2 -->
						<div class="flex items-center gap-3">
							<!-- Search Input Container with Subtle Pink Glow matching Image 2 -->
							<div class="flex-1 flex items-center gap-3.5 h-[52px] px-5 rounded-full bg-[#13131D]/80 backdrop-blur-xl border border-[#FF2D78]/35 focus-within:border-[#FF2D78] shadow-[0_0_16px_rgba(255,45,120,0.12)] focus-within:shadow-[0_0_24px_rgba(255,45,120,0.25)] transition-all duration-300">
								{#if isSearching}
									<svg class="w-5 h-5 text-[#FF2D78] animate-spin shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
								{:else}
									<svg class="w-5 h-5 text-[#8E8E9F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
								{/if}

								<input
									bind:this={searchInputEl}
									type="text"
									bind:value={searchQuery}
									on:input={handleSearchInput}
									on:keydown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
									placeholder="What do you want to listen to?"
									class="flex-1 bg-transparent border-none text-[15px] font-medium text-white placeholder-[#8E8E9F] focus:outline-none"
								/>

								{#if searchQuery}
									<button
										type="button"
										on:click={() => { searchQuery = ''; searchResults = { tracks: [], albums: [], artists: [], playlists: [] }; }}
										class="p-1 rounded-full text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
										title="Clear search"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
									</button>
								{/if}
							</div>

							<!-- Filter Settings Button (Pink Equalizer in Dark Circle matching Image 2) -->
							<button
								type="button"
								aria-label="Filter settings"
								on:click={() => (isSettingsOpen = true)}
								class="w-12 h-12 rounded-full bg-[#141420]/80 border border-[#FF2D78]/40 hover:border-[#FF2D78] text-[#FF2D78] flex items-center justify-center shadow-[0_0_12px_rgba(255,45,120,0.15)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
								title="Filter settings"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
							</button>
						</div>

						<!-- Filter Chips Row (All, Songs, Albums, Artists, Playlists matching Image 2) -->
						<div class="flex items-center gap-3 pt-1 pb-1 overflow-x-auto custom-scrollbar">
							{#each [
								{ id: 'all', label: 'All' },
								{ id: 'songs', label: 'Songs' },
								{ id: 'albums', label: 'Albums' },
								{ id: 'artists', label: 'Artists' },
								{ id: 'playlists', label: 'Playlists' }
							] as tab}
								<button
									type="button"
									on:click={() => {
										searchFilter = tab.id;
										if (searchQuery.trim()) performSearch(searchQuery);
									}}
									class="px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer {searchFilter === tab.id
										? 'bg-[#FF2D78] text-white shadow-[0_2px_12px_rgba(255,45,120,0.35)]'
										: 'bg-[#14141C] text-[#8E8E9F] hover:text-white border border-white/[0.08] hover:border-white/20'}"
								>
									{tab.label}
								</button>
							{/each}
						</div>

						<!-- Top Results Section matching Image 2 -->
						{#if isSearching}
							<div class="py-20 flex flex-col items-center justify-center gap-3 text-[#9CA3AF]">
								<svg class="w-8 h-8 animate-spin text-[#FF2D78]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
								<span class="text-xs">Searching songs, albums, and artists...</span>
							</div>
						{:else}
							{@const currentTracks = searchQuery.trim() ? (searchResults.tracks || []) : (trendingTracks || [])}

							{#if searchQuery.trim() && !currentTracks.length && !searchResults.albums?.length && !searchResults.artists?.length && !searchResults.playlists?.length}
								<div class="py-16 text-center text-[#9CA3AF] bg-[#141418] rounded-2xl border border-[#2A2A32] p-8">
									<p class="text-base font-bold text-white mb-1">No matches found for "{searchQuery}"</p>
									<p class="text-xs text-[#6B7280]">Try searching for another song, artist, album, or playlist</p>
								</div>
							{:else}
								<!-- Top Results Songs (Matches Image 2) -->
								{#if (searchFilter === 'all' || searchFilter === 'songs') && currentTracks.length > 0}
									<div class="pt-3">
										<!-- "◇ Top Results" section header matching Image 2 -->
										<div class="flex items-center gap-2 text-[11.5px] font-bold text-[#8A9BA8] tracking-[1.2px] uppercase mb-3">
											<svg class="w-3.5 h-3.5 text-[#8A9BA8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
											<span>Top Results</span>
										</div>

										<!-- Track rows with "Tracks" badge matching Image 2 -->
										<div class="space-y-2">
											{#each currentTracks as track, idx (track.id || idx)}
												{@const isCurrent = $currentTrack?.id === track.id}
												<div
													on:click={() => audioPlayer.playTrack(track, currentTracks, idx)}
													on:keydown={(e) => e.key === 'Enter' && audioPlayer.playTrack(track, currentTracks, idx)}
													role="button"
													tabindex="0"
													class="flex items-center justify-between gap-4 px-4 py-3 rounded-[18px] bg-[#13131B]/70 hover:bg-[#1A1A26] border border-white/[0.04] hover:border-[#FF2D78]/30 transition-all duration-200 cursor-pointer group select-none relative {isCurrent ? 'border-[#FF2D78]/50 shadow-[0_0_16px_rgba(255,45,120,0.15)] bg-gradient-to-r from-[#FF2D78]/15 via-transparent to-transparent' : ''}"
												>
													<div class="flex items-center gap-3.5 min-w-0 flex-1">
														<!-- Square Rounded Artwork matching Image 2 -->
														<div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#1A1A24] border border-white/5 relative shadow-sm group-hover:scale-105 transition-transform">
															<img
																src={track.artwork || '/placeholder-artwork.svg'}
																alt={track.title}
																class="w-full h-full object-cover"
																on:error={(e) => (e.target.src = '/placeholder-artwork.svg')}
															/>
															{#if isCurrent && $isPlaying}
																<div class="absolute inset-0 bg-black/50 flex items-center justify-center">
																	<div class="flex items-end gap-[2px] h-3.5">
																		<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-1"></div>
																		<div class="w-[2px] bg-[#FF6B35] rounded-full eq-bar-2"></div>
																		<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-3"></div>
																	</div>
																</div>
															{:else}
																<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
																	<svg class="w-5 h-5 text-white fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
																</div>
															{/if}
														</div>

														<!-- Title & Artist -->
														<div class="min-w-0 flex-1">
															<h4 class="text-[14.5px] font-bold truncate transition-colors leading-snug {isCurrent ? 'text-[#FF2D78]' : 'text-white group-hover:text-white'}">{track.title}</h4>
															<p class="text-[12.5px] text-[#8E8E9F] truncate mt-0.5">{track.artist || 'Unknown Artist'}</p>
														</div>
													</div>

													<!-- Right: Duration + "Tracks" badge matching Image 2 -->
													<div class="flex items-center gap-3.5 shrink-0">
														{#if track.duration}
															<span class="text-[12px] tabular-nums font-medium text-[#8E8E9F] hidden sm:block">
																{Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
															</span>
														{/if}
														<div class="px-4 py-1 rounded-full text-xs font-medium text-[#8E8E9F] border border-white/[0.08] bg-[#14141C] group-hover:border-[#FF2D78]/30 group-hover:text-white transition-all">
															Tracks
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Albums Section (if albums exist and filter is all or albums) -->
								{#if (searchFilter === 'all' || searchFilter === 'albums') && searchResults.albums && searchResults.albums.length > 0}
									<div class="space-y-3 pt-4">
										<h3 class="text-lg font-bold text-white">Albums ({searchResults.albums.length})</h3>
										<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
											{#each searchResults.albums as alb}
												<div
													on:click={() => handleAlbumSelect({ detail: { album: alb } })}
													on:keydown={(e) => e.key === 'Enter' && handleAlbumSelect({ detail: { album: alb } })}
													role="button"
													tabindex="0"
													class="group bg-[#141418] hover:bg-[#1E1E24] p-3 rounded-2xl border border-[#2A2A32] hover:border-[#FF2D78]/40 transition-all duration-300 cursor-pointer text-left"
												>
													<div class="aspect-square rounded-xl overflow-hidden mb-3 bg-[#2A2A32] shadow-md">
														<img src={alb.artwork || alb.image || '/placeholder-artwork.svg'} alt={alb.title || alb.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" on:error={(e) => (e.target.src = '/placeholder-artwork.svg')} />
													</div>
													<h4 class="text-sm font-semibold text-white truncate">{alb.title || alb.name}</h4>
													<p class="text-xs text-[#9CA3AF] truncate mt-0.5">{alb.artist || 'Album'}</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Artists Section (if artists exist and filter is all or artists) -->
								{#if (searchFilter === 'all' || searchFilter === 'artists') && searchResults.artists && searchResults.artists.length > 0}
									<div class="space-y-3 pt-4">
										<h3 class="text-lg font-bold text-white">Artists ({searchResults.artists.length})</h3>
										<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
											{#each searchResults.artists as art}
												<div
													on:click={() => handleArtistSelect({ detail: { artist: art } })}
													on:keydown={(e) => e.key === 'Enter' && handleArtistSelect({ detail: { artist: art } })}
													role="button"
													tabindex="0"
													class="group bg-[#141418] hover:bg-[#1E1E24] p-4 rounded-2xl border border-[#2A2A32] hover:border-[#FF2D78]/40 transition-all duration-300 cursor-pointer text-center"
												>
													<div class="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 bg-[#2A2A32] shadow-md border border-white/10">
														<img src={art.image || art.artwork || '/placeholder-artwork.svg'} alt={art.name || art.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" on:error={(e) => (e.target.src = '/placeholder-artwork.svg')} />
													</div>
													<h4 class="text-sm font-bold text-white truncate">{art.name || art.title}</h4>
													<p class="text-xs text-[#9CA3AF] truncate mt-0.5">Artist</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Playlists Section (if playlists exist and filter is all or playlists) -->
								{#if (searchFilter === 'all' || searchFilter === 'playlists') && searchResults.playlists && searchResults.playlists.length > 0}
									<div class="space-y-3 pt-4">
										<h3 class="text-lg font-bold text-white">Playlists ({searchResults.playlists.length})</h3>
										<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
											{#each searchResults.playlists as pl}
												<div
													on:click={() => handlePlaylistSelect({ detail: { playlist: pl } })}
													on:keydown={(e) => e.key === 'Enter' && handlePlaylistSelect({ detail: { playlist: pl } })}
													role="button"
													tabindex="0"
													class="group bg-[#141418] hover:bg-[#1E1E24] p-3 rounded-2xl border border-[#2A2A32] hover:border-[#FF2D78]/40 transition-all duration-300 cursor-pointer text-left"
												>
													<div class="aspect-square rounded-xl overflow-hidden mb-3 bg-[#2A2A32] shadow-md">
														<img src={pl.artwork || pl.image || '/placeholder-artwork.svg'} alt={pl.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" on:error={(e) => (e.target.src = '/placeholder-artwork.svg')} />
													</div>
													<h4 class="text-sm font-semibold text-white truncate">{pl.title}</h4>
													<p class="text-xs text-[#9CA3AF] truncate mt-0.5">{pl.artist || 'Playlist'}</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							{/if}
						{/if}
					</section>

				{:else if currentTab === 'library'}
					<!-- =================== LIBRARY TAB =================== -->
					<section class="space-y-8 animate-fade-slide">
						<!-- Top Banner Row -->
						<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
							<!-- Liked Songs Banner -->
							<div
								on:click={() => (currentTab = 'liked')}
								on:keydown={(e) => e.key === 'Enter' && (currentTab = 'liked')}
								role="button"
								tabindex="0"
								class="md:col-span-2 teja-gradient-card p-6 sm:p-8 rounded-3xl border border-[#FF2D78]/30 shadow-2xl relative overflow-hidden cursor-pointer group"
							>
								<div class="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
									<div>
										<span class="text-xs font-bold uppercase tracking-widest text-white/80">Collection</span>
										<h2 class="text-2xl sm:text-3xl font-black text-white mt-1">Liked Songs</h2>
										<p class="text-sm text-white/80 mt-1">{$likedTracks.length} favorite {$likedTracks.length === 1 ? 'track' : 'tracks'}</p>
									</div>

									<div class="flex items-center gap-3 mt-4">
										<button
											type="button"
											aria-label="Play Collection"
											on:click|stopPropagation={() => playLikedTracks(false)}
											disabled={!$likedTracks.length}
											class="w-12 h-12 rounded-full bg-white text-[#0A0A0F] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
										>
											<svg class="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
										</button>
										<span class="text-xs font-bold text-white">Play Collection</span>
									</div>
								</div>
							</div>

							<!-- Recents Banner -->
							<div
								on:click={() => (currentTab = 'recent')}
								on:keydown={(e) => e.key === 'Enter' && (currentTab = 'recent')}
								role="button"
								tabindex="0"
								class="bg-[#141418] hover:bg-[#1E1E24] p-6 rounded-3xl border border-[#2A2A32] shadow-xl flex flex-col justify-between cursor-pointer transition-colors"
							>
								<div class="w-12 h-12 rounded-2xl bg-[#FF2D78]/15 flex items-center justify-center text-[#FF2D78] mb-4">
									<svg class="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
								</div>
								<div>
									<h3 class="text-lg font-bold text-white">Recently Played</h3>
									<p class="text-xs text-[#9CA3AF] mt-1">{$recentlyPlayed.length} songs in history</p>
								</div>
							</div>
						</div>

						<!-- Custom Playlists Grid -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-bold text-white">Your Playlists</h3>
								<button
									type="button"
									on:click={handleCreatePlaylist}
									class="flex items-center gap-1.5 px-4 py-1.5 rounded-full teja-gradient-btn text-white text-xs font-bold shadow-md cursor-pointer"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
									Create Playlist
								</button>
							</div>

							<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
								<!-- New Playlist Tile -->
								<button
									type="button"
									on:click={handleCreatePlaylist}
									class="aspect-square rounded-2xl border-2 border-dashed border-[#2A2A32] hover:border-[#FF2D78] hover:bg-[#FF2D78]/5 flex flex-col items-center justify-center gap-2 text-[#9CA3AF] hover:text-white transition-all cursor-pointer p-4"
								>
									<div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#FF2D78]">
										<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
									</div>
									<span class="text-xs font-bold">New Playlist</span>
								</button>

								{#each $playlists as pl}
									<div
										on:click={() => handlePlaylistSelect({ detail: { playlist: pl } })}
										on:keydown={(e) => e.key === 'Enter' && handlePlaylistSelect({ detail: { playlist: pl } })}
										role="button"
										tabindex="0"
										class="group bg-[#141418] hover:bg-[#1E1E24] p-3 rounded-2xl border border-[#2A2A32] hover:border-[#FF2D78]/40 transition-all duration-300 cursor-pointer text-left"
									>
										<div class="aspect-square rounded-xl overflow-hidden mb-3 bg-[#2A2A32] shadow-md flex items-center justify-center text-[#FF2D78]">
											{#if pl.tracks && pl.tracks.length > 0 && pl.tracks[0].artwork}
												<img src={pl.tracks[0].artwork} alt={pl.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
											{:else}
												<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
											{/if}
										</div>
										<h4 class="text-sm font-semibold text-white truncate">{pl.name}</h4>
										<p class="text-xs text-[#9CA3AF] truncate mt-0.5">{pl.tracks?.length || 0} tracks</p>
									</div>
								{/each}
							</div>
						</div>
					</section>

				{:else if currentTab === 'liked'}
					<!-- =================== LIKED SONGS VIEW =================== -->
					<section class="space-y-6 animate-fade-slide">
						<button
							type="button"
							on:click={() => (currentTab = 'library')}
							class="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer text-sm font-medium"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
							Back to Library
						</button>

						<div class="flex flex-col sm:row items-center sm:items-end gap-6 teja-gradient-card p-6 sm:p-8 rounded-3xl border border-[#FF2D78]/30 shadow-2xl relative overflow-hidden">
							<div class="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-2xl shrink-0 border border-white/20">
								<svg class="w-20 h-20 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
							</div>

							<div class="flex-1 text-center sm:text-left min-w-0">
								<span class="text-xs font-bold uppercase tracking-widest text-white/80">Playlist</span>
								<h1 class="text-2xl sm:text-4xl font-extrabold text-white mt-1 mb-2">My Favourites</h1>
								<p class="text-sm text-white/80">{$likedTracks.length} liked songs</p>

								<div class="flex items-center justify-center sm:justify-start gap-3 mt-5">
									<button
										type="button"
										on:click={() => playLikedTracks(false)}
										disabled={!$likedTracks.length}
										class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#0A0A0F] text-sm font-bold shadow-xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
									>
										<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
										Play All
									</button>
									<button
										type="button"
										on:click={() => playLikedTracks(true)}
										disabled={!$likedTracks.length}
										class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/20 hover:bg-black/30 text-white text-sm font-semibold border border-white/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
									>
										<svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
										Shuffle
									</button>
								</div>
							</div>
						</div>

						<!-- Liked Tracks List -->
						{#if $likedTracks.length === 0}
							<div class="py-16 text-center text-[#6B7280] bg-[#141418] rounded-2xl border border-[#2A2A32]">
								<p class="text-sm font-bold text-white/80">No liked songs yet</p>
								<p class="text-xs text-[#9CA3AF] mt-1">Heart songs across the app to build your favorites</p>
							</div>
						{:else}
							<div class="space-y-1">
								{#each $likedTracks as track, idx (track.id || idx)}
									<TrackRow {track} index={idx} playlist={$likedTracks} on:addToPlaylist={handleOpenAddToPlaylist} />
								{/each}
							</div>
						{/if}
					</section>

				{:else if currentTab === 'recent'}
					<!-- =================== RECENTLY PLAYED VIEW =================== -->
					<section class="space-y-6 animate-fade-slide">
						<button
							type="button"
							on:click={() => (currentTab = 'library')}
							class="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer text-sm font-medium"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
							Back to Library
						</button>

						<div class="flex items-center justify-between">
							<div>
								<span class="text-xs font-bold uppercase tracking-widest text-[#FF2D78]">History</span>
								<h2 class="text-2xl font-black text-white">Recently Played</h2>
							</div>
							{#if $recentlyPlayed.length > 0}
								<button
									type="button"
									on:click={() => audioPlayer.playQueue($recentlyPlayed, 0)}
									class="flex items-center gap-1.5 px-4 py-2 rounded-full teja-gradient-btn text-white text-xs font-bold shadow-md cursor-pointer"
								>
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
									Play All
								</button>
							{/if}
						</div>

						{#if $recentlyPlayed.length === 0}
							<div class="py-16 text-center text-[#6B7280] bg-[#141418] rounded-2xl border border-[#2A2A32]">
								<p class="text-sm font-bold text-white/80">No recent tracks</p>
								<p class="text-xs text-[#9CA3AF] mt-1">Songs you listen to will appear here</p>
							</div>
						{:else}
							<div class="space-y-1">
								{#each $recentlyPlayed as track, idx (track.id + '-' + idx)}
									<TrackRow {track} index={idx} playlist={$recentlyPlayed} on:addToPlaylist={handleOpenAddToPlaylist} />
								{/each}
							</div>
						{/if}
					</section>

				{:else if currentTab === 'playlist' && selectedPlaylist}
					<!-- =================== PLAYLIST DETAIL VIEW =================== -->
					<PlaylistView playlist={selectedPlaylist} on:back={() => (currentTab = 'library')} />

				{:else if currentTab === 'album' && selectedAlbum}
					<!-- =================== ALBUM DETAIL VIEW =================== -->
					<AlbumView albumData={selectedAlbum} albumId={selectedAlbum.id} on:back={() => (currentTab = 'trending')} />

				{:else if currentTab === 'artist' && selectedArtist}
					<!-- =================== ARTIST DETAIL VIEW =================== -->
					<ArtistView
						artistData={selectedArtist}
						artistId={selectedArtist.id}
						on:back={() => (currentTab = 'trending')}
						on:selectAlbum={handleAlbumSelect}
					/>
				{/if}
			</div>
		</main>
	</div>

	<!-- Bottom Player Bar (Desktop & Tablet) -->
	<PlayerBar
		bind:isQueueOpen
		bind:isMobileExpanded
		bind:isLyricsOpen
	/>

	<!-- Mobile Bottom Navigation Bar (Phone) -->
	<MobileBottomNav
		activeTab={currentTab}
		on:selectTab={handleNavSelect}
		on:openPlayer={() => (isMobileExpanded = true)}
	/>

	<!-- Slide-over Queue Panel -->
	<QueueDrawer
		isOpen={isQueueOpen}
		on:close={() => (isQueueOpen = false)}
	/>

	<!-- Fullscreen Mobile Player Sheet -->
	<MobilePlayerSheet
		isOpen={isMobileExpanded}
		on:close={() => (isMobileExpanded = false)}
		on:openTimer={() => (isTimerOpen = true)}
		on:openSettings={() => (isSettingsOpen = true)}
		on:openLyrics={() => (isLyricsOpen = true)}
	/>

	<!-- Lyrics Modal / Floating Panel -->
	<LyricsPanel
		isOpen={isLyricsOpen}
		on:close={() => (isLyricsOpen = false)}
	/>

	<!-- Sleep Timer Modal -->
	<TimerModal
		isOpen={isTimerOpen}
		on:close={() => (isTimerOpen = false)}
	/>

	<!-- Settings Modal -->
	<SettingsModal
		isOpen={isSettingsOpen}
		on:close={() => (isSettingsOpen = false)}
		on:openImportExport={() => (isImportExportOpen = true)}
	/>

	<!-- About Modal -->
	<AboutModal
		isOpen={isAboutOpen}
		on:close={() => (isAboutOpen = false)}
	/>

	<!-- Add to Playlist Modal -->
	<AddToPlaylistModal
		isOpen={isAddToPlaylistOpen}
		track={trackToAddToPlaylist}
		on:close={() => {
			isAddToPlaylistOpen = false;
			trackToAddToPlaylist = null;
		}}
	/>

	<!-- Import / Export Library Modal -->
	<ImportExportModal
		isOpen={isImportExportOpen}
		on:close={() => (isImportExportOpen = false)}
	/>

	<!-- Floating Toast Notifications -->
	<ToastNotification />
</div>
