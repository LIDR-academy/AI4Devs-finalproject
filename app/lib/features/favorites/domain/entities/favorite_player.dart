import 'package:equatable/equatable.dart';

class FavoritePlayer extends Equatable {
  const FavoritePlayer({
    required this.id,
    required this.displayName,
    required this.userId,
    required this.createdAt,
  });

  final String id;
  final String displayName;
  final String? userId;
  final DateTime createdAt;

  bool get isRegistered => userId != null;

  @override
  List<Object?> get props => [id, displayName, userId, createdAt];
}
