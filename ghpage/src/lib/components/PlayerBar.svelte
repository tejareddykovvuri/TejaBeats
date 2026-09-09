<!-- PlayerBar.svelte — Bottom player bar matching mini_player_widget.dart desktop view -->
<script>
	import { currentTrack, isPlaying, isLoadingAudio, currentTime, duration, progress, volume, isMuted, shuffle, repeat, likedTracks, toggleLike, queue } from '$lib/player/playerStore.js';
	import { audioPlayer } from '$lib/player/audioService.js';

	export let isQueueOpen = false;
	export let isMobileExpanded = false;
	export let isLyricsOpen = false;

	$: isLiked = $likedTracks.some((t) => String(t.id) === String($currentTrack?.id));
	$: seekPercent = $duration > 0 ? Math.min(100, Math.max(0, ($currentTime / $duration) * 100)) : 0;
	$: volPercent = ($isMuted ? 0 : $volume) * 100;

	function formatTime(sec) {
		if (!sec || isNaN(sec)) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handleSeek(e) {
		const val = parseFloat(e.target.value);
		audioPlayer.seek(val);
	}

	function handleVolume(e) {
		audioPlayer.setVolume(parseFloat(e.target.value));
	}

	function handleImgError(e) {
		e.target.src = '/placeholder-artwork.svg';
	}
</script>

{#if $currentTrack}
	<!-- Desktop Player Bar (Matching EXE Screenshot Image 2: floating rounded card with pink neon border) -->
	<div class="hidden sm:block fixed bottom-3 left-4 right-4 z-50 select-none">
		<!-- Background with ambient glow -->
		<div class="relative h-[86px] bg-[#0E0E14]/95 backdrop-blur-2xl rounded-2xl border border-[#FF2D78]/35 px-6 flex items-center justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_24px_rgba(255,45,120,0.18)]">

			<!-- Left: Track Info + Thumbnail (Clickable to open Full Player) -->
			<div
				on:click={() => (isMobileExpanded = true)}
				on:keydown={(e) => e.key === 'Enter' && (isMobileExpanded = true)}
				role="button"
				tabindex="0"
				class="flex items-center gap-3.5 w-[300px] shrink-0 cursor-pointer group/track hover:opacity-95 transition-opacity"
				title="Open Now Playing Player"
			>
				<!-- Square Album Art Thumbnail (Matching EXE screenshot media_1788883874662.png) -->
				<div
					class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md group border border-white/10 bg-[#1A1A24]"
				>
					<img
						src={$currentTrack.artwork || '/placeholder-artwork.svg'}
						alt={$currentTrack.title}
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						on:error={handleImgError}
					/>
				</div>

				<!-- Track Text Metadata -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<h4 class="text-[13.5px] font-bold text-white truncate group-hover/track:text-[#FF2D78] transition-colors">{$currentTrack.title}</h4>
						{#if $isPlaying}
							<div class="flex items-end gap-[1.5px] h-3 shrink-0">
								<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-1"></div>
								<div class="w-[2px] bg-[#FF6B35] rounded-full eq-bar-2"></div>
								<div class="w-[2px] bg-[#FF2D78] rounded-full eq-bar-3"></div>
							</div>
						{/if}
					</div>
					<p class="text-[11.5px] text-[#9CA3AF] truncate mt-0.5">{$currentTrack.artist || 'Unknown Artist'}</p>
				</div>

				<!-- Like Heart Button -->
				<button
					type="button"
					on:click|stopPropagation={() => toggleLike($currentTrack)}
					class="p-2 shrink-0 cursor-pointer {isLiked ? 'text-[#FF2D78] animate-heart-pop' : 'text-[#6B7280] hover:text-[#FF2D78] hover:scale-110'} transition-all"
					title={isLiked ? 'Unlike' : 'Like'}
				>
					{#if isLiked}
						<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
					{:else}
						<svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
					{/if}
				</button>
			</div>

			<!-- Center: Playback Controls + Seek Bar -->
			<div class="flex-1 flex flex-col items-center gap-1.5 max-w-2xl mx-auto">
				<!-- Controls Buttons Row -->
				<div class="flex items-center gap-5">
					<!-- Shuffle Button -->
					<button
						type="button"
						on:click={() => audioPlayer.toggleShuffle()}
						class="p-2 relative cursor-pointer transition-colors {$shuffle ? 'text-[#FF2D78]' : 'text-[#9CA3AF] hover:text-white hover:scale-110'}"
						title="Shuffle"
					>
						<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
						{#if $shuffle}
							<span class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF2D78] rounded-full shadow-[0_0_6px_#FF2D78]"></span>
						{/if}
					</button>

					<!-- Previous Track -->
					<button
						type="button"
						on:click={() => audioPlayer.previousTrack()}
						class="p-2 text-white/90 hover:text-[#FF2D78] active:scale-90 transition-all cursor-pointer"
						title="Previous"
					>
						<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
					</button>

					<!-- Play / Pause Primary Button -->
					<button
						type="button"
						on:click={() => audioPlayer.togglePlayPause()}
						class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 {$isPlaying ? 'bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white shadow-[0_0_24px_rgba(255,45,120,0.6)] animate-pulse-glow' : 'bg-white text-[#0A0A0F] shadow-lg hover:scale-105'}"
						title={$isPlaying ? 'Pause' : 'Play'}
					>
						{#if $isLoadingAudio}
							<svg class="w-5 h-5 animate-spin {$isPlaying ? 'text-white' : 'text-[#0A0A0F]'}" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
						{:else if $isPlaying}
							<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
						{:else}
							<svg class="w-5 h-5 fill-[#0A0A0F] ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
						{/if}
					</button>

					<!-- Next Track -->
					<button
						type="button"
						on:click={() => audioPlayer.nextTrack()}
						class="p-2 text-white/90 hover:text-[#FF2D78] active:scale-90 transition-all cursor-pointer"
						title="Next"
					>
						<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
					</button>

					<!-- Repeat Button -->
					<button
						type="button"
						on:click={() => audioPlayer.cycleRepeat()}
						class="p-2 relative cursor-pointer transition-colors {$repeat !== 'off' ? 'text-[#FF2D78]' : 'text-[#9CA3AF] hover:text-white hover:scale-110'}"
						title="Repeat ({$repeat})"
					>
						{#if $repeat === 'one'}
							<svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>
						{:else}
							<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
						{/if}
						{#if $repeat !== 'off'}
							<span class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF2D78] rounded-full shadow-[0_0_6px_#FF2D78]"></span>
						{/if}
					</button>
				</div>

				<!-- Seek Bar with Dynamic Range Track Fill -->
				<div class="flex items-center gap-3 w-full">
					<span class="text-[11px] font-medium text-[#6B7280] w-10 text-right tabular-nums">{formatTime($currentTime)}</span>
					<div class="relative flex-1 flex items-center group py-2">
						<input
							type="range"
							min="0"
							max={$duration || 1}
							step="0.1"
							value={$currentTime}
							on:input={handleSeek}
							style="background: linear-gradient(to right, #FF2D78 0%, #FF6B35 {seekPercent}%, rgba(255,255,255,0.16) {seekPercent}%, rgba(255,255,255,0.16) 100%)"
							class="w-full"
						/>
					</div>
					<span class="text-[11px] font-medium text-[#6B7280] w-10 tabular-nums">{formatTime($duration)}</span>
				</div>
			</div>

			<!-- Right: Lyrics + Queue + Volume + Fullscreen -->
			<div class="flex items-center gap-3 w-[310px] shrink-0 justify-end">
				<!-- Lyrics Button -->
				<button
					type="button"
					on:click={() => (isLyricsOpen = !isLyricsOpen)}
					class="p-2 rounded-xl transition-all cursor-pointer {isLyricsOpen ? 'bg-[#FF2D78]/20 text-[#FF2D78] shadow-sm' : 'text-[#9CA3AF] hover:text-[#FF2D78] hover:bg-white/5'}"
					title="Lyrics"
				>
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
				</button>

				<!-- Queue Button with Badge -->
				<button
					type="button"
					on:click={() => (isQueueOpen = !isQueueOpen)}
					class="p-2 rounded-xl relative transition-all cursor-pointer {isQueueOpen ? 'bg-[#FF2D78]/20 text-[#FF2D78] shadow-sm' : 'text-[#9CA3AF] hover:text-[#FF2D78] hover:bg-white/5'}"
					title="Playing Queue ({$queue.length})"
				>
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
					{#if $queue.length > 0}
						<span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF2D78] text-white text-[9px] font-bold flex items-center justify-center">{$queue.length}</span>
					{/if}
				</button>

				<!-- Volume Button & Slider -->
				<div class="flex items-center gap-2 pl-1 border-l border-white/10">
					<button
						type="button"
						on:click={() => audioPlayer.toggleMute()}
						class="p-1 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
						title={$isMuted ? 'Unmute' : 'Mute'}
					>
						{#if $isMuted || $volume === 0}
							<svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
						{:else if $volume < 0.5}
							<svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
						{:else}
							<svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
						{/if}
					</button>

					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={$isMuted ? 0 : $volume}
						on:input={handleVolume}
						style="background: linear-gradient(to right, #FF2D78 0%, #FF6B35 {volPercent}%, rgba(255,255,255,0.16) {volPercent}%, rgba(255,255,255,0.16) 100%)"
						class="w-20"
					/>
				</div>

				<!-- Fullscreen Expand Button (Matching EXE Screenshot media_1788888501399.png) -->
				<button
					type="button"
					on:click={() => (isMobileExpanded = true)}
					class="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all cursor-pointer shrink-0"
					title="Expand Now Playing"
				>
					<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile Mini Player (Floating 68px glass pill card) -->
	<div
		on:click={() => (isMobileExpanded = true)}
		on:keydown={(e) => e.key === 'Enter' && (isMobileExpanded = true)}
		role="button"
		tabindex="0"
		class="sm:hidden fixed bottom-[72px] left-3 right-3 z-50 h-[68px] bg-[#141418]/95 backdrop-blur-2xl border border-[#2A2A32] rounded-2xl shadow-2xl flex items-center gap-3 px-3.5 cursor-pointer overflow-hidden animate-fade-slide"
	>
		<!-- Mini Progress Bar at bottom of card -->
		<div class="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
			<div class="h-full bg-gradient-to-r from-[#FF2D78] to-[#FF6B35]" style="width: {seekPercent}%"></div>
		</div>

		<!-- Mini Artwork Thumbnail (Square rounded-xl matching Flutter MiniPlayerCard) -->
		<div class="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md bg-[#1A1A24]">
			<img src={$currentTrack.artwork || '/placeholder-artwork.svg'} alt={$currentTrack.title} class="w-full h-full object-cover" on:error={handleImgError} />
		</div>


		<div class="flex-1 min-w-0">
			<h4 class="text-[13px] font-bold text-white truncate">{$currentTrack.title}</h4>
			<p class="text-[11px] text-[#9CA3AF] truncate">{$currentTrack.artist || 'Unknown'}</p>
		</div>

		<!-- Mobile Play / Pause Button -->
		<div
			on:click|stopPropagation={() => audioPlayer.togglePlayPause()}
			on:keydown|stopPropagation
			role="button"
			tabindex="0"
			class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 {$isPlaying ? 'bg-gradient-to-tr from-[#FF2D78] to-[#FF6B35] text-white shadow-[0_0_16px_rgba(255,45,120,0.5)]' : 'bg-white/15 text-white'}"
		>
			{#if $isLoadingAudio}
				<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
			{:else if $isPlaying}
				<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
			{:else}
				<svg class="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
			{/if}
		</div>
	</div>
{/if}
