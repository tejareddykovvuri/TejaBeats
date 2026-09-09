<script>
	import '../app.css';
	import favicon from '$lib/assets/tejabeats_logo.png';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-[#0A0A0F] text-white selection:bg-[#FF2D78] selection:text-white">
	{@render children?.()}
</div>
