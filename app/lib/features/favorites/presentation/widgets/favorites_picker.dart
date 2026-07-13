import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/presentation/bloc/favorites_bloc.dart';
import 'package:la_pocha/features/favorites/presentation/widgets/favorite_list_tile.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';

class FavoritesPicker extends StatelessWidget {
  const FavoritesPicker({super.key, required this.onSelected});

  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Favoritos'),
        actions: [
          TextButton(
            onPressed: () => context.push('/favorites'),
            child: const Text('Gestionar'),
          ),
        ],
      ),
      body: BlocBuilder<FavoritesBloc, FavoritesState>(
        builder: (context, state) {
          return switch (state) {
            FavoritesInitial() || FavoritesLoading() =>
              const Center(child: CircularProgressIndicator()),
            FavoritesFailure(:final message) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    message,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppTheme.onSurfaceVariant,
                        ),
                  ),
                ),
              ),
            FavoritesEmpty() => _EmptyPickerView(
                onManage: () => context.push('/favorites'),
              ),
            FavoritesLoaded(:final favorites) => ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: favorites.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final favorite = favorites[index];
                  return FavoriteListTile(
                    favorite: favorite,
                    trailing: IconButton(
                      icon: const Icon(Icons.add_circle_outline),
                      onPressed: () => _selectFavorite(context, favorite),
                    ),
                  );
                },
              ),
          };
        },
      ),
    );
  }

  void _selectFavorite(BuildContext context, FavoritePlayer favorite) {
    context.read<AddPlayersBloc>().add(
          PlayerAddedFromFavorite(favoriteId: favorite.id),
        );
    onSelected();
  }
}

class _EmptyPickerView extends StatelessWidget {
  const _EmptyPickerView({required this.onManage});

  final VoidCallback onManage;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.star_outline,
              size: 64,
              color: AppTheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Sin favoritos',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Añade jugadores frecuentes para seleccionarlos aquí.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: onManage,
              child: const Text('Gestionar favoritos'),
            ),
          ],
        ),
      ),
    );
  }
}
