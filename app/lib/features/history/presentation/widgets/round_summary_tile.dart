import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/history/domain/entities/round_summary.dart';
import 'package:la_pocha/features/history/presentation/widgets/round_detail_expansion.dart';
import 'package:la_pocha/features/round/presentation/widgets/ranking_list.dart';

class RoundSummaryTile extends StatelessWidget {
  const RoundSummaryTile({
    super.key,
    required this.summary,
    required this.playersBySeatOrder,
  });

  final RoundSummary summary;
  final List<({String id, String displayName})> playersBySeatOrder;

  @override
  Widget build(BuildContext context) {
    final round = summary.round;
    final leader = summary.cumulativeRanking.isNotEmpty
        ? summary.cumulativeRanking.first
        : null;

    return Card(
      margin: EdgeInsets.zero,
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          title: Row(
            children: [
              Text(
                'Ronda ${round.roundNumber}',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const Spacer(),
              Text(
                '${round.cardsInRound} cartas',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.onSurfaceVariant,
                    ),
              ),
            ],
          ),
          subtitle: leader == null
              ? null
              : Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    'Líder: ${leader.player.displayName} (${leader.totalScore} pts)',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
          children: [
            RoundDetailExpansion(
              summary: summary,
              playersBySeatOrder: playersBySeatOrder,
            ),
            const SizedBox(height: 12),
            Text(
              'RANKING TRAS RONDA',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            RankingList(
              entries: summary.cumulativeRanking,
              showPositionDelta: false,
              shrinkWrap: true,
            ),
          ],
        ),
      ),
    );
  }
}
