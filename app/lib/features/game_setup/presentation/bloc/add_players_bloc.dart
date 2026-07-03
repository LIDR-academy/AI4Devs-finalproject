import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';

part 'add_players_event.dart';
part 'add_players_state.dart';

class AddPlayersBloc extends Bloc<AddPlayersEvent, AddPlayersState> {
  AddPlayersBloc({
    required GetGameByIdUseCase getGameById,
    required AddPlayerUseCase addPlayer,
    required RemovePlayerUseCase removePlayer,
  })  : _getGameById = getGameById,
        _addPlayer = addPlayer,
        _removePlayer = removePlayer,
        super(const AddPlayersInitial()) {
    on<AddPlayersStarted>(_onStarted);
    on<PlayerAdded>(_onPlayerAdded);
    on<PlayerRemoved>(_onPlayerRemoved);
    on<ContinueRequested>(_onContinueRequested);
  }

  final GetGameByIdUseCase _getGameById;
  final AddPlayerUseCase _addPlayer;
  final RemovePlayerUseCase _removePlayer;

  Future<void> _onStarted(
    AddPlayersStarted event,
    Emitter<AddPlayersState> emit,
  ) async {
    emit(const AddPlayersLoading());
    try {
      final game = await _getGameById(event.gameId);
      if (game == null) {
        emit(AddPlayersFailure(message: 'Partida no encontrada'));
        return;
      }
      emit(AddPlayersLoaded(
        gameId: game.id,
        playerCount: game.playerCount,
        players: game.players,
        isLoading: false,
      ));
    } catch (error) {
      emit(AddPlayersFailure(message: error.toString()));
    }
  }

  Future<void> _onPlayerAdded(
    PlayerAdded event,
    Emitter<AddPlayersState> emit,
  ) async {
    final current = state;
    if (current is! AddPlayersLoaded) {
      return;
    }

    if (event.type != PlayerAddType.guest) {
      return;
    }

    emit(current.copyWith(isLoading: true, errorMessage: null));
    try {
      final game = await _addPlayer(
        gameId: current.gameId,
        name: event.name,
      );
      emit(current.copyWith(
        players: game.players,
        isLoading: false,
        errorMessage: null,
      ));
    } catch (error) {
      emit(current.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _onPlayerRemoved(
    PlayerRemoved event,
    Emitter<AddPlayersState> emit,
  ) async {
    final current = state;
    if (current is! AddPlayersLoaded) {
      return;
    }

    emit(current.copyWith(isLoading: true, errorMessage: null));
    try {
      final game = await _removePlayer(
        gameId: current.gameId,
        playerId: event.playerId,
      );
      if (game == null) {
        emit(current.copyWith(isLoading: false));
        return;
      }
      emit(current.copyWith(
        players: game.players,
        isLoading: false,
        errorMessage: null,
      ));
    } catch (error) {
      emit(current.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      ));
    }
  }

  void _onContinueRequested(
    ContinueRequested event,
    Emitter<AddPlayersState> emit,
  ) {
    final current = state;
    if (current is! AddPlayersLoaded || !current.isComplete) {
      return;
    }
    emit(AddPlayersNavigateToSetup(gameId: current.gameId));
  }
}
