import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/usecases/add_favorite_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/get_favorites_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/remove_favorite_usecase.dart';

part 'favorites_event.dart';
part 'favorites_state.dart';

class FavoritesBloc extends Bloc<FavoritesEvent, FavoritesState> {
  FavoritesBloc({
    required this._getFavorites,
    required this._addFavorite,
    required this._removeFavorite,
  }) : super(const FavoritesInitial()) {
    on<FavoritesStarted>(_onStarted);
    on<FavoriteAdded>(_onFavoriteAdded);
    on<FavoriteRemoved>(_onFavoriteRemoved);
    on<FavoritesRefreshed>(_onRefreshed);
  }

  final GetFavoritesUseCase _getFavorites;
  final AddFavoriteUseCase _addFavorite;
  final RemoveFavoriteUseCase _removeFavorite;

  Future<void> _onStarted(
    FavoritesStarted event,
    Emitter<FavoritesState> emit,
  ) async {
    await _loadFavorites(emit);
  }

  Future<void> _onRefreshed(
    FavoritesRefreshed event,
    Emitter<FavoritesState> emit,
  ) async {
    await _loadFavorites(emit, showLoading: false);
  }

  Future<void> _onFavoriteAdded(
    FavoriteAdded event,
    Emitter<FavoritesState> emit,
  ) async {
    final current = state;
    if (current is! FavoritesLoaded && current is! FavoritesEmpty) {
      return;
    }

    try {
      final favorite = await _addFavorite(
        displayName: event.displayName,
        userId: event.userId,
      );

      if (current is FavoritesEmpty) {
        emit(FavoritesLoaded(favorites: [favorite]));
        return;
      }

      if (current is FavoritesLoaded) {
        emit(
          FavoritesLoaded(
            favorites: [...current.favorites, favorite],
          ),
        );
      }
    } catch (error) {
      emit(FavoritesFailure(message: error.toString()));
      if (current is FavoritesLoaded) {
        emit(FavoritesLoaded(favorites: current.favorites));
      } else if (current is FavoritesEmpty) {
        emit(const FavoritesEmpty());
      }
    }
  }

  void _onFavoriteRemoved(
    FavoriteRemoved event,
    Emitter<FavoritesState> emit,
  ) {
    final current = state;
    if (current is! FavoritesLoaded) {
      return;
    }

    final updated = current.favorites
        .where((favorite) => favorite.id != event.favoriteId)
        .toList();

    if (updated.isEmpty) {
      emit(const FavoritesEmpty());
      return;
    }

    emit(FavoritesLoaded(favorites: updated));
    _removeFavorite(event.favoriteId);
  }

  Future<void> _loadFavorites(
    Emitter<FavoritesState> emit, {
    bool showLoading = true,
  }) async {
    if (showLoading) {
      emit(const FavoritesLoading());
    }

    try {
      final favorites = await _getFavorites();
      if (favorites.isEmpty) {
        emit(const FavoritesEmpty());
        return;
      }
      emit(FavoritesLoaded(favorites: favorites));
    } catch (error) {
      emit(FavoritesFailure(message: error.toString()));
    }
  }
}
