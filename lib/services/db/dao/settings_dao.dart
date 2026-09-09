import 'package:flutter/foundation.dart';
import 'package:Bloomee/services/db/global_db.dart';
import 'package:isar_community/isar.dart';

/// DAO for settings (string & bool) persistence.
class SettingsDAO {
  final Future<Isar> _db;

  const SettingsDAO(this._db);

  static final Map<String, String> _webStr = {
    'userName': 'Teja',
    'appSetupCompleted': 'true',
    'countryCode': 'IN',
    'languageCode': '',
    'preferredQuality': 'high',
    'streamingQuality': 'high',
    'preferredSearchEngine': 'saavn',
    'homePluginId': 'content-resolver.bloomfactory.jisaavn',
    'searchPluginId': 'content-resolver.bloomfactory.jisaavn',
    'lyricsPluginId': 'content-resolver.bloomfactory.jisaavn',
    'suggestionPluginId': 'search-suggestion-provider.bloomfactory.ytmusicsearchsuggestion',
    'lyricsPriority': '["content-resolver.bloomfactory.jisaavn"]',
    'resolverPriority':
        '["content-resolver.bloomfactory.jisaavn","content-resolver.bloomfactory.ytmusic","content-resolver.bloomfactory.ytvideo"]',
    'autoLoadPluginIds':
        '["content-resolver.bloomfactory.jisaavn","content-resolver.bloomfactory.ytmusic","content-resolver.bloomfactory.ytvideo"]',
    'repositoriesBootstrapped': 'true',
  };
  static final Map<String, bool> _webBool = {
    'appSetupCompleted': true,
    'autoGetCountry': false,
    'autoPlay': true,
    'repositoriesBootstrapped': true,
  };

  // --------------- String settings ---------------

  Future<void> putSettingStr(String key, String value) async {
    if (kIsWeb) {
      _webStr[key] = value;
      return;
    }
    Isar isarDB = await _db;
    if (key.isNotEmpty) {
      await isarDB.writeTxn(() async {
        await isarDB.appSettingsStrDBs
            .put(AppSettingsStrDB(settingName: key, settingValue: value));
      });
    }
  }

  Future<String?> getSettingStr(String key, {String? defaultValue}) async {
    if (kIsWeb) {
      return _webStr[key] ?? defaultValue;
    }
    Isar isarDB = await _db;
    final settingValue = isarDB.appSettingsStrDBs
        .filter()
        .settingNameEqualTo(key)
        .findFirstSync()
        ?.settingValue;
    if (settingValue != null) {
      return settingValue;
    } else {
      return defaultValue;
    }
  }

  Future<Stream<AppSettingsStrDB?>?> getWatcher4SettingStr(String key) async {
    if (kIsWeb) {
      return Stream.value(
          AppSettingsStrDB(settingName: key, settingValue: _webStr[key] ?? ''));
    }
    Isar isarDB = await _db;
    int? id = isarDB.appSettingsStrDBs
        .filter()
        .settingNameEqualTo(key)
        .findFirstSync()
        ?.id;
    if (id != null) {
      return isarDB.appSettingsStrDBs.watchObject(id, fireImmediately: true);
    } else {
      return null;
    }
  }

  // --------------- Bool settings ---------------

  Future<void> putSettingBool(String key, bool value) async {
    if (kIsWeb) {
      _webBool[key] = value;
      return;
    }
    Isar isarDB = await _db;
    if (key.isNotEmpty) {
      await isarDB.writeTxn(() async {
        await isarDB.appSettingsBoolDBs
            .put(AppSettingsBoolDB(settingName: key, settingValue: value));
      });
    }
  }

  Future<bool?> getSettingBool(String key, {bool? defaultValue}) async {
    if (kIsWeb) {
      return _webBool[key] ?? defaultValue;
    }
    Isar isarDB = await _db;
    final settingValue = isarDB.appSettingsBoolDBs
        .filter()
        .settingNameEqualTo(key)
        .findFirstSync()
        ?.settingValue;
    if (settingValue != null) {
      return settingValue;
    } else {
      return defaultValue;
    }
  }

  Future<Stream<AppSettingsBoolDB?>?> getWatcher4SettingBool(String key) async {
    if (kIsWeb) {
      return Stream.value(
          AppSettingsBoolDB(settingName: key, settingValue: _webBool[key] ?? false));
    }
    Isar isarDB = await _db;
    int? id = isarDB.appSettingsBoolDBs
        .filter()
        .settingNameEqualTo(key)
        .findFirstSync()
        ?.id;
    if (id != null) {
      return isarDB.appSettingsBoolDBs.watchObject(id, fireImmediately: true);
    } else {
      await isarDB.writeTxn(() async {
        await isarDB.appSettingsBoolDBs
            .put(AppSettingsBoolDB(settingName: key, settingValue: false));
      });
      return isarDB.appSettingsBoolDBs.watchObject(
        isarDB.appSettingsBoolDBs
            .filter()
            .settingNameEqualTo(key)
            .findFirstSync()!
            .id,
        fireImmediately: true,
      );
    }
  }
}
