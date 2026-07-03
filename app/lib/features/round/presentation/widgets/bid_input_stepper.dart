import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class BidInputStepper extends StatelessWidget {
  const BidInputStepper({
    super.key,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    required this.onConfirm,
    required this.canConfirm,
    this.isSubmitting = false,
  });

  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;
  final VoidCallback onConfirm;
  final bool canConfirm;
  final bool isSubmitting;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StepperButton(
          icon: Icons.remove,
          onPressed: value > min ? () => onChanged(value - 1) : null,
        ),
        Expanded(
          child: Text(
            '$value',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: AppTheme.primary,
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
        _StepperButton(
          icon: Icons.add,
          onPressed: value < max ? () => onChanged(value + 1) : null,
        ),
        const SizedBox(width: 8),
        FilledButton(
          onPressed: canConfirm && !isSubmitting ? onConfirm : null,
          style: FilledButton.styleFrom(
            minimumSize: const Size(96, 44),
            padding: const EdgeInsets.symmetric(horizontal: 12),
          ),
          child: isSubmitting
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('OK'),
        ),
      ],
    );
  }
}

class _StepperButton extends StatelessWidget {
  const _StepperButton({
    required this.icon,
    required this.onPressed,
  });

  final IconData icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFD7ECE0),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          width: 44,
          height: 44,
          child: Icon(
            icon,
            color: onPressed == null
                ? AppTheme.onSurfaceVariant.withValues(alpha: 0.4)
                : AppTheme.primary,
          ),
        ),
      ),
    );
  }
}
