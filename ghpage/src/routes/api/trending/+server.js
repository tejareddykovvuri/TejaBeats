import { json } from '@sveltejs/kit';
import { getTrendingJioSaavn } from '$lib/server/jiosaavn.js';

export async function GET() {
	try {
		const data = await getTrendingJioSaavn();
		return json({
			success: true,
			results: data.tracks,
			title: data.chartTitle
		});
	} catch (err) {
		console.error('Trending API error:', err);
		return json({ success: false, error: 'Failed to load trending songs' }, { status: 500 });
	}
}
