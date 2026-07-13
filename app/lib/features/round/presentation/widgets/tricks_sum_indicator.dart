import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class TricksSumIndicator extends StatelessWidget {
  const TricksSumIndicator({
    super.key,
    required this.tricksSum,
    required this.cardsInRound,
    required this.canConfirm,
  });

  final int tricksSum;
  final int cardsInRound;
  final bool canConfirm;

  @override
  Widget build(BuildContext context) {
    final remaining = cardsInRound - tricksSum;
    final statusColor =
        canConfirm ? AppTheme.primary : const Color(0xFFF4A259);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'BAZAS REGISTRADAS',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '$tricksSum / $cardsInRound',
              textAlign: TextAlign.right,
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              canConfirm
                  ? 'La suma cuadra'
                  : remaining > 0
                      ? 'Faltan $remaining bazas'
                      : 'Sobran ${-remaining} bazas',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: canConfirm
                        ? AppTheme.primary
                        : AppTheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
