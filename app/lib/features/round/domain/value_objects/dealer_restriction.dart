import 'package:equatable/equatable.dart';

class DealerRestriction extends Equatable {
  const DealerRestriction({
    required this.partialBidSum,
    required this.availableTricks,
    required this.forbiddenBidForDealer,
  });

  final int partialBidSum;
  final int availableTricks;
  final int forbiddenBidForDealer;

  @override
  List<Object?> get props => [
        partialBidSum,
        availableTricks,
        forbiddenBidForDealer,
      ];
}
