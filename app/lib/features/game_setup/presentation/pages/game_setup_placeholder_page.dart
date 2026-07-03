import 'package:flutter/material.dart';

class GameSetupPlaceholderPage extends StatelessWidget {
  const GameSetupPlaceholderPage({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Orden de mesa'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Pantalla LPT-7 pendiente.\nGame ID: $gameId',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
      ),
    );
  }
}
