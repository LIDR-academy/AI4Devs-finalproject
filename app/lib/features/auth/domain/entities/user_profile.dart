import 'package:equatable/equatable.dart';

class UserProfile extends Equatable {
  const UserProfile({
    required this.uid,
    required this.displayName,
    required this.email,
    this.photoUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  final String uid;
  final String displayName;
  final String email;
  final String? photoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  List<Object?> get props => [
        uid,
        displayName,
        email,
        photoUrl,
        createdAt,
        updatedAt,
      ];
}
