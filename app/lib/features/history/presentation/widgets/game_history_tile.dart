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
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  SourceBadge(source: item.source),
                  if (item.isSyncPending) ...[
                    const SizedBox(height: 8),
                    const _SyncPendingBadge(),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SyncPendingBadge extends StatelessWidget {
  const _SyncPendingBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFCEFE0),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        'Pendiente',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: const Color(0xFFF4A259),
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
