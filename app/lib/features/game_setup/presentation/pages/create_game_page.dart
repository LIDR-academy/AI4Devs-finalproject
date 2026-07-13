import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/create_game_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/game_config_preview.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/player_count_selector.dart';

class CreateGamePage extends StatelessWidget {
  const CreateGamePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<CreateGameBloc>()..add(const PlayerCountChanged(4)),
      child: const _CreateGameView(),
    );
  }
}

class _CreateGameView extends StatelessWidget {
  const _CreateGameView();

  @override
  Widget build(BuildContext context) {
    return BlocListener<CreateGameBloc, CreateGameState>(
      listener: (context, state) {
        if (state is CreateGameSuccess) {
          context.go('/games/${state.gameId}/players');
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Header(onBack: () => context.pop()),
              Expanded(
                child: BlocBuilder<CreateGameBloc, CreateGameState>(
                  builder: (context, state) {
                    final preview = _resolvePreview(state);
                    final isSubmitting = state is CreateGameSubmitting;

                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          PlayerCountSelector(
                            selectedCount: preview.playerCount,
                            onCountSelected: (count) => context
                                .read<CreateGameBloc>()
                                .add(PlayerCountChanged(count)),
                          ),
                          const SizedBox(height: 24),
                          GameConfigPreview(
                            totalCards: preview.totalCards,
                            maxCardsPerRound: preview.maxCardsPerRound,
                            totalRounds: preview.totalRounds,
                          ),
                          if (state is CreateGameFailure) ...[
                            const SizedBox(height: 16),
                            Text(
                              state.message,
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.error,
                              ),
                            ),
                          ],
                          const SizedBox(height: 32),
                          FilledButton(
                            onPressed: isSubmitting
                                ? null
                                : () => context
                                    .read<CreateGameBloc>()
                                    .add(const CreateGameConfirmed()),
                            child: isSubmitting
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Continuar'),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  CreateGamePreview _resolvePreview(CreateGameState state) {
    return switch (state) {
      CreateGamePreview preview => preview,
      CreateGameSubmitting submitting => CreateGamePreview(
          playerCount: submitting.playerCount,
          totalCards: submitting.totalCards,
          maxCardsPerRound: submitting.maxCardsPerRound,
          totalRounds: submitting.totalRounds,
        ),
      CreateGameFailure failure => CreateGamePreview(
          playerCount: failure.playerCount,
          totalCards: failure.totalCards,
          maxCardsPerRound: failure.maxCardsPerRound,
          totalRounds: failure.totalRounds,
        ),
      _ => const CreateGamePreview(
          playerCount: 4,
          totalCards: 40,
          maxCardsPerRound: 10,
          totalRounds: 22,
        ),
    };
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.primary,
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
        child: Row(
          children: [
            IconButton(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back, color: Colors.white),
            ),
            Expanded(
              child: Text(
                'Nueva partida',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
