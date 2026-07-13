import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/presentation/bloc/repeat_game_cubit.dart';
import 'package:la_pocha/features/history/presentation/widgets/repeat_game_dialog.dart';

void handleRepeatGameSuccess(BuildContext context, String newGameId) {
  context.go('/games/$newGameId/players');
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: const Text('Nueva partida creada'),
      action: SnackBarAction(
        label: 'Ir al setup',
        onPressed: () => context.go('/games/$newGameId/players'),
      ),
    ),
  );
}

Future<void> requestRepeatGame(
  BuildContext context, {
  required String gameId,
  required GameHistorySource source,
}) async {
  final confirmed = await showRepeatGameDialog(context);
  if (!confirmed || !context.mounted) {
    return;
  }

  await context.read<RepeatGameCubit>().repeat(
        gameId: gameId,
        source: source,
      );
}

class RepeatGameButton extends StatelessWidget {
  const RepeatGameButton({
    super.key,
    required this.gameId,
    required this.source,
  });

  final String gameId;
  final GameHistorySource source;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<RepeatGameCubit, RepeatGameState>(
      builder: (context, state) {
        final isLoading = state is RepeatGameInProgress;

        return FilledButton.icon(
          onPressed: isLoading
              ? null
              : () => requestRepeatGame(
                    context,
                    gameId: gameId,
                    source: source,
                  ),
          icon: isLoading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.replay),
          label: const Text('Repetir partida'),
        );
      },
    );
  }
}
