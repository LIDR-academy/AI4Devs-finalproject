import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class PlayerCountSelector extends StatelessWidget {
  const PlayerCountSelector({
    super.key,
    required this.selectedCount,
    required this.onCountSelected,
  });

  static const List<int> options = [3, 4, 5, 6, 7, 8];

  final int selectedCount;
  final ValueChanged<int> onCountSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'NÚMERO DE JUGADORES',
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.onSurfaceVariant,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final count in options)
              Semantics(
                label: '$count jugadores',
                selected: selectedCount == count,
                button: true,
                child: ChoiceChip(
                  label: Text(
                    '$count',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: selectedCount == count
                          ? Colors.white
                          : AppTheme.onSurfaceVariant,
                    ),
                  ),
                  selected: selectedCount == count,
                  showCheckmark: false,
                  selectedColor: AppTheme.primary,
                  backgroundColor: Colors.white,
                  side: BorderSide(
                    color: selectedCount == count
                        ? AppTheme.primary
                        : AppTheme.onSurfaceVariant.withValues(alpha: 0.3),
                  ),
                  onSelected: (_) => onCountSelected(count),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
