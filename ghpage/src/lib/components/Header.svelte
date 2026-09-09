<!-- Header.svelte — Explore screen header matching ExploreScreen app bar -->
<!-- In the EXE, the search bar is a GestureDetector that navigates to /Search -->
<!-- It is NOT a real input. Clicking it switches to the Search tab. -->
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function getGreeting() {
		const h = new Date().getHours();
		if (h < 12) return 'Good Morning, Teja';
		if (h < 17) return 'Good Afternoon, Teja';
		return 'Good Evening, Teja';
	}

	function getGreetingEmoji() {
		const h = new Date().getHours();
		if (h < 6) return '🌙';
		if (h < 12) return '☀️';
		if (h < 17) return '👋';
		return '🌙';
	}
</script>

<div class="mb-6 animate-fade-slide select-none">
	<!-- Top Row: Greeting + Action Buttons (Matching EXE ExploreScreen AppBar) -->
	<div class="flex items-center justify-between mb-5">
		<div>
			<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
				<span>{getGreeting()}</span>
				<span class="inline-block hover:rotate-12 hover:scale-125 transition-all duration-300 cursor-default">{getGreetingEmoji()}</span>
			</h1>
			<p class="text-xs font-bold tracking-[1.2px] text-[#FF2D78] uppercase mt-1.5 opacity-80">YOUR MUSIC. YOUR BEATS.</p>
		</div>

		<!-- Action Buttons: Bell, Sleep Timer, Settings, Audio Equalizer (EXE screenshot) -->
		<div class="flex items-center gap-1">
			<!-- Notification Bell Button -->
			<button
				type="button"
				class="w-10 h-10 flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
				title="Notifications"
			>
				<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
			</button>

			<!-- Sleep Timer Button -->
			<button
				type="button"
				on:click={() => dispatch('openTimer')}
				class="w-10 h-10 flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
				title="Sleep Timer"
			>
				<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
			</button>

			<!-- Settings Button -->
			<button
				type="button"
				on:click={() => dispatch('openSettings')}
				class="w-10 h-10 flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
				title="Settings"
			>
				<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
			</button>

			<!-- Lyrics / Audio Button -->
			<button
				type="button"
				on:click={() => dispatch('openLyrics')}
				class="w-10 h-10 flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
				title="Lyrics & Music"
			>
				<svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
			</button>
		</div>
	</div>

	<!-- Ultra-Premium Glassmorphic Search Pill (navigates to /Search) -->
	<button
		type="button"
		on:click={() => dispatch('goToSearch')}
		class="w-full group cursor-pointer text-left focus:outline-none"
	>
		<div class="relative flex items-center gap-3.5 h-[54px] px-4.5 sm:px-5 rounded-full bg-gradient-to-r from-[#13131D]/90 via-[#181826]/80 to-[#13131D]/90 backdrop-blur-2xl border border-white/[0.08] group-hover:border-[#FF2D78]/60 group-active:scale-[0.99] transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.35)] group-hover:shadow-[0_0_28px_rgba(255,45,120,0.2)] overflow-hidden">
			<!-- Subtle ambient top highlight -->
			<div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:via-[#FF2D78]/50 transition-all duration-300"></div>

			<!-- Search Icon in Glass Disc -->
			<div class="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-[#FF2D78]/15 border border-white/[0.06] group-hover:border-[#FF2D78]/30 flex items-center justify-center shrink-0 transition-all duration-300">
				<svg class="w-4.5 h-4.5 text-[#9CA3AF] group-hover:text-[#FF2D78] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			</div>

			<!-- Search Placeholder Text -->
			<span class="flex-1 text-[14.5px] font-medium text-[#8A8A99] group-hover:text-white transition-colors duration-200 truncate">Search for songs, artists, albums, playlists...</span>

			<!-- Premium Keyboard Shortcut Hint -->
			<span class="hidden sm:flex items-center gap-1 text-[11px] text-white/30 font-mono bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 group-hover:text-white/60 group-hover:border-white/20 transition-all">
				<span class="text-[10px]">Ctrl</span>
				<span class="text-white/20">+</span>
				<span class="font-bold">K</span>
			</span>
		</div>
	</button>
</div>
