import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart' as domain;
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/auth/domain/usecases/send_password_reset_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_in_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_out_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_up_usecase.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc({
    required this._authRepository,
    required this._signIn,
    required this._signUp,
    required this._signOut,
    required this._sendPasswordReset,
  }) : super(const AuthInitial()) {
    on<AuthStarted>(_onStarted);
    on<SignInSubmitted>(_onSignInSubmitted);
    on<SignUpSubmitted>(_onSignUpSubmitted);
    on<SignOutRequested>(_onSignOutRequested);
    on<PasswordResetRequested>(_onPasswordResetRequested);
    on<_AuthUserChanged>(_onAuthUserChanged);
  }

  final AuthRepository _authRepository;
  final SignInUseCase _signIn;
  final SignUpUseCase _signUp;
  final SignOutUseCase _signOut;
  final SendPasswordResetUseCase _sendPasswordReset;
  StreamSubscription<UserProfile?>? _authSubscription;

  Future<void> _onStarted(
    AuthStarted event,
    Emitter<AuthState> emit,
  ) async {
    await _authSubscription?.cancel();
    _authSubscription = _authRepository.authStateChanges.listen(
      (user) => add(_AuthUserChanged(user)),
    );
  }

  void _onAuthUserChanged(
    _AuthUserChanged event,
    Emitter<AuthState> emit,
  ) {
    if (event.user != null) {
      emit(Authenticated(event.user!));
    } else if (state is! AuthLoading) {
      emit(const Unauthenticated());
    }
  }

  Future<void> _onSignInSubmitted(
    SignInSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await _signIn(email: event.email, password: event.password);
      emit(Authenticated(user));
    } on domain.AuthFailure catch (error) {
      emit(AuthFailure(message: error.message));
      emit(const Unauthenticated());
    }
  }

  Future<void> _onSignUpSubmitted(
    SignUpSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await _signUp(
        email: event.email,
        password: event.password,
        displayName: event.displayName,
      );
      emit(Authenticated(user));
    } on domain.AuthFailure catch (error) {
      emit(AuthFailure(message: error.message));
      emit(const Unauthenticated());
    }
  }

  Future<void> _onSignOutRequested(
    SignOutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      await _signOut();
      emit(const Unauthenticated());
    } on domain.AuthFailure catch (error) {
      emit(AuthFailure(message: error.message));
      final user = await _authRepository.getCurrentUser();
      if (user != null) {
        emit(Authenticated(user));
      } else {
        emit(const Unauthenticated());
      }
    }
  }

  Future<void> _onPasswordResetRequested(
    PasswordResetRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _sendPasswordReset(email: event.email);
      emit(const PasswordResetEmailSent());
      emit(const Unauthenticated());
    } on domain.AuthFailure catch (error) {
      emit(AuthFailure(message: error.message));
      emit(const Unauthenticated());
    }
  }

  @override
  Future<void> close() {
    _authSubscription?.cancel();
    return super.close();
  }
}
