<!-- TimerModal.svelte — Sleep timer modal matching timer_view.dart -->
<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { audioPlayer } from '$lib/player/audioService.js';
	import { showToast } from '$lib/player/playerStore.js';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let selectedMinutes = 30;
	let customHours = 0;
	let customMinutes = 30;
	let remainingSeconds = 0;
	let timerActive = false;
	let timerInterval = null;

	const presets = [15, 30, 45, 60, 90];

	function startTimer(minutes) {
		const totalSec = minutes * 60;
		if (totalSec <= 0) return;
		remainingSeconds = totalSec;
		timerActive = true;

		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			if (remainingSeconds > 0) {
				remainingSeconds -= 1;
			} else {
				stopTimer();
				audioPlayer.pause();
				showToast('Sleep timer ended. Music paused.');
			}
		}, 1000);

		showToast(`Sleep timer set for ${minutes} minutes`);
		close();
	}

	function startCustomTimer() {
		const totalMin = (customHours * 60) + customMinutes;
		if (totalMin > 0) {
			startTimer(totalMin);
		}
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		timerActive = false;
		remainingSeconds = 0;
		showToast('Sleep timer cancelled');
	}

	function formatCountdown(sec) {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		if (h > 0) {
			return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		}
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function close() {
		dispatch('close');
	}

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});
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
			class="bg-[#141418] border border-[#2A2A32] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 animate-scale-up text-left"
		>
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-[#FF2D78]/15 flex items-center justify-center text-[#FF2D78]">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
					</div>
					<div>
						<h3 class="text-lg font-bold text-white">Sleep Timer</h3>
						<p class="text-xs text-[#9CA3AF]">Stop playback automatically</p>
					</div>
				</div>

				<button
					type="button"
					on:click={close}
					class="p-2 text-[#9CA3AF] hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			</div>

			{#if timerActive}
				<!-- Active Countdown Display -->
				<div class="bg-gradient-to-br from-[#FF2D78]/20 to-[#FF6B35]/10 border border-[#FF2D78]/30 rounded-2xl p-6 text-center space-y-3">
					<span class="text-xs font-semibold text-[#FF2D78] uppercase tracking-wider">Music will stop in</span>
					<div class="text-4xl font-extrabold text-white font-mono tracking-wider tabular-nums">{formatCountdown(remainingSeconds)}</div>
					<button
						type="button"
						on:click={stopTimer}
						class="px-5 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
					>
						Turn Off Timer
					</button>
				</div>
			{:else}
				<!-- Presets Grid -->
				<div>
					<label class="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-3">Quick Presets</label>
					<div class="grid grid-cols-3 gap-2.5">
						{#each presets as min}
							<button
								type="button"
								on:click={() => startTimer(min)}
								class="p-3 rounded-xl bg-[#1E1E24] hover:bg-[#FF2D78]/20 border border-[#2A2A32] hover:border-[#FF2D78]/50 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer text-center"
							>
								{min}m
							</button>
						{/each}
					</div>
				</div>

				<!-- Custom Time Form -->
				<div class="pt-2 border-t border-[#2A2A32]">
					<label class="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-3">Custom Duration</label>
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<span class="text-[11px] text-[#9CA3AF] block mb-1">Hours</span>
							<input
								type="number"
								min="0"
								max="24"
								bind:value={customHours}
								class="w-full bg-[#1E1E24] border border-[#2A2A32] rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-[#FF2D78]"
							/>
						</div>
						<div class="flex-1">
							<span class="text-[11px] text-[#9CA3AF] block mb-1">Minutes</span>
							<input
								type="number"
								min="1"
								max="59"
								bind:value={customMinutes}
								class="w-full bg-[#1E1E24] border border-[#2A2A32] rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-[#FF2D78]"
							/>
						</div>
					</div>

					<button
						type="button"
						on:click={startCustomTimer}
						class="w-full mt-4 py-3 rounded-xl teja-gradient-btn text-white font-bold text-sm shadow-lg shadow-[#FF2D78]/25 hover:shadow-[#FF2D78]/40 active:scale-95 transition-all cursor-pointer"
					>
						Set Timer
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
