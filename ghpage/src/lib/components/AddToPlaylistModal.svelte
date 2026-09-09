<!-- AddToPlaylistModal.svelte — Modal to add a track to an existing or new playlist -->
<script>
	import { createEventDispatcher } from 'svelte';
	import { playlists, createPlaylist, addTrackToPlaylist } from '$lib/player/playlistStore.js';
	import { showToast } from '$lib/player/playerStore.js';

	export let isOpen = false;
	export let track = null;

	const dispatch = createEventDispatcher();

	let newPlaylistName = '';
	let isCreating = false;

	function close() {
		dispatch('close');
		isCreating = false;
		newPlaylistName = '';
	}

	function handleAddToPlaylist(playlistId) {
		if (!track) return;
		addTrackToPlaylist(playlistId, track);
		close();
	}

	function handleCreateAndAdd() {
		if (!newPlaylistName.trim() || !track) return;
		const created = createPlaylist(newPlaylistName.trim());
		if (created) {
			addTrackToPlaylist(created.id, track);
			close();
		}
	}
</script>

{#if isOpen && track}
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
			class="bg-[#141418] border border-[#2A2A32] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up text-left"
		>
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-bold text-white">Add to Playlist</h3>
					<p class="text-xs text-[#9CA3AF] truncate max-w-xs mt-0.5">"{track.title}"</p>
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

			<!-- Create New Playlist Row -->
			{#if isCreating}
				<div class="space-y-3 p-3.5 bg-[#1E1E24] rounded-2xl border border-[#2A2A32]">
					<input
						type="text"
						bind:value={newPlaylistName}
						placeholder="Enter playlist name..."
						class="w-full bg-[#0A0A0F] border border-[#2A2A32] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FF2D78]"
					/>
					<div class="flex items-center justify-end gap-2">
						<button
							type="button"
							on:click={() => (isCreating = false)}
							class="px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-white"
						>
							Cancel
						</button>
						<button
							type="button"
							on:click={handleCreateAndAdd}
							disabled={!newPlaylistName.trim()}
							class="px-4 py-1.5 bg-[#FF2D78] text-white rounded-xl text-xs font-bold disabled:opacity-50"
						>
							Create & Add
						</button>
					</div>
				</div>
			{:else}
				<button
					type="button"
					on:click={() => (isCreating = true)}
					class="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-[#2A2A32] hover:border-[#FF2D78]/50 hover:bg-[#FF2D78]/5 text-white transition-all cursor-pointer"
				>
					<div class="w-9 h-9 rounded-xl bg-[#FF2D78]/15 flex items-center justify-center text-[#FF2D78]">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
					</div>
					<span class="text-xs font-bold">New Playlist</span>
				</button>
			{/if}

			<!-- Existing Playlists List -->
			<div class="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar">
				{#if $playlists.length === 0}
					<p class="text-xs text-[#6B7280] text-center py-4">No custom playlists yet</p>
				{:else}
					{#each $playlists as pl}
						<button
							type="button"
							on:click={() => handleAddToPlaylist(pl.id)}
							class="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1E1E24] border border-transparent hover:border-[#2A2A32] transition-colors cursor-pointer text-left"
						>
							<div class="flex items-center gap-3 min-w-0">
								<div class="w-9 h-9 rounded-lg bg-[#2A2A32] flex items-center justify-center text-[#9CA3AF] shrink-0">
									<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
								</div>
								<div class="min-w-0">
									<h4 class="text-xs font-semibold text-white truncate">{pl.name}</h4>
									<p class="text-[10px] text-[#9CA3AF]">{pl.tracks?.length || 0} tracks</p>
								</div>
							</div>
							<svg class="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
