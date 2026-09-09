import 'dart:convert';
import 'dart:developer';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:dart_des/dart_des.dart';

import 'package:Bloomee/src/rust/api/plugin/commands.dart';
import 'package:Bloomee/src/rust/api/plugin/models.dart';

class WebPluginHandler {
  static const String jioSaavnPluginId =
      'content-resolver.bloomfactory.jisaavn';
  static const String ytMusicPluginId =
      'content-resolver.bloomfactory.ytmusic';
  static const String ytVideoPluginId =
      'content-resolver.bloomfactory.ytvideo';
  static const String ytSuggestionsPluginId =
      'search-suggestion-provider.bloomfactory.ytmusicsearchsuggestion';

  static final Map<String, Track> _knownTracks = {};
  static const String _apiBase = 'https://www.jiosaavn.com/api.php';
  static const String _desKey = '38346591';

  static String decodeHtml(String? str) {
    if (str == null) return '';
    return str
        .replaceAll('&quot;', '"')
        .replaceAll('&#039;', "'")
        .replaceAll('&apos;', "'")
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&nbsp;', ' ')
        .trim();
  }

  static String getHighResImage(String? url) {
    if (url == null || url.isEmpty) {
      return 'https://c.saavncdn.com/artists/Teja_150x150.jpg';
    }
    return url
        .replaceAll('50x50.jpg', '500x500.jpg')
        .replaceAll('150x150.jpg', '500x500.jpg')
        .replaceAll('50x50.png', '500x500.png')
        .replaceAll('150x150.png', '500x500.png');
  }

  static String? decryptMediaUrl(String? encryptedUrl) {
    if (encryptedUrl == null || encryptedUrl.isEmpty) return null;
    try {
      final des = DES(key: _desKey.codeUnits, mode: DESMode.ECB);
      final encryptedBytes = base64.decode(encryptedUrl.trim());
      final decryptedBytes = des.decrypt(encryptedBytes);
      final raw = utf8.decode(decryptedBytes, allowMalformed: true);
      final cleaned = raw.replaceAll(RegExp(r'[\x00-\x1F\s]'), '').trim();
      if (cleaned.startsWith('http')) {
        return cleaned;
      }
    } catch (e) {
      log('Error decrypting JioSaavn media URL: $e', name: 'WebPluginHandler');
    }
    return null;
  }

  static String get _effectiveApiBase {
    if (kIsWeb) {
      final origin = Uri.base.origin;
      if (origin.startsWith('http')) {
        return '$origin/api.php';
      }
      return '/api.php';
    }
    return _apiBase;
  }

  static Future<Map<String, dynamic>?> _fetchJson(
      Map<String, String> params) async {
    try {
      final baseUrl = _effectiveApiBase;
      final uri = Uri.parse(baseUrl).replace(queryParameters: {
        '_format': 'json',
        '_marker': '0',
        'ctx': 'web6dot0',
        ...params,
      });
      final headers = kIsWeb
          ? {'Accept': 'application/json'}
          : {
              'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
            };
      final res = await http.get(uri, headers: headers);
      if (res.statusCode == 200) {
        final body = res.body.trim();
        if (body.startsWith('{') && body.endsWith('}')) {
          return json.decode(body) as Map<String, dynamic>;
        }
      }
    } catch (e) {
      log('WebPluginHandler fetch error: $e', name: 'WebPluginHandler');
    }
    return null;
  }

