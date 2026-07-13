import 'package:flutter/material.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/presentation/widgets/game_history_tile.dart';

class DeleteGameSlidable extends StatelessWidget {
  const DeleteGameSlidable({
    super.key,
    required this.item,
    required this.onTap,
    required this.onDeleteRequested,
    this.onRepeatRequested,
  });

  final GameHistoryItem item;
  final VoidCallback onTap;
  final VoidCallback onDeleteRequested;
  final VoidCallback? onRepeatRequested;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey('history-delete-${item.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.error,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        onDeleteRequested();
        return false;
      },
      child: GameHistoryTile(
        item: item,
        onTap: onTap,
        onRepeat: onRepeatRequested,
        onDelete: onDeleteRequested,
      ),
    );
  }
}
