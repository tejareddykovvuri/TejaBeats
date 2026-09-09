import { json } from '@sveltejs/kit';
import { getArtistJioSaavn } from '$lib/server/jiosaavn.js';

export async function GET({ url }) {
	const artistId = url.searchParams.get('id');
	if (!artistId) {
		return json({ success: false, error: 'Missing artist ID' }, { status: 400 });
	}

	try {
		const artist = await getArtistJioSaavn(artistId);
		return json({ success: true, ...artist });
	} catch (err) {
		console.error('Artist API error:', err);
		return json({ success: false, error: 'Failed to load artist' }, { status: 500 });
	}
}
