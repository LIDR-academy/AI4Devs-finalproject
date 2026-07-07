import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/cancel_game_usecase.dart';

part 'cancel_game_state.dart';

class CancelGameCubit extends Cubit<CancelGameState> {
  CancelGameCubit({required CancelGameUseCase cancelGame})
      : _cancelGame = cancelGame,
        super(const CancelGameInitial());

  final CancelGameUseCase _cancelGame;

  Future<void> cancel(String gameId) async {
    emit(const CancelGameInProgress());
    try {
      await _cancelGame(gameId: gameId);
      emit(const CancelGameSuccess());
    } catch (error) {
      emit(CancelGameFailure(message: error.toString()));
    }
  }
}
