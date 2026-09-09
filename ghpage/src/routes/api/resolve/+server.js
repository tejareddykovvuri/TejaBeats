import { json } from '@sveltejs/kit';
import { resolveStreamUrl } from '$lib/server/jiosaavn.js';

export async function GET({ url }) {
	const songId = url.searchParams.get('id');
	if (!songId) {
		return json({ success: false, error: 'Missing song ID' }, { status: 400 });
	}

	try {
		const track = await resolveStreamUrl(songId);
		if (track && track.streamUrl) {
			return json({ success: true, track });
		}
		return json({ success: false, error: 'Could not resolve stream URL' }, { status: 404 });
	} catch (err) {
		console.error('Resolve API error:', err);
		return json({ success: false, error: 'Failed to resolve stream' }, { status: 500 });
	}
}
