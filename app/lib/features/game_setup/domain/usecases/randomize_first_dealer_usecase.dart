import 'dart:math';

import '../entities/player_embed.dart';

class RandomizeFirstDealerUseCase {
  RandomizeFirstDealerUseCase({Random? random}) : _random = random ?? Random();

  final Random _random;

  String call({required List<PlayerEmbed> players}) {
    if (players.isEmpty) {
      throw ArgumentError('Players list must not be empty');
    }
    return players[_random.nextInt(players.length)].id;
  }
}
