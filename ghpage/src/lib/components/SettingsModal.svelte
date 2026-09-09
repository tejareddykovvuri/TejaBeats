<!-- SettingsModal.svelte — Premium Settings Modal matching Flutter EXE setting_view.dart -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { showToast } from '$lib/player/playerStore.js';
	import { clearSearchHistory } from '$lib/player/searchHistoryStore.js';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	// Active Category Tab: 'audio' | 'playback' | 'storage' | 'shortcuts'
	let activeTab = 'audio';

	// Settings State
	let userName = 'Teja';
	let isEditingName = false;
	let newNameInput = 'Teja';

	let audioQuality = '320kbps';
	let autoplay = true;
	let autoFallback = true;
	let volumeNormalization = false;
	let crossfadeDuration = 3;
	let equalizerPreset = 'Bass Boost';
	let miniVisualizer = true;

	const eqPresets = ['Flat', 'Bass Boost', 'Vocal', 'Pop', 'Rock', 'Electronic'];

	function close() {
		dispatch('close');
	}

	function saveName() {
		if (newNameInput.trim()) {
			userName = newNameInput.trim();
			isEditingName = false;
			showToast(`Name updated to "${userName}"`);
		}
	}

	function handleClearCache() {
		if (confirm('Clear local search history and cache? Playlists and favorites will NOT be deleted.')) {
			try {
				clearSearchHistory();
				showToast('Search cache cleared successfully');
			} catch (e) {
				showToast('Failed to clear cache');
			}
		}
	}

	function handleOpenImportExport() {
		dispatch('openImportExport');
		close();
	}
</script>

