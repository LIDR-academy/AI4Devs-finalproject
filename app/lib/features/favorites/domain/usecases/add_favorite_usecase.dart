import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/repositories/favorite_repository.dart';

class AddFavoriteUseCase {
  AddFavoriteUseCase(this._repository);

  final FavoriteRepository _repository;

  Future<FavoritePlayer> call({
    required String displayName,
    String? userId,
  }) {
    return _repository.addFavorite(displayName: displayName, userId: userId);
  }
}
