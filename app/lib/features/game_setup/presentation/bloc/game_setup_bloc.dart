import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/randomize_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/reorder_players_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/set_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/start_game_usecase.dart';

part 'game_setup_event.dart';
part 'game_setup_state.dart';

class GameSetupBloc extends Bloc<GameSetupEvent, GameSetupState> {
  GameSetupBloc({
    required GetGameByIdUseCase getGameById,
    required ReorderPlayersUseCase reorderPlayers,
    required SetFirstDealerUseCase setFirstDealer,
    required RandomizeFirstDealerUseCase randomizeFirstDealer,
    required StartGameUseCase startGame,
  })  : _getGameById = getGameById,
        _reorderPlayers = reorderPlayers,
        _setFirstDealer = setFirstDealer,
        _randomizeFirstDealer = randomizeFirstDealer,
        _startGame = startGame,
        super(const GameSetupInitial()) {
    on<GameSetupStarted>(_onStarted);
    on<PlayersReordered>(_onPlayersReordered);
    on<FirstDealerSelected>(_onFirstDealerSelected);
    on<RandomDealerRequested>(_onRandomDealerRequested);
    on<StartGameRequested>(_onStartGameRequested);
  }

  final GetGameByIdUseCase _getGameById;
  final ReorderPlayersUseCase _reorderPlayers;
  final SetFirstDealerUseCase _setFirstDealer;
  final RandomizeFirstDealerUseCase _randomizeFirstDealer;
  final StartGameUseCase _startGame;

  List<PlayerEmbed> _normalizePlayers(List<PlayerEmbed> players) {
    final sorted = List<PlayerEmbed>.from(players)
      ..sort((a, b) => a.seatOrder.compareTo(b.seatOrder));
    return [
      for (var i = 0; i < sorted.length; i++)
        sorted[i].copyWith(seatOrder: i + 1),
    ];
  }

  Future<void> _onStarted(
    GameSetupStarted event,
    Emitter<GameSetupState> emit,
  ) async {
    emit(const GameSetupLoading());
    try {
      final game = await _getGameById(event.gameId);
      if (game == null) {
        emit(const GameSetupFailure(message: 'Partida no encontrada'));
        return;
      }

      final players = _normalizePlayers(game.players);
      final firstDealerPlayerId = players.first.id;

      emit(
        GameSetupLoaded(
          gameId: game.id,
          game: game,
          players: players,
          firstDealerPlayerId: firstDealerPlayerId,
          isStarting: false,
        ),
      );
    } catch (error) {
      emit(GameSetupFailure(message: error.toString()));
    }
  }

  void _onPlayersReordered(
    PlayersReordered event,
    Emitter<GameSetupState> emit,
  ) {
    final current = state;
    if (current is! GameSetupLoaded) {
      return;
    }

    try {
      final reordered = _reorderPlayers(
        players: current.players,
        oldIndex: event.oldIndex,
        newIndex: event.newIndex,
      );
      emit(current.copyWith(players: reordered));
    } catch (_) {
      // Ignore invalid reorder indices.
    }
  }

  void _onFirstDealerSelected(
    FirstDealerSelected event,
    Emitter<GameSetupState> emit,
  ) {
    final current = state;
    if (current is! GameSetupLoaded) {
      return;
    }

    try {
      final dealerId = _setFirstDealer(
        players: current.players,
        playerId: event.playerId,
      );
      emit(current.copyWith(firstDealerPlayerId: dealerId));
    } catch (_) {
      // Ignore invalid dealer selection.
    }
  }

  void _onRandomDealerRequested(
    RandomDealerRequested event,
    Emitter<GameSetupState> emit,
  ) {
    final current = state;
    if (current is! GameSetupLoaded || current.players.isEmpty) {
      return;
    }

    final dealerId = _randomizeFirstDealer(players: current.players);
    emit(current.copyWith(firstDealerPlayerId: dealerId));
  }

  Future<void> _onStartGameRequested(
    StartGameRequested event,
    Emitter<GameSetupState> emit,
  ) async {
    final current = state;
    if (current is! GameSetupLoaded || !current.isComplete) {
      return;
    }

    emit(current.copyWith(isStarting: true));
    try {
      final result = await _startGame(
        game: current.game,
        players: current.players,
        firstDealerPlayerId: current.firstDealerPlayerId,
      );
      emit(
        GameSetupNavigateToBids(
          gameId: result.gameId,
          roundId: result.roundId,
          roundNumber: result.roundNumber,
        ),
      );
    } catch (error) {
      emit(
        current.copyWith(isStarting: false),
      );
      emit(GameSetupFailure(message: error.toString()));
    }
  }
}
