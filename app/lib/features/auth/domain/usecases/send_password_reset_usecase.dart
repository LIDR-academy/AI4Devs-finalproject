import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';

class SendPasswordResetUseCase {
  const SendPasswordResetUseCase(this._repository);

  final AuthRepository _repository;

  static final _emailPattern = RegExp(r'^[^@]+@[^@]+\.[^@]+$');

  Future<void> call({required String email}) {
    final trimmedEmail = email.trim();

    if (trimmedEmail.isEmpty || !_emailPattern.hasMatch(trimmedEmail)) {
      throw const ValidationFailure('Introduce un email válido');
    }

    return _repository.sendPasswordReset(email: trimmedEmail);
  }
}
