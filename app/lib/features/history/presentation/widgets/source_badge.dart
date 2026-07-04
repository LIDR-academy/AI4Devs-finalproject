import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';

class SourceBadge extends StatelessWidget {
  const SourceBadge({super.key, required this.source});

  final GameHistorySource source;

  @override
  Widget build(BuildContext context) {
    final isLocal = source == GameHistorySource.local;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isLocal ? const Color(0xFFD7ECE0) : const Color(0xFFE8F0FE),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isLocal ? Icons.smartphone : Icons.cloud,
            size: 16,
            color: isLocal ? AppTheme.primary : const Color(0xFF1A73E8),
          ),
          const SizedBox(width: 4),
          Text(
            isLocal ? 'Local' : 'Nube',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: isLocal ? AppTheme.primary : const Color(0xFF1A73E8),
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}
