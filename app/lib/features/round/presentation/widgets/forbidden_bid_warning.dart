import 'package:flutter/material.dart';

class ForbiddenBidWarning extends StatelessWidget {
  const ForbiddenBidWarning({
    super.key,
    required this.forbiddenBid,
  });

  final int forbiddenBid;

  static const Color _backgroundColor = Color(0xFFFCEFE0);
  static const Color _textColor = Color(0xFFD9772E);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: _textColor, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Número prohibido: $forbiddenBid',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: _textColor,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
