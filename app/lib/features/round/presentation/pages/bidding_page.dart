import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/game_overflow_menu.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_state.dart';
import 'package:la_pocha/features/round/presentation/widgets/bidding_player_row.dart';
import 'package:la_pocha/features/round/presentation/widgets/tricks_balance_indicator.dart';

class BiddingPage extends StatelessWidget {
  const BiddingPage({
    super.key,
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<BiddingBloc>()
        ..add(BiddingStarted(gameId: gameId, roundNumber: roundNumber)),
      child: _BiddingView(gameId: gameId, roundNumber: roundNumber),
    );
  }
}

class _BiddingView extends StatelessWidget {
  const _BiddingView({required this.gameId, required this.roundNumber});

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return BlocListener<BiddingBloc, BiddingState>(
      listener: (context, state) {
        if (state is BiddingNavigateToPlay) {
          context.go(
            '/games/${state.gameId}/rounds/${state.roundNumber}/play',
          );
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              BlocBuilder<BiddingBloc, BiddingState>(
                builder: (context, state) {
                  final cardsInRound =
                      state is BiddingLoaded ? state.round.cardsInRound : null;
                  return _Header(
                    gameId: gameId,
                    roundNumber: roundNumber,
                    cardsInRound: cardsInRound,
                  );
                },
              ),
              Expanded(
                child: BlocBuilder<BiddingBloc, BiddingState>(
                  builder: (context, state) {
                    return switch (state) {
                      BiddingLoading() => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      BiddingFailure(:final message) => Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(message),
                          ),
                        ),
                      BiddingLoaded() => _LoadedBody(state: state),
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

  final BiddingLoaded state;

  PlayerEmbed? _playerById(String playerId) {
    for (final player in state.game.players) {
      if (player.id == playerId) {
        return player;
      }
    }
    return null;
  }

  BiddingPlayerRowStatus _statusFor(String playerId) {
    if (state.round.bids.containsKey(playerId)) {
      return BiddingPlayerRowStatus.completed;
    }
    if (playerId == state.currentPlayerId) {
      return BiddingPlayerRowStatus.active;
    }
    return BiddingPlayerRowStatus.pending;
  }

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
          child: TricksBalanceIndicator(
            availableTricks: state.availableTricks,
            partialSum: state.partialSum,
          ),
        ),
        if (state.validationMessage != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Text(
              state.validationMessage!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFFD9772E),
                  ),
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: state.biddingOrder.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final playerId = state.biddingOrder[index];
              final player = _playerById(playerId);
              if (player == null) {
                return const SizedBox.shrink();
              }

              final rowStatus = _statusFor(playerId);
              return BiddingPlayerRow(
                player: player,
                index: index,
                status: rowStatus,
                bid: state.round.bids[playerId],
                isDealer: playerId == state.round.dealerPlayerId,
                draftBid: state.draftBid,
                cardsInRound: state.round.cardsInRound,
                forbiddenBid: rowStatus == BiddingPlayerRowStatus.active
                    ? state.forbiddenBid
                    : null,
                canConfirmBid: state.canConfirmBid,
                isSubmitting: state.isSubmitting,
                onBidChanged: rowStatus == BiddingPlayerRowStatus.active
                    ? (bid) => context.read<BiddingBloc>().add(
                          BidValueChanged(bid),
                        )
                    : null,
                onBidConfirmed: rowStatus == BiddingPlayerRowStatus.active
                    ? () => context.read<BiddingBloc>().add(
                          const BidConfirmed(),
                        )
                    : null,
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: FilledButton(
            onPressed: state.canClose && !state.isClosing
                ? () => context.read<BiddingBloc>().add(
                      const CloseBiddingRequested(),
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
                : const Text('Cerrar apuestas'),
          ),
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.gameId,
    required this.roundNumber,
    required this.cardsInRound,
  });

  final String gameId;
  final int roundNumber;
  final int? cardsInRound;

  @override
  Widget build(BuildContext context) {
    final title = cardsInRound == null
        ? 'Ronda $roundNumber'
        : 'Ronda $roundNumber · $cardsInRound cartas';

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
              onPressed: () => context.pop(),
              icon: const Icon(Icons.arrow_back, color: Colors.white),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Text(
                    'Apuestas',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                  ),
                ],
              ),
            ),
            GameOverflowMenu(
              gameId: gameId,
              repeatRoundNumber: roundNumber,
            ),
          ],
        ),
      ),
    );
  }
}
