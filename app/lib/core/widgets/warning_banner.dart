import 'package:flutter/material.dart';

class WarningBanner extends StatelessWidget {
  const WarningBanner({
    super.key,
    required this.message,
    this.icon = Icons.warning_amber_rounded,
    this.onTap,
  });

  final String message;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final background = colorScheme.tertiaryContainer;
    final foreground = colorScheme.onTertiaryContainer;

    final content = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          Icon(icon, color: foreground, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: foreground,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
          if (onTap != null)
            Icon(Icons.chevron_right, color: foreground),
        ],
      ),
    );

    if (onTap == null) {
      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(12),
        ),
        child: content,
      );
    }

    return Material(
      color: background,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: content,
      ),
    );
  }
}
