import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_state.dart';
import 'package:la_pocha/features/round/presentation/widgets/correct_bids_dialog.dart';
import 'package:la_pocha/features/round/presentation/widgets/player_play_card.dart';
import 'package:la_pocha/features/round/presentation/widgets/round_header.dart';
import 'package:la_pocha/features/round/presentation/widgets/tricks_balance_banner.dart';

class PlayPage extends StatelessWidget {
  const PlayPage({
    super.key,
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<PlayStateBloc>()
        ..add(PlayStateStarted(gameId: gameId, roundNumber: roundNumber)),
      child: _PlayView(gameId: gameId, roundNumber: roundNumber),
    );
  }
}

class _PlayView extends StatelessWidget {
  const _PlayView({required this.gameId, required this.roundNumber});

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return BlocListener<PlayStateBloc, PlayStateBlocState>(
      listener: (context, state) {
        if (state is PlayStateNavigateToTricks) {
          context.go(
            '/games/${state.gameId}/rounds/${state.roundNumber}/tricks',
          );
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              BlocBuilder<PlayStateBloc, PlayStateBlocState>(
                builder: (context, state) {
                  final cardsInRound = state is PlayStateLoaded
                      ? state.playState.round.cardsInRound
                      : null;
                  return RoundHeader(
                    gameId: gameId,
                    roundNumber: roundNumber,
                    cardsInRound: cardsInRound,
                    subtitle: 'En juego',
                    repeatRoundNumber: roundNumber,
                  );
                },
              ),
              Expanded(
                child: BlocBuilder<PlayStateBloc, PlayStateBlocState>(
                  builder: (context, state) {
                    return switch (state) {
                      PlayStateLoading() => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      PlayStateFailure(:final message) => Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(message),
                          ),
                        ),
                      PlayStateLoaded() => _LoadedBody(state: state),
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

  static const Color _warningColor = Color(0xFFD9772E);

  final PlayStateLoaded state;

  Future<void> _onCorrectBids(BuildContext context) async {
    final bloc = context.read<PlayStateBloc>();
    final playState = state.playState;
    final updatedBids = await showCorrectBidsDialog(
      context,
      players: playState.players,
      round: playState.round,
    );
    if (updatedBids != null) {
      bloc.add(BidsCorrectionSubmitted(updatedBids));
    }
  }

  @override
  Widget build(BuildContext context) {
    final playState = state.playState;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (playState.round.roundNumber >= 2)
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
          child: TricksBalanceBanner(
            bidSum: playState.bidSum,
            cardsInRound: playState.round.cardsInRound,
            restrictionMet: playState.restrictionMet,
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: playState.players.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final player = playState.players[index];
              return PlayerPlayCard(
                player: player,
                index: index,
                bid: playState.round.bids[player.id] ?? 0,
                isDealer: player.id == playState.round.dealerPlayerId,
              );
            },
          ),
        ),
        if (!playState.restrictionMet)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
            child: Text(
              'La suma de apuestas iguala ${playState.round.cardsInRound}. '
              'El repartidor debe corregir su apuesta antes de continuar.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: _warningColor,
                  ),
            ),
          ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
          child: TextButton(
            onPressed: () => _onCorrectBids(context),
            child: const Text('Corregir apuestas'),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: FilledButton(
            onPressed: playState.restrictionMet
                ? () => context.read<PlayStateBloc>().add(
                      const IntroduceTricksRequested(),
                    )
                : null,
            child: const Text('Introducir bazas reales'),
          ),
        ),
      ],
    );
  }
}
