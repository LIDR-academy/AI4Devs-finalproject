import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';

class UserProfileModel {
  const UserProfileModel({
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

  factory UserProfileModel.fromFirestore(
    String uid,
    Map<String, dynamic> data,
  ) {
    return UserProfileModel(
      uid: uid,
      displayName: data['displayName'] as String? ?? '',
      email: data['email'] as String? ?? '',
      photoUrl: data['photoUrl'] as String?,
      createdAt: _readTimestamp(data['createdAt']),
      updatedAt: _readTimestamp(data['updatedAt']),
    );
  }

  factory UserProfileModel.fromEntity(UserProfile profile) {
    return UserProfileModel(
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      photoUrl: profile.photoUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    );
  }

  UserProfile toEntity() {
    return UserProfile(
      uid: uid,
      displayName: displayName,
      email: email,
      photoUrl: photoUrl,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  Map<String, dynamic> toFirestore({bool isCreate = false}) {
    return {
      'displayName': displayName,
      'email': email,
      if (photoUrl != null) 'photoUrl': photoUrl,
      if (isCreate) 'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  static DateTime _readTimestamp(dynamic value) {
    if (value is Timestamp) {
      return value.toDate();
    }
    if (value is DateTime) {
      return value;
    }
    return DateTime.fromMillisecondsSinceEpoch(0);
  }
}
