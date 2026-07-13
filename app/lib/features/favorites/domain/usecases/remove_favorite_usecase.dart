import 'package:la_pocha/features/favorites/domain/repositories/favorite_repository.dart';

class RemoveFavoriteUseCase {
  RemoveFavoriteUseCase(this._repository);

  final FavoriteRepository _repository;

  Future<void> call(String id) => _repository.removeFavorite(id);
}
