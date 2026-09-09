import { getHomeSectionsJioSaavn } from '$lib/server/jiosaavn.js';

export async function load() {
	try {
		const data = await getHomeSectionsJioSaavn();
		return {
			trendingTracks: data.trendingTracks || [],
			chartTitle: data.chartTitle || 'Trending Superhits',
			rainTherapy: data.rainTherapy || [],
			communityPlaylists: data.communityPlaylists || [],
			indiaHits: data.indiaHits || [],
			newReleases: data.newReleases || [],
			nostalgic: data.nostalgic || [],
			danceHits: data.danceHits || [],
			easyMornings: data.easyMornings || []
		};
	} catch (err) {
		console.error('Initial page load failed:', err);
		return {
			trendingTracks: [],
			chartTitle: 'Trending Superhits',
			rainTherapy: [],
			communityPlaylists: [],
			indiaHits: [],
			newReleases: [],
			nostalgic: [],
			danceHits: [],
			easyMornings: []
		};
	}
}
