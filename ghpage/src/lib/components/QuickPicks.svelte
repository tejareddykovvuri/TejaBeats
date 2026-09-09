<!-- QuickPicks.svelte — 5 Quick picks cards matching Screenshot 1 & explore_screen.dart -->
<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const picks = [
		{
			label: 'Chill Vibes',
			query: 'Chill Vibes',
			gradient: 'from-[#6366F1] to-[#8B5CF6]',
			shadowColor: 'rgba(99, 102, 241, 0.45)',
			iconType: 'music'
		},
		{
			label: 'Workout',
			query: 'Workout',
			gradient: 'from-[#FF2D78] to-[#FF6B35]',
			shadowColor: 'rgba(255, 45, 120, 0.45)',
			iconType: 'run'
		},
		{
			label: 'Focus',
			query: 'Focus',
			gradient: 'from-[#0EA5E0] to-[#10B981]',
			shadowColor: 'rgba(16, 185, 129, 0.45)',
			iconType: 'book'
		},
		{
			label: 'Romantic',
			query: 'Romantic',
			gradient: 'from-[#EF4444] to-[#EC4899]',
			shadowColor: 'rgba(236, 72, 153, 0.45)',
			iconType: 'heart'
		},
		{
			label: 'Party',
			query: 'Party',
			gradient: 'from-[#F59E0B] to-[#EF4444]',
			shadowColor: 'rgba(245, 158, 11, 0.45)',
			iconType: 'party'
		}
	];

	function handlePick(pick) {
		dispatch('selectPick', { query: pick.query, pick });
		dispatch('select', { query: pick.query, pick });
	}
</script>

<section class="mb-6 select-none">
	<div class="flex items-center justify-between mb-3 px-1">
		<h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
			<span>Quick Picks</span>
		</h3>
	</div>

	<!-- 5 Cards Row matching EXE Screenshot 1 -->
	<div class="flex items-stretch gap-3.5 pb-2 overflow-x-auto custom-scrollbar">
		{#each picks as pick}
			<button
				type="button"
				on:click={() => handlePick(pick)}
				class="group h-[104px] rounded-2xl bg-gradient-to-br {pick.gradient} p-3.5 flex flex-col justify-between text-left cursor-pointer border border-white/20 transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] relative overflow-hidden"
				style="box-shadow: 0 6px 18px {pick.shadowColor};"
			>
				<!-- Subtle animated background glow on hover -->
				<div class="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/15 blur-sm group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

				<!-- Top-Left Icon -->
				<div class="text-white group-hover:rotate-6 transition-transform duration-300">
					{#if pick.iconType === 'music'}
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
					{:else if pick.iconType === 'run'}
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 6.1 1.2z"/></svg>
					{:else if pick.iconType === 'book'}
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
					{:else if pick.iconType === 'heart'}
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
					{:else if pick.iconType === 'party'}
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zM21 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
					{/if}
				</div>

				<!-- Bottom-Left Label -->
				<span class="text-[13.5px] font-bold text-white tracking-tight">{pick.label}</span>
			</button>
		{/each}
	</div>
</section>
