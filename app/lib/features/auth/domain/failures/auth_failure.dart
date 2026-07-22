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

final class UserNotFoundFailure extends AuthFailure {
  const UserNotFoundFailure()
      : super('No hay ninguna cuenta asociada a este email.');
}

final class NetworkUnavailableFailure extends AuthFailure {
  const NetworkUnavailableFailure()
      : super('Comprueba tu conexión e inténtalo de nuevo.');
}

final class ValidationFailure extends AuthFailure {
  const ValidationFailure(super.message);
}

final class UnknownAuthFailure extends AuthFailure {
  const UnknownAuthFailure([super.message = 'Ha ocurrido un error inesperado']);
}
