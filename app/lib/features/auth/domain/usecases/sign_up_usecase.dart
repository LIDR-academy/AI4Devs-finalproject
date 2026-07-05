import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';

class SignUpUseCase {
  const SignUpUseCase(this._repository);

  final AuthRepository _repository;

  static final _emailPattern = RegExp(r'^[^@]+@[^@]+\.[^@]+$');

  Future<UserProfile> call({
    required String email,
    required String password,
    required String displayName,
  }) {
    final trimmedName = displayName.trim();
    final trimmedEmail = email.trim();

    if (trimmedName.isEmpty) {
      throw const ValidationFailure('El nombre es obligatorio');
    }
    if (trimmedEmail.isEmpty || !_emailPattern.hasMatch(trimmedEmail)) {
      throw const ValidationFailure('Introduce un email válido');
    }
    if (password.length < 6) {
      throw const ValidationFailure(
        'La contraseña debe tener al menos 6 caracteres',
      );
    }

    return _repository.signUp(
      email: trimmedEmail,
      password: password,
      displayName: trimmedName,
    );
  }
}
