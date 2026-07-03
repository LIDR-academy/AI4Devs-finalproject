import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class DealerBadge extends StatelessWidget {
  const DealerBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFD7ECE0),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        'REPARTE',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: AppTheme.primary,
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }
}

class DealerSelector extends StatelessWidget {
  const DealerSelector({
    super.key,
    required this.isSelected,
    required this.onTap,
  });

  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onTap,
      tooltip: 'Designar repartidor',
      icon: Icon(
        Icons.style,
        color: isSelected ? AppTheme.primary : AppTheme.onSurfaceVariant,
      ),
    );
  }
}