  static Track formatTrack(Map<String, dynamic> raw) {
    final id = (raw['id'] ?? raw['song_id'] ?? '').toString();
    final title = decodeHtml(raw['song'] ?? raw['title'] ?? 'Unknown');
    final albumName = decodeHtml(raw['album'] ?? '');
    final albumId = (raw['albumid'] ?? raw['album_id'] ?? '').toString();

    String artist = decodeHtml(raw['primary_artists'] ??
        raw['music'] ??
        raw['singers'] ??
        'Unknown Artist');
    if (artist.isEmpty) artist = 'Unknown Artist';

    final artworkUrl = getHighResImage(raw['image']?.toString());
    final durationSec = int.tryParse(raw['duration']?.toString() ?? '0') ?? 0;

    final track = Track(
      id: '$jioSaavnPluginId::$id',
      title: title,
      artists: [ArtistSummary(id: 'artist_$id', name: artist)],
      album: AlbumSummary(
        id: albumId,
        title: albumName,
        artists: [ArtistSummary(id: 'artist_$id', name: artist)],
        thumbnail: Artwork(url: artworkUrl, layout: ImageLayout.square),
      ),
      durationMs: BigInt.from(durationSec * 1000),
      thumbnail: Artwork(url: artworkUrl, layout: ImageLayout.square),
      isExplicit: raw['explicit_content'] == 1 || raw['explicit_content'] == '1',
    );
    _knownTracks[id] = track;
    return track;
  }

  static Future<PluginResponse> _searchYouTube(String pluginId, String query) async {
    try {
      final origin = kIsWeb ? Uri.base.origin : 'http://localhost:8088';
      final uri = Uri.parse('$origin/yt/search?q=${Uri.encodeComponent(query)}');
      final res = await http.get(uri);
      if (res.statusCode == 200) {
        final body = json.decode(res.body) as Map<String, dynamic>;
        final results = (body['results'] as List?) ?? [];
        if (results.isNotEmpty) {
          final tracks = results.map((r) {
            final raw = r as Map<String, dynamic>;
            final vid = raw['id']?.toString() ?? '';
            final title = decodeHtml(raw['title']?.toString() ?? 'Track');
            final artist = decodeHtml(raw['artist']?.toString() ?? 'YouTube Artist');
            final thumb = raw['image']?.toString() ?? 'https://i.ytimg.com/vi/$vid/hqdefault.jpg';
            final durSec = int.tryParse(raw['duration']?.toString() ?? '180') ?? 180;
            final t = Track(
              id: '$pluginId::$vid',
              title: title,
              artists: [ArtistSummary(id: 'artist_$vid', name: artist)],
              album: AlbumSummary(
                id: 'yt_album_$vid',
                title: title,
                artists: [ArtistSummary(id: 'artist_$vid', name: artist)],
                thumbnail: Artwork(url: thumb, layout: ImageLayout.square),
              ),
              durationMs: BigInt.from(durSec * 1000),
              thumbnail: Artwork(url: thumb, layout: ImageLayout.square),
              isExplicit: false,
            );
            _knownTracks[vid] = t;
            return t;
          }).toList();
          return PluginResponse.search(
            PagedMediaItems(
              items: tracks.map((t) => MediaItem.track(t)).toList(),
              nextPageToken: null,
            ),
          );
        }
      }
    } catch (e) {
      log('YouTube search failed, fallback: $e', name: 'WebPluginHandler');
    }
    final data = await _fetchJson({
      '__call': 'search.getResults',
      'q': query,
      'p': '1',
      'n': '30',
    });
    final list = (data?['results'] as List?) ?? [];
    final List<Track> tracks = list.map((e) {
      final t = formatTrack(e as Map<String, dynamic>);
      final trackId = '$pluginId::${t.id.split('::').last}';
      final mapped = Track(
        id: trackId,
        title: t.title,
        artists: t.artists,
        album: t.album,
        durationMs: t.durationMs,
        thumbnail: t.thumbnail,
        isExplicit: t.isExplicit,
      );
      final clean = trackId.split('::').last;
      _knownTracks[clean] = mapped;
      return mapped;
    }).toList();
    return PluginResponse.search(
      PagedMediaItems(
        items: tracks.map((t) => MediaItem.track(t)).toList(),
        nextPageToken: null,
      ),
    );
  }