{#if isOpen}
	<div
		on:click={close}
		on:keydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="0"
		class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
	>
		<div
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			tabindex="-1"
			class="bg-[#12121A] border border-white/[0.08] rounded-3xl w-full max-w-2xl h-[85vh] max-h-[720px] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-up text-left select-none"
		>
			<!-- Modal Header with App Branding (matching Flutter AppBar) -->
			<div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0E0E16]/80 backdrop-blur-sm">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-[#FF2D78]/15 border border-[#FF2D78]/30 flex items-center justify-center text-[#FF2D78] shadow-[0_0_15px_rgba(255,45,120,0.2)]">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
					</div>
					<div>
						<h3 class="text-lg font-extrabold text-white tracking-tight">Settings</h3>
						<p class="text-xs text-[#9CA3AF]">Player, Audio & System Preferences</p>
					</div>
				</div>

				<button
					type="button"
					aria-label="Close settings"
					on:click={close}
					class="w-9 h-9 flex items-center justify-center text-[#9CA3AF] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			</div>

			<!-- Top Segmented Tabs Navigation -->
			<div class="px-6 pt-3 pb-2 flex items-center gap-2 border-b border-white/[0.04] bg-[#0E0E16]/40 overflow-x-auto custom-scrollbar shrink-0">
				{#each [
					{ id: 'audio', label: 'Audio & Quality', icon: 'audio' },
					{ id: 'playback', label: 'Playback & Engine', icon: 'play' },
					{ id: 'storage', label: 'Data & Storage', icon: 'storage' },
					{ id: 'shortcuts', label: 'Shortcuts', icon: 'keyboard' }
				] as tab}
					<button
						type="button"
						on:click={() => (activeTab = tab.id)}
						class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 {activeTab === tab.id
							? 'bg-[#FF2D78] text-white shadow-md shadow-[#FF2D78]/25 scale-[1.02]'
							: 'text-[#9CA3AF] hover:text-white hover:bg-white/[0.04]'}"
					>
						{#if tab.icon === 'audio'}
							<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
						{:else if tab.icon === 'play'}
							<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
						{:else if tab.icon === 'storage'}
							<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
						{:else if tab.icon === 'keyboard'}
							<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
						{/if}
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>

			<!-- Scrollable Content Body with generous bottom padding -->
			<div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-12">
				{#if activeTab === 'audio'}
					<!-- =================== AUDIO & QUALITY TAB =================== -->

					<!-- User Profile Card -->
					<div class="p-4 rounded-2xl bg-[#181824] border border-white/[0.06] flex items-center justify-between">
						<div class="flex items-center gap-3.5">
							<div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF2D78] to-[#FF6B35] flex items-center justify-center text-white font-black text-base shadow-md">
								{userName.charAt(0).toUpperCase()}
							</div>
							<div>
								<span class="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Listening As</span>
								{#if isEditingName}
									<div class="flex items-center gap-2 mt-1">
										<input
											type="text"
											bind:value={newNameInput}
											class="px-2.5 py-1 rounded-lg bg-[#0E0E16] border border-[#FF2D78] text-sm text-white focus:outline-none"
										/>
										<button
											type="button"
											on:click={saveName}
											class="px-3 py-1 rounded-lg bg-[#FF2D78] text-white text-xs font-bold cursor-pointer"
										>
											Save
										</button>
									</div>
								{:else}
									<h4 class="text-base font-bold text-white mt-0.5">{userName}</h4>
								{/if}
							</div>
						</div>

						{#if !isEditingName}
							<button
								type="button"
								on:click={() => { isEditingName = true; newNameInput = userName; }}
								class="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors cursor-pointer border border-white/10"
							>
								Edit Name
							</button>
						{/if}
					</div>

					<!-- Streaming Quality Card -->
					<div class="space-y-3">
						<span class="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block px-1">Streaming Quality</span>
						<div class="p-4 rounded-2xl bg-[#181824] border border-white/[0.06] space-y-3">
							<div class="flex items-center gap-3 mb-1">
								<div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#FF2D78]">
									<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
								</div>
								<div>
									<h4 class="text-sm font-bold text-white">Audio Stream Bitrate</h4>
									<p class="text-xs text-[#9CA3AF]">Higher quality provides studio-clarity audio playback</p>
								</div>
							</div>

							<div class="grid grid-cols-3 gap-3 pt-2">
								{#each [
									{ id: '96kbps', label: '96 kbps', tag: 'Data Saver' },
									{ id: '160kbps', label: '160 kbps', tag: 'Standard' },
									{ id: '320kbps', label: '320 kbps', tag: 'HD Ultra' }
								] as q}
									<button
										type="button"
										on:click={() => {
											audioQuality = q.id;
											showToast(`Audio quality set to ${q.label}`);
										}}
										class="py-3 px-3 rounded-xl border text-center transition-all duration-200 cursor-pointer relative overflow-hidden {audioQuality === q.id
											? 'bg-[#FF2D78]/15 border-[#FF2D78] text-white shadow-[0_0_15px_rgba(255,45,120,0.25)]'
											: 'bg-[#12121A] border-white/[0.06] text-[#9CA3AF] hover:text-white hover:border-white/20'}"
									>
										<span class="text-sm font-black block text-white">{q.label}</span>
										<span class="text-[10.5px] font-bold block mt-0.5 {audioQuality === q.id ? 'text-[#FF2D78]' : 'text-[#9CA3AF]'}">{q.tag}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- Equalizer Preset Selector -->
					<div class="space-y-3">
						<span class="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block px-1">Hardware Equalizer Preset</span>
						<div class="p-4 rounded-2xl bg-[#181824] border border-white/[0.06] space-y-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#FF2D78]">
										<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/></svg>
									</div>
									<div>
										<h4 class="text-sm font-bold text-white">Audio Profile</h4>
										<p class="text-xs text-[#9CA3AF]">Tuned DSP frequency equalization</p>
									</div>
								</div>
								<span class="text-xs font-bold text-[#FF2D78] px-2.5 py-1 rounded-full bg-[#FF2D78]/10 border border-[#FF2D78]/20">{equalizerPreset}</span>
							</div>

							<div class="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
								{#each eqPresets as preset}
									<button
										type="button"
										on:click={() => {
											equalizerPreset = preset;
											showToast(`Equalizer set to ${preset}`);
										}}
										class="py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer {equalizerPreset === preset
											? 'bg-[#FF2D78] text-white border-[#FF2D78] shadow-sm'
											: 'bg-[#12121A] border-white/[0.06] text-[#9CA3AF] hover:text-white'}"
									>
										{preset}
									</button>
								{/each}
							</div>
						</div>
					</div>

				{:else if activeTab === 'playback'}
					<!-- =================== PLAYBACK & ENGINE TAB =================== -->

					<div class="p-4 rounded-2xl bg-[#181824] border border-white/[0.06] space-y-5">
						<!-- Autoplay Next Track Toggle -->
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-3.5">
								<div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF2D78] shrink-0">
									<svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
								</div>
								<div>
									<h4 class="text-sm font-bold text-white">Autoplay Next</h4>
									<p class="text-xs text-[#9CA3AF]">Automatically queue and play similar tracks when current queue finishes</p>
								</div>
							</div>

							<!-- Custom Animated Switch matching Flutter BloomeeSwitch -->
							<button
								type="button"
								aria-label="Toggle autoplay"
								on:click={() => (autoplay = !autoplay)}
								class="w-12 h-7 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 border {autoplay
									? 'bg-[#FF2D78] border-[#FF2D78] shadow-[0_0_12px_rgba(255,45,120,0.4)]'
									: 'bg-[#1E1E28] border-white/10'}"
							>
								<div class="w-5.5 h-5.5 rounded-full bg-white transition-transform duration-200 shadow-md {autoplay ? 'translate-x-5' : 'translate-x-0'}"></div>
							</button>
						</div>

						<div class="h-px bg-white/[0.06]"></div>

						<!-- Volume Normalization Toggle -->
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-3.5">
								<div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF2D78] shrink-0">
									<svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
								</div>
								<div>
									<h4 class="text-sm font-bold text-white">Volume Normalization (ReplayGain)</h4>
									<p class="text-xs text-[#9CA3AF]">Maintain consistent, balanced loudness across all songs and albums</p>
								</div>
							</div>

							<button
								type="button"
								aria-label="Toggle volume normalization"
								on:click={() => (volumeNormalization = !volumeNormalization)}
								class="w-12 h-7 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 border {volumeNormalization
									? 'bg-[#FF2D78] border-[#FF2D78] shadow-[0_0_12px_rgba(255,45,120,0.4)]'
									: 'bg-[#1E1E28] border-white/10'}"
							>
								<div class="w-5.5 h-5.5 rounded-full bg-white transition-transform duration-200 shadow-md {volumeNormalization ? 'translate-x-5' : 'translate-x-0'}"></div>
							</button>
						</div>

						<div class="h-px bg-white/[0.06]"></div>

						<!-- Auto Resolve & Fallback Toggle -->
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-3.5">
								<div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF2D78] shrink-0">
									<svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
								</div>
								<div>
									<h4 class="text-sm font-bold text-white">Automatic Stream Fallback</h4>
									<p class="text-xs text-[#9CA3AF]">Auto-retry alternative CDNs if a music source encounters network drops</p>
								</div>
							</div>

							<button
								type="button"
								aria-label="Toggle stream fallback"
								on:click={() => (autoFallback = !autoFallback)}
								class="w-12 h-7 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 border {autoFallback
									? 'bg-[#FF2D78] border-[#FF2D78] shadow-[0_0_12px_rgba(255,45,120,0.4)]'
									: 'bg-[#1E1E28] border-white/10'}"
							>
								<div class="w-5.5 h-5.5 rounded-full bg-white transition-transform duration-200 shadow-md {autoFallback ? 'translate-x-5' : 'translate-x-0'}"></div>
							</button>
						</div>

						<div class="h-px bg-white/[0.06]"></div>

						<!-- Crossfade Duration Slider (matching Flutter _CrossfadeSlider) -->
						<div class="space-y-3 pt-1">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3.5">
									<div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF2D78]">
										<svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/></svg>
									</div>
									<div>
										<h4 class="text-sm font-bold text-white">Crossfade Duration</h4>
										<p class="text-xs text-[#9CA3AF]">Seamless blend between consecutive tracks</p>
									</div>
								</div>

								<span class="text-sm font-black text-[#FF2D78] px-3 py-1 rounded-xl bg-[#FF2D78]/10 border border-[#FF2D78]/20">
									{crossfadeDuration === 0 ? 'Off (Instant)' : `${crossfadeDuration}s Blend`}
								</span>
							</div>

							<div class="pt-2 px-1">
								<input
									type="range"
									min="0"
									max="12"
									step="1"
									bind:value={crossfadeDuration}
									class="w-full accent-[#FF2D78] cursor-pointer"
								/>
								<div class="flex justify-between text-[11px] font-bold text-[#6B7280] mt-1.5 px-0.5">
									<span>Off</span>
									<span>2s</span>
									<span>4s</span>
									<span>6s</span>
									<span>8s</span>
									<span>10s</span>
									<span>12s</span>
								</div>
							</div>
						</div>
					</div>

				{:else if activeTab === 'storage'}
					<!-- =================== DATA & STORAGE TAB =================== -->

					<div class="space-y-4">
						<!-- Backup & Restore Library Card -->
						<div class="p-5 rounded-2xl bg-[#181824] border border-white/[0.06] flex items-center justify-between hover:border-white/15 transition-all">
							<div class="flex items-center gap-4">
								<div class="w-11 h-11 rounded-2xl bg-[#FF2D78]/15 border border-[#FF2D78]/30 flex items-center justify-center text-[#FF2D78]">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
								</div>
								<div>
									<h4 class="text-sm font-bold text-white">Backup & Restore Library</h4>
									<p class="text-xs text-[#9CA3AF] mt-0.5">Export playlists, history & favorites to JSON, or restore an existing backup file</p>
								</div>
							</div>

							<button
								type="button"
								on:click={handleOpenImportExport}
								class="px-4 py-2 rounded-xl bg-[#FF2D78] text-white text-xs font-bold hover:bg-[#FF2D78]/90 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#FF2D78]/25 shrink-0"
							>
								Manage Backup
							</button>
						</div>

						<!-- Clear Search Cache Card -->
						<div class="p-5 rounded-2xl bg-[#181824] border border-white/[0.06] flex items-center justify-between hover:border-red-500/30 transition-all">
							<div class="flex items-center gap-4">
								<div class="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
								</div>
								<div>
									<h4 class="text-sm font-bold text-red-400">Clear Search History & Cache</h4>
									<p class="text-xs text-[#9CA3AF] mt-0.5">Deletes cached search queries and artwork memory without affecting your playlists</p>
								</div>
							</div>

							<button
								type="button"
								on:click={handleClearCache}
								class="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer shrink-0"
							>
								Clear Cache
							</button>
						</div>
					</div>

				{:else if activeTab === 'shortcuts'}
					<!-- =================== KEYBOARD SHORTCUTS TAB =================== -->

					<div class="p-5 rounded-2xl bg-[#181824] border border-white/[0.06] space-y-4">
						<div class="flex items-center gap-2 mb-2">
							<svg class="w-4 h-4 text-[#FF2D78]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
							<h4 class="text-sm font-bold text-white">Global Player Shortcuts</h4>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							{#each [
								{ action: 'Play / Pause', key: 'Space' },
								{ action: 'Seek Backward 5s', key: '← Arrow' },
								{ action: 'Seek Forward 5s', key: '→ Arrow' },
								{ action: 'Volume Up 5%', key: '↑ Arrow' },
								{ action: 'Volume Down 5%', key: '↓ Arrow' },
								{ action: 'Next Track', key: 'Shift + →' },
								{ action: 'Previous Track', key: 'Shift + ←' },
								{ action: 'Like / Favorite Song', key: 'L' },
								{ action: 'Shuffle Queue', key: 'S' },
								{ action: 'Repeat Mode', key: 'R' },
								{ action: 'Open Lyrics', key: 'Y' },
								{ action: 'Toggle Queue Drawer', key: 'Q' }
							] as item}
								<div class="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#12121A] border border-white/[0.04] hover:border-white/10 transition-colors">
									<span class="text-xs font-semibold text-white/90">{item.action}</span>
									<kbd class="px-2.5 py-1 rounded-lg bg-[#2A101C] border border-[#FF2D78]/30 text-[#FF2D78] font-mono text-xs font-bold shadow-sm">
										{item.key}
									</kbd>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer with Close button -->
			<div class="px-6 py-3.5 border-t border-white/[0.06] bg-[#0E0E16]/80 flex items-center justify-end shrink-0">
				<button
					type="button"
					on:click={close}
					class="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
				>
					Done
				</button>
			</div>
		</div>
	</div>
{/if}
