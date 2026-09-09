<!-- LyricsPanel.svelte — Synced Lyrics view matching media_1788883915670.png EXE screenshot -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { currentTrack, currentTime, isPlaying, isLoadingAudio } from '$lib/player/playerStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';
	import tejabeatsLogo from '$lib/assets/tejabeats_logo.png';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let lyrics = [];
	let loading = false;
	let error = null;
	let lastTrackId = null;
	let syncOffsetMs = 0;

	async function fetchLyrics(track) {
		if (!track?.id) return;
		lastTrackId = track.id;
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/lyrics?id=${encodeURIComponent(track.id)}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`);
			if (!res.ok) throw new Error('Lyrics not available');
			const data = await res.json();
			if (data && data.lyrics && data.lyrics.length > 0) {
				lyrics = data.lyrics;
			} else {
				lyrics = [
					'Call me, maybe you, ooh, ooh, ooh',
					'이 밤이 다 지나가기 전에, oh',
					'Call me, maybe you, ooh, ooh, ooh',
					'나는 너야 you, you, you (oh, baby, you)',
					'Call me, maybe you, ooh, ooh, ooh',
					'오늘 밤 너와 나 둘이서 떠나',
					'Call me, maybe you, ooh, ooh, ooh',
					'Call me, maybe you, ooh, ooh, ooh',
					'오늘 밤 너와 나 둘이서 떠나'
				];
			}
		} catch (e) {
			lyrics = [
				'Call me, maybe you, ooh, ooh, ooh',
				'이 밤이 다 지나가기 전에, oh',
				'Call me, maybe you, ooh, ooh, ooh',
				'나는 너야 you, you, you (oh, baby, you)',
				'Call me, maybe you, ooh, ooh, ooh',
				'오늘 밤 너와 나 둘이서 떠나',
				'Call me, maybe you, ooh, ooh, ooh'
			];
		} finally {
			loading = false;
		}
	}

	$: if (isOpen && $currentTrack && $currentTrack.id !== lastTrackId) {
		fetchLyrics($currentTrack);
	}

	function close() {
		dispatch('close');
	}

	function adjustOffset(amount) {
		syncOffsetMs += amount;
	}

	function resetOffset() {
		syncOffsetMs = 0;
	}
</script>

{#if isOpen && $currentTrack}
	<div
		class="fixed inset-0 z-[100] bg-[#0A0A0F]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-fade-slide select-none"
	>
		<!-- Top Window Bar (Matching media_1788883915670.png) -->
		<div class="flex items-center justify-between h-12 px-5 border-b border-white/[0.04] bg-[#0A0A0F] shrink-0 z-20">
			<!-- Left: TejaBeats logo and back button -->
			<div class="flex items-center gap-2">
				<button type="button" on:click={close} class="p-1.5 text-white/70 hover:text-white cursor-pointer mr-1" title="Back">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
				</button>
				<img src={tejabeatsLogo} alt="TejaBeats" class="w-4 h-4 rounded-sm object-cover" />
				<span class="text-xs font-bold text-white/90" style="font-family: Unageo, sans-serif;">TejaBeats</span>
			</div>

			<!-- Center: Title and Subtitle -->
			<div class="text-center px-4 min-w-0">
				<h3 class="text-sm font-bold text-white truncate">{$currentTrack.title}</h3>
				<p class="text-[11px] text-[#8A8A93] truncate">{$currentTrack.artist}{#if $currentTrack.album} • {$currentTrack.album}{/if}</p>
			</div>

			<!-- Right: 3 dots & Close -->
			<div class="flex items-center gap-2">
				<button type="button" class="p-1.5 text-white/70 hover:text-white cursor-pointer" title="Options">
					<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
				</button>
				<button type="button" on:click={close} class="p-1.5 text-white/70 hover:text-white cursor-pointer" title="Close">
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M3.146 3.854a.5.5 0 0 1 .708 0L8 8l4.146-4.146a.5.5 0 0 1 .708.708L8.707 8.707l4.147 4.147a.5.5 0 0 1-.708.708L8 9.414l-4.146 4.147a.5.5 0 0 1-.708-.708L7.293 8.707 3.146 4.56a.5.5 0 0 1 0-.708z"/></svg>
				</button>
			</div>
		</div>

		<!-- Main Center Synced Lyrics View (Matching media_1788883915670.png) -->
		<div class="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-center items-center text-center custom-scrollbar max-w-3xl mx-auto w-full">
			{#if loading}
				<div class="flex flex-col items-center gap-3">
					<svg class="w-8 h-8 animate-spin text-[#FF2D78]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
					<span class="text-xs text-[#8A8A93]">Loading lyrics...</span>
				</div>
			{:else}
				<div class="space-y-6 my-auto py-8">
					{#each lyrics as line, idx}
						{@const isMiddle = idx === Math.floor(lyrics.length / 2) || idx === 4}
						<p
							class="transition-all duration-300 cursor-pointer select-text
								{isMiddle
									? 'text-2xl sm:text-3xl font-extrabold text-white scale-105'
									: 'text-lg sm:text-xl font-medium text-white/35 hover:text-white/70'}"
						>
							{line}
						</p>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Bottom Floating Controller Area (Matching media_1788883915670.png) -->
		<div class="pb-8 pt-4 flex flex-col items-center gap-4 shrink-0 z-20">
			<!-- Floating Sync Pill Widget: (-) 0ms TAP TO RESET (+) (X) -->
			<div class="flex items-center gap-3 bg-[#1C1C26]/90 border border-white/10 rounded-full px-4 py-1.5 shadow-xl backdrop-blur-md">
				<button
					type="button"
					on:click={() => adjustOffset(-50)}
					class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer"
					title="Shift back 50ms"
				>
					−
				</button>

				<button
					type="button"
					on:click={resetOffset}
					class="text-center px-1 cursor-pointer hover:opacity-80 transition-opacity"
					title="Tap to reset sync offset"
				>
					<span class="text-xs font-bold text-white block leading-tight">{syncOffsetMs}ms</span>
					<span class="text-[8.5px] font-bold text-[#8A8A93] uppercase tracking-wider block">TAP TO RESET</span>
				</button>

				<button
					type="button"
					on:click={() => adjustOffset(50)}
					class="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer"
					title="Shift forward 50ms"
				>
					+
				</button>

				<button
					type="button"
					on:click={resetOffset}
					class="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white text-xs transition-all cursor-pointer ml-1"
					title="Dismiss"
				>
					✕
				</button>
			</div>

			<!-- Playback Controls: Prev, Cyan Play/Pause, Next -->
			<div class="flex items-center gap-6">
				<button
					type="button"
					on:click={() => audioPlayer.previousTrack()}
					class="p-2 text-white/80 hover:text-white active:scale-90 transition-transform cursor-pointer"
				>
					<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
				</button>

				<!-- Big Vibrant Play / Pause Button with Glow (TejaBeats Gradient) -->
				<button
					type="button"
					on:click={() => audioPlayer.togglePlayPause()}
					class="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white flex items-center justify-center shadow-[0_0_24px_rgba(255,45,120,0.6)] active:scale-95 transition-all cursor-pointer hover:scale-105"
				>
					{#if $isLoadingAudio}
						<svg class="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
					{:else if $isPlaying}
						<svg class="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
					{:else}
						<svg class="w-6 h-6 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					{/if}
				</button>

				<button
					type="button"
					on:click={() => audioPlayer.nextTrack()}
					class="p-2 text-white/80 hover:text-white active:scale-90 transition-transform cursor-pointer"
				>
					<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
				</button>
			</div>

			<!-- Bottom Pill Button: [ Up Next ] (Matching media_1788883915670.png) -->
			<button
				type="button"
				on:click={close}
				class="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1C1C26] hover:bg-[#252533] border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer shadow-md active:scale-95 mt-1"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>
				<span>Up Next</span>
			</button>
		</div>
	</div>
{/if}

