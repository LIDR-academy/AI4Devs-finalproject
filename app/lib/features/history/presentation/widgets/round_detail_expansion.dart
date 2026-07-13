import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/history/domain/entities/round_summary.dart';

class RoundDetailExpansion extends StatelessWidget {
  const RoundDetailExpansion({
    super.key,
    required this.summary,
    required this.playersBySeatOrder,
  });

  final RoundSummary summary;
  final List<({String id, String displayName})> playersBySeatOrder;

  static const Color _negativeScoreColor = Color(0xFFD9772E);

  @override
  Widget build(BuildContext context) {
    final round = summary.round;
    final bids = round.bids;
    final tricks = round.tricks ?? const {};
    final scoresDelta = round.scoresDelta ?? const {};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _InfoRow(
          label: 'Repartidor',
          value: summary.dealerDisplayName,
        ),
        const SizedBox(height: 12),
        Text(
          'APUESTAS Y BAZAS',
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.onSurfaceVariant,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 8),
        ...playersBySeatOrder.map((player) {
          final bid = bids[player.id] ?? 0;
          final trick = tricks[player.id] ?? 0;
          final delta = scoresDelta[player.id] ?? 0;
          final deltaColor =
              delta >= 0 ? AppTheme.primary : _negativeScoreColor;

          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    player.displayName,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
                _StatChip(label: 'Apuesta', value: '$bid'),
                const SizedBox(width: 8),
                _StatChip(label: 'Bazas', value: '$trick'),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: deltaColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${delta >= 0 ? '+' : ''}$delta',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: deltaColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.onSurfaceVariant,
              ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppTheme.primary,
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
