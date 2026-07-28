import 'package:flutter/material.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';

class FavoritesChipSection extends StatelessWidget {
  const FavoritesChipSection({
    super.key,
    required this.visibleFavorites,
    this.onFavoriteTap,
  });

  final List<FavoritePlayer> visibleFavorites;
  final ValueChanged<FavoritePlayer>? onFavoriteTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colors = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'FAVORITOS',
          style: textTheme.labelSmall?.copyWith(
            color: colors.onSurfaceVariant,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        if (visibleFavorites.isEmpty)
          Text(
            'Añade jugadores frecuentes con ⭐',
            style: textTheme.labelSmall?.copyWith(
              color: colors.onSurfaceVariant,
            ),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: visibleFavorites
                .map(
                  (favorite) => FilterChip(
                    label: Text(favorite.displayName),
                    onSelected: (_) => onFavoriteTap?.call(favorite),
                  ),
                )
                .toList(),
          ),
      ],
    );
  }
}
