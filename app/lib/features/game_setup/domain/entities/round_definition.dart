import 'package:equatable/equatable.dart';

class RoundDefinition extends Equatable {
  const RoundDefinition({
    required this.roundNumber,
    required this.cardsPerPlayer,
  });

  final int roundNumber;
  final int cardsPerPlayer;

  factory RoundDefinition.fromJson(Map<String, dynamic> json) {
    return RoundDefinition(
      roundNumber: json['roundNumber'] as int,
      cardsPerPlayer: json['cardsPerPlayer'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'roundNumber': roundNumber,
        'cardsPerPlayer': cardsPerPlayer,
      };

  @override
  List<Object?> get props => [roundNumber, cardsPerPlayer];
}
