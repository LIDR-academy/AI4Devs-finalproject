import 'package:flutter/material.dart';

Future<bool> showRepeatGameDialog(BuildContext context) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: const Text('Repetir partida'),
      content: const Text(
        'Se creará una nueva partida con la misma configuración '
        'y jugadores, sin puntuaciones ni rondas anteriores.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(false),
          child: const Text('Volver'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(dialogContext).pop(true),
          child: const Text('Repetir partida'),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}
