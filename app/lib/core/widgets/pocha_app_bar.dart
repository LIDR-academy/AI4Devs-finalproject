import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class PochaAppBar extends StatelessWidget implements PreferredSizeWidget {
  const PochaAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.onBack,
    this.showBackConfirmation = false,
    this.backConfirmationMessage = '¿Seguro que quieres salir?',
    this.leading,
    this.expanded = false,
  });

  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final VoidCallback? onBack;
  final bool showBackConfirmation;
  final String backConfirmationMessage;
  final Widget? leading;
  final bool expanded;

  static const BorderRadius _bottomRadius = BorderRadius.only(
    bottomLeft: Radius.circular(20),
    bottomRight: Radius.circular(20),
  );

  @override
  Size get preferredSize {
    if (expanded) {
      return const Size.fromHeight(16 + 24 + 56 + 24 + 16);
    }
    return const Size.fromHeight(8 + 16 + 56 + 16);
  }

  Future<void> _handleBack(BuildContext context) async {
    final callback = onBack;
    if (callback == null) {
      return;
    }
    if (!showBackConfirmation) {
      callback();
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          content: Text(backConfirmationMessage),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Salir'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      callback();
    }
  }

  @override
  Widget build(BuildContext context) {
    final titleStyle = (expanded
            ? Theme.of(context).textTheme.headlineMedium
            : Theme.of(context).textTheme.headlineSmall)
        ?.copyWith(
      color: Colors.white,
      fontWeight: FontWeight.bold,
    );

    final showDefaultBack = leading == null && onBack != null;
    final resolvedLeading = leading ??
        (showDefaultBack
            ? IconButton(
                onPressed: () => _handleBack(context),
                icon: const Icon(Icons.arrow_back, color: Colors.white),
              )
            : null);

    final bar = Container(
      decoration: const BoxDecoration(
        color: AppTheme.primary,
        borderRadius: _bottomRadius,
      ),
      padding: expanded
          ? const EdgeInsets.all(24)
          : const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
      child: Row(
        crossAxisAlignment:
            subtitle != null ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          ?resolvedLeading,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: titleStyle),
                if (subtitle != null && subtitle!.isNotEmpty)
                  Text(
                    subtitle!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                  ),
              ],
            ),
          ),
          ...?actions,
        ],
      ),
    );

    if (expanded) {
      return Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        child: bar,
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
      child: bar,
    );
  }
}
