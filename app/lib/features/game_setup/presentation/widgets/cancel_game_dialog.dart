import 'package:flutter/material.dart';

Future<bool> showCancelGameDialog(BuildContext context) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: const Text('Cancelar partida'),
      content: const Text(
        'Se perdera todo el progreso de la partida y no se guardara en '
        'ningun historial. Esta accion no se puede deshacer.',
      ),
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
          child: const Text('Cancelar partida'),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}
