import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/value_objects/game_deck_config.dart';

part 'create_game_event.dart';
part 'create_game_state.dart';

class CreateGameBloc extends Bloc<CreateGameEvent, CreateGameState> {
  CreateGameBloc({required this._createGameDraft})
      : super(const CreateGameInitial()) {
    on<PlayerCountChanged>(_onPlayerCountChanged);
    on<CreateGameConfirmed>(_onCreateGameConfirmed);
  }

  final CreateGameDraftUseCase _createGameDraft;

  void _onPlayerCountChanged(
    PlayerCountChanged event,
    Emitter<CreateGameState> emit,
  ) {
    emit(_buildPreview(event.playerCount));
  }

  Future<void> _onCreateGameConfirmed(
    CreateGameConfirmed event,
    Emitter<CreateGameState> emit,
  ) async {
    final currentPreview = state is CreateGamePreview
        ? state as CreateGamePreview
        : _buildPreview(4);

    emit(CreateGameSubmitting(
      playerCount: currentPreview.playerCount,
      totalCards: currentPreview.totalCards,
      maxCardsPerRound: currentPreview.maxCardsPerRound,
      totalRounds: currentPreview.totalRounds,
    ));

    try {
      final game = await _createGameDraft(playerCount: currentPreview.playerCount);
      emit(CreateGameSuccess(gameId: game.id));
    } catch (error) {
      emit(CreateGameFailure(
        message: error.toString(),
        playerCount: currentPreview.playerCount,
        totalCards: currentPreview.totalCards,
        maxCardsPerRound: currentPreview.maxCardsPerRound,
        totalRounds: currentPreview.totalRounds,
      ));
    }
  }

  CreateGamePreview _buildPreview(int playerCount) {
    final config = GameDeckConfig.fromPlayerCount(playerCount);
    return CreateGamePreview(
      playerCount: playerCount,
      totalCards: config.totalCards,
      maxCardsPerRound: config.maxCardsPerRound,
      totalRounds: config.totalRounds,
    );
  }
}
