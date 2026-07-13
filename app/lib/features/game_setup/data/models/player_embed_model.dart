class PlayerEmbedModel {
  const PlayerEmbedModel({
    required this.id,
    required this.displayName,
    required this.isGuest,
    required this.userId,
    required this.seatOrder,
    required this.totalScore,
    required this.joinedAt,
  });

  final String id;
  final String displayName;
  final bool isGuest;
  final String? userId;
  final int seatOrder;
  final int totalScore;
  final DateTime joinedAt;

  factory PlayerEmbedModel.fromJson(Map<String, dynamic> json) {
    return PlayerEmbedModel(
      id: json['id'] as String,
      displayName: json['displayName'] as String,
      isGuest: json['isGuest'] as bool,
      userId: json['userId'] as String?,
      seatOrder: json['seatOrder'] as int,
      totalScore: json['totalScore'] as int,
      joinedAt: DateTime.parse(json['joinedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'displayName': displayName,
        'isGuest': isGuest,
        'userId': userId,
        'seatOrder': seatOrder,
        'totalScore': totalScore,
        'joinedAt': joinedAt.toIso8601String(),
      };
}
