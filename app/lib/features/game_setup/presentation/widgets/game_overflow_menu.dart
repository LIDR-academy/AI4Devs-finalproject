import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/cancel_game_cubit.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/cancel_game_dialog.dart';

class GameOverflowMenu extends StatelessWidget {
  const GameOverflowMenu({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<CancelGameCubit>(),
      child: _GameOverflowMenuView(gameId: gameId),
    );
  }
}

class _GameOverflowMenuView extends StatelessWidget {
  const _GameOverflowMenuView({required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return BlocListener<CancelGameCubit, CancelGameState>(
      listener: (context, state) {
        if (state is CancelGameSuccess) {
          context.go('/');
        } else if (state is CancelGameFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
        }
      },
      child: PopupMenuButton<String>(
        icon: const Icon(Icons.more_vert, color: Colors.white),
        onSelected: (value) async {
          if (value != 'cancel') {
            return;
          }
          final cubit = context.read<CancelGameCubit>();
          final confirmed = await showCancelGameDialog(context);
          if (confirmed) {
            await cubit.cancel(gameId);
          }
        },
        itemBuilder: (context) => [
          const PopupMenuItem(
            value: 'cancel',
            child: Text(
              'Cancelar partida',
              style: TextStyle(color: Color(0xFFD9772E)),
            ),
          ),
        ],
      ),
    );
  }
}
