import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/delete_local_game_usecase.dart';
import 'package:la_pocha/features/history/domain/usecases/hide_cloud_game_usecase.dart';

part 'delete_game_from_history_state.dart';

class DeleteGameFromHistoryCubit extends Cubit<DeleteGameFromHistoryState> {
  DeleteGameFromHistoryCubit({
    required this._deleteLocalGame,
    required this._hideCloudGame,
  }) : super(const DeleteGameFromHistoryInitial());

  final DeleteLocalGameUseCase _deleteLocalGame;
  final HideCloudGameUseCase _hideCloudGame;

  Future<void> delete({
    required String gameId,
    required GameHistorySource source,
  }) async {
    emit(const DeleteGameFromHistoryInProgress());
    try {
      if (source == GameHistorySource.local) {
        await _deleteLocalGame(gameId: gameId);
      } else {
        await _hideCloudGame(gameId: gameId);
      }
      emit(DeleteGameFromHistorySuccess(gameId: gameId));
    } catch (error) {
      emit(DeleteGameFromHistoryFailure(message: error.toString()));
    }
  }
}
