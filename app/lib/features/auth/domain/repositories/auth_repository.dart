import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';

abstract class AuthRepository {
  Stream<UserProfile?> get authStateChanges;

  Future<UserProfile> signUp({
    required String email,
    required String password,
    required String displayName,
  });

  Future<UserProfile> signIn({
    required String email,
    required String password,
  });

  Future<void> signOut();

  Future<void> sendPasswordReset({required String email});

  Future<UserProfile?> getCurrentUser();
}
