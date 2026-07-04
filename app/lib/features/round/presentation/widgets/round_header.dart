import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class RoundHeader extends StatelessWidget {
  const RoundHeader({
    super.key,
    required this.roundNumber,
    required this.cardsInRound,
    required this.subtitle,
    this.dealerName,
  });

  final int roundNumber;
  final int? cardsInRound;
  final String subtitle;
  final String? dealerName;

  @override
  Widget build(BuildContext context) {
    final title = cardsInRound == null
        ? 'Ronda $roundNumber'
        : 'Ronda $roundNumber · $cardsInRound cartas';

    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.primary,
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
        child: Row(
          children: [
            IconButton(
              onPressed: () => context.pop(),
              icon: const Icon(Icons.arrow_back, color: Colors.white),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Text(
                    dealerName != null
                        ? '$subtitle · Repartidor: $dealerName'
                        : subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                  ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, color: Colors.white),
              onSelected: (value) {
                if (value == 'cancel') {
                  // TODO(LPT-24): cancel game
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'cancel',
                  child: Text(
                    'Cancelar partida',
                    style: TextStyle(color: Color(0xFFD9772E)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
