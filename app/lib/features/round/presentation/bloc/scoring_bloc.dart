import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/round/domain/services/tricks_sum_validator.dart';
import 'package:la_pocha/features/round/domain/usecases/close_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_tricks_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_state.dart';

class ScoringBloc extends Bloc<ScoringEvent, ScoringState> {
  ScoringBloc({
    required GetRoundPlayStateUseCase getRoundPlayState,
    required SubmitTricksUseCase submitTricks,
    required CloseRoundUseCase closeRound,
    TricksSumValidator? validator,
  })  : _getRoundPlayState = getRoundPlayState,
        _submitTricks = submitTricks,
        _closeRound = closeRound,
        _validator = validator ?? const TricksSumValidator(),
        super(const ScoringInitial()) {
    on<ScoringStarted>(_onScoringStarted);
    on<TrickValueChanged>(_onTrickValueChanged);
    on<CloseRoundRequested>(_onCloseRoundRequested);
  }

  final GetRoundPlayStateUseCase _getRoundPlayState;
  final SubmitTricksUseCase _submitTricks;
  final CloseRoundUseCase _closeRound;
  final TricksSumValidator _validator;

  Future<void> _onScoringStarted(
    ScoringStarted event,
    Emitter<ScoringState> emit,
  ) async {
    emit(const ScoringLoading());
    try {
      final playState = await _getRoundPlayState(
        gameId: event.gameId,
        roundNumber: event.roundNumber,
      );
      final draftTricks = {
        for (final player in playState.players) player.id: 0,
      };
      emit(
        _buildLoadedState(
          game: playState.game,
          round: playState.round,
          players: playState.players,
          draftTricks: draftTricks,
        ),
      );
    } catch (error) {
      emit(ScoringFailure(message: error.toString()));
    }
  }

  void _onTrickValueChanged(
    TrickValueChanged event,
    Emitter<ScoringState> emit,
  ) {
    final current = state;
    if (current is! ScoringLoaded) {
      return;
    }

    final updatedTricks = Map<String, int>.from(current.draftTricks)
      ..[event.playerId] = event.value;

    emit(
      _buildLoadedState(
        game: current.game,
        round: current.round,
        players: current.players,
        draftTricks: updatedTricks,
      ),
    );
  }

  Future<void> _onCloseRoundRequested(
    CloseRoundRequested event,
    Emitter<ScoringState> emit,
  ) async {
    final current = state;
    if (current is! ScoringLoaded ||
        !current.canConfirm ||
        current.isClosing) {
      return;
    }

    emit(current.copyWith(isClosing: true, validationMessage: () => null));
    try {
      await _closeRound(
        gameId: current.game.id,
        round: current.round,
        players: current.players,
        tricks: current.draftTricks,
      );
      emit(
        ScoringNavigateToResult(
          gameId: current.game.id,
          roundNumber: current.round.roundNumber,
        ),
      );
    } catch (error) {
      emit(
        current.copyWith(
          isClosing: false,
          validationMessage: () => error.toString(),
        ),
      );
    }
  }

  ScoringLoaded _buildLoadedState({
    required Game game,
    required Round round,
    required List<PlayerEmbed> players,
    required Map<String, int> draftTricks,
  }) {
    final playerIds = players.map((player) => player.id).toList();
    final tricksSum = _validator.partialTricksSum(draftTricks);
    final canConfirm = _validator.canClose(
      cardsInRound: round.cardsInRound,
      tricks: draftTricks,
      playerIds: playerIds,
    );
    final scoresPreview = _submitTricks.previewScoresDelta(
      round: round,
      tricks: draftTricks,
      playerIds: playerIds,
    );

    String? validationMessage;
    if (!canConfirm && tricksSum > round.cardsInRound) {
      validationMessage =
          'La suma de bazas ($tricksSum) supera ${round.cardsInRound}';
    } else if (!canConfirm &&
        tricksSum == round.cardsInRound &&
        !_validator.areAllTricksInRange(
          cardsInRound: round.cardsInRound,
          tricks: draftTricks,
          playerIds: playerIds,
        )) {
      validationMessage = 'Alguna baza está fuera de rango';
    } else if (!canConfirm && tricksSum < round.cardsInRound) {
      validationMessage =
          'Faltan ${round.cardsInRound - tricksSum} bazas por repartir';
    }

    return ScoringLoaded(
      game: game,
      round: round,
      players: players,
      draftTricks: draftTricks,
      tricksSum: tricksSum,
      canConfirm: canConfirm,
      scoresPreview: scoresPreview,
      validationMessage: validationMessage,
    );
  }
}
