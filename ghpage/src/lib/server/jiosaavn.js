import { decryptDesEcb, buildAudioStreams } from './des.js';

/**
 * Unescapes HTML entities commonly found in JioSaavn responses.
 * Safe against any type (objects, arrays, numbers, null, undefined).
 */
export function decodeHtmlEntities(str) {
	if (!str) return '';
	if (typeof str !== 'string') {
		if (typeof str === 'number') return String(str);
		if (Array.isArray(str)) return str.map(decodeHtmlEntities).filter(Boolean).join(', ');
		if (typeof str === 'object') {
			if (typeof str.name === 'string') return decodeHtmlEntities(str.name);
			if (typeof str.title === 'string') return decodeHtmlEntities(str.title);
			return '';
		}
		return '';
	}
	return str
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.trim();
}

/**
 * Normalizes artwork image to highest resolution (500x500).
 */
export function getHighResImage(imageUrl) {
	if (!imageUrl || typeof imageUrl !== 'string') return '/placeholder-artwork.svg';
	return imageUrl
		.replace('50x50.jpg', '500x500.jpg')
		.replace('150x150.jpg', '500x500.jpg')
		.replace('50x50.png', '500x500.png')
		.replace('150x150.png', '500x500.png');
}

/**
 * Formats duration in seconds to M:SS.
 */
export function formatDuration(seconds) {
	const totalSec = parseInt(seconds, 10) || 0;
	const m = Math.floor(totalSec / 60);
	const s = totalSec % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Formats a raw JioSaavn song object into a clean standard Track object.
 */
export function formatTrack(raw) {
	if (!raw) return null;

	const id = String(raw.id || raw.more_info?.song_id || Math.random());
	const title = decodeHtmlEntities(raw.title || raw.song || 'Unknown Song');
	const album = decodeHtmlEntities(raw.more_info?.album || raw.album || '');
	
	// Primary artists
	let artistName = '';
	if (raw.more_info?.artistMap?.primary_artists?.length) {
		artistName = raw.more_info.artistMap.primary_artists.map((a) => a.name).join(', ');
	} else if (typeof raw.more_info?.music === 'string') {
		artistName = raw.more_info.music;
	} else if (typeof raw.subtitle === 'string') {
		artistName = raw.subtitle.split('-')[0].trim();
	} else if (typeof raw.primary_artists === 'string') {
		artistName = raw.primary_artists;
	}
	artistName = decodeHtmlEntities(artistName || 'Unknown Artist');

	// Artwork
	const artwork = getHighResImage(raw.image || raw.more_info?.image || '');

	// Duration
	const durationSec = parseInt(raw.more_info?.duration || raw.duration || '0', 10);
	const durationStr = formatDuration(durationSec);

	// Stream URL from encrypted_media_url
	let streamUrl = null;
	let fallbackStreamUrl = null;

	const encUrl = raw.encrypted_media_url || raw.more_info?.encrypted_media_url;
	if (encUrl && typeof encUrl === 'string') {
		try {
			const decrypted = decryptDesEcb(encUrl);
			if (decrypted) {
				const streams = buildAudioStreams(decrypted);
				streamUrl = streams.high || streams.medium || streams.low;
				fallbackStreamUrl = streams.medium || streams.low;
			}
		} catch (err) {
			// fallback handled
		}
	}

	// Artist ID for linking
	let artistId = null;
	if (raw.more_info?.artistMap?.primary_artists?.[0]?.id) {
		artistId = raw.more_info.artistMap.primary_artists[0].id;
	}

	// Album ID for linking
	let albumId = raw.more_info?.album_id || null;

	// Year
	const year = String(raw.year || raw.more_info?.year || '');

	// Language
	const language = String(raw.language || raw.more_info?.language || '');

	return {
		id,
		title,
		artist: artistName,
		artistId,
		album,
		albumId,
		artwork,
		duration: durationSec,
		durationFormatted: durationStr,
		streamUrl,
		fallbackStreamUrl,
		year,
		language,
		source: 'jiosaavn'
	};
}

/**
 * Format raw album from JioSaavn safely.
 */
export function formatAlbum(raw) {
	if (!raw) return null;
	let artistName = '';
	if (typeof raw.primary_artists === 'string') {
		artistName = raw.primary_artists;
	} else if (typeof raw.music === 'string') {
		artistName = raw.music;
	} else if (raw.artist && typeof raw.artist === 'object' && Array.isArray(raw.artist.music)) {
		artistName = raw.artist.music.map((m) => (Array.isArray(m) ? m[0] : m)).join(', ');
	} else if (typeof raw.artist === 'string') {
		artistName = raw.artist;
	}

	return {
		id: String(raw.id || raw.albumid || ''),
		title: decodeHtmlEntities(raw.title || raw.name || 'Album'),
		artist: decodeHtmlEntities(artistName || 'Various Artists'),
		artwork: getHighResImage(raw.image || ''),
		year: String(raw.year || ''),
		type: 'album'
	};
}

/**
 * Format raw artist from JioSaavn safely.
 */
export function formatArtist(raw) {
	if (!raw) return null;
	return {
		id: String(raw.id || raw.artistid || ''),
		name: decodeHtmlEntities(raw.name || raw.title || 'Artist'),
		image: getHighResImage(raw.image || ''),
		artwork: getHighResImage(raw.image || ''),
		role: decodeHtmlEntities(raw.role || raw.subtitle || 'Artist'),
		type: 'artist'
	};
}

/**
 * Format raw playlist from JioSaavn safely.
 */
export function formatPlaylist(raw) {
	if (!raw) return null;
	return {
		id: String(raw.id || raw.listid || ''),
		title: decodeHtmlEntities(raw.title || raw.listname || raw.name || 'Playlist'),
		artist: decodeHtmlEntities(Array.isArray(raw.artist_name) ? raw.artist_name.join(', ') : raw.firstname || 'JioSaavn'),
		artwork: getHighResImage(raw.image || ''),
		count: String(raw.count || raw.numsongs || '0'),
		type: 'playlist'
	};
}

/**
 * JioSaavn API base URL.
 */
const JIOSAAVN_API = 'https://www.jiosaavn.com/api.php';

/**
 * Build a JioSaavn API URL with common parameters.
 */
function buildApiUrl(params) {
	const url = new URL(JIOSAAVN_API);
	url.searchParams.set('_format', 'json');
	url.searchParams.set('_marker', '0');
	url.searchParams.set('ctx', 'web6dot0');
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}
	return url.toString();
}

