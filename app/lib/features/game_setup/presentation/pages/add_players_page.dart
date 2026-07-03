import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/add_player_bottom_sheet.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/player_slot.dart';

class AddPlayersPage extends StatelessWidget {
  const AddPlayersPage({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          getIt<AddPlayersBloc>()..add(AddPlayersStarted(gameId: gameId)),
      child: _AddPlayersView(gameId: gameId),
    );
  }
}

class _AddPlayersView extends StatelessWidget {
  const _AddPlayersView({required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return BlocListener<AddPlayersBloc, AddPlayersState>(
      listener: (context, state) {
        if (state is AddPlayersNavigateToSetup) {
          context.go('/games/${state.gameId}/setup');
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Header(onBack: () => context.pop()),
              Expanded(
                child: BlocBuilder<AddPlayersBloc, AddPlayersState>(
                  builder: (context, state) {
                    return switch (state) {
                      AddPlayersLoading() => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      AddPlayersFailure(:final message) => Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(message),
                          ),
                        ),
                      AddPlayersLoaded(
                        :final playerCount,
                        :final players,
                        :final isLoading,
                      ) =>
                        _LoadedBody(
                          playerCount: playerCount,
                          players: players,
                          isLoading: isLoading,
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
    required this.playerCount,
    required this.players,
    required this.isLoading,
  });

  final int playerCount;
  final List<PlayerEmbed> players;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final isComplete = players.length == playerCount;
    final remainingCount = playerCount - players.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
          child: _ProgressIndicator(
            playerCount: playerCount,
            filledCount: players.length,
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: playerCount,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final player = index < players.length ? players[index] : null;
              return PlayerSlot(
                player: player,
                index: index,
                onTap: player == null && !isLoading
                    ? () => showAddPlayerBottomSheet(context)
                    : null,
                onRemove: player == null
                    ? null
                    : () => context.read<AddPlayersBloc>().add(
                          PlayerRemoved(playerId: player.id),
                        ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: Opacity(
            opacity: isComplete ? 1 : 0.4,
            child: FilledButton(
              onPressed: isComplete && !isLoading
                  ? () => context
                      .read<AddPlayersBloc>()
                      .add(const ContinueRequested())
                  : null,
              child: Text(
                isComplete
                    ? 'Continuar'
                    : 'Faltan $remainingCount jugadores',
              ),
            ),
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
    return BlocBuilder<AddPlayersBloc, AddPlayersState>(
      builder: (context, state) {
        final subtitle = switch (state) {
          AddPlayersLoaded(:final players, :final playerCount) =>
            '${players.length} de $playerCount añadidos',
          _ => '',
        };

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
                        'Jugadores',
                        style:
                            Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      if (subtitle.isNotEmpty)
                        Text(
                          subtitle,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.8),
                                  ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ProgressIndicator extends StatelessWidget {
  const _ProgressIndicator({
    required this.playerCount,
    required this.filledCount,
  });

  final int playerCount;
  final int filledCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(playerCount, (index) {
        final isFilled = index < filledCount;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index < playerCount - 1 ? 6 : 0),
            child: Container(
              height: 4,
              decoration: BoxDecoration(
                color: isFilled
                    ? AppTheme.primary
                    : AppTheme.onSurfaceVariant.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        );
      }),
    );
  }
}
