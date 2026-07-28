import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/core/widgets/player_initial_avatar.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/dealer_selector.dart';

class ReorderablePlayerList extends StatelessWidget {
  const ReorderablePlayerList({
    super.key,
    required this.players,
    required this.firstDealerPlayerId,
    required this.onReorder,
    required this.onDealerSelected,
  });

  final List<PlayerEmbed> players;
  final String firstDealerPlayerId;
  final void Function(int oldIndex, int newIndex) onReorder;
  final void Function(String playerId) onDealerSelected;

  @override
  Widget build(BuildContext context) {
    return ReorderableListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: players.length,
      onReorderItem: (oldIndex, newIndex) => onReorder(oldIndex, newIndex),
      itemBuilder: (context, index) {
        final player = players[index];
        final isDealer = player.id == firstDealerPlayerId;

        return _PlayerRow(
          key: ValueKey(player.id),
          player: player,
          index: index,
          isDealer: isDealer,
          onDealerSelected: () => onDealerSelected(player.id),
        );
      },
    );
  }
}

class _PlayerRow extends StatelessWidget {
  const _PlayerRow({
    required super.key,
    required this.player,
    required this.index,
    required this.isDealer,
    required this.onDealerSelected,
  });

  final PlayerEmbed player;
  final int index;
  final bool isDealer;
  final VoidCallback onDealerSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          ReorderableDragStartListener(
            index: index,
            child: const Padding(
              padding: EdgeInsets.only(right: 8),
              child: Icon(
                Icons.drag_handle,
                color: AppTheme.onSurfaceVariant,
              ),
            ),
          ),
          Container(
            width: 28,
            height: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Text(
              '${player.seatOrder}',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          const SizedBox(width: 12),
          PlayerInitialAvatar(
            name: player.displayName,
            colorIndex: index,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              player.displayName,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
          if (isDealer) const DealerBadge(),
          DealerSelector(
            isSelected: isDealer,
            onTap: onDealerSelected,
          ),
        ],
      ),
    );
  }
}
