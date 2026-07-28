import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/widgets/primary_button.dart';
import 'package:la_pocha/features/round/domain/entities/round_result.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_state.dart';
import 'package:la_pocha/features/round/presentation/widgets/ranking_list.dart';
import 'package:la_pocha/features/round/presentation/widgets/round_header.dart';

class RoundResultPage extends StatelessWidget {
  const RoundResultPage({
    super.key,
    required this.gameId,
    required this.roundNumber,
    this.readOnly = false,
  });

  final String gameId;
  final int roundNumber;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<RoundResultBloc>()
        ..add(RoundResultStarted(gameId: gameId, roundNumber: roundNumber)),
      child: _RoundResultView(
        gameId: gameId,
        roundNumber: roundNumber,
        readOnly: readOnly,
      ),
    );
  }
}

class _RoundResultView extends StatelessWidget {
  const _RoundResultView({
    required this.gameId,
    required this.roundNumber,
    required this.readOnly,
  });

  final String gameId;
  final int roundNumber;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return BlocListener<RoundResultBloc, RoundResultState>(
      listener: (context, state) {
        if (state is RoundResultNavigateToBids) {
          context.go(
            '/games/${state.gameId}/rounds/${state.roundNumber}/bids',
          );
        } else if (state is RoundResultNavigateToFinal) {
          context.go('/games/${state.gameId}/final');
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              BlocBuilder<RoundResultBloc, RoundResultState>(
                builder: (context, state) {
                  final cardsInRound = switch (state) {
                    RoundResultLoaded(:final result) => result.round.cardsInRound,
                    RoundResultAdvancing(:final result) => result.round.cardsInRound,
                    _ => null,
                  };
                  final dealerName = switch (state) {
                    RoundResultLoaded(:final result) => result.dealerDisplayName,
                    RoundResultAdvancing(:final result) => result.dealerDisplayName,
                    _ => null,
                  };
                  return RoundHeader(
                    gameId: gameId,
                    roundNumber: roundNumber,
                    cardsInRound: cardsInRound,
                    subtitle: 'Resultado',
                    dealerName: dealerName,
                  );
                },
              ),
              Expanded(
                child: BlocBuilder<RoundResultBloc, RoundResultState>(
                  builder: (context, state) {
                    return switch (state) {
                      RoundResultLoading() => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      RoundResultFailure(:final message) => Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(message),
                          ),
                        ),
                      RoundResultLoaded(:final result) ||
                      RoundResultAdvancing(:final result) =>
                        _LoadedBody(
                          gameId: gameId,
                          roundNumber: roundNumber,
                          result: result,
                          isAdvancing: state is RoundResultAdvancing,
                          readOnly: readOnly,
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
    required this.gameId,
    required this.roundNumber,
    required this.result,
    required this.isAdvancing,
    required this.readOnly,
  });

  final String gameId;
  final int roundNumber;
  final RoundResult result;
  final bool isAdvancing;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (roundNumber >= 2)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () {
                  context.go(
                    '/games/$gameId/rounds/${roundNumber - 1}/result?readOnly=true',
                  );
                },
                icon: const Icon(Icons.arrow_back, size: 16),
                label: const Text('Ver ronda anterior'),
              ),
            ),
          ),
        Expanded(
          child: RankingList(entries: result.entries),
        ),
        if (!readOnly)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: PrimaryButton(
              label: result.isLastRound
                  ? 'Ver resultado final'
                  : 'Siguiente ronda',
              isLoading: isAdvancing,
              onPressed: () {
                if (result.isLastRound) {
                  context.read<RoundResultBloc>().add(
                        const FinishGameRequested(),
                      );
                } else {
                  context.read<RoundResultBloc>().add(
                        const AdvanceToNextRoundRequested(),
                      );
                }
              },
            ),
          ),
      ],
    );
  }
}
