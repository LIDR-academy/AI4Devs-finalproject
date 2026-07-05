import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/sync/domain/usecases/upload_finished_game_usecase.dart';

part 'game_sync_event.dart';
part 'game_sync_state.dart';

class GameSyncBloc extends Bloc<GameSyncEvent, GameSyncState> {
  GameSyncBloc({required UploadFinishedGameUseCase uploadFinishedGame})
      : _uploadFinishedGame = uploadFinishedGame,
        super(const GameSyncIdle()) {
    on<GameUploadRequested>(_onUploadRequested);
  }

  final UploadFinishedGameUseCase _uploadFinishedGame;

  Future<void> _onUploadRequested(
    GameUploadRequested event,
    Emitter<GameSyncState> emit,
  ) async {
    final outcome = await _uploadFinishedGame(gameId: event.gameId);

    switch (outcome) {
      case UploadFinishedGameOutcome.synced:
        emit(GameSyncSuccess(gameId: event.gameId));
      case UploadFinishedGameOutcome.pending:
      case UploadFinishedGameOutcome.failed:
        emit(GameSyncFailure(gameId: event.gameId, outcome: outcome));
      case UploadFinishedGameOutcome.skippedNoSession:
      case UploadFinishedGameOutcome.skippedAlreadySynced:
        emit(const GameSyncIdle());
    }
  }
}
