sealed class AuthFailure implements Exception {
  const AuthFailure(this.message);

  final String message;

  @override
  String toString() => message;
}

final class EmailAlreadyInUseFailure extends AuthFailure {
  const EmailAlreadyInUseFailure()
      : super('Este email ya está registrado');
}

final class InvalidCredentialsFailure extends AuthFailure {
  const InvalidCredentialsFailure()
      : super('Email o contraseña incorrectos');
}

final class NetworkUnavailableFailure extends AuthFailure {
  const NetworkUnavailableFailure()
      : super('Sin conexión. Comprueba tu red');
}

final class ValidationFailure extends AuthFailure {
  const ValidationFailure(super.message);
}

final class UnknownAuthFailure extends AuthFailure {
  const UnknownAuthFailure([super.message = 'Ha ocurrido un error inesperado']);
}
