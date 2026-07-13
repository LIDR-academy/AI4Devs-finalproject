import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_history_usecase.dart';
import 'package:la_pocha/features/sync/domain/usecases/retry_pending_uploads_usecase.dart';

part 'history_list_event.dart';
part 'history_list_state.dart';

class HistoryListBloc extends Bloc<HistoryListEvent, HistoryListState> {
  HistoryListBloc({
    required this._getGameHistory,
    required this._retryPendingUploads,
  }) : super(const HistoryListInitial()) {
    on<HistoryListStarted>(_onStarted);
    on<HistoryListRefreshed>(_onRefreshed);
    on<HistoryListGameDeleted>(_onGameDeleted);
  }

  final GetGameHistoryUseCase _getGameHistory;
  final RetryPendingUploadsUseCase _retryPendingUploads;

  Future<void> _onStarted(
    HistoryListStarted event,
    Emitter<HistoryListState> emit,
  ) async {
    await _loadHistory(emit);
  }

  Future<void> _onRefreshed(
    HistoryListRefreshed event,
    Emitter<HistoryListState> emit,
  ) async {
    // Retry pending uploads when auth and upload are available.
    await _loadHistory(emit, showLoading: false);
  }

  void _onGameDeleted(
    HistoryListGameDeleted event,
    Emitter<HistoryListState> emit,
  ) {
    final current = state;
    if (current is! HistoryListLoaded) {
      return;
    }

    final updatedItems = current.items
        .where(
          (item) =>
              item.id != event.gameId && item.cloudGameId != event.gameId,
        )
        .toList();

    if (updatedItems.isEmpty) {
      emit(const HistoryListEmpty());
      return;
    }

    emit(HistoryListLoaded(items: updatedItems));
  }

  Future<void> _loadHistory(
    Emitter<HistoryListState> emit, {
    bool showLoading = true,
  }) async {
    if (showLoading) {
      emit(const HistoryListLoading());
    }

    try {
      await _retryPendingUploads();
      final items = await _getGameHistory();
      if (items.isEmpty) {
        emit(const HistoryListEmpty());
        return;
      }
      emit(HistoryListLoaded(items: items));
    } catch (error) {
      emit(HistoryListFailure(message: error.toString()));
    }
  }
}
