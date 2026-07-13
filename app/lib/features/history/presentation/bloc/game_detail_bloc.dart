import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_detail_usecase.dart';

part 'game_detail_event.dart';
part 'game_detail_state.dart';

class GameDetailBloc extends Bloc<GameDetailEvent, GameDetailState> {
  GameDetailBloc({required this._getGameDetail})
      : super(const GameDetailInitial()) {
    on<GameDetailStarted>(_onStarted);
  }

  final GetGameDetailUseCase _getGameDetail;

  Future<void> _onStarted(
    GameDetailStarted event,
    Emitter<GameDetailState> emit,
  ) async {
    emit(const GameDetailLoading());

    try {
      final detail = await _getGameDetail(
        gameId: event.gameId,
        source: event.source,
      );
      emit(GameDetailLoaded(detail: detail));
    } catch (error) {
      emit(GameDetailFailure(message: error.toString()));
    }
  }
}
