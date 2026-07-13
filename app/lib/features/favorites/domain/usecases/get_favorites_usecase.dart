import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/repositories/favorite_repository.dart';

class GetFavoritesUseCase {
  GetFavoritesUseCase(this._repository);

  final FavoriteRepository _repository;

  Future<List<FavoritePlayer>> call() => _repository.getFavorites();
}
