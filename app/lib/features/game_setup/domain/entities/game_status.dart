enum GameStatus {
  setup,
  inProgress,
  finished;

  String toStorageString() => switch (this) {
        GameStatus.setup => 'setup',
        GameStatus.inProgress => 'in_progress',
        GameStatus.finished => 'finished',
      };

  static GameStatus fromStorageString(String value) => switch (value) {
        'setup' => GameStatus.setup,
        'in_progress' => GameStatus.inProgress,
        'finished' => GameStatus.finished,
        _ => throw ArgumentError('Unknown game status: $value'),
      };
}
