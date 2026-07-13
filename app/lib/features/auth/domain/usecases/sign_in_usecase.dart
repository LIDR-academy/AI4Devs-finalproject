import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';

class SignInUseCase {
  const SignInUseCase(this._repository);

  final AuthRepository _repository;

  static final _emailPattern = RegExp(r'^[^@]+@[^@]+\.[^@]+$');

  Future<UserProfile> call({
    required String email,
    required String password,
  }) {
    final trimmedEmail = email.trim();

    if (trimmedEmail.isEmpty || !_emailPattern.hasMatch(trimmedEmail)) {
      throw const ValidationFailure('Introduce un email válido');
    }
    if (password.isEmpty) {
      throw const ValidationFailure('Introduce tu contraseña');
    }

    return _repository.signIn(email: trimmedEmail, password: password);
  }
}