  static Future<PluginResponse> execute(
    String pluginId,
    PluginRequest request,
  ) async {
    return request.when(
      contentResolver: (cmd) async {
        return cmd.when(
          search: (query, filter, pageToken) async {
            if (pluginId == ytMusicPluginId || pluginId == ytVideoPluginId) {
              return _searchYouTube(pluginId, query);
            }
            final data = await _fetchJson({
              '__call': 'search.getResults',
              'q': query,
              'p': '1',
              'n': '30',
            });
            final list = (data?['results'] as List?) ?? [];
            final tracks =
                list.map((e) => formatTrack(e as Map<String, dynamic>)).toList();
            for (final t in tracks) {
              final clean = t.id.contains('::') ? t.id.split('::').last : t.id;
              _knownTracks[clean] = t;
            }
            return PluginResponse.search(
              PagedMediaItems(
                items: tracks.map((t) => MediaItem.track(t)).toList(),
                nextPageToken: null,
              ),
            );
          },
          getStreams: (id) async {
            final cleanId = id.contains('::') ? id.split('::').last : id;
            var data = await _fetchJson({
              '__call': 'song.getDetails',
              'pids': cleanId,
            });

            String? extractEncUrl(dynamic source) {
              if (source == null) return null;
              if (source is Map<String, dynamic>) {
                final direct = source['encrypted_media_url']?.toString();
                if (direct != null && direct.isNotEmpty) return direct;
                final moreInfo = source['more_info'];
                if (moreInfo is Map) {
                  final fromMore = moreInfo['encrypted_media_url']?.toString();
                  if (fromMore != null && fromMore.isNotEmpty) return fromMore;
                }
              }
              return null;
            }

            String? encUrl;
            if (data != null) {
              if (data[cleanId] != null) {
                encUrl = extractEncUrl(data[cleanId]);
              }
              if (encUrl == null &&
                  data['songs'] is List &&
                  (data['songs'] as List).isNotEmpty) {
                encUrl = extractEncUrl(data['songs'][0]);
              }
            }
            if (encUrl == null || encUrl.isEmpty) {
              final known = _knownTracks[cleanId];
              final query = known != null
                  ? '${known.title} ${known.artists.isNotEmpty ? known.artists.first.name : ''}'
                  : cleanId;
              final searchData = await _fetchJson({
                '__call': 'search.getResults',
                'q': query.trim(),
                'p': '1',
                'n': '1',
              });
              final searchResults = (searchData?['results'] as List?) ?? [];
              if (searchResults.isNotEmpty) {
                final matchId = (searchResults[0]['id'] ?? '').toString();
                if (matchId.isNotEmpty) {
                  final matchDetails = await _fetchJson({
                    '__call': 'song.getDetails',
                    'pids': matchId,
                  });
                  if (matchDetails != null) {
                    if (matchDetails[matchId] != null) {
                      encUrl = extractEncUrl(matchDetails[matchId]);
                    }
                    if (encUrl == null &&
                        matchDetails['songs'] is List &&
                        (matchDetails['songs'] as List).isNotEmpty) {
                      encUrl = extractEncUrl(matchDetails['songs'][0]);
                    }
                  }
                }
              }
            }
            final decrypted = decryptMediaUrl(encUrl);
            if (decrypted != null) {
              final highUrl = decrypted
                  .replaceFirst('_96.mp4', '_320.mp4')
                  .replaceFirst('_96.mp3', '_320.mp3');
              final medUrl = decrypted
                  .replaceFirst('_96.mp4', '_160.mp4')
                  .replaceFirst('_96.mp3', '_160.mp3');
              return PluginResponse.streams([
                StreamSource(url: medUrl, quality: Quality.high, format: 'mp4'),
                StreamSource(url: decrypted, quality: Quality.medium, format: 'mp4'),
                StreamSource(url: highUrl, quality: Quality.lossless, format: 'mp4'),
              ]);
            }
            return const PluginResponse.streams([]);
          },
          getHomeSections: () async {
            final [trendingData, hitData, classicData] = await Future.wait([
              _fetchJson({
                '__call': 'search.getResults',
                'q': 'Top Trending Hits Bollywood Hindi Telugu',
                'p': '1',
                'n': '16',
              }),
              _fetchJson({
                '__call': 'search.getResults',
                'q': 'Superhit Love Songs Arijit Singh',
                'p': '1',
                'n': '16',
              }),
              _fetchJson({
                '__call': 'search.getResults',
                'q': 'Party Dance Workout Hits',
                'p': '1',
                'n': '16',
              }),
            ]);

            final tList = ((trendingData?['results'] as List?) ?? [])
                .map((e) => formatTrack(e as Map<String, dynamic>))
                .toList();
            final hList = ((hitData?['results'] as List?) ?? [])
                .map((e) => formatTrack(e as Map<String, dynamic>))
                .toList();
            final cList = ((classicData?['results'] as List?) ?? [])
                .map((e) => formatTrack(e as Map<String, dynamic>))
                .toList();

            final sections = <Section>[
              Section(
                id: 'trending_hits',
                title: 'Trending Superhits',
                subtitle: 'Most streamed songs right now',
                cardType: CardType.vlist,
                items: tList.map((t) => MediaItem.track(t)).toList(),
              ),
              Section(
                id: 'romantic_hits',
                title: 'Romantic Melodies',
                subtitle: 'Feel good love songs',
                cardType: CardType.carousel,
                items: hList.map((t) => MediaItem.track(t)).toList(),
              ),
              Section(
                id: 'party_hits',
                title: 'Party & Dance',
                subtitle: 'Upbeat club anthems',
                cardType: CardType.vlist,
                items: cList.map((t) => MediaItem.track(t)).toList(),
              ),
            ];

            return PluginResponse.homeSections(sections);
          },
          getTrackDetails: (id) async {
            final data = await _fetchJson({
              '__call': 'song.getDetails',
              'pids': id,
            });
            if (data != null && data[id] is Map<String, dynamic>) {
              return PluginResponse.trackDetails(
                  formatTrack(data[id] as Map<String, dynamic>));
            }
            throw Exception('Song not found: $id');
          },
          getAlbumDetails: (id) async {
            final data = await _fetchJson({
              '__call': 'content.getAlbumDetails',
              'albumid': id,
            });
            final rawSongs = (data?['list'] as List?) ?? [];
            final tracks = rawSongs
                .map((e) => formatTrack(e as Map<String, dynamic>))
                .toList();
            final title = decodeHtml(data?['title']?.toString() ?? 'Album');
            final summary = AlbumSummary(
              id: id,
              title: title,
              artists: [],
              thumbnail: Artwork(
                url: getHighResImage(data?['image']?.toString()),
                layout: ImageLayout.square,
              ),
            );
            return PluginResponse.albumDetails(
              AlbumDetails(
                summary: summary,
                tracks: PagedTracks(items: tracks, nextPageToken: null),
              ),
            );
          },
          getArtistDetails: (id) async {
            final data = await _fetchJson({
              '__call': 'artist.getArtistPageDetails',
              'artistId': id,
            });
            final rawSongs = (data?['topSongs'] as List?) ?? [];
            final tracks = rawSongs
                .map((e) => formatTrack(e as Map<String, dynamic>))
                .toList();
            final name = decodeHtml(data?['name']?.toString() ?? 'Artist');
            final summary = ArtistSummary(
              id: id,
              name: name,
              thumbnail: Artwork(
                url: getHighResImage(data?['image']?.toString()),
                layout: ImageLayout.square,
              ),
            );
            return PluginResponse.artistDetails(
              ArtistDetails(
                summary: summary,
                topTracks: tracks,
                albums: const PagedAlbums(items: [], nextPageToken: null),
                relatedArtists: const [],
              ),
            );
          },
          getPlaylistDetails: (id) async {
            final data = await _fetchJson({
              '__call': 'playlist.getDetails',
              'listid': id,
            });
            final rawSongs = (data?['list'] as List?) ?? [];
            final tracks = rawSongs
                .map((e) => formatTrack(e as Map<String, dynamic>))
                .toList();
            final title = decodeHtml(data?['title']?.toString() ?? 'Playlist');
            final summary = PlaylistSummary(
              id: id,
              title: title,
              thumbnail: Artwork(
                url: getHighResImage(data?['image']?.toString()),
                layout: ImageLayout.square,
              ),
            );
            return PluginResponse.playlistDetails(
              PlaylistDetails(
                summary: summary,
                tracks: PagedTracks(items: tracks, nextPageToken: null),
              ),
            );
          },
          moreAlbumTracks: (id, pageToken) async {
            return const PluginResponse.moreTracks(
                PagedTracks(items: [], nextPageToken: null));
          },
          moreArtistAlbums: (id, pageToken) async {
            return const PluginResponse.moreAlbums(
                PagedAlbums(items: [], nextPageToken: null));
          },
          morePlaylistTracks: (id, pageToken) async {
            return const PluginResponse.moreTracks(
                PagedTracks(items: [], nextPageToken: null));
          },
          getRadioTracks: (id, pageToken) async {
            return const PluginResponse.moreTracks(
                PagedTracks(items: [], nextPageToken: null));
          },
          loadMore: (id, moreLink) async {
            return const PluginResponse.loadMoreItems([]);
          },
          getSegmentsForTrack: (id) async {
            return const PluginResponse.segments([]);
          },
        );
      },
      searchSuggestionProvider: (cmd) async {
        return cmd.when(
          getSuggestions: (query, limit, includeEntities) async {
            if (pluginId == ytSuggestionsPluginId) {
              try {
                final origin = kIsWeb ? Uri.base.origin : 'http://localhost:8088';
                final uri = Uri.parse('$origin/yt/suggest?q=${Uri.encodeComponent(query)}');
                final res = await http.get(uri);
                if (res.statusCode == 200) {
                  final body = json.decode(res.body) as List;
                  if (body.length > 1 && body[1] is List) {
                    final list = (body[1] as List)
                        .map((e) => Suggestion.query(e.toString()))
                        .toList();
                    return PluginResponse.suggestions(list);
                  }
                }
              } catch (e) {
                log('YouTube suggestion error: $e', name: 'WebPluginHandler');
              }
            }
            final data = await _fetchJson({
              '__call': 'autocomplete.get',
              'query': query,
            });
            final songs = (data?['songs']?['data'] as List?) ?? [];
            final suggestions = songs.map((e) {
              final title = decodeHtml(e['title']?.toString() ?? '');
              return Suggestion.query(title);
            }).toList();
            return PluginResponse.suggestions(suggestions);
          },
          getDefaultSuggestions: (limit, includeEntities) async {
            return const PluginResponse.suggestions([]);
          },
        );
      },
      chartProvider: (_) async => const PluginResponse.charts([]),
      lyricsProvider: (cmd) async {
        return cmd.when(
          getLyrics: (metadata) async {
            final query = '${metadata.title} ${metadata.artist}'.trim();
            final data = await _fetchJson({
              '__call': 'search.getResults',
              'q': query,
              'p': '1',
              'n': '5',
            });
            final list = (data?['results'] as List?) ?? [];
            String? lyricsText;
            String? copyright;
            String? source;

            for (final item in list) {
              final raw = item as Map<String, dynamic>;
              final songId = (raw['id'] ?? '').toString();
              if (songId.isNotEmpty) {
                final lData = await _fetchJson({
                  '__call': 'lyrics.getLyrics',
                  'lyrics_id': songId,
                });
                if (lData != null && lData['lyrics'] != null) {
                  lyricsText = lData['lyrics'].toString();
                  copyright = lData['lyrics_copyright']?.toString();
                  source = 'JioSaavn';
                  break;
                }
              }
            }

            if (lyricsText != null && lyricsText.isNotEmpty) {
              final cleanLyrics = decodeHtml(
                lyricsText
                    .replaceAll(
                        RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
                    .replaceAll(RegExp(r'<[^>]+>'), ''),
              ).trim();

              return PluginResponse.lyricsResult(
                (
                  PluginLyrics(
                    plain: cleanLyrics,
                    lrc: null,
                    lines: null,
                    isInstrumental: false,
                    syncType: LyricsSyncType.none,
                  ),
                  LyricsMetadata(
                    source: source ?? 'JioSaavn',
                    author: metadata.artist,
                    language: 'en',
                    copyright: copyright ?? 'TejaBeats',
                    isVerified: true,
                  ),
                ),
              );
            }

            final fallbackLines = [
              '♪ ${metadata.title} ♪',
              metadata.artist.isNotEmpty
                  ? 'Performed by ${metadata.artist}'
                  : 'TejaBeats Exclusive',
              '',
              'Enjoy the rhythm and feel the beats...',
              '♪ ♫ ♩ ♬',
              'Sing along with your heart!',
              'TejaBeats • Your Music, Your Beats.',
            ].join('\n');

            return PluginResponse.lyricsResult(
              (
                PluginLyrics(
                  plain: fallbackLines,
                  lrc: null,
                  lines: null,
                  isInstrumental: false,
                  syncType: LyricsSyncType.none,
                ),
                LyricsMetadata(
                  source: 'TejaBeats',
                  author: metadata.artist,
                  language: 'en',
                  copyright: 'TejaBeats Music',
                  isVerified: false,
                ),
              ),
            );
          },
          search: (query) async {
            final data = await _fetchJson({
              '__call': 'search.getResults',
              'q': query,
              'p': '1',
              'n': '10',
            });
            final list = (data?['results'] as List?) ?? [];
            final matches = list.map((e) {
              final raw = e as Map<String, dynamic>;
              final id = (raw['id'] ?? '').toString();
              final title = decodeHtml(raw['song'] ?? raw['title'] ?? '');
              final artist =
                  decodeHtml(raw['primary_artists'] ?? raw['music'] ?? '');
              return LyricsMatch(
                id: id,
                title: title,
                artist: artist,
                album: decodeHtml(raw['album'] ?? ''),
                durationMs: null,
                syncType: LyricsSyncType.none,
              );
            }).toList();
            return PluginResponse.lyricsSearchResults(matches);
          },
          getLyricsById: (id) async {
            final lData = await _fetchJson({
              '__call': 'lyrics.getLyrics',
              'lyrics_id': id,
            });
            if (lData != null && lData['lyrics'] != null) {
              final clean = decodeHtml(
                lData['lyrics']
                    .toString()
                    .replaceAll(
                        RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
                    .replaceAll(RegExp(r'<[^>]+>'), ''),
              ).trim();
              return PluginResponse.lyricsById(
                PluginLyrics(
                  plain: clean,
                  isInstrumental: false,
                  syncType: LyricsSyncType.none,
                ),
                LyricsMetadata(
                  source: 'JioSaavn',
                  copyright:
                      lData['lyrics_copyright']?.toString() ?? 'TejaBeats',
                  isVerified: true,
                ),
              );
            }
            return const PluginResponse.lyricsById(
              PluginLyrics(
                plain: 'Lyrics unavailable for this selection.',
                isInstrumental: false,
                syncType: LyricsSyncType.none,
              ),
              LyricsMetadata(
                source: 'TejaBeats',
                isVerified: false,
              ),
            );
          },
        );
      },
      contentImporter: (_) async => const PluginResponse.canHandle(false),
    );
  }
}
