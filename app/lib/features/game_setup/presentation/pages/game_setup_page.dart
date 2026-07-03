import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/game_setup_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/random_dealer_button.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/reorderable_player_list.dart';

class GameSetupPage extends StatelessWidget {
  const GameSetupPage({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          getIt<GameSetupBloc>()..add(GameSetupStarted(gameId: gameId)),
      child: _GameSetupView(gameId: gameId),
    );
  }
}

class _GameSetupView extends StatelessWidget {
  const _GameSetupView({required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return BlocListener<GameSetupBloc, GameSetupState>(
      listener: (context, state) {
        if (state is GameSetupNavigateToBids) {
          context.go(
            '/games/${state.gameId}/rounds/${state.roundNumber}/bids',
          );
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Header(onBack: () => context.pop()),
              Expanded(
                child: BlocBuilder<GameSetupBloc, GameSetupState>(
                  builder: (context, state) {
                    return switch (state) {
                      GameSetupLoading() => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      GameSetupFailure(:final message) => Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(message),
                          ),
                        ),
                      GameSetupLoaded(
                        :final players,
                        :final firstDealerPlayerId,
                        :final isStarting,
                        :final isComplete,
                      ) =>
                        _LoadedBody(
                          players: players,
                          firstDealerPlayerId: firstDealerPlayerId,
                          isStarting: isStarting,
                          isComplete: isComplete,
                        ),
                      _ => const SizedBox.shrink(),
                    };
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoadedBody extends StatelessWidget {
  const _LoadedBody({
    required this.players,
    required this.firstDealerPlayerId,
    required this.isStarting,
    required this.isComplete,
  });

  final List<PlayerEmbed> players;
  final String firstDealerPlayerId;
  final bool isStarting;
  final bool isComplete;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: ReorderablePlayerList(
            players: players,
            firstDealerPlayerId: firstDealerPlayerId,
            onReorder: (oldIndex, newIndex) {
              context.read<GameSetupBloc>().add(
                    PlayersReordered(
                      oldIndex: oldIndex,
                      newIndex: newIndex,
                    ),
                  );
            },
            onDealerSelected: (playerId) {
              context.read<GameSetupBloc>().add(
                    FirstDealerSelected(playerId: playerId),
                  );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
          child: RandomDealerButton(
            isEnabled: !isStarting && isComplete,
            onPressed: () => context.read<GameSetupBloc>().add(
                  const RandomDealerRequested(),
                ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: FilledButton(
            onPressed: isComplete && !isStarting
                ? () => context
                    .read<GameSetupBloc>()
                    .add(const StartGameRequested())
                : null,
            child: isStarting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('▶ Empezar partida'),
          ),
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.primary,
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
        child: Row(
          children: [
            IconButton(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back, color: Colors.white),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Orden de mesa',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Text(
                    'Arrastra para reordenar',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                  ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, color: Colors.white),
              onSelected: (value) {
                if (value == 'cancel') {
                  // TODO(LPT-24): cancel game
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'cancel',
                  child: Text('Cancelar partida'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
