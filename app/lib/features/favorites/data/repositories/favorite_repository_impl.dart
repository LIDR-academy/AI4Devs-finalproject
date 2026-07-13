import 'package:la_pocha/features/favorites/data/datasources/favorite_local_datasource.dart';
import 'package:la_pocha/features/favorites/data/models/favorite_player_model.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/repositories/favorite_repository.dart';
import 'package:uuid/uuid.dart';

class FavoriteRepositoryImpl implements FavoriteRepository {
  FavoriteRepositoryImpl(this._datasource, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final FavoriteLocalDatasource _datasource;
  final Uuid _uuid;

  @override
  Future<List<FavoritePlayer>> getFavorites() async {
    final models = await _datasource.getAll();
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<FavoritePlayer> addFavorite({
    required String displayName,
    String? userId,
  }) async {
    final trimmedName = displayName.trim();
    if (trimmedName.isEmpty) {
      throw ArgumentError.value(displayName, 'displayName', 'Must not be empty');
    }

    final existing = await _datasource.getAll();

    if (userId != null) {
      final duplicateUser = existing.any((favorite) => favorite.userId == userId);
      if (duplicateUser) {
        throw ArgumentError.value(
          userId,
          'userId',
          'Favorite with this user already exists',
        );
      }
    }

    final duplicateName = existing.any(
      (favorite) =>
          favorite.displayName.toLowerCase() == trimmedName.toLowerCase(),
    );
    if (duplicateName) {
      throw ArgumentError.value(
        displayName,
        'displayName',
        'Favorite with this display name already exists',
      );
    }

    final model = FavoritePlayerModel(
      id: _uuid.v4(),
      displayName: trimmedName,
      userId: userId,
      createdAt: DateTime.now(),
    );

    await _datasource.insert(model);
    return model.toEntity();
  }

  @override
  Future<void> removeFavorite(String id) async {
    await _datasource.deleteById(id);
  }
}
