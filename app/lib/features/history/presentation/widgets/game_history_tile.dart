import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/presentation/widgets/source_badge.dart';

class GameHistoryTile extends StatelessWidget {
  const GameHistoryTile({
    super.key,
    required this.item,
    required this.onTap,
  });

  final GameHistoryItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final winnerText = item.winnerName != null
        ? 'Ganador: ${item.winnerName} (${item.winnerScore ?? 0} pts)'
        : 'Sin ganador';

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.displayLabel,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppTheme.onSurface,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${item.playerCount} jugadores',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      winnerText,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              SourceBadge(source: item.source),
            ],
          ),
        ),
      ),
    );
  }
}
