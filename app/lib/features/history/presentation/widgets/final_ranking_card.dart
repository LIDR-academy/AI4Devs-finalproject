import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:la_pocha/features/round/presentation/widgets/ranking_list.dart';

class FinalRankingCard extends StatelessWidget {
  const FinalRankingCard({super.key, required this.entries});

  final List<RankingEntry> entries;

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return const SizedBox.shrink();
    }

    final winner = entries.first;

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'RANKING FINAL',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              winner.player.displayName,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              '${winner.totalScore} puntos',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 12),
            RankingList(
              entries: entries,
              showPositionDelta: false,
              shrinkWrap: true,
            ),
          ],
        ),
      ),
    );
  }
}
