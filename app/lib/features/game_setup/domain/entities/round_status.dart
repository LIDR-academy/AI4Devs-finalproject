enum RoundStatus {
  bidding,
  playing,
  closed;

  String toStorageString() => switch (this) {
        RoundStatus.bidding => 'bidding',
        RoundStatus.playing => 'playing',
        RoundStatus.closed => 'closed',
      };

  static RoundStatus fromStorageString(String value) => switch (value) {
        'bidding' => RoundStatus.bidding,
        'playing' => RoundStatus.playing,
        'closed' => RoundStatus.closed,
        _ => throw ArgumentError('Unknown round status: $value'),
      };
}
