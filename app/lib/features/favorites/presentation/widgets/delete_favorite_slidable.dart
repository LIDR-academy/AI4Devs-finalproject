import 'package:flutter/material.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/presentation/widgets/favorite_list_tile.dart';

class DeleteFavoriteSlidable extends StatelessWidget {
  const DeleteFavoriteSlidable({
    super.key,
    required this.favorite,
    required this.onDeleteRequested,
    this.trailing,
  });

  final FavoritePlayer favorite;
  final VoidCallback onDeleteRequested;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey('favorite-delete-${favorite.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.error,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        onDeleteRequested();
        return false;
      },
      child: FavoriteListTile(
        favorite: favorite,
        trailing: trailing,
        onDelete: onDeleteRequested,
      ),
    );
  }
}
