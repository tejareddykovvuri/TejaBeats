import { json } from '@sveltejs/kit';
import { getHomeSectionsJioSaavn } from '$lib/server/jiosaavn.js';

export async function GET() {
	try {
		const data = await getHomeSectionsJioSaavn();
		return json({ success: true, ...data });
	} catch (err) {
		console.error('Launch API error:', err);
		return json({ success: false, tracks: [], chartTitle: 'TejaBeats' }, { status: 500 });
	}
}
