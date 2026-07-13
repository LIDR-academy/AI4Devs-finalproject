import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';

class AuthRefreshNotifier extends ChangeNotifier {
  AuthRefreshNotifier(AuthBloc authBloc) {
    _subscription = authBloc.stream.listen((_) => notifyListeners());
  }

  StreamSubscription<AuthState>? _subscription;

  @override
  void dispose() {
    unawaited(_subscription?.cancel());
    super.dispose();
  }
}
