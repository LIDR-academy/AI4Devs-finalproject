import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:la_pocha/features/auth/data/models/user_profile_model.dart';

class UserFirestoreDatasource {
  UserFirestoreDatasource(this._firestore);

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> get _users =>
      _firestore.collection('users');

  Future<UserProfileModel?> getProfile(String uid) async {
    final snapshot = await _users.doc(uid).get();
    if (!snapshot.exists || snapshot.data() == null) {
      return null;
    }
    return UserProfileModel.fromFirestore(uid, snapshot.data()!);
  }

  Future<UserProfileModel> upsertProfile({
    required String uid,
    required String displayName,
    required String email,
    String? photoUrl,
    bool isCreate = false,
  }) async {
    final model = UserProfileModel(
      uid: uid,
      displayName: displayName,
      email: email,
      photoUrl: photoUrl,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    await _users.doc(uid).set(
          model.toFirestore(isCreate: isCreate),
          SetOptions(merge: true),
        );

    final saved = await getProfile(uid);
    return saved ?? model;
  }

  Future<UserProfileModel> touchProfile({
    required String uid,
    required String email,
  }) async {
    await _users.doc(uid).set(
      {
        'email': email,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );

    final saved = await getProfile(uid);
    if (saved != null) {
      return saved;
    }

    return UserProfileModel(
      uid: uid,
      displayName: email.split('@').first,
      email: email,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }
}
