<!-- MobileBottomNav.svelte — Mobile bottom navigation bar matching HorizontalNavBar in global_footer.dart -->
<script>
	import { createEventDispatcher } from 'svelte';

	export let activeTab = 'trending'; // 'trending' | 'search' | 'library'

	const dispatch = createEventDispatcher();

	function selectTab(tab) {
		dispatch('selectTab', { tab });
	}

	function openPlayer() {
		dispatch('openPlayer');
	}
</script>

<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-[#2A2A32]/60 px-4 py-2 flex items-center justify-around">
	<!-- Home Tab -->
	<button
		type="button"
		on:click={() => selectTab('trending')}
		class="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all cursor-pointer {activeTab === 'trending'
			? 'bg-[#FF2D78]/15 text-[#FF2D78] font-bold shadow-sm'
			: 'text-[#9CA3AF] hover:text-white'}"
	>
		<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
		{#if activeTab === 'trending'}
			<span class="text-xs font-semibold">Home</span>
		{/if}
	</button>

	<!-- Search Tab -->
	<button
		type="button"
		on:click={() => selectTab('search')}
		class="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all cursor-pointer {activeTab === 'search'
			? 'bg-[#FF2D78]/15 text-[#FF2D78] font-bold shadow-sm'
			: 'text-[#9CA3AF] hover:text-white'}"
	>
		<svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
		{#if activeTab === 'search'}
			<span class="text-xs font-semibold">Search</span>
		{/if}
	</button>

	<!-- Library Tab -->
	<button
		type="button"
		on:click={() => selectTab('library')}
		class="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all cursor-pointer {activeTab === 'library' || activeTab === 'liked' || activeTab === 'recent' || activeTab === 'playlists'
			? 'bg-[#FF2D78]/15 text-[#FF2D78] font-bold shadow-sm'
			: 'text-[#9CA3AF] hover:text-white'}"
	>
		<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
		{#if activeTab === 'library' || activeTab === 'liked' || activeTab === 'recent' || activeTab === 'playlists'}
			<span class="text-xs font-semibold">Library</span>
		{/if}
	</button>

	<!-- Now Playing Tab -->
	<button
		type="button"
		on:click={openPlayer}
		class="flex items-center gap-2 px-3.5 py-2 rounded-full text-[#9CA3AF] hover:text-[#FF2D78] transition-all cursor-pointer"
	>
		<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
	</button>
</nav>
