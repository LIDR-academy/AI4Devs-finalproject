import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/player_slot.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:la_pocha/features/round/presentation/widgets/score_delta_chip.dart';

class RankingList extends StatelessWidget {
  const RankingList({
    super.key,
    required this.entries,
    this.showPositionDelta = true,
    this.shrinkWrap = false,
  });

  final List<RankingEntry> entries;
  final bool showPositionDelta;
  final bool shrinkWrap;

  static const Color _negativeScoreColor = Color(0xFFD9772E);

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      shrinkWrap: shrinkWrap,
      physics: shrinkWrap ? const NeverScrollableScrollPhysics() : null,
      padding: const EdgeInsets.all(20),
      itemCount: entries.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final entry = entries[index];
        final playerIndex = entry.player.seatOrder;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                SizedBox(
                  width: 36,
                  child: Text(
                    '${entry.rank}',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: playerAvatarColorForIndex(playerIndex),
                  child: Text(
                    entry.player.displayName.characters.first.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.player.displayName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'Ronda ${entry.roundScore >= 0 ? '+' : ''}${entry.roundScore}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: entry.roundScore >= 0
                                  ? AppTheme.primary
                                  : _negativeScoreColor,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ],
                  ),
                ),
                if (showPositionDelta &&
                    entry.positionDelta != null &&
                    entry.positionDelta != 0)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ScoreDeltaChip(positionDelta: entry.positionDelta!),
                  ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Total',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                          ),
                    ),
                    Text(
                      '${entry.totalScore}',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
