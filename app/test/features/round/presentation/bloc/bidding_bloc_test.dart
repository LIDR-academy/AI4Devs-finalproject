import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/entities/bidding_context.dart';
import 'package:la_pocha/features/round/domain/entities/submit_bid_result.dart';
import 'package:la_pocha/features/round/domain/usecases/close_bidding_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/load_bidding_context_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_bid_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_state.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'bidding_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<LoadBiddingContextUseCase>(),
  MockSpec<SubmitBidUseCase>(),
  MockSpec<CloseBiddingUseCase>(),
])
void main() {
  late MockLoadBiddingContextUseCase loadBiddingContext;
  late MockSubmitBidUseCase submitBid;
  late MockCloseBiddingUseCase closeBidding;

  const biddingOrder = ['p1', 'p2', 'p3', 'p0'];

  final players = [
    PlayerEmbed(
      id: 'p0',
      displayName: 'Dealer',
      isGuest: true,
      userId: null,
      seatOrder: 0,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p3',
      displayName: 'Carla',
      isGuest: true,
      userId: null,
      seatOrder: 3,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
  ];

  final game = Game(
    id: 'game-1',
    status: GameStatus.inProgress,
    playerCount: 4,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [
      RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
    ],
    players: players,
    currentRoundNumber: 1,
    startedAt: DateTime(2026),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  Round round({Map<String, int> bids = const {}}) {
    return Round(
      id: 'round-1',
      gameId: 'game-1',
      roundNumber: 1,
      cardsInRound: 4,
      dealerPlayerId: 'p0',
      status: RoundStatus.bidding,
      bids: bids,
      createdAt: DateTime(2026),
    );
  }

  BiddingBloc buildBloc() => BiddingBloc(
        loadBiddingContext: loadBiddingContext,
        submitBid: submitBid,
        closeBidding: closeBidding,
      );

  setUp(() {
    loadBiddingContext = MockLoadBiddingContextUseCase();
    submitBid = MockSubmitBidUseCase();
    closeBidding = MockCloseBiddingUseCase();
  });

  blocTest<BiddingBloc, BiddingState>(
    'loads bidding context with indicators',
    build: buildBloc,
    setUp: () {
      when(
        loadBiddingContext(gameId: 'game-1', roundNumber: 1),
      ).thenAnswer(
        (_) async => BiddingContext(
          game: game,
          round: round(),
          biddingOrder: biddingOrder,
          currentPlayerId: 'p1',
        ),
      );
    },
    act: (bloc) => bloc.add(
      const BiddingStarted(gameId: 'game-1', roundNumber: 1),
    ),
    expect: () => [
      const BiddingLoading(),
      isA<BiddingLoaded>()
          .having((s) => s.currentPlayerId, 'currentPlayerId', 'p1')
          .having((s) => s.availableTricks, 'availableTricks', 4)
          .having((s) => s.canClose, 'canClose', false),
    ],
  );

  blocTest<BiddingBloc, BiddingState>(
    'updates draft bid and recalculates indicators',
    build: buildBloc,
    seed: () => BiddingLoaded(
      game: game,
      round: round(bids: const {'p1': 1}),
      biddingOrder: biddingOrder,
      currentPlayerId: 'p2',
      draftBid: 0,
      partialSum: 1,
      availableTricks: 3,
      canConfirmBid: true,
      canClose: false,
    ),
    act: (bloc) => bloc.add(const BidValueChanged(2)),
    expect: () => [
      isA<BiddingLoaded>()
          .having((s) => s.draftBid, 'draftBid', 2)
          .having((s) => s.canConfirmBid, 'canConfirmBid', true),
    ],
  );

  blocTest<BiddingBloc, BiddingState>(
    'blocks dealer forbidden bid confirmation',
    build: buildBloc,
    seed: () => BiddingLoaded(
      game: game,
      round: round(bids: const {'p1': 1, 'p2': 1, 'p3': 1}),
      biddingOrder: biddingOrder,
      currentPlayerId: 'p0',
      draftBid: 1,
      partialSum: 3,
      availableTricks: 1,
      forbiddenBid: 1,
      canConfirmBid: false,
      canClose: false,
      validationMessage:
          'El repartidor no puede apostar 1 porque la suma igualaría 4 bazas',
    ),
    act: (bloc) => bloc.add(const BidConfirmed()),
    expect: () => [],
  );

  blocTest<BiddingBloc, BiddingState>(
    'confirms bid and advances turn',
    build: buildBloc,
    seed: () => BiddingLoaded(
      game: game,
      round: round(),
      biddingOrder: biddingOrder,
      currentPlayerId: 'p1',
      draftBid: 2,
      partialSum: 0,
      availableTricks: 4,
      canConfirmBid: true,
      canClose: false,
    ),
    setUp: () {
      when(
        submitBid(
          round: anyNamed('round'),
          biddingOrder: anyNamed('biddingOrder'),
          currentPlayerId: anyNamed('currentPlayerId'),
          bid: anyNamed('bid'),
        ),
      ).thenAnswer(
        (_) async => SubmitBidResult(
          round: round(bids: const {'p1': 2}),
          biddingOrder: biddingOrder,
          currentPlayerId: 'p2',
        ),
      );
    },
    act: (bloc) => bloc.add(const BidConfirmed()),
    expect: () => [
      isA<BiddingLoaded>().having((s) => s.isSubmitting, 'isSubmitting', true),
      isA<BiddingLoaded>()
          .having((s) => s.currentPlayerId, 'currentPlayerId', 'p2')
          .having((s) => s.availableTricks, 'availableTricks', 2),
    ],
  );

  blocTest<BiddingBloc, BiddingState>(
    'closes bidding and navigates to play',
    build: buildBloc,
    seed: () => BiddingLoaded(
      game: game,
      round: round(bids: const {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 0}),
      biddingOrder: biddingOrder,
      currentPlayerId: null,
      draftBid: 0,
      partialSum: 3,
      availableTricks: 1,
      canConfirmBid: false,
      canClose: true,
    ),
    setUp: () {
      when(
        closeBidding(
          round: anyNamed('round'),
          playerIds: anyNamed('playerIds'),
        ),
      ).thenAnswer(
        (_) async => round(bids: const {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 0})
            .copyWith(status: RoundStatus.playing),
      );
    },
    act: (bloc) => bloc.add(const CloseBiddingRequested()),
    expect: () => [
      isA<BiddingLoaded>().having((s) => s.isClosing, 'isClosing', true),
      isA<BiddingNavigateToPlay>()
          .having((s) => s.gameId, 'gameId', 'game-1')
          .having((s) => s.roundNumber, 'roundNumber', 1),
    ],
  );
}
