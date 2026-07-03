import 'package:flutter/material.dart';

class ResultPlaceholderPage extends StatelessWidget {
  const ResultPlaceholderPage({
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
        title: Text('Resultado — Ronda $roundNumber'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Pantalla LPT-14 pendiente\nPartida: $gameId',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