/**
 * Fetch with retries and timeout.
 */
async function fetchWithRetry(url, retries = 2) {
	for (let i = 0; i <= retries; i++) {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 10000);
			const res = await fetch(url, {
				signal: controller.signal,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				}
			});
			clearTimeout(timeout);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return await res.json();
		} catch (err) {
			if (i === retries) throw err;
			await new Promise((r) => setTimeout(r, 300 * (i + 1)));
		}
	}
}

/**
 * Search JioSaavn for songs.
 */
export async function searchJioSaavn(query, limit = 30) {
	try {
		const url = buildApiUrl({
			__call: 'search.getResults',
			q: query,
			p: '1',
			n: String(limit)
		});

		const data = await fetchWithRetry(url);
		const results = data?.results || [];
		return results.map(formatTrack).filter(Boolean);
	} catch (e) {
		console.warn('searchJioSaavn error:', e.message);
		return [];
	}
}

/**
 * Search JioSaavn for albums.
 */
export async function searchAlbumsJioSaavn(query, limit = 20) {
	try {
		const url = buildApiUrl({
			__call: 'search.getAlbumResults',
			q: query,
			p: '1',
			n: String(limit)
		});
		const data = await fetchWithRetry(url);
		return (data?.results || []).map(formatAlbum).filter(Boolean);
	} catch (e) {
		console.warn('searchAlbumsJioSaavn error:', e.message);
		return [];
	}
}

/**
 * Search JioSaavn for artists.
 */
export async function searchArtistsJioSaavn(query, limit = 20) {
	try {
		const url = buildApiUrl({
			__call: 'search.getArtistResults',
			q: query,
			p: '1',
			n: String(limit)
		});
		const data = await fetchWithRetry(url);
		return (data?.results || []).map(formatArtist).filter(Boolean);
	} catch (e) {
		console.warn('searchArtistsJioSaavn error:', e.message);
		return [];
	}
}

/**
 * Search JioSaavn for playlists.
 */
export async function searchPlaylistsJioSaavn(query, limit = 20) {
	try {
		const url = buildApiUrl({
			__call: 'search.getPlaylistResults',
			q: query,
			p: '1',
			n: String(limit)
		});
		const data = await fetchWithRetry(url);
		return (data?.results || []).map(formatPlaylist).filter(Boolean);
	} catch (e) {
		console.warn('searchPlaylistsJioSaavn error:', e.message);
		return [];
	}
}

/**
 * Search JioSaavn across songs, albums, and artists in parallel with zero crashes.
 */
