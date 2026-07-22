part of 'auth_bloc.dart';

sealed class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

final class AuthStarted extends AuthEvent {
  const AuthStarted();
}

final class SignInSubmitted extends AuthEvent {
  const SignInSubmitted({
    required this.email,
    required this.password,
  });

  final String email;
  final String password;

  @override
  List<Object?> get props => [email, password];
}

final class SignUpSubmitted extends AuthEvent {
  const SignUpSubmitted({
    required this.displayName,
    required this.email,
    required this.password,
  });

  final String displayName;
  final String email;
  final String password;

  @override
  List<Object?> get props => [displayName, email, password];
}

final class SignOutRequested extends AuthEvent {
  const SignOutRequested();
}

final class PasswordResetRequested extends AuthEvent {
  const PasswordResetRequested({required this.email});

  final String email;

  @override
  List<Object?> get props => [email];
}

final class _AuthUserChanged extends AuthEvent {
  const _AuthUserChanged(this.user);

  final UserProfile? user;

  @override
  List<Object?> get props => [user];
}
