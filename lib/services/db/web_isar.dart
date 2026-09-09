import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:isar_community/isar.dart';

/// Web-compatible in-memory Isar implementation.
///
/// Bypasses native FFI / missing isar.js binaries on Flutter Web so all
/// existing Isar DAOs run seamlessly in the browser.
class WebIsar extends Isar {
  WebIsar(List<CollectionSchema<dynamic>> schemas) : super('dbv3') {
    final cols = <Type, IsarCollection<dynamic>>{};
    for (final schema in schemas) {
      schema.toCollection(<OBJ>() {
        schema as CollectionSchema<OBJ>;
        cols[OBJ] = WebIsarCollection<OBJ>(this, schema);
      });
    }
    attachCollections(cols);
  }

  @override
  String? get directory => null;

  @override
  Future<T> txn<T>(Future<T> Function() callback) => callback();

  @override
  Future<T> writeTxn<T>(Future<T> Function() callback, {bool silent = false}) =>
      callback();

  @override
  T txnSync<T>(T Function() callback) => callback();

  @override
  T writeTxnSync<T>(T Function() callback, {bool silent = false}) =>
      callback();

  @override
  Future<int> getSize({bool includeIndexes = false, bool includeLinks = false}) async =>
      0;

  @override
  int getSizeSync({bool includeIndexes = false, bool includeLinks = false}) => 0;

  @override
  Future<void> copyToFile(String targetPath) async {}

  @override
  Future<void> verify() async {}

  @override
  Future<bool> close({bool deleteFromDisk = false}) async => true;
}

class WebIsarCollection<OBJ> extends IsarCollection<OBJ> {
  WebIsarCollection(this.isar, this.schema);

  @override
  final Isar isar;

  @override
  final CollectionSchema<OBJ> schema;

  @override
  String get name => schema.name;

  final Map<Id, OBJ> _storage = {};
  int _autoId = 1;

  Id _getId(OBJ object) {
    try {
      final dynamic obj = object;
      if (obj.id != null && obj.id != Isar.autoIncrement && obj.id != 0) {
        return obj.id as Id;
      }
    } catch (_) {}
    return _autoId++;
  }

  void _setId(OBJ object, Id id) {
    try {
      final dynamic obj = object;
      obj.id = id;
    } catch (_) {}
  }

  @override
  Future<List<OBJ?>> getAll(List<Id> ids) async => getAllSync(ids);

  @override
  List<OBJ?> getAllSync(List<Id> ids) =>
      ids.map((id) => _storage[id]).toList();

  @override
  Future<List<Id>> putAll(List<OBJ> objects) async => putAllSync(objects);

  @override
  List<Id> putAllSync(List<OBJ> objects, {bool saveLinks = true}) {
    final result = <Id>[];
    for (final obj in objects) {
      final id = _getId(obj);
      _setId(obj, id);
      _storage[id] = obj;
      result.add(id);
    }
    return result;
  }

  @override
  Future<int> deleteAll(List<Id> ids) async => deleteAllSync(ids);

  @override
  int deleteAllSync(List<Id> ids) {
    int count = 0;
    for (final id in ids) {
      if (_storage.remove(id) != null) count++;
    }
    return count;
  }

  @override
  Future<void> clear() async => clearSync();

  @override
  void clearSync() => _storage.clear();

  @override
  Future<int> count() async => countSync();

  @override
  int countSync() => _storage.length;

  @override
  Future<int> getSize(
          {bool includeIndexes = false, bool includeLinks = false}) async =>
      0;

  @override
  int getSizeSync({bool includeIndexes = false, bool includeLinks = false}) => 0;

  @override
  Stream<void> watchLazy({bool fireImmediately = false}) =>
      const Stream.empty();

  @override
  Stream<OBJ?> watchObject(Id id, {bool fireImmediately = false}) {
    if (fireImmediately && _storage.containsKey(id)) {
      return Stream.value(_storage[id]);
    }
    return const Stream.empty();
  }

