import '../entities/game.dart';

abstract class GameRepository {
  Future<Game> saveDraft(Game game);
}
