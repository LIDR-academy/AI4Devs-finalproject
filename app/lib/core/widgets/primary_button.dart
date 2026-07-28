import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: Colors.white,
            ),
          )
        : Text(label);

    final effectiveOnPressed = isLoading ? null : onPressed;

    if (icon != null && !isLoading) {
      return FilledButton.icon(
        onPressed: effectiveOnPressed,
        icon: Icon(icon),
        label: Text(label),
      );
    }

    return FilledButton(
      onPressed: effectiveOnPressed,
      child: child,
    );
  }
}
