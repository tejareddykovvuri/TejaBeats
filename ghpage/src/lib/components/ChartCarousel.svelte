<!-- ChartCarousel.svelte — Billboard charts carousel with automatic smooth scrolling matching Flutter EXE -->
<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	const dispatch = createEventDispatcher();

	let scrollContainer;
	let autoScrollTimer = null;
	let isHovered = false;

	const charts = [
		{
			title: 'Current Albums',
			subtitle: 'Top Current Albums',
			image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
			query: 'Current Albums'
		},
		{
			title: 'Independent Albums',
			subtitle: 'Top Independent Albums',
			image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
			query: 'Independent Albums'
		},
		{
			title: 'Catalog Albums',
			subtitle: 'Top Catalog Albums',
			image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
			query: 'Catalog Albums'
		},
		{
			title: 'Soundtracks',
			subtitle: 'Top Soundtracks',
			image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
			query: 'Soundtracks'
		},
		{
			title: 'Hot 100',
			subtitle: 'The Standard of Music',
			image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
			query: 'Billboard Hot 100'
		}
	];

	function handleSelect(chart) {
		dispatch('selectChart', { chart, query: chart.query });
	}

	function scroll(direction) {
		if (scrollContainer) {
			const scrollAmount = direction === 'left' ? -360 : 360;
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}

	function autoAdvance() {
		if (!scrollContainer || isHovered) return;
		const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
		if (scrollContainer.scrollLeft >= maxScroll - 20) {
			scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
		} else {
			scrollContainer.scrollBy({ left: 360, behavior: 'smooth' });
		}
	}

	onMount(() => {
		autoScrollTimer = setInterval(autoAdvance, 3500);
	});

	onDestroy(() => {
		if (autoScrollTimer) clearInterval(autoScrollTimer);
	});
</script>

<section
	class="mb-8 select-none relative group/section"
	on:mouseenter={() => (isHovered = true)}
	on:mouseleave={() => (isHovered = false)}
>
	<!-- Carousel Controls (Left & Right floating buttons) -->
	<button
		type="button"
		on:click={() => scroll('left')}
		class="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 cursor-pointer shadow-xl hover:scale-110"
		aria-label="Scroll left"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
	</button>

	<button
		type="button"
		on:click={() => scroll('right')}
		class="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-200 cursor-pointer shadow-xl hover:scale-110"
		aria-label="Scroll right"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
	</button>

	<!-- Horizontal Scrollable Container matching Screenshot 1 -->
	<div
		bind:this={scrollContainer}
		class="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar scroll-smooth snap-x"
	>
		{#each charts as chart}
			<button
				type="button"
				on:click={() => handleSelect(chart)}
				class="shrink-0 w-[320px] sm:w-[360px] h-[190px] rounded-2xl relative overflow-hidden text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 group snap-start shadow-xl"
			>
				<!-- Background Image -->
				<img
					src={chart.image}
					alt={chart.title}
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					loading="lazy"
				/>

				<!-- Gradient Overlay matching Flutter ChartWidget.dart (transparent -> 0.25 -> 0.8 black) -->
				<div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/85"></div>

				<!-- Play Hover Badge -->
				<div class="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg group-hover:scale-110">
					<svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
				</div>

				<!-- Title at Bottom Left matching Screenshot 1 & ChartWidget.dart -->
				<div class="absolute bottom-4 left-4 right-4 z-10">
					<h4 class="text-[19px] font-extrabold text-white tracking-tight leading-tight">{chart.title}</h4>
					<p class="text-[11px] font-medium text-white/70 mt-0.5">{chart.subtitle}</p>
				</div>
			</button>
		{/each}
	</div>
</section>
