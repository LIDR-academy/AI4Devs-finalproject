import 'package:flutter/material.dart';

class RandomDealerButton extends StatelessWidget {
  const RandomDealerButton({
    super.key,
    required this.onPressed,
    this.isEnabled = true,
  });

  final VoidCallback? onPressed;
  final bool isEnabled;

  static const Color _amber = Color(0xFFF4A259);

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: isEnabled ? onPressed : null,
      style: OutlinedButton.styleFrom(
        foregroundColor: _amber,
        side: const BorderSide(color: _amber),
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
      child: const Text('🎲 Repartidor aleatorio'),
    );
  }
}
