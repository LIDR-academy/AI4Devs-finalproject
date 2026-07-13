import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/presentation/bloc/favorites_bloc.dart';
import 'package:la_pocha/features/favorites/presentation/widgets/add_favorite_fab.dart';
import 'package:la_pocha/features/favorites/presentation/widgets/delete_favorite_dialog.dart';
import 'package:la_pocha/features/favorites/presentation/widgets/delete_favorite_slidable.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<FavoritesBloc>()..add(const FavoritesStarted()),
      child: const _FavoritesView(),
    );
  }
}

class _FavoritesView extends StatelessWidget {
  const _FavoritesView();

  Future<void> _requestDelete(
    BuildContext context,
    FavoritePlayer favorite,
  ) async {
    final confirmed = await showDeleteFavoriteDialog(context);
    if (!confirmed || !context.mounted) {
      return;
    }

    context.read<FavoritesBloc>().add(FavoriteRemoved(favorite.id));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _Header(onBack: () => context.pop()),
            Expanded(
              child: BlocBuilder<FavoritesBloc, FavoritesState>(
                builder: (context, state) {
                  return switch (state) {
                    FavoritesInitial() || FavoritesLoading() =>
                      const Center(child: CircularProgressIndicator()),
                    FavoritesEmpty() => const _EmptyFavoritesView(),
                    FavoritesFailure(:final message) => Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            message,
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .bodyLarge
                                ?.copyWith(color: AppTheme.onSurfaceVariant),
                          ),
                        ),
                      ),
                    FavoritesLoaded(:final favorites) => RefreshIndicator(
                        onRefresh: () async {
                          context
                              .read<FavoritesBloc>()
                              .add(const FavoritesRefreshed());
                          await context
                              .read<FavoritesBloc>()
                              .stream
                              .firstWhere(
                                (state) =>
                                    state is FavoritesLoaded ||
                                    state is FavoritesEmpty ||
                                    state is FavoritesFailure,
                              );
                        },
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 88),
                          itemCount: favorites.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final favorite = favorites[index];
                            return DeleteFavoriteSlidable(
                              favorite: favorite,
                              onDeleteRequested: () =>
                                  _requestDelete(context, favorite),
                            );
                          },
                        ),
                      ),
                  };
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: const AddFavoriteFab(),
    );
  }
}

class _EmptyFavoritesView extends StatelessWidget {
  const _EmptyFavoritesView();

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
              'Guarda jugadores frecuentes para añadirlos rápido a tus partidas.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => showAddFavoriteBottomSheet(context),
              icon: const Icon(Icons.add),
              label: const Text('Añadir favorito'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.primary,
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
        child: Row(
          children: [
            IconButton(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back, color: Colors.white),
            ),
            Expanded(
              child: Text(
                'Mis favoritos',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
