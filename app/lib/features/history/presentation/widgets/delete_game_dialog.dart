import 'package:flutter/material.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';

Future<bool> showDeleteGameDialog(
  BuildContext context, {
  required GameHistorySource source,
}) async {
  final message = switch (source) {
    GameHistorySource.local => 'Esta acción no se puede deshacer.',
    GameHistorySource.cloud => 'Solo se eliminará de tu historial.',
  };

  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: const Text('Eliminar del historial'),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(false),
          child: const Text('Volver'),
        ),
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(true),
          style: TextButton.styleFrom(
            foregroundColor: Theme.of(dialogContext).colorScheme.error,
          ),
          child: const Text('Eliminar'),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}
