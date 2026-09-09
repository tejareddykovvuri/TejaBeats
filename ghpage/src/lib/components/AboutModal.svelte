<!-- AboutModal.svelte — About modal matching AboutView -->
<script>
	import { createEventDispatcher } from 'svelte';
	import tejabeatsLogo from '$lib/assets/tejabeats_logo.png';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}
</script>

{#if isOpen}
	<div
		on:click={close}
		on:keydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="0"
		class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
	>
		<div
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			tabindex="-1"
			class="bg-[#141418] border border-[#2A2A32] rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6 text-center animate-scale-up relative overflow-hidden"
		>
			<!-- Ambient glow -->
			<div class="absolute -top-20 -left-20 w-60 h-60 bg-[#FF2D78]/20 rounded-full blur-3xl pointer-events-none"></div>

			<!-- Logo -->
			<div class="w-20 h-20 mx-auto rounded-3xl overflow-hidden shadow-2xl p-0.5 bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] relative z-10">
				<div class="w-full h-full bg-[#0A0A0F] rounded-[22px] flex items-center justify-center p-3">
					<img src={tejabeatsLogo} alt="TejaBeats Logo" class="w-full h-full object-contain" />
				</div>
			</div>

			<!-- App Info -->
			<div class="space-y-1 relative z-10">
				<h2 class="text-2xl font-black tracking-wider text-white">TEJABEATS</h2>
				<p class="text-xs font-semibold text-[#FF2D78] tracking-widest uppercase">Your Music. Your Beats.</p>
				<span class="inline-block mt-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[#9CA3AF]">
					Version 3.0.4-202 (Web Edition)
				</span>
			</div>

			<!-- Description -->
			<div class="text-xs text-[#9CA3AF] leading-relaxed relative z-10 space-y-2 bg-[#0A0A0F]/50 p-4 rounded-2xl border border-[#2A2A32]">
				<p>High quality, ad-free streaming web player converted directly from the TejaBeats desktop application.</p>
				<p class="text-[11px] text-[#6B7280]">Built with SvelteKit 2, HTML5 Audio Engine & JioSaavn API.</p>
			</div>

			<!-- Close Button -->
			<button
				type="button"
				on:click={close}
				class="w-full py-3 rounded-xl teja-gradient-btn text-white font-bold text-sm shadow-lg shadow-[#FF2D78]/25 hover:shadow-[#FF2D78]/40 active:scale-95 transition-all cursor-pointer relative z-10"
			>
				Close
			</button>
		</div>
	</div>
{/if}
