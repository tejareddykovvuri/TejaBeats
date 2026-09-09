import { json } from '@sveltejs/kit';
import { getAlbumJioSaavn } from '$lib/server/jiosaavn.js';

export async function GET({ url }) {
	const albumId = url.searchParams.get('id');
	if (!albumId) {
		return json({ success: false, error: 'Missing album ID' }, { status: 400 });
	}

	try {
		const album = await getAlbumJioSaavn(albumId);
		return json({ success: true, ...album });
	} catch (err) {
		console.error('Album API error:', err);
		return json({ success: false, error: 'Failed to load album' }, { status: 500 });
	}
}
