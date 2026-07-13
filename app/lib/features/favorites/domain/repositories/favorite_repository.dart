import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';

abstract class FavoriteRepository {
  Future<List<FavoritePlayer>> getFavorites();

  Future<FavoritePlayer> addFavorite({
    required String displayName,
    String? userId,
  });

  Future<void> removeFavorite(String id);
}
