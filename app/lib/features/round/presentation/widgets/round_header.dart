import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/game_overflow_menu.dart';

class RoundHeader extends StatelessWidget {
  const RoundHeader({
    super.key,
    required this.gameId,
    required this.roundNumber,
    required this.cardsInRound,
    required this.subtitle,
    this.dealerName,
    this.repeatRoundNumber,
  });

  final String gameId;
  final int roundNumber;
  final int? cardsInRound;
  final String subtitle;
  final String? dealerName;
  final int? repeatRoundNumber;

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
            GameOverflowMenu(
              gameId: gameId,
              repeatRoundNumber: repeatRoundNumber,
            ),
          ],
        ),
      ),
    );
  }
}
