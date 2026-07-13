import 'package:flutter/material.dart';

import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:go_router/go_router.dart';

import 'package:la_pocha/core/di/injection.dart';

import 'package:la_pocha/core/theme/app_theme.dart';

import 'package:la_pocha/features/history/domain/entities/game_detail.dart';

import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';

import 'package:la_pocha/features/history/domain/services/game_history_mapper.dart';

import 'package:la_pocha/features/history/presentation/bloc/delete_game_from_history_cubit.dart';

import 'package:la_pocha/features/history/presentation/bloc/game_detail_bloc.dart';

import 'package:la_pocha/features/history/presentation/bloc/repeat_game_cubit.dart';

import 'package:la_pocha/features/history/presentation/widgets/delete_game_dialog.dart';

import 'package:la_pocha/features/history/presentation/widgets/final_ranking_card.dart';

import 'package:la_pocha/features/history/presentation/widgets/repeat_game_button.dart';

import 'package:la_pocha/features/history/presentation/widgets/round_summary_tile.dart';

import 'package:la_pocha/features/history/presentation/widgets/source_badge.dart';



class GameDetailPage extends StatelessWidget {

  const GameDetailPage({super.key, required this.gameId, required this.source});



  final String gameId;

  final GameHistorySource source;



  @override

  Widget build(BuildContext context) {

    return MultiBlocProvider(

      providers: [

        BlocProvider(

          create: (_) =>

              getIt<GameDetailBloc>()

                ..add(GameDetailStarted(gameId: gameId, source: source)),

        ),

        BlocProvider(create: (_) => getIt<DeleteGameFromHistoryCubit>()),

        BlocProvider(create: (_) => getIt<RepeatGameCubit>()),

      ],

      child: _GameDetailView(gameId: gameId),

    );

  }

}



class _GameDetailView extends StatelessWidget {

  const _GameDetailView({required this.gameId});



  final String gameId;



  @override

  Widget build(BuildContext context) {

    return MultiBlocListener(

      listeners: [

        BlocListener<DeleteGameFromHistoryCubit, DeleteGameFromHistoryState>(

          listener: (context, state) {

            if (state is DeleteGameFromHistorySuccess) {

              context.pop();

            } else if (state is DeleteGameFromHistoryFailure) {

              ScaffoldMessenger.of(context).showSnackBar(

                SnackBar(content: Text(state.message)),

              );

            }

          },

        ),

        BlocListener<RepeatGameCubit, RepeatGameState>(

          listener: (context, state) {

            if (state is RepeatGameSuccess) {

              handleRepeatGameSuccess(context, state.newGameId);

            } else if (state is RepeatGameFailure) {

              ScaffoldMessenger.of(context).showSnackBar(

                SnackBar(content: Text(state.message)),

              );

            }

          },

        ),

      ],

      child: Scaffold(

        body: SafeArea(

          child: BlocBuilder<GameDetailBloc, GameDetailState>(

            builder: (context, state) {

              return switch (state) {

                GameDetailInitial() || GameDetailLoading() => Column(

                  crossAxisAlignment: CrossAxisAlignment.stretch,

                  children: [

                    _Header(

                      title: 'Detalle de partida',

                      onBack: () => context.pop(),

                    ),

                    const Expanded(

                      child: Center(child: CircularProgressIndicator()),

                    ),

                  ],

                ),

                GameDetailFailure(:final message) => Column(

                  crossAxisAlignment: CrossAxisAlignment.stretch,

                  children: [

                    _Header(

                      title: 'Detalle de partida',

                      onBack: () => context.pop(),

                    ),

                    Expanded(

                      child: Center(

                        child: Padding(

                          padding: const EdgeInsets.all(24),

                          child: Text(

                            message,

                            textAlign: TextAlign.center,

                            style: Theme.of(context).textTheme.bodyLarge

                                ?.copyWith(color: AppTheme.onSurfaceVariant),

                          ),

                        ),

                      ),

                    ),

                  ],

                ),

                GameDetailLoaded(:final detail) => _LoadedBody(detail: detail),

              };

            },

          ),

        ),

      ),

    );

  }

}



class _LoadedBody extends StatelessWidget {

  const _LoadedBody({required this.detail});



  final GameDetail detail;



