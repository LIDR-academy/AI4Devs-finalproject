import 'package:flutter/material.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/player_slot.dart';

class PlayersRosterSection extends StatelessWidget {
  const PlayersRosterSection({
    super.key,
    required this.playerCount,
    required this.players,
    required this.activeEditIndex,
    required this.isLoading,
    required this.isFavoritePlayer,
    this.onEditActivated,
    this.onEditCancelled,
    this.onNameConfirmed,
    this.onFavoriteToggle,
    this.onRemovePlayer,
  });

  final int playerCount;
  final List<PlayerEmbed> players;
  final int? activeEditIndex;
  final bool isLoading;
  final bool Function(PlayerEmbed player) isFavoritePlayer;
  final ValueChanged<int>? onEditActivated;
  final VoidCallback? onEditCancelled;
  final void Function(int index, String name)? onNameConfirmed;
  final ValueChanged<String>? onFavoriteToggle;
  final ValueChanged<String>? onRemovePlayer;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'JUGADORES EN LA PARTIDA',
          style: textTheme.labelSmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: List.generate(playerCount, (index) {
              final player = index < players.length ? players[index] : null;
              final slot = PlayerSlot(
                index: index,
                player: player,
                isEditing: player == null && activeEditIndex == index,
                isFavorite: player != null && isFavoritePlayer(player),
                isBusy: isLoading,
                onActivateEdit: () => onEditActivated?.call(index),
                onCancelEdit: onEditCancelled,
                onConfirmName: (name) => onNameConfirmed?.call(index, name),
                onToggleFavorite:
                    player == null ? null : () => onFavoriteToggle?.call(player.id),
                onRemove: player == null ? null : () => onRemovePlayer?.call(player.id),
              );

              if (index == playerCount - 1) {
                return slot;
              }

              return Column(
                children: [
                  slot,
                  Divider(
                    height: 1,
                    color: colorScheme.outlineVariant.withValues(alpha: 0.6),
                  ),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }
}
