import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/round/domain/usecases/advance_to_next_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/finish_game_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_result_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_state.dart';

class RoundResultBloc extends Bloc<RoundResultEvent, RoundResultState> {
  RoundResultBloc({
    required this._getRoundResult,
    required this._advanceToNextRound,
    required this._finishGame,
  }) : super(const RoundResultInitial()) {
    on<RoundResultStarted>(_onStarted);
    on<AdvanceToNextRoundRequested>(_onAdvanceToNextRound);
    on<FinishGameRequested>(_onFinishGame);
  }

  final GetRoundResultUseCase _getRoundResult;
  final AdvanceToNextRoundUseCase _advanceToNextRound;
  final FinishGameUseCase _finishGame;

  Future<void> _onStarted(
    RoundResultStarted event,
    Emitter<RoundResultState> emit,
  ) async {
    emit(const RoundResultLoading());
    try {
      final result = await _getRoundResult(
        gameId: event.gameId,
        roundNumber: event.roundNumber,
      );
      emit(RoundResultLoaded(result: result));
    } catch (error) {
      emit(RoundResultFailure(message: error.toString()));
    }
  }

  Future<void> _onAdvanceToNextRound(
    AdvanceToNextRoundRequested event,
    Emitter<RoundResultState> emit,
  ) async {
    final current = state;
    if (current is! RoundResultLoaded || current.result.isLastRound) {
      return;
    }

    emit(RoundResultAdvancing(result: current.result));
    try {
      final nextRound = await _advanceToNextRound(
        gameId: current.result.game.id,
        closedRound: current.result.round,
      );
      emit(
        RoundResultNavigateToBids(
          gameId: current.result.game.id,
          roundNumber: nextRound.roundNumber,
        ),
      );
    } catch (error) {
      emit(RoundResultFailure(message: error.toString()));
    }
  }

  Future<void> _onFinishGame(
    FinishGameRequested event,
    Emitter<RoundResultState> emit,
  ) async {
    final current = state;
    if (current is! RoundResultLoaded || !current.result.isLastRound) {
      return;
    }

    emit(RoundResultAdvancing(result: current.result));
    try {
      await _finishGame(
        gameId: current.result.game.id,
        closedRound: current.result.round,
      );
      emit(RoundResultNavigateToFinal(gameId: current.result.game.id));
    } catch (error) {
      emit(RoundResultFailure(message: error.toString()));
    }
  }
}
