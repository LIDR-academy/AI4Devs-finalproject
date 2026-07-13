import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/cancel_game_cubit.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/cancel_game_dialog.dart';
import 'package:la_pocha/features/round/presentation/bloc/repeat_round_cubit.dart';
import 'package:la_pocha/features/round/presentation/widgets/repeat_round_dialog.dart';

class GameOverflowMenu extends StatelessWidget {
  const GameOverflowMenu({
    super.key,
    required this.gameId,
    this.repeatRoundNumber,
  });

  final String gameId;
  final int? repeatRoundNumber;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<CancelGameCubit>()),
        BlocProvider(create: (_) => getIt<RepeatRoundCubit>()),
      ],
      child: _GameOverflowMenuView(
        gameId: gameId,
        repeatRoundNumber: repeatRoundNumber,
      ),
    );
  }
}

class _GameOverflowMenuView extends StatelessWidget {
  const _GameOverflowMenuView({
    required this.gameId,
    this.repeatRoundNumber,
  });

  final String gameId;
  final int? repeatRoundNumber;

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<CancelGameCubit, CancelGameState>(
          listener: (context, state) {
            if (state is CancelGameSuccess) {
              context.go('/');
            } else if (state is CancelGameFailure) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            }
          },
        ),
        BlocListener<RepeatRoundCubit, RepeatRoundState>(
          listener: (context, state) {
            if (state is RepeatRoundSuccess) {
              context.go(
                '/games/${state.gameId}/rounds/${state.roundNumber}/bids',
              );
            } else if (state is RepeatRoundFailure) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            }
          },
        ),
      ],
      child: PopupMenuButton<String>(
        icon: const Icon(Icons.more_vert, color: Colors.white),
        onSelected: (value) async {
          switch (value) {
            case 'repeat':
              final roundNumber = repeatRoundNumber;
              if (roundNumber == null) {
                return;
              }
              final cubit = context.read<RepeatRoundCubit>();
              final confirmed = await showRepeatRoundDialog(context);
              if (confirmed) {
                await cubit.repeat(gameId: gameId, roundNumber: roundNumber);
              }
            case 'cancel':
              final cubit = context.read<CancelGameCubit>();
              final confirmed = await showCancelGameDialog(context);
              if (confirmed) {
                await cubit.cancel(gameId);
              }
          }
        },
        itemBuilder: (context) => [
          if (repeatRoundNumber != null)
            const PopupMenuItem(
              value: 'repeat',
              child: Text(
                'Repetir ronda',
                style: TextStyle(color: Color(0xFFD9772E)),
              ),
            ),
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
