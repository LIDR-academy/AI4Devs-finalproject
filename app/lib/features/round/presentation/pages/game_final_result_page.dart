import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/widgets/pocha_app_bar.dart';
import 'package:la_pocha/core/widgets/warning_banner.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:la_pocha/features/round/domain/services/ranking_service.dart';
import 'package:la_pocha/features/round/presentation/widgets/ranking_list.dart';

class GameFinalResultPage extends StatefulWidget {
  const GameFinalResultPage({super.key, required this.gameId});

  final String gameId;

  @override
  State<GameFinalResultPage> createState() => _GameFinalResultPageState();
}

class _GameFinalResultPageState extends State<GameFinalResultPage> {
  late Future<_FinalResultData> _loadFuture;

  @override
  void initState() {
    super.initState();
    _loadFuture = _loadFinalResult();
  }

  Future<_FinalResultData> _loadFinalResult() async {
    final gameRepository = getIt<GameRepository>();
    final roundRepository = getIt<RoundRepository>();
    const rankingService = RankingService();

    final game = await gameRepository.getGameById(widget.gameId);
    if (game == null) {
      throw StateError('Game not found: ${widget.gameId}');
    }

    final lastRoundNumber = game.currentRoundNumber ?? game.roundSequence.length;
    final lastRound = await roundRepository.getRoundByGameAndNumber(
      widget.gameId,
      lastRoundNumber,
    );

    final scoresDelta = lastRound?.scoresDelta ?? {};
    final entries = rankingService.buildRanking(
      players: game.players,
      scoresDelta: scoresDelta,
      includePositionDelta: false,
    );

    return _FinalResultData(
      entries: entries,
      roundCount: game.roundSequence.length,
      winnerName: entries.isNotEmpty
          ? entries.first.player.displayName
          : '',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<_FinalResultData>(
          future: _loadFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(snapshot.error.toString()),
                ),
              );
            }

            final data = snapshot.data!;
            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  PochaAppBar(
                    title: 'Resultado final',
                    subtitle:
                        '${data.roundCount} rondas · Ganador: ${data.winnerName}',
                    leading: IconButton(
                      onPressed: () => context.go('/'),
                      icon: const Icon(Icons.home, color: Colors.white),
                    ),
                  ),
                  const _SignUpBanner(),
                  RankingList(
                    entries: data.entries,
                    showPositionDelta: false,
                    shrinkWrap: true,
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: OutlinedButton(
                      onPressed: () => context.go('/'),
                      child: const Text('Nueva partida'),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SignUpBanner extends StatelessWidget {
  const _SignUpBanner();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        if (authState is Authenticated) {
          return const SizedBox.shrink();
        }
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: WarningBanner(
            message:
                'Crea una cuenta para guardar y compartir esta partida',
            icon: Icons.cloud_upload_outlined,
            onTap: () => context.push('/auth/sign-up'),
          ),
        );
      },
    );
  }
}

class _FinalResultData {
  const _FinalResultData({
    required this.entries,
    required this.roundCount,
    required this.winnerName,
  });

  final List<RankingEntry> entries;
  final int roundCount;
  final String winnerName;
}
