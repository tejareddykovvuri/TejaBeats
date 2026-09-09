import { writable } from 'svelte/store';
import { showNotification } from './playerStore.js';

// Helper to safely load from localStorage
function loadLocalStorage(key, fallback) {
	if (typeof window === 'undefined') return fallback;
	try {
		const val = localStorage.getItem(key);
		return val ? JSON.parse(val) : fallback;
	} catch (e) {
		return fallback;
	}
}

function saveLocalStorage(key, val) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(val));
	} catch (e) { /* ignore */ }
}

/**
 * Playlist store matching PlaylistDAO from the EXE.
 * Each playlist: { id, name, tracks: [], createdAt }
 */
export const playlists = writable(loadLocalStorage('tejabeats_playlists', []));

// Persist on change
if (typeof window !== 'undefined') {
	playlists.subscribe((val) => saveLocalStorage('tejabeats_playlists', val));
}

/**
 * Create a new playlist.
 */
export function createPlaylist(name) {
	const newPlaylist = {
		id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		name: name.trim(),
		tracks: [],
		createdAt: Date.now()
	};

	playlists.update((items) => [...items, newPlaylist]);
	showNotification(`Created playlist "${newPlaylist.name}"`, 'success');
	return newPlaylist;
}

/**
 * Delete a playlist by ID.
 */
export function deletePlaylist(id) {
	playlists.update((items) => {
		const pl = items.find((p) => p.id === id);
		if (pl) showNotification(`Deleted playlist "${pl.name}"`, 'info');
		return items.filter((p) => p.id !== id);
	});
}

/**
 * Rename a playlist.
 */
export function renamePlaylist(id, newName) {
	playlists.update((items) =>
		items.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p))
	);
}

/**
 * Add a track to a playlist.
 */
export function addTrackToPlaylist(playlistId, track) {
	if (!track || !track.id) return;
	playlists.update((items) =>
		items.map((p) => {
			if (p.id !== playlistId) return p;
			const exists = p.tracks.some((t) => t.id === track.id);
			if (exists) {
				showNotification(`"${track.title}" is already in "${p.name}"`, 'info');
				return p;
			}
			showNotification(`Added "${track.title}" to "${p.name}"`, 'success');
			return { ...p, tracks: [...p.tracks, track] };
		})
	);
}

/**
 * Remove a track from a playlist.
 */
export function removeTrackFromPlaylist(playlistId, trackId) {
	playlists.update((items) =>
		items.map((p) => {
			if (p.id !== playlistId) return p;
			return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
		})
	);
}

/**
 * Reorder tracks in a playlist.
 */
export function reorderPlaylistTracks(playlistId, fromIndex, toIndex) {
	playlists.update((items) =>
		items.map((p) => {
			if (p.id !== playlistId) return p;
			const tracks = [...p.tracks];
			const [moved] = tracks.splice(fromIndex, 1);
			tracks.splice(toIndex, 0, moved);
			return { ...p, tracks };
		})
	);
}
