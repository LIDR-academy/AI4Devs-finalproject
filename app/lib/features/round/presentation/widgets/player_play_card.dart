import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/core/widgets/player_initial_avatar.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class PlayerPlayCard extends StatelessWidget {
  const PlayerPlayCard({
    super.key,
    required this.player,
    required this.index,
    required this.bid,
    required this.isDealer,
  });

  final PlayerEmbed player;
  final int index;
  final int bid;
  final bool isDealer;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            PlayerInitialAvatar(
              name: player.displayName,
              colorIndex: index,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Row(
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
                  ),
                  Semantics(
                    label: '${player.displayName} apostó $bid',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'apostó',
                          style:
                              Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: AppTheme.onSurfaceVariant,
                                  ),
                        ),
                        Text(
                          '$bid',
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Semantics(
              label: '${player.displayName} tiene ${player.totalScore} puntos',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'puntos',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppTheme.onSurfaceVariant,
                        ),
                  ),
                  Text(
                    '${player.totalScore}',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
