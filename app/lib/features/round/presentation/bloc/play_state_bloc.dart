import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_state.dart';

class PlayStateBloc extends Bloc<PlayStateEvent, PlayStateBlocState> {
  PlayStateBloc({
    required GetRoundPlayStateUseCase getRoundPlayState,
  })  : _getRoundPlayState = getRoundPlayState,
        super(const PlayStateInitial()) {
    on<PlayStateStarted>(_onPlayStateStarted);
    on<IntroduceTricksRequested>(_onIntroduceTricksRequested);
  }

  final GetRoundPlayStateUseCase _getRoundPlayState;

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
}
