import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/router/app_router.dart';
import 'package:la_pocha/core/router/auth_refresh_notifier.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/core/widgets/root_scaffold_messenger_key.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/sync/presentation/bloc/game_sync_bloc.dart';
import 'package:la_pocha/features/sync/presentation/widgets/sync_status_snackbar.dart';
import 'package:la_pocha/firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await configureDependencies();

  final authBloc = getIt<AuthBloc>()..add(const AuthStarted());
  final gameSyncBloc = getIt<GameSyncBloc>();
  final refreshNotifier = AuthRefreshNotifier(authBloc);
  final router = createAppRouter(
    refreshListenable: refreshNotifier,
    authBloc: authBloc,
  );

  runApp(LaPochaApp(
    authBloc: authBloc,
    gameSyncBloc: gameSyncBloc,
    router: router,
  ));
}

class LaPochaApp extends StatelessWidget {
  const LaPochaApp({
    super.key,
    required this.authBloc,
    required this.gameSyncBloc,
    required this.router,
  });

  final AuthBloc authBloc;
  final GameSyncBloc gameSyncBloc;
  final GoRouter router;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>.value(value: authBloc),
        BlocProvider<GameSyncBloc>.value(value: gameSyncBloc),
      ],
      child: SyncStatusSnackbar(
        child: MaterialApp.router(
          title: 'La Pocha',
          theme: AppTheme.light,
          scaffoldMessengerKey: rootScaffoldMessengerKey,
          routerConfig: router,
        ),
      ),
    );
  }
}
