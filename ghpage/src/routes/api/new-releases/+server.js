import { json } from '@sveltejs/kit';
import { getNewReleasesJioSaavn } from '$lib/server/jiosaavn.js';

export async function GET() {
	try {
		const sections = await getNewReleasesJioSaavn();
		return json({ success: true, sections });
	} catch (err) {
		console.error('New releases API error:', err);
		return json({ success: false, sections: [] }, { status: 500 });
	}
}