  Future<void> _requestDelete(BuildContext context) async {

    final confirmed = await showDeleteGameDialog(

      context,

      source: detail.source,

    );

    if (!confirmed || !context.mounted) {

      return;

    }



    await context.read<DeleteGameFromHistoryCubit>().delete(

          gameId: detail.game.id,

          source: detail.source,

        );

  }



  @override

  Widget build(BuildContext context) {

    final game = detail.game;

    final finishedAt = game.finishedAt;

    final formattedDate = finishedAt != null

        ? const GameHistoryMapper().formatFinishedAt(finishedAt)

        : '—';



    final playersBySeatOrder = List.of(game.players)

      ..sort((a, b) => a.seatOrder.compareTo(b.seatOrder));

    final playerRows = playersBySeatOrder

        .map((player) => (id: player.id, displayName: player.displayName))

        .toList();



    return Column(

      crossAxisAlignment: CrossAxisAlignment.stretch,

      children: [

        _Header(

          title: 'Detalle de partida',

          subtitle: formattedDate,

          onBack: () => context.pop(),

          trailing: SourceBadge(source: detail.source),

        ),

        if (detail.duration != null)

          Padding(

            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),

            child: Text(

              'Duración: ${_formatDuration(detail.duration!)}',

              style: Theme.of(

                context,

              ).textTheme.bodySmall?.copyWith(color: AppTheme.onSurfaceVariant),

            ),

          ),

        Expanded(

          child: ListView(

            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),

            children: [

              FinalRankingCard(entries: detail.finalRanking),

              const SizedBox(height: 16),

              Text(

                'RONDAS',

                style: Theme.of(context).textTheme.labelSmall?.copyWith(

                  color: AppTheme.onSurfaceVariant,

                  letterSpacing: 1.2,

                  fontWeight: FontWeight.w600,

                ),

              ),

              const SizedBox(height: 8),

              ...detail.roundSummaries.map(

                (summary) => Padding(

                  padding: const EdgeInsets.only(bottom: 12),

                  child: RoundSummaryTile(

                    summary: summary,

                    playersBySeatOrder: playerRows,

                  ),

                ),

              ),

            ],

          ),

        ),

        Padding(

          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),

          child: Column(

            crossAxisAlignment: CrossAxisAlignment.stretch,

            children: [

              RepeatGameButton(

                gameId: detail.game.id,

                source: detail.source,

              ),

              const SizedBox(height: 8),

              OutlinedButton.icon(

                onPressed: () => _requestDelete(context),

                style: OutlinedButton.styleFrom(

                  foregroundColor: const Color(0xFFD9772E),

                  side: const BorderSide(color: Color(0xFFD9772E)),

                ),

                icon: const Icon(Icons.delete_outline),

                label: const Text('Eliminar del historial'),

              ),

            ],

          ),

        ),

      ],

    );

  }



  String _formatDuration(Duration duration) {

    final hours = duration.inHours;

    final minutes = duration.inMinutes.remainder(60);

    if (hours > 0) {

      return '${hours}h ${minutes}min';

    }

    return '${duration.inMinutes} min';

  }

}



class _Header extends StatelessWidget {

  const _Header({

    required this.title,

    required this.onBack,

    this.subtitle,

    this.trailing,

  });



  final String title;

  final VoidCallback onBack;

  final String? subtitle;

  final Widget? trailing;



  @override

  Widget build(BuildContext context) {

    return Container(

      margin: const EdgeInsets.fromLTRB(16, 16, 16, 16),

      padding: const EdgeInsets.all(24),

      decoration: BoxDecoration(

        color: AppTheme.primary,

        borderRadius: BorderRadius.circular(20),

      ),

      child: Row(

        crossAxisAlignment: CrossAxisAlignment.start,

        children: [

          IconButton(

            onPressed: onBack,

            icon: const Icon(Icons.arrow_back, color: Colors.white),

          ),

          Expanded(

            child: Column(

              crossAxisAlignment: CrossAxisAlignment.start,

              children: [

                Text(

                  title,

                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(

                    color: Colors.white,

                    fontWeight: FontWeight.bold,

                  ),

                ),

                if (subtitle != null) ...[

                  const SizedBox(height: 4),

                  Text(

                    subtitle!,

                    style: Theme.of(

                      context,

                    ).textTheme.bodyMedium?.copyWith(color: Colors.white70),

                  ),

                ],

              ],

            ),

          ),

          ?trailing,

        ],

      ),

    );

  }

}


