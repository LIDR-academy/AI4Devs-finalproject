import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_state.dart';
import 'package:la_pocha/features/round/presentation/widgets/round_header.dart';
import 'package:la_pocha/features/round/presentation/widgets/scoring_player_row.dart';
import 'package:la_pocha/features/round/presentation/widgets/tricks_sum_indicator.dart';

class ScoringPage extends StatelessWidget {
  const ScoringPage({
    super.key,
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ScoringBloc>()
        ..add(ScoringStarted(gameId: gameId, roundNumber: roundNumber)),
      child: _ScoringView(gameId: gameId, roundNumber: roundNumber),
    );
  }
}

class _ScoringView extends StatelessWidget {
  const _ScoringView({required this.gameId, required this.roundNumber});

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return BlocListener<ScoringBloc, ScoringState>(
      listener: (context, state) {
        if (state is ScoringNavigateToResult) {
          context.go(
            '/games/${state.gameId}/rounds/${state.roundNumber}/result',
          );
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              BlocBuilder<ScoringBloc, ScoringState>(
                builder: (context, state) {
                  final cardsInRound =
                      state is ScoringLoaded ? state.round.cardsInRound : null;
                  return RoundHeader(
                    gameId: gameId,
                    roundNumber: roundNumber,
                    cardsInRound: cardsInRound,
                    subtitle: 'Bazas reales',
                    repeatRoundNumber: roundNumber,
                  );
                },
              ),
              Expanded(
                child: BlocBuilder<ScoringBloc, ScoringState>(
                  builder: (context, state) {
                    return switch (state) {
                      ScoringLoading() => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ScoringFailure(:final message) => Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(message),
                          ),
                        ),
                      ScoringLoaded() => _LoadedBody(state: state),
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
  const _LoadedBody({required this.state});

  static const Color _validationTextColor = Color(0xFFD9772E);

  final ScoringLoaded state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.round.roundNumber >= 2)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () {
                  // TODO(LPT-14): navigate to previous round summary
                },
                icon: const Icon(Icons.arrow_back, size: 16),
                label: const Text('Ver ronda anterior'),
              ),
            ),
          ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
          child: TricksSumIndicator(
            tricksSum: state.tricksSum,
            cardsInRound: state.round.cardsInRound,
            canConfirm: state.canConfirm,
          ),
        ),
        if (state.validationMessage != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Text(
              state.validationMessage!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: _validationTextColor,
                  ),
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: state.players.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final player = state.players[index];
              return ScoringPlayerRow(
                player: player,
                index: index,
                bid: state.round.bids[player.id] ?? 0,
                isDealer: player.id == state.round.dealerPlayerId,
                trickValue: state.draftTricks[player.id] ?? 0,
                cardsInRound: state.round.cardsInRound,
                scorePreview: state.scoresPreview[player.id],
                onTrickChanged: (value) {
                  context.read<ScoringBloc>().add(
                        TrickValueChanged(
                          playerId: player.id,
                          value: value,
                        ),
                      );
                },
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: FilledButton(
            onPressed: state.canConfirm && !state.isClosing
                ? () => context.read<ScoringBloc>().add(
                      const CloseRoundRequested(),
                    )
                : null,
            child: state.isClosing
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('Confirmar bazas'),
          ),
        ),
      ],
    );
  }
}
