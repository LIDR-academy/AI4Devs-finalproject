/// Default short-round sequence used to seed DebugConfigNotifier.
///
/// Runtime toggles live in DebugConfigNotifier (see Home debug panel).
/// These constants are only defaults; prefer the notifier in debug builds.
const bool kShortGameMode = false;
const List<int> kShortRoundSequence = [1, 4, 8, 8, 4, 1];
