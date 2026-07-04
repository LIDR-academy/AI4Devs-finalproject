import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_history_usecase.dart';
import 'package:la_pocha/features/history/presentation/bloc/history_list_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'history_list_bloc_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GetGameHistoryUseCase>()])
void main() {
  late MockGetGameHistoryUseCase getGameHistory;

  final items = [
    GameHistoryItem(
      id: 'game-1',
      source: GameHistorySource.local,
      finishedAt: DateTime(2026, 7, 4),
      playerCount: 4,
      displayLabel: '4 jul 2026, 22:00 — Ana, Carlos',
      winnerName: 'Ana',
      winnerScore: 42,
    ),
  ];

  setUp(() {
    getGameHistory = MockGetGameHistoryUseCase();
  });

  HistoryListBloc buildBloc() => HistoryListBloc(getGameHistory: getGameHistory);

  blocTest<HistoryListBloc, HistoryListState>(
    'emits loaded when history has items',
    build: buildBloc,
    setUp: () {
      when(getGameHistory()).thenAnswer((_) async => items);
    },
    act: (bloc) => bloc.add(const HistoryListStarted()),
    expect: () => [
      const HistoryListLoading(),
      HistoryListLoaded(items: items),
    ],
  );

  blocTest<HistoryListBloc, HistoryListState>(
    'emits empty when history has no items',
    build: buildBloc,
    setUp: () {
      when(getGameHistory()).thenAnswer((_) async => []);
    },
    act: (bloc) => bloc.add(const HistoryListStarted()),
    expect: () => [
      const HistoryListLoading(),
      const HistoryListEmpty(),
    ],
  );

  blocTest<HistoryListBloc, HistoryListState>(
    'reloads items on refresh without loading state',
    build: buildBloc,
    setUp: () {
      when(getGameHistory()).thenAnswer((_) async => items);
    },
    seed: () => HistoryListLoaded(items: items),
    act: (bloc) => bloc.add(const HistoryListRefreshed()),
    expect: () => [],
    verify: (_) {
      verify(getGameHistory()).called(1);
    },
  );

  blocTest<HistoryListBloc, HistoryListState>(
    'emits failure when use case throws',
    build: buildBloc,
    setUp: () {
      when(getGameHistory()).thenThrow(Exception('network error'));
    },
    act: (bloc) => bloc.add(const HistoryListStarted()),
    expect: () => [
      const HistoryListLoading(),
      isA<HistoryListFailure>(),
    ],
  );
}
