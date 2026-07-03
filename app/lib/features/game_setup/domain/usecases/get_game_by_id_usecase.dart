import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class GetGameByIdUseCase {
  GetGameByIdUseCase(this._repository);

  final GameRepository _repository;

  Future<Game?> call(String gameId) => _repository.getGameById(gameId);
}
