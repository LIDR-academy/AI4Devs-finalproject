import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

class GameHistoryDetailPlaceholderPage extends StatelessWidget {
  const GameHistoryDetailPlaceholderPage({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  Expanded(
                    child: Text(
                      'Detalle de partida',
                      style:
                          Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'El detalle ronda a ronda se implementará en LPT-16.\n\nPartida: $gameId',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppTheme.onSurfaceVariant,
                        ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
