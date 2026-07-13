import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_tricks_usecase.dart';

class CloseRoundUseCase {
  CloseRoundUseCase(
    this._gameRepository,
    this._submitTricks,
  );

  final GameRepository _gameRepository;
  final SubmitTricksUseCase _submitTricks;

  Future<Round> call({
    required String gameId,
    required Round round,
    required List<PlayerEmbed> players,
    required Map<String, int> tricks,
  }) async {
    if (round.status != RoundStatus.playing) {
      throw StateError('Round is not in playing status');
    }

    final playerIds = players.map((player) => player.id).toList();
    final scoresDelta = _submitTricks(
      round: round,
      tricks: tricks,
      playerIds: playerIds,
    );

    final closedAt = DateTime.now();
    final closedRound = round.copyWith(
      tricks: tricks,
      scoresDelta: scoresDelta,
      status: RoundStatus.closed,
      closedAt: closedAt,
    );

    final updatedPlayers = players
        .map(
          (player) => player.copyWith(
            totalScore: player.totalScore + (scoresDelta[player.id] ?? 0),
          ),
        )
        .toList();

    return _gameRepository.closeRoundAndUpdateScores(
      closedRound: closedRound,
      updatedPlayers: updatedPlayers,
    );
  }
}
