import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class TricksBalanceIndicator extends StatelessWidget {
  const TricksBalanceIndicator({
    super.key,
    required this.availableTricks,
    required this.partialSum,
  });

  final int availableTricks;
  final int partialSum;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'BAZAS RESTANTES',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '$availableTricks',
              textAlign: TextAlign.right,
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Text(
              'Apostadas: $partialSum',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
