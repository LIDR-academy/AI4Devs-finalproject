part of 'favorites_bloc.dart';

sealed class FavoritesState extends Equatable {
  const FavoritesState();

  @override
  List<Object?> get props => [];
}

class FavoritesInitial extends FavoritesState {
  const FavoritesInitial();
}

class FavoritesLoading extends FavoritesState {
  const FavoritesLoading();
}

class FavoritesLoaded extends FavoritesState {
  const FavoritesLoaded({required this.favorites});

  final List<FavoritePlayer> favorites;

  @override
  List<Object?> get props => [favorites];
}

class FavoritesEmpty extends FavoritesState {
  const FavoritesEmpty();
}

class FavoritesFailure extends FavoritesState {
  const FavoritesFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}
