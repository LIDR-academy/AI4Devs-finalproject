import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/round/domain/usecases/correct_bids_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_state.dart';

class PlayStateBloc extends Bloc<PlayStateEvent, PlayStateBlocState> {
  PlayStateBloc({required this._getRoundPlayState, required this._correctBids})
    : super(const PlayStateInitial()) {
    on<PlayStateStarted>(_onPlayStateStarted);
    on<IntroduceTricksRequested>(_onIntroduceTricksRequested);
    on<BidsCorrectionSubmitted>(_onBidsCorrectionSubmitted);
  }

  final GetRoundPlayStateUseCase _getRoundPlayState;
  final CorrectBidsUseCase _correctBids;

  Future<void> _onPlayStateStarted(
    PlayStateStarted event,
    Emitter<PlayStateBlocState> emit,
  ) async {
    emit(const PlayStateLoading());
    try {
      final playState = await _getRoundPlayState(
        gameId: event.gameId,
        roundNumber: event.roundNumber,
      );
      emit(PlayStateLoaded(playState: playState));
    } catch (error) {
      emit(PlayStateFailure(message: error.toString()));
    }
  }

  void _onIntroduceTricksRequested(
    IntroduceTricksRequested event,
    Emitter<PlayStateBlocState> emit,
  ) {
    final current = state;
    if (current is! PlayStateLoaded) {
      return;
    }

    emit(
      PlayStateNavigateToTricks(
        gameId: current.playState.game.id,
        roundNumber: current.playState.round.roundNumber,
      ),
    );
  }

  Future<void> _onBidsCorrectionSubmitted(
    BidsCorrectionSubmitted event,
    Emitter<PlayStateBlocState> emit,
  ) async {
    final current = state;
    if (current is! PlayStateLoaded) {
      return;
    }

    final playState = current.playState;
    try {
      await _correctBids(
        round: playState.round,
        updatedBids: event.updatedBids,
        playerIds: playState.players.map((player) => player.id).toList(),
      );

      final refreshed = await _getRoundPlayState(
        gameId: playState.game.id,
        roundNumber: playState.round.roundNumber,
      );
      emit(PlayStateLoaded(playState: refreshed));
    } catch (error) {
      emit(PlayStateFailure(message: error.toString()));
    }
  }
}
