import 'package:flutter/material.dart';

class AddPlayersPlaceholderPage extends StatelessWidget {
  const AddPlayersPlaceholderPage({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Añadir jugadores'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Pantalla LPT-6 pendiente.\nGame ID: $gameId',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
      ),
    );
  }
}
