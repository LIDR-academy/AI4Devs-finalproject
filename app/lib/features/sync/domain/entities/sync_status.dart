enum SyncStatus {
  local,
  pending,
  synced,
  failed;

  String toStorageString() => name;

  static SyncStatus? fromStorageString(String? value) {
    if (value == null) {
      return null;
    }
    return SyncStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => SyncStatus.local,
    );
  }
}