export async function searchAllJioSaavn(query, limit = 30) {
	try {
		const [tracks, albums, artists, playlists] = await Promise.all([
			searchJioSaavn(query, limit),
			searchAlbumsJioSaavn(query, 12),
			searchArtistsJioSaavn(query, 12),
			searchPlaylistsJioSaavn(query, 12)
		]);

		return { tracks, albums, artists, playlists };
	} catch (e) {
		console.warn('searchAllJioSaavn error:', e.message);
		return { tracks: [], albums: [], artists: [], playlists: [] };
	}
}

/**
 * In-memory cache for home sections to provide instant, silky-smooth loading.
 */
let homeSectionsCache = null;
let homeSectionsTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Get distinct, high-quality songs and curated sets for every section on the Home screen.
 */
export async function getHomeSectionsJioSaavn() {
	const now = Date.now();
	if (homeSectionsCache && (now - homeSectionsTimestamp < CACHE_TTL_MS)) {
		return homeSectionsCache;
	}

	try {
		const [
			trending,
			rainTracks,
			communityTracks,
			indiaHits,
			newRelTracks,
			nostalgicTracks,
			danceTracks,
			morningTracks
		] = await Promise.all([
			getTrendingJioSaavn(),
			searchJioSaavn('Rain Hindi Baarish Romantic Hits', 25),
			searchJioSaavn('Bollywood Party Anthems Hits', 25),
			searchJioSaavn('Top 50 India Bollywood Hits', 25),
			searchJioSaavn('Latest Bollywood Hits 2026', 25),
			searchJioSaavn('90s Bollywood Evergreen Classics Hits', 25),
			searchJioSaavn('Hindi Dance Workout Club Party', 25),
			searchJioSaavn('Acoustic Coffee Hindi Morning Chill', 25)
		]);

		// Helper to ensure each row has distinct tracks without duplicate artwork or cross-category duplication
		const seenIds = new Set();
		const seenGlobalArtworks = new Set();
		function filterUnique(arr) {
			const res = [];
			const seenRowArtworks = new Set();
			for (const t of arr) {
				if (!t || !t.id || seenIds.has(String(t.id))) continue;
				const artKey = t.artwork ? t.artwork.split('?')[0].replace(/-\d+x\d+\./, '.') : '';
				if (artKey && seenRowArtworks.has(artKey)) continue;
				if (artKey) {
					seenRowArtworks.add(artKey);
					seenGlobalArtworks.add(artKey);
				}
				seenIds.add(String(t.id));
				res.push(t);
				if (res.length >= 14) break;
			}
			return res;
		}

		const result = {
			trendingTracks: trending.tracks,
			chartTitle: trending.chartTitle,
			rainTherapy: filterUnique(rainTracks),
			communityPlaylists: filterUnique(communityTracks),
			indiaHits: filterUnique(indiaHits),
			newReleases: filterUnique(newRelTracks),
			nostalgic: filterUnique(nostalgicTracks),
			danceHits: filterUnique(danceTracks),
			easyMornings: filterUnique(morningTracks)
		};

		homeSectionsCache = result;
		homeSectionsTimestamp = now;
		return result;
	} catch (e) {
		console.warn('getHomeSectionsJioSaavn error:', e.message);
		const trending = await getTrendingJioSaavn();
		const t = trending.tracks || [];
		// Use non-overlapping slices so each section shows truly unique songs
		const chunkSize = Math.max(2, Math.floor(t.length / 7));
		return {
			trendingTracks: t,
			chartTitle: trending.chartTitle,
			rainTherapy: t.slice(0, chunkSize),
			communityPlaylists: t.slice(chunkSize, chunkSize * 2),
			indiaHits: t.slice(chunkSize * 2, chunkSize * 3),
			newReleases: t.slice(chunkSize * 3, chunkSize * 4),
			nostalgic: t.slice(chunkSize * 4, chunkSize * 5),
			danceHits: t.slice(chunkSize * 5, chunkSize * 6),
			easyMornings: t.slice(chunkSize * 6, chunkSize * 7)
		};
	}
}


/**
 * Get trending/chart songs from JioSaavn.
 */
