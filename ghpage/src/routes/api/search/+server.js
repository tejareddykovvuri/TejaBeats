import { json } from '@sveltejs/kit';
import {
	searchAllJioSaavn,
	searchJioSaavn,
	searchAlbumsJioSaavn,
	searchArtistsJioSaavn,
	searchPlaylistsJioSaavn
} from '$lib/server/jiosaavn.js';

export async function GET({ url }) {
	const query = url.searchParams.get('q');
	const type = url.searchParams.get('type') || 'all';

	if (!query || !query.trim()) {
		return json({ success: false, error: 'Missing search query parameter "q"' }, { status: 400 });
	}

	try {
		const trimmed = query.trim();
		if (type === 'all') {
			const { tracks, albums, artists, playlists } = await searchAllJioSaavn(trimmed, 30);
			return json({
				success: true,
				tracks: tracks || [],
				albums: albums || [],
				artists: artists || [],
				playlists: playlists || [],
				results: tracks || []
			});
		} else if (type === 'albums') {
			const albums = await searchAlbumsJioSaavn(trimmed, 30);
			return json({
				success: true,
				tracks: [],
				albums: albums || [],
				artists: [],
				playlists: [],
				results: []
			});
		} else if (type === 'artists') {
			const artists = await searchArtistsJioSaavn(trimmed, 30);
			return json({
				success: true,
				tracks: [],
				albums: [],
				artists: artists || [],
				playlists: [],
				results: []
			});
		} else if (type === 'playlists') {
			const playlists = await searchPlaylistsJioSaavn(trimmed, 30);
			return json({
				success: true,
				tracks: [],
				albums: [],
				artists: [],
				playlists: playlists || [],
				results: []
			});
		} else {
			// type === 'songs' or default
			const tracks = await searchJioSaavn(trimmed, 30);
			return json({
				success: true,
				tracks: tracks || [],
				albums: [],
				artists: [],
				playlists: [],
				results: tracks || []
			});
		}
	} catch (err) {
		console.error('Search API error:', err);
		return json({ success: false, error: 'Search failed. Please try again.', tracks: [], albums: [], artists: [], playlists: [], results: [] }, { status: 500 });
	}
}
