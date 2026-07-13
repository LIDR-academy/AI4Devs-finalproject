import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';

class FavoritePlayerModel {
  FavoritePlayerModel({
    required this.id,
    required this.displayName,
    required this.userId,
    required this.createdAt,
  });

  final String id;
  final String displayName;
  final String? userId;
  final DateTime createdAt;

  factory FavoritePlayerModel.fromEntry(FavoriteEntry entry) {
    return FavoritePlayerModel(
      id: entry.id,
      displayName: entry.displayName,
      userId: entry.userId,
      createdAt: entry.createdAt,
    );
  }

  FavoritePlayer toEntity() {
    return FavoritePlayer(
      id: id,
      displayName: displayName,
      userId: userId,
      createdAt: createdAt,
    );
  }

  FavoritesCompanion toCompanion() {
    return FavoritesCompanion.insert(
      id: id,
      displayName: displayName,
      userId: Value(userId),
      createdAt: createdAt,
    );
  }
}
