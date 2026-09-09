<!-- Sidebar.svelte — Desktop sidebar matching EXE: Home → Search → Library, My Favourites under PLAYLISTS -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { playlists } from '$lib/player/playlistStore.js';
	import tejabeatsLogo from '$lib/assets/tejabeats_logo.png';

	export let activeTab = 'trending';

	const dispatch = createEventDispatcher();

	let isCollapsed = false;

	function changeTab(tab) {
		activeTab = tab;
		dispatch('selectTab', { tab });
		dispatch('changeTab', { tab });
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}
</script>

<aside
	class="flex flex-col shrink-0 bg-[#0A0A0F] border-r border-white/[0.06] py-5 select-none transition-all duration-300 relative w-[240px] px-3"
>

	<!-- Brand Header (Matching Flutter DesktopSidebar) -->
	<div class="mb-6 pt-1 {isCollapsed ? 'px-0' : 'px-2'}">
		<button
			type="button"
			on:click={() => changeTab('trending')}
			class="w-full flex items-center {isCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer text-left group"
			title="TejaBeats"
		>
			<div class="w-10 h-10 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(255,45,120,0.45)] group-hover:scale-105 transition-transform duration-200 shrink-0 bg-black">
				<img src={tejabeatsLogo} alt="TejaBeats" class="w-full h-full object-cover" />
			</div>
			{#if !isCollapsed}
				<div class="min-w-0 flex-1">
					<h1 class="text-[18px] font-black tracking-[1.2px] text-white leading-tight" style="font-family: Unageo, sans-serif;">TEJABEATS</h1>
					<p class="text-[8px] font-bold tracking-[0.8px] text-white/50 uppercase mt-0.5" style="font-family: Gilroy, sans-serif;">YOUR MUSIC. YOUR BEATS.</p>
				</div>
			{/if}
		</button>
	</div>

	<!-- Main Navigation Items: Home → Search → Library (matching EXE) -->
	<div class="space-y-2 mb-6 w-full {isCollapsed ? 'flex flex-col items-center' : ''}">
		<!-- Home Button -->
		<button
			type="button"
			on:click={() => changeTab('trending')}
			class="transition-all duration-200 cursor-pointer group flex items-center
				{isCollapsed
					? 'w-11 h-11 justify-center rounded-2xl ' + (activeTab === 'trending' ? 'bg-[#FF2D78] text-white shadow-[0_0_16px_rgba(255,45,120,0.5)]' : 'text-white/60 hover:text-white hover:bg-white/5')
					: 'w-full gap-3.5 px-3.5 py-2.5 rounded-xl ' + (activeTab === 'trending' ? 'bg-[#FF2D78]/12 border border-[#FF2D78]/30 text-[#FF2D78]' : 'hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white border border-transparent')}"
			title="Home"
		>
			<svg class="w-5 h-5 {isCollapsed && activeTab === 'trending' ? 'text-white' : ''}" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
			{#if !isCollapsed}
				<span class="text-[14px] font-bold {activeTab === 'trending' ? 'text-[#FF2D78]' : 'text-[#9CA3AF] group-hover:text-white'}">Home</span>
			{/if}
		</button>

		<!-- Search Button -->
		<button
			type="button"
			on:click={() => changeTab('search')}
			class="transition-all duration-200 cursor-pointer group flex items-center
				{isCollapsed
					? 'w-11 h-11 justify-center rounded-2xl ' + (activeTab === 'search' ? 'bg-[#FF2D78] text-white shadow-[0_0_16px_rgba(255,45,120,0.5)]' : 'text-white/60 hover:text-white hover:bg-white/5')
					: 'w-full gap-3.5 px-3.5 py-2.5 rounded-xl ' + (activeTab === 'search' ? 'bg-[#FF2D78]/12 border border-[#FF2D78]/30 text-[#FF2D78]' : 'hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white border border-transparent')}"
			title="Search"
		>
			<svg class="w-5 h-5 {isCollapsed && activeTab === 'search' ? 'text-white' : ''}" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
			{#if !isCollapsed}
				<span class="text-[14px] font-bold {activeTab === 'search' ? 'text-[#FF2D78]' : 'text-[#9CA3AF] group-hover:text-white'}">Search</span>
			{/if}
		</button>

		<!-- Library Button -->
		<button
			type="button"
			on:click={() => changeTab('library')}
			class="transition-all duration-200 cursor-pointer group flex items-center
				{isCollapsed
					? 'w-11 h-11 justify-center rounded-2xl ' + (activeTab === 'library' || activeTab === 'recent' || activeTab === 'playlists' ? 'bg-[#FF2D78] text-white shadow-[0_0_16px_rgba(255,45,120,0.5)]' : 'text-white/60 hover:text-white hover:bg-white/5')
					: 'w-full gap-3.5 px-3.5 py-2.5 rounded-xl ' + (activeTab === 'library' || activeTab === 'recent' || activeTab === 'playlists' ? 'bg-[#FF2D78]/12 border border-[#FF2D78]/30 text-[#FF2D78]' : 'hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white border border-transparent')}"
			title="Library"
		>
			<svg class="w-5 h-5 {isCollapsed && (activeTab === 'library' || activeTab === 'recent' || activeTab === 'playlists') ? 'text-white' : ''}" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
			{#if !isCollapsed}
				<span class="text-[14px] font-bold {activeTab === 'library' || activeTab === 'recent' || activeTab === 'playlists' ? 'text-[#FF2D78]' : 'text-[#9CA3AF] group-hover:text-white'}">Library</span>
			{/if}
		</button>
	</div>

	<!-- Playlists Header (Only when expanded) -->
	{#if !isCollapsed}
		<div class="px-3 mb-2 flex items-center justify-between">
			<span class="text-[11px] font-bold text-[#6B7280] tracking-[1.2px] uppercase">PLAYLISTS</span>
			<button
				type="button"
				on:click={() => dispatch('createPlaylist')}
				class="w-5 h-5 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
				title="Create Playlist"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
			</button>
		</div>

		<!-- Default & User Playlists -->
		<div class="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
			<!-- My Favourites (moved from main nav to match EXE) -->
			<button
				type="button"
				on:click={() => changeTab('liked')}
				class="flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer text-left w-full group
					{activeTab === 'liked' ? 'bg-[#FF2D78]/10 text-[#FF2D78]' : 'hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white'}"
			>
				<svg class="w-4 h-4 text-[#FF2D78] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
				<span class="text-[13.5px] font-medium truncate">My Favourites</span>
			</button>

			<!-- Chill Beats -->
			<button
				type="button"
				on:click={() => dispatch('quickSearch', { query: 'Chill Beats' })}
				class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white transition-all cursor-pointer text-left w-full group"
			>
				<svg class="w-4 h-4 text-[#9CA3AF] group-hover:text-white shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
				<span class="text-[13.5px] font-medium truncate">Chill Beats</span>
			</button>

			<!-- Workout Mix -->
			<button
				type="button"
				on:click={() => dispatch('quickSearch', { query: 'Workout Mix' })}
				class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white transition-all cursor-pointer text-left w-full group"
			>
				<svg class="w-4 h-4 text-[#9CA3AF] group-hover:text-white shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/></svg>
				<span class="text-[13.5px] font-medium truncate">Workout Mix</span>
			</button>

			<!-- Roadtrip Songs -->
			<button
				type="button"
				on:click={() => dispatch('quickSearch', { query: 'Roadtrip Songs' })}
				class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white transition-all cursor-pointer text-left w-full group"
			>
				<svg class="w-4 h-4 text-[#FF9800] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
				<span class="text-[13.5px] font-medium truncate">Roadtrip Songs</span>
			</button>

			<!-- Custom user created playlists -->
			{#each $playlists as pl (pl.id)}
				<button
					type="button"
					on:click={() => dispatch('selectPlaylist', { playlist: pl })}
					class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-[#9CA3AF] hover:text-white transition-all cursor-pointer text-left w-full group"
				>
					<svg class="w-4 h-4 text-[#FF2D78] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
					<span class="text-[13.5px] font-medium truncate">{pl.name}</span>
				</button>
			{/each}
		</div>
	{:else}
		<div class="flex-1"></div>
	{/if}

	<!-- Settings at Bottom (matching Flutter) -->
	<button
		type="button"
		on:click={() => dispatch('openSettings')}
		class="transition-all cursor-pointer border border-transparent group text-left text-[#9CA3AF] hover:text-white flex items-center
			{isCollapsed ? 'w-11 h-11 justify-center rounded-2xl hover:bg-white/5' : 'w-full gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04]'}"
		title="Settings"
	>
		<svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
		{#if !isCollapsed}
			<span class="text-[13.5px] font-medium">Settings</span>
		{/if}
	</button>
</aside>
