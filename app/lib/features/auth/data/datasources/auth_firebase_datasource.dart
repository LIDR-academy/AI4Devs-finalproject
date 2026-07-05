import 'package:firebase_auth/firebase_auth.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';

class AuthFirebaseDatasource {
  AuthFirebaseDatasource(this._auth);

  final FirebaseAuth _auth;

  Stream<User?> authStateChanges() => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  Future<UserCredential> createUserWithEmailAndPassword({
    required String email,
    required String password,
  }) {
    return _wrapAuthCall(
      () => _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      ),
    );
  }

  Future<UserCredential> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) {
    return _wrapAuthCall(
      () => _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      ),
    );
  }

  Future<void> signOut() {
    return _wrapAuthCall(_auth.signOut);
  }

  Future<T> _wrapAuthCall<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on FirebaseAuthException catch (error) {
      throw _mapAuthException(error);
    }
  }

  AuthFailure _mapAuthException(FirebaseAuthException error) {
    return switch (error.code) {
      'email-already-in-use' => const EmailAlreadyInUseFailure(),
      'invalid-credential' ||
      'wrong-password' ||
      'user-not-found' ||
      'invalid-email' =>
        const InvalidCredentialsFailure(),
      'network-request-failed' => const NetworkUnavailableFailure(),
      _ => UnknownAuthFailure(error.message ?? 'Ha ocurrido un error inesperado'),
    };
  }
}
