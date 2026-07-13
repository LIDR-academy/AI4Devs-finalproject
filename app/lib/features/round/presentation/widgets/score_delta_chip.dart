import 'package:flutter/material.dart';

class ScoreDeltaChip extends StatelessWidget {
  const ScoreDeltaChip({
    super.key,
    required this.positionDelta,
  });

  final int positionDelta;

  static const Color _positiveColor = Color(0xFF2E7D5B);
  static const Color _negativeColor = Color(0xFFD9772E);

  @override
  Widget build(BuildContext context) {
    if (positionDelta == 0) {
      return const SizedBox.shrink();
    }

    final isUp = positionDelta > 0;
    final color = isUp ? _positiveColor : _negativeColor;
    final icon = isUp ? Icons.arrow_upward : Icons.arrow_downward;
    final label = isUp ? '+$positionDelta' : '$positionDelta';

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 8),
            child: child,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 2),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
