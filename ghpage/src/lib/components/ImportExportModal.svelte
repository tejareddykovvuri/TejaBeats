<!-- ImportExportModal.svelte — Backup and restore user library modal -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { likedTracks, showToast } from '$lib/player/playerStore.js';
	import { playlists } from '$lib/player/playlistStore.js';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let fileInput;

	function close() {
		dispatch('close');
	}

	function handleExport() {
		try {
			const data = {
				version: '3.0.4-202',
				timestamp: new Date().toISOString(),
				likedTracks: $likedTracks,
				playlists: $playlists
			};
			const jsonStr = JSON.stringify(data, null, 2);
			const blob = new Blob([jsonStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `tejabeats_backup_${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showToast('Library exported successfully!');
		} catch (e) {
			showToast('Failed to export library');
		}
	}

	function handleImportFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const parsed = JSON.parse(event.target.result);
				if (parsed.likedTracks && Array.isArray(parsed.likedTracks)) {
					likedTracks.set(parsed.likedTracks);
					localStorage.setItem('tb_liked_tracks', JSON.stringify(parsed.likedTracks));
				}
				if (parsed.playlists && Array.isArray(parsed.playlists)) {
					playlists.set(parsed.playlists);
					localStorage.setItem('tb_user_playlists', JSON.stringify(parsed.playlists));
				}
				showToast('Library imported successfully!');
				close();
			} catch (err) {
				showToast('Invalid backup file format');
			}
		};
		reader.readAsText(file);
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
			class="bg-[#141418] border border-[#2A2A32] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 animate-scale-up text-left"
		>
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-[#FF2D78]/15 flex items-center justify-center text-[#FF2D78]">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
					</div>
					<div>
						<h3 class="text-lg font-bold text-white">Backup & Restore</h3>
						<p class="text-xs text-[#9CA3AF]">Save or load your library</p>
					</div>
				</div>

				<button
					type="button"
					on:click={close}
					class="p-2 text-[#9CA3AF] hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
					aria-label="Close"
					title="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>
			</div>

			<!-- Export Button -->
			<div class="space-y-3">
				<button
					type="button"
					on:click={handleExport}
					class="w-full flex items-center justify-between p-4 bg-[#1E1E24] hover:bg-white/5 border border-[#2A2A32] hover:border-[#FF2D78]/50 rounded-2xl transition-all cursor-pointer text-left group"
				>
					<div>
						<h4 class="text-sm font-bold text-white group-hover:text-[#FF2D78] transition-colors">Export Library</h4>
						<p class="text-xs text-[#9CA3AF] mt-0.5">Download JSON file of {$likedTracks.length} liked songs & {$playlists.length} playlists</p>
					</div>
					<div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white group-hover:bg-[#FF2D78] transition-all">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
					</div>
				</button>

				<!-- Import Button -->
				<button
					type="button"
					on:click={() => fileInput.click()}
					class="w-full flex items-center justify-between p-4 bg-[#1E1E24] hover:bg-white/5 border border-[#2A2A32] hover:border-[#FF2D78]/50 rounded-2xl transition-all cursor-pointer text-left group"
				>
					<div>
						<h4 class="text-sm font-bold text-white group-hover:text-[#FF2D78] transition-colors">Restore / Import</h4>
						<p class="text-xs text-[#9CA3AF] mt-0.5">Load a previously exported JSON backup</p>
					</div>
					<div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white group-hover:bg-[#FF2D78] transition-all">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
					</div>
				</button>

				<input type="file" accept=".json" bind:this={fileInput} on:change={handleImportFile} class="hidden" />
			</div>
		</div>
	</div>
{/if}
