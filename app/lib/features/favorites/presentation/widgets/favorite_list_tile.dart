import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';

class FavoriteListTile extends StatelessWidget {
  const FavoriteListTile({
    super.key,
    required this.favorite,
    this.trailing,
    this.onDelete,
  });

  final FavoritePlayer favorite;
  final Widget? trailing;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final initial = favorite.displayName.isNotEmpty
        ? favorite.displayName[0].toUpperCase()
        : '?';

    return ListTile(
      tileColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      leading: CircleAvatar(
        backgroundColor: AppTheme.primary.withValues(alpha: 0.15),
        child: Text(
          initial,
          style: const TextStyle(
            color: AppTheme.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      title: Text(favorite.displayName),
      subtitle: Text(
        favorite.isRegistered ? 'Usuario registrado' : 'Invitado',
      ),
      trailing: trailing ??
          (onDelete != null
              ? IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: onDelete,
                )
              : Icon(
                  favorite.isRegistered ? Icons.verified : Icons.person_outline,
                  color: AppTheme.onSurfaceVariant,
                )),
    );
  }
}
