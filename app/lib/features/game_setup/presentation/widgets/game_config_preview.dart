import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class GameConfigPreview extends StatelessWidget {
  const GameConfigPreview({
    super.key,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.totalRounds,
  });

  final int totalCards;
  final int maxCardsPerRound;
  final int totalRounds;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _PreviewRow(
              label: 'Cartas totales',
              value: '$totalCards',
              suffix: 'cartas',
            ),
            const SizedBox(height: 16),
            _PreviewRow(
              label: 'Máx. por ronda',
              value: '$maxCardsPerRound',
              suffix: 'cartas',
            ),
            const SizedBox(height: 16),
            _PreviewRow(
              label: 'Total de rondas',
              value: '$totalRounds',
              suffix: 'rondas',
            ),
          ],
        ),
      ),
    );
  }
}

class _PreviewRow extends StatelessWidget {
  const _PreviewRow({
    required this.label,
    required this.value,
    required this.suffix,
  });

  final String label;
  final String value;
  final String suffix;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.onSurfaceVariant,
                ),
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: AppTheme.primary,
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(width: 4),
        Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Text(
            suffix,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.onSurfaceVariant,
                ),
          ),
        ),
      ],
    );
  }
}
