import 'package:flutter/material.dart';

class TricksPlaceholderPage extends StatelessWidget {
  const TricksPlaceholderPage({
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
        title: Text('Bazas reales — Ronda $roundNumber'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Pantalla LPT-11 pendiente\nPartida: $gameId',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
