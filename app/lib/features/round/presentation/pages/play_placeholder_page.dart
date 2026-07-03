import 'package:flutter/material.dart';

class PlayPlaceholderPage extends StatelessWidget {
  const PlayPlaceholderPage({
    super.key,
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('En juego — Ronda $roundNumber'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Pantalla LPT-10 pendiente\nPartida: $gameId',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
