import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/sync/presentation/bloc/game_sync_bloc.dart';

class SyncStatusSnackbar extends StatelessWidget {
  const SyncStatusSnackbar({super.key, required this.child});

  final Widget child;

  static const Color _warningBackground = Color(0xFFFCEFE0);
  static const Color _warningText = Color(0xFFF4A259);

  @override
  Widget build(BuildContext context) {
    return BlocListener<GameSyncBloc, GameSyncState>(
      listener: (context, state) {
        final messenger = ScaffoldMessenger.of(context);
        messenger.hideCurrentSnackBar();

        switch (state) {
          case GameSyncSuccess():
            messenger.showSnackBar(
              SnackBar(
                content: const Text('Partida guardada en la nube'),
                backgroundColor: AppTheme.primary,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          case GameSyncFailure():
            messenger.showSnackBar(
              SnackBar(
                content: const Text(
                  'No se pudo sincronizar; se reintentará',
                ),
                backgroundColor: _warningBackground,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                action: SnackBarAction(
                  label: 'OK',
                  textColor: _warningText,
                  onPressed: messenger.hideCurrentSnackBar,
                ),
              ),
            );
          case GameSyncIdle():
            break;
        }
      },
      child: child,
    );
  }
}
