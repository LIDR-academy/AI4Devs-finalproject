import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/usecases/add_favorite_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/get_favorites_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/remove_favorite_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_from_favorite_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';

part 'add_players_event.dart';
part 'add_players_state.dart';

class AddPlayersBloc extends Bloc<AddPlayersEvent, AddPlayersState> {
  AddPlayersBloc({
    required this._getGameById,
    required this._getFavorites,
    required this._addPlayer,
    required this._addPlayerFromFavorite,
    required this._removePlayer,
    required this._addFavorite,
    required this._removeFavorite,
  }) : super(const AddPlayersInitial()) {
    on<AddPlayersStarted>(_onStarted);
    on<FavoriteChipTapped>(_onFavoriteChipTapped);
    on<PlayerFavoriteToggled>(_onPlayerFavoriteToggled);
    on<PlayerRemoved>(_onPlayerRemoved);
    on<EditSlotActivated>(_onEditSlotActivated);
    on<EditSlotCancelled>(_onEditSlotCancelled);
    on<PlayerNameConfirmed>(_onPlayerNameConfirmed);
  }

  final GetGameByIdUseCase _getGameById;
  final GetFavoritesUseCase _getFavorites;
  final AddPlayerUseCase _addPlayer;
  final AddPlayerFromFavoriteUseCase _addPlayerFromFavorite;
  final RemovePlayerUseCase _removePlayer;
  final AddFavoriteUseCase _addFavorite;
  final RemoveFavoriteUseCase _removeFavorite;

  Future<void> _onStarted(
    AddPlayersStarted event,
    Emitter<AddPlayersState> emit,
  ) async {
    emit(const AddPlayersLoading());
    try {
      final gameFuture = _getGameById(event.gameId);
      final favoritesFuture = _getFavorites();
      final game = await gameFuture;
      if (game == null) {
        emit(AddPlayersFailure(message: 'Partida no encontrada'));
        return;
      }
      final favorites = await favoritesFuture;
      emit(
        AddPlayersLoaded(
          gameId: game.id,
          playerCount: game.playerCount,
          players: game.players,
          favorites: favorites,
          activeEditIndex: null,
          isLoading: false,
        ),
      );
    } catch (error) {
      emit(AddPlayersFailure(message: error.toString()));
    }
  }

  Future<void> _onFavoriteChipTapped(
    FavoriteChipTapped event,
    Emitter<AddPlayersState> emit,
  ) async {
    final current = state;
    if (current is! AddPlayersLoaded) {
      return;
    }

    emit(
      current.copyWith(
        isLoading: true,
        errorMessage: null,
        clearActiveEditIndex: true,
      ),
    );
    try {
      final game = await _addPlayerFromFavorite(
        gameId: current.gameId,
        favoriteId: event.favorite.id,
      );
      emit(
        current.copyWith(
          players: game.players,
          isLoading: false,
          errorMessage: null,
        ),
      );
    } catch (error) {
      emit(current.copyWith(isLoading: false, errorMessage: error.toString()));
    }
  }

  Future<void> _onPlayerFavoriteToggled(
    PlayerFavoriteToggled event,
    Emitter<AddPlayersState> emit,
  ) async {
    final current = state;
    if (current is! AddPlayersLoaded) {
      return;
    }

    PlayerEmbed? player;
    for (final item in current.players) {
      if (item.id == event.playerId) {
        player = item;
        break;
      }
    }
    if (player == null) {
      return;
    }

    final existingFavorite = _findFavoriteForPlayer(
      player: player,
      favorites: current.favorites,
    );

    emit(current.copyWith(isLoading: true, errorMessage: null));
    try {
      final updatedFavorites = [...current.favorites];
      if (existingFavorite == null) {
        final createdFavorite = await _addFavorite(
          displayName: player.displayName,
          userId: player.userId,
        );
        updatedFavorites.add(createdFavorite);
      } else {
        await _removeFavorite(existingFavorite.id);
        updatedFavorites.removeWhere((item) => item.id == existingFavorite.id);
      }
      emit(
        current.copyWith(
          favorites: updatedFavorites,
          isLoading: false,
          errorMessage: null,
        ),
      );
    } catch (error) {
      emit(current.copyWith(isLoading: false, errorMessage: error.toString()));
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

    emit(
      current.copyWith(
        isLoading: true,
        errorMessage: null,
        clearActiveEditIndex: true,
      ),
    );
    try {
      final game = await _removePlayer(
        gameId: current.gameId,
        playerId: event.playerId,
      );
      if (game == null) {
        emit(current.copyWith(isLoading: false));
        return;
      }
      emit(
        current.copyWith(
          players: game.players,
          isLoading: false,
          errorMessage: null,
        ),
      );
    } catch (error) {
      emit(current.copyWith(isLoading: false, errorMessage: error.toString()));
    }
  }

  void _onEditSlotActivated(
    EditSlotActivated event,
    Emitter<AddPlayersState> emit,
  ) {
    final current = state;
    if (current is! AddPlayersLoaded) {
      return;
    }
    if (event.index < 0 || event.index >= current.playerCount) {
      return;
    }
    if (event.index < current.players.length) {
      return;
    }
    emit(
      current.copyWith(
        activeEditIndex: event.index,
        clearError: true,
      ),
    );
  }

  void _onEditSlotCancelled(
    EditSlotCancelled event,
    Emitter<AddPlayersState> emit,
  ) {
    final current = state;
    if (current is! AddPlayersLoaded || current.activeEditIndex == null) {
      return;
    }
    emit(
      current.copyWith(
        clearActiveEditIndex: true,
        clearError: true,
      ),
    );
  }

  Future<void> _onPlayerNameConfirmed(
    PlayerNameConfirmed event,
    Emitter<AddPlayersState> emit,
  ) async {
    final current = state;
    if (current is! AddPlayersLoaded) {
      return;
    }
    if (event.index != current.activeEditIndex) {
      return;
    }
    final trimmedName = event.name.trim();
    if (trimmedName.isEmpty) {
      emit(current.copyWith(errorMessage: 'El nombre no puede estar vacío'));
      return;
    }

    emit(current.copyWith(isLoading: true, errorMessage: null));
    try {
      final game = await _addPlayer(gameId: current.gameId, name: trimmedName);
      emit(
        current.copyWith(
          players: game.players,
          isLoading: false,
          clearActiveEditIndex: true,
          errorMessage: null,
        ),
      );
    } catch (error) {
      emit(current.copyWith(isLoading: false, errorMessage: error.toString()));
    }
  }

  FavoritePlayer? _findFavoriteForPlayer({
    required PlayerEmbed player,
    required List<FavoritePlayer> favorites,
  }) {
    for (final favorite in favorites) {
      if (player.userId != null && favorite.userId == player.userId) {
        return favorite;
      }
      if (player.userId == null &&
          favorite.userId == null &&
          favorite.displayName.toLowerCase() == player.displayName.toLowerCase()) {
        return favorite;
      }
    }
    return null;
  }
}