export async function getTrendingJioSaavn() {
	let chartTitle = 'Trending Superhits';
	try {
		const url = buildApiUrl({
			__call: 'content.getCharts'
		});

		const data = await fetchWithRetry(url);

		let chartList = [];
		if (Array.isArray(data)) {
			chartList = data;
		} else if (data?.results) {
			chartList = Array.isArray(data.results) ? data.results : [];
		}

		let targetChart = chartList.find(
			(c) =>
				c.title?.toLowerCase().includes('superhit') ||
				c.title?.toLowerCase().includes('top 50') ||
				c.listname?.toLowerCase().includes('superhit')
		);
		if (!targetChart && chartList.length > 0) {
			targetChart = chartList[0];
		}

		if (targetChart) {
			chartTitle = decodeHtmlEntities(targetChart.title || targetChart.listname || chartTitle);
			const chartId = targetChart.id || targetChart.listid;

			if (chartId) {
				const detailUrl = buildApiUrl({
					__call: 'playlist.getDetails',
					listid: String(chartId)
				});

				try {
					const detail = await fetchWithRetry(detailUrl);
					const songs = detail?.songs || detail?.list || [];
					const tracks = songs.map(formatTrack).filter(Boolean);
					if (tracks.length > 0) {
						return { tracks, chartTitle };
					}
				} catch (e) {
					// fallback handled
				}
			}
		}
	} catch (err) {
		// fallback handled
	}

	// Resilient fallback: search top trending tracks
	try {
		const fallbackTracks = await searchJioSaavn('Hindi Top 50 Trending', 30);
		if (fallbackTracks.length > 0) {
			return { tracks: fallbackTracks, chartTitle };
		}
	} catch (err) {
		// fallback handled
	}

	return { tracks: [], chartTitle };
}

/**
 * Get album details by album ID.
 */
export async function getAlbumJioSaavn(albumId) {
	const url = buildApiUrl({
		__call: 'content.getAlbumDetails',
		albumid: String(albumId)
	});

	const data = await fetchWithRetry(url);
	const songs = data?.list || data?.songs || [];
	const tracks = songs.map(formatTrack).filter(Boolean);

	return {
		id: albumId,
		title: decodeHtmlEntities(data?.title || data?.name || 'Album'),
		artist: decodeHtmlEntities(data?.primary_artists || data?.more_info?.artistMap?.primary_artists?.map((a) => a.name).join(', ') || ''),
		artwork: getHighResImage(data?.image || ''),
		year: data?.year || '',
		tracks
	};
}

/**
 * Get artist details by artist ID.
 */
export async function getArtistJioSaavn(artistId) {
	const url = buildApiUrl({
		__call: 'artist.getArtistPageDetails',
		artistId: String(artistId),
		n_song: '50',
		n_album: '20'
	});

	const data = await fetchWithRetry(url);

	const topSongs = (data?.topSongs || []).map(formatTrack).filter(Boolean);
	const albums = (data?.topAlbums || []).map((a) => ({
		id: a.id || a.albumid,
		title: decodeHtmlEntities(a.title || a.name || ''),
		artwork: getHighResImage(a.image || ''),
		year: a.year || '',
		artist: decodeHtmlEntities(a.music || a.primary_artists || '')
	}));

	return {
		id: artistId,
		name: decodeHtmlEntities(data?.name || 'Artist'),
		artwork: getHighResImage(data?.image || ''),
		bio: decodeHtmlEntities(data?.bio || data?.subtitle || ''),
		followerCount: data?.follower_count || data?.fan_count || '',
		topSongs,
		albums
	};
}

/**
 * Resolve a stream URL for a song by ID.
 */
export async function resolveStreamUrl(songId) {
	const url = buildApiUrl({
		__call: 'song.getDetails',
		pids: String(songId)
	});

	try {
		const data = await fetchWithRetry(url);
		let songObj = null;
		if (data?.songs && Array.isArray(data.songs) && data.songs.length > 0) {
			songObj = data.songs[0];
		} else if (data?.[songId]) {
			songObj = data[songId];
		} else if (Array.isArray(data) && data.length > 0) {
			songObj = data[0];
		} else if (data && typeof data === 'object') {
			const keys = Object.keys(data);
			for (const k of keys) {
				if (data[k]?.more_info || data[k]?.id) {
					songObj = data[k];
					break;
				}
			}
		}

		if (songObj) {
			const track = formatTrack(songObj);
			return track;
		}
	} catch (err) {
		// fallback handled
	}

	return null;
}

/**
 * Get lyrics for a song.
 */
export async function getLyricsJioSaavn(songId) {
	const url = buildApiUrl({
		__call: 'lyrics.getLyrics',
		lyrics_id: String(songId)
	});

	try {
		const data = await fetchWithRetry(url);
		if (data?.lyrics) {
			return {
				lyrics: decodeHtmlEntities(data.lyrics),
				snippet: decodeHtmlEntities(data.snippet || ''),
				copyright: decodeHtmlEntities(data.lyrics_copyright || '')
			};
		}
	} catch (e) {
		// fallback handled
	}

	return null;
}

/**
 * Launch/auto-play suggestions (get a set of songs for auto-play).
 */
export async function getLaunchData() {
	return await getHomeSectionsJioSaavn();
}

/**
 * Get new releases sections.
 */
export async function getNewReleasesJioSaavn() {
	const data = await getHomeSectionsJioSaavn();
	return data.newReleases || [];
}
