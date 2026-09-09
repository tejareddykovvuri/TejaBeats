<script>
	import { createEventDispatcher } from 'svelte';
	import tejabeatsLogo from '$lib/assets/tejabeats_logo.png';
	const dispatch = createEventDispatcher();
</script>

<div class="hidden lg:flex items-center justify-between h-8 bg-[#0A0A0F] border-b border-white/[0.04] px-3 select-none z-50 relative">
	<!-- Left: TejaBeats Brand Logo & Title -->
	<div class="flex items-center gap-2">
		<img src={tejabeatsLogo} alt="TejaBeats" class="w-4 h-4 rounded-sm object-cover" />
		<span class="text-[12px] font-bold tracking-wider text-white/90" style="font-family: Unageo, sans-serif;">TejaBeats</span>
	</div>

	<!-- Right: Windows Window Controls (Minimize, Maximize, Close) matching Windows EXE -->
	<div class="flex items-center h-full">
		<button
			type="button"
			class="w-11 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
			title="Minimize"
			aria-label="Minimize"
		>
			<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M2 8.5h12v1H2z"/></svg>
		</button>
		<button
			type="button"
			class="w-11 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
			title="Maximize"
			aria-label="Maximize"
		>
			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="0.5"/></svg>
		</button>
		<button
			type="button"
			class="w-11 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#E81123] transition-colors cursor-pointer"
			title="Close"
			aria-label="Close"
		>
			<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M3.146 3.854a.5.5 0 0 1 .708 0L8 8l4.146-4.146a.5.5 0 0 1 .708.708L8.707 8.707l4.147 4.147a.5.5 0 0 1-.708.708L8 9.414l-4.146 4.147a.5.5 0 0 1-.708-.708L7.293 8.707 3.146 4.56a.5.5 0 0 1 0-.708z"/></svg>
		</button>
	</div>
</div>