  @override
  Stream<void> watchObjectLazy(Id id, {bool fireImmediately = false}) =>
      const Stream.empty();

  @override
  Future<void> verify(List<OBJ> objects) async {}

  @override
  Future<void> verifyLink(
      String linkName, List<int> sourceIds, List<int> targetIds) async {}

  @override
  Future<List<OBJ?>> getAllByIndex(
          String indexName, List<IndexKey> keys) async =>
      [];

  @override
  List<OBJ?> getAllByIndexSync(String indexName, List<IndexKey> keys) => [];

  @override
  Future<List<Id>> putAllByIndex(String indexName, List<OBJ> objects) async =>
      putAll(objects);

  @override
  List<Id> putAllByIndexSync(String indexName, List<OBJ> objects,
          {bool saveLinks = true}) =>
      putAllSync(objects);

  @override
  Future<int> deleteAllByIndex(String indexName, List<IndexKey> keys) async => 0;

  @override
  int deleteAllByIndexSync(String indexName, List<IndexKey> keys) => 0;

  @override
  Future<void> importJsonRaw(Uint8List jsonBytes) async {}

  @override
  void importJsonRawSync(Uint8List jsonBytes) {}

  @override
  Future<void> importJson(List<Map<String, dynamic>> json) async {}

  @override
  void importJsonSync(List<Map<String, dynamic>> json) {}

  @override
  Query<R> buildQuery<R>({
    List<WhereClause> whereClauses = const [],
    bool whereDistinct = false,
    Sort whereSort = Sort.asc,
    FilterOperation? filter,
    List<SortProperty> sortBy = const [],
    List<DistinctProperty> distinctBy = const [],
    int? offset,
    int? limit,
    String? property,
  }) {
    return WebQuery<R>(this, property, offset, limit);
  }
}

class WebQuery<R> extends Query<R> {
  final WebIsarCollection<dynamic> col;
  final String? property;
  final int? offset;
  final int? limit;

  WebQuery(this.col, this.property, this.offset, this.limit);

  @override
  Isar get isar => col.isar;

  List<R> _getItems() {
    var items = col._storage.values.toList();
    if (offset != null && offset! > 0) {
      if (offset! >= items.length) return [];
      items = items.sublist(offset!);
    }
    if (limit != null && limit! > 0) {
      if (items.length > limit!) items = items.sublist(0, limit!);
    }
    return items.cast<R>();
  }

  @override
  Future<R?> findFirst() async => findFirstSync();

  @override
  R? findFirstSync() {
    final items = _getItems();
    return items.isEmpty ? null : items.first;
  }

  @override
  Future<List<R>> findAll() async => findAllSync();

  @override
  List<R> findAllSync() => _getItems();

  @override
  Future<T?> aggregate<T>(AggregationOp op) async => aggregateSync<T>(op);

  @override
  T? aggregateSync<T>(AggregationOp op) {
    if (op == AggregationOp.count) return col._storage.length as T;
    if (op == AggregationOp.isEmpty) return (col._storage.isEmpty ? 1 : 0) as T;
    return null;
  }

  @override
  Future<bool> deleteFirst() async => deleteFirstSync();

  @override
  bool deleteFirstSync() {
    final items = _getItems();
    if (items.isEmpty) return false;
    final first = items.first;
    try {
      final dynamic obj = first;
      col._storage.remove(obj.id);
      return true;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<int> deleteAll() async => deleteAllSync();

  @override
  int deleteAllSync() {
    final count = col._storage.length;
    col._storage.clear();
    return count;
  }

  @override
  Stream<List<R>> watch({bool fireImmediately = false}) {
    if (fireImmediately) return Stream.value(findAllSync());
    return const Stream.empty();
  }

  @override
  Stream<void> watchLazy({bool fireImmediately = false}) =>
      const Stream.empty();

  @override
  Future<T> exportJsonRaw<T>(T Function(Uint8List) callback) async =>
      callback(Uint8List(0));

  @override
  T exportJsonRawSync<T>(T Function(Uint8List) callback) =>
      callback(Uint8List(0));
}
