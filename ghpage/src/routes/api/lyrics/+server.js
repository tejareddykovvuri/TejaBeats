import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const songId = url.searchParams.get('id');
	const title = url.searchParams.get('title') || '';
	const artist = url.searchParams.get('artist') || '';

	if (!songId && !title) {
		return json({ success: false, error: 'Missing song ID or title' }, { status: 400 });
	}

	// 1. Try JioSaavn lyrics if songId is provided
	if (songId) {
		try {
			const jioUrl = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&lyrics_id=${encodeURIComponent(songId)}&ctx=web6dot0&api_version=4&_format=json`;
			const res = await fetch(jioUrl, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				}
			});
			if (res.ok) {
				const text = await res.text();
				const clean = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
				if (clean.startsWith('{')) {
					const data = JSON.parse(clean);
					if (data?.lyrics) {
						// Clean HTML breaks like <br/> into newlines
						const rawLyrics = data.lyrics.replace(/<br\s*[\/]?>/gi, '\n').replace(/<[^>]+>/g, '');
						const lines = rawLyrics.split('\n').map((l) => l.trim()).filter(Boolean);
						if (lines.length > 0) {
							return json({ success: true, lyrics: lines, source: 'jiosaavn' });
						}
					}
				}
			}
		} catch (e) {
			// fallback to LRCLIB
		}
	}

	// 2. Try LRCLIB by track title and artist
	if (title) {
		try {
			const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
			const cleanArtist = artist.split(',')[0].trim();
			const lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
			const res = await fetch(lrcUrl, {
				headers: {
					'User-Agent': 'TejaBeats/3.0.4 (tejamusic web)'
				}
			});
			if (res.ok) {
				const data = await res.json();
				if (data.plainLyrics) {
					const lines = data.plainLyrics.split('\n').map((l) => l.trim()).filter(Boolean);
					if (lines.length > 0) {
						return json({ success: true, lyrics: lines, source: 'lrclib' });
					}
				}
				if (data.syncedLyrics) {
					const lines = data.syncedLyrics
						.split('\n')
						.map((l) => l.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim())
						.filter(Boolean);
					if (lines.length > 0) {
						return json({ success: true, lyrics: lines, source: 'lrclib' });
					}
				}
			}
		} catch (e) {
			// fallback
		}
	}

	// 3. Elegant fallback when lyrics aren't found in database
	const fallbackLines = [
		`♪ ${title || 'Now Playing'} ♪`,
		artist ? `Performed by ${artist}` : 'TejaBeats Exclusive',
		'',
		'Enjoy the rhythm and feel the beats...',
		'♪ ♫ ♩ ♬',
		'Sing along with your heart!',
		'TejaBeats • Your Music, Your Beats.'
	];

	return json({ success: true, lyrics: fallbackLines, source: 'fallback' });
}
