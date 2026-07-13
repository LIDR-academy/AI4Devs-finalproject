import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class TricksBalanceBanner extends StatelessWidget {
  const TricksBalanceBanner({
    super.key,
    required this.bidSum,
    required this.cardsInRound,
    required this.restrictionMet,
  });

  final int bidSum;
  final int cardsInRound;
  final bool restrictionMet;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'BAZAS APOSTADAS',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppTheme.onSurfaceVariant,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$bidSum / $cardsInRound',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
            if (restrictionMet)
              Semantics(
                label: 'Restricción del repartidor cumplida',
                child: Icon(
                  Icons.check_circle,
                  color: AppTheme.primary,
                  size: 36,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
