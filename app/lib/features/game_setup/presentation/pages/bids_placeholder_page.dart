import 'package:flutter/material.dart';

class BidsPlaceholderPage extends StatelessWidget {
  const BidsPlaceholderPage({
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
        title: Text('Apuestas — Ronda $roundNumber'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Pantalla LPT-9 pendiente\nPartida: $gameId',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
