import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/core/widgets/player_initial_avatar.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/round/presentation/widgets/trick_input_stepper.dart';

class ScoringPlayerRow extends StatelessWidget {
  const ScoringPlayerRow({
    super.key,
    required this.player,
    required this.index,
    required this.bid,
    required this.isDealer,
    required this.trickValue,
    required this.cardsInRound,
    required this.scorePreview,
    required this.onTrickChanged,
  });

  final PlayerEmbed player;
  final int index;
  final int bid;
  final bool isDealer;
  final int trickValue;
  final int cardsInRound;
  final int? scorePreview;
  final ValueChanged<int> onTrickChanged;

  static const Color _negativeScoreColor = Color(0xFFD9772E);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                PlayerInitialAvatar(
                  name: player.displayName,
                  colorIndex: index,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              player.displayName,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(fontWeight: FontWeight.w600),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isDealer) ...[
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.style,
                              color: AppTheme.onSurfaceVariant,
                              size: 18,
                            ),
                          ],
                        ],
                      ),
                      Text(
                        'Apuesta $bid · Total ${player.totalScore}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
                if (scorePreview != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Ronda',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppTheme.onSurfaceVariant,
                            ),
                      ),
                      Text(
                        scorePreview! >= 0 ? '+$scorePreview' : '$scorePreview',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: scorePreview! >= 0
                                  ? AppTheme.primary
                                  : _negativeScoreColor,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  'Bazas',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppTheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(width: 12),
                TrickInputStepper(
                  value: trickValue,
                  min: 0,
                  max: cardsInRound,
                  onChanged: onTrickChanged,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
