import { writable } from 'svelte/store';

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

const MAX_HISTORY = 20;

/**
 * Search history store matching SearchHistoryDAO from the EXE.
 */
export const searchHistory = writable(loadLocalStorage('tejabeats_search_history', []));

// Persist on change
if (typeof window !== 'undefined') {
	searchHistory.subscribe((val) => saveLocalStorage('tejabeats_search_history', val));
}

/**
 * Add a search query to history (deduplicates, limits to MAX_HISTORY).
 */
export function addSearchQuery(query) {
	if (!query || !query.trim()) return;
	const trimmed = query.trim();
	searchHistory.update((items) => {
		const filtered = items.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
		return [trimmed, ...filtered].slice(0, MAX_HISTORY);
	});
}

/**
 * Remove a search query from history.
 */
export function removeSearchQuery(query) {
	searchHistory.update((items) => items.filter((q) => q !== query));
}

/**
 * Clear all search history.
 */
export function clearSearchHistory() {
	searchHistory.set([]);
}
