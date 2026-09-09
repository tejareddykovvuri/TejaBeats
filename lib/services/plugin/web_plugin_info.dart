import 'package:Bloomee/services/plugin/web_plugin_handler.dart';
import 'package:Bloomee/src/rust/api/plugin/manifest.dart';
import 'package:Bloomee/src/rust/api/plugin/plugin_info.dart';
import 'package:Bloomee/src/rust/api/plugin/types.dart';

class WebPluginInfo implements PluginInfo {
  WebPluginInfo({
    this.pluginType = PluginType.contentResolver,
    String? id,
    String? name,
    String? description,
    List<String>? capabilities,
  })  : name = name ?? 'JioSaavn',
        manifest = Manifest(
          manifestVersion: 1,
          id: id ?? WebPluginHandler.jioSaavnPluginId,
          name: name ?? 'JioSaavn',
          version: '1.0.0',
          type: pluginType == PluginType.lyricsProvider
              ? 'lyrics-provider'
              : pluginType == PluginType.searchSuggestionProvider
                  ? 'search-suggestion-provider'
                  : 'content-resolver',
          description: description ?? 'JioSaavn Provider for Web',
          publisher: const PluginPublisher(name: 'Bloomee'),
          license: 'MIT',
          homepage: 'https://jiosaavn.com',
          hostSite: const ['https://www.jiosaavn.com'],
          capabilities: capabilities ??
              const [
                'search',
                'home_sections',
                'stream',
                'lyrics',
                'suggestions'
              ],
          keysRequired: const {},
          resolver: true,
          countryAllowlist: const [],
        );

  factory WebPluginInfo.jioSaavn() => WebPluginInfo(
        pluginType: PluginType.contentResolver,
        id: WebPluginHandler.jioSaavnPluginId,
        name: 'JioSaavn',
        description: 'JioSaavn Music Provider for Web',
        capabilities: const [
          'search',
          'home_sections',
          'stream',
          'lyrics',
          'suggestions'
        ],
      );

  factory WebPluginInfo.ytMusic() => WebPluginInfo(
        pluginType: PluginType.contentResolver,
        id: WebPluginHandler.ytMusicPluginId,
        name: 'YouTube Music',
        description: 'Music streaming integration powered by YouTube Music',
        capabilities: const ['search', 'stream', 'suggestions'],
      );

  factory WebPluginInfo.ytVideo() => WebPluginInfo(
        pluginType: PluginType.contentResolver,
        id: WebPluginHandler.ytVideoPluginId,
        name: 'YouTube Video',
        description: 'Resolve YouTube video content for Web',
        capabilities: const ['search', 'stream', 'suggestions'],
      );

  factory WebPluginInfo.ytSuggestions() => WebPluginInfo(
        pluginType: PluginType.searchSuggestionProvider,
        id: WebPluginHandler.ytSuggestionsPluginId,
        name: 'YouTube Music Suggestions',
        description: 'Search suggestions powered by YouTube Music',
        capabilities: const ['suggestions'],
      );

  factory WebPluginInfo.lyrics() => WebPluginInfo(
        pluginType: PluginType.lyricsProvider,
        id: WebPluginHandler.jioSaavnPluginId,
        name: 'JioSaavn Lyrics',
        description: 'Lyrics provider for Web',
        capabilities: const ['lyrics'],
      );

  factory WebPluginInfo.jioSuggestions() => WebPluginInfo(
        pluginType: PluginType.searchSuggestionProvider,
        id: WebPluginHandler.jioSaavnPluginId,
        name: 'JioSaavn Suggestions',
        description: 'Search suggestions powered by JioSaavn',
        capabilities: const ['suggestions'],
      );

  @override
  Manifest manifest;

  @override
  String name;

  @override
  String pluginPath = 'web_plugin';

  @override
  PluginType pluginType;

  @override
  void dispose() {}

  @override
  bool get isDisposed => false;
}
