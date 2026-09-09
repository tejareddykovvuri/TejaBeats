import 'dart:async';
import 'dart:developer';
import 'package:bloc/bloc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
part 'connectivity_state.dart';

class ConnectivityCubit extends Cubit<ConnectivityState> {
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  ConnectivityCubit() : super(ConnectivityState.connected) {
    if (kIsWeb) {
      emit(ConnectivityState.connected);
      return;
    }
    Connectivity().checkConnectivity().then(_updateStatus);
    _subscription = Connectivity().onConnectivityChanged.listen(_updateStatus);
  }

  void _updateStatus(List<ConnectivityResult> event) {
    if (event.contains(ConnectivityResult.wifi) ||
        event.contains(ConnectivityResult.mobile) ||
        event.contains(ConnectivityResult.ethernet) ||
        event.contains(ConnectivityResult.bluetooth) ||
        event.contains(ConnectivityResult.vpn) ||
        event.contains(ConnectivityResult.other)) {
      emit(ConnectivityState.connected);
      log('Connected to network: $event', name: 'ConnectivityCubit');
    } else {
      emit(ConnectivityState.disconnected);
      log('Disconnected from network: $event', name: 'ConnectivityCubit');
    }
  }
  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
