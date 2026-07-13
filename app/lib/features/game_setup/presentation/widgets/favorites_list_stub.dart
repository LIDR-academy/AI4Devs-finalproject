import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

// TODO(LPT-18): Replace hardcoded favorites with Drift favorites table
// via FavoriteRepository.
class FavoritesListStub extends StatelessWidget {
  const FavoritesListStub({super.key});

  static const _stubFavorites = [
    ('Carlos', 'C'),
    ('María', 'M'),
    ('Luis', 'L'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Favoritos'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: _stubFavorites.length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final (name, initial) = _stubFavorites[index];
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
            title: Text(name),
            trailing: IconButton(
              icon: const Icon(Icons.add_circle_outline),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Favoritos reales pendientes (LPT-18)'),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
