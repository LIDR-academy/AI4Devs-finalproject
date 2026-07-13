import 'package:flutter/material.dart';

Future<bool> showRepeatRoundDialog(BuildContext context) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: const Text('Repetir ronda'),
      content: const Text(
        'Se perderan las apuestas, bazas y puntuacion de esta ronda. '
        'Las rondas anteriores no se veran afectadas. '
        'Esta accion no se puede deshacer.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(false),
          child: const Text('Volver'),
        ),
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(true),
          style: TextButton.styleFrom(
            foregroundColor: const Color(0xFFD9772E),
          ),
          child: const Text('Repetir ronda'),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}
