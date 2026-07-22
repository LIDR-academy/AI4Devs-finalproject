import 'package:bloc_test/bloc_test.dart';
import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart'
    as domain;
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/auth/domain/usecases/send_password_reset_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_in_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_out_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_up_usecase.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'auth_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<AuthRepository>(),
  MockSpec<SignInUseCase>(),
  MockSpec<SignUpUseCase>(),
  MockSpec<SignOutUseCase>(),
  MockSpec<SendPasswordResetUseCase>(),
])
void main() {
  late MockAuthRepository authRepository;
  late MockSignInUseCase signIn;
  late MockSignUpUseCase signUp;
  late MockSignOutUseCase signOut;
  late MockSendPasswordResetUseCase sendPasswordReset;

  final profile = UserProfile(
    uid: 'uid-1',
    displayName: 'Ana',
    email: 'ana@example.com',
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  AuthBloc buildBloc() => AuthBloc(
        authRepository: authRepository,
        signIn: signIn,
        signUp: signUp,
        signOut: signOut,
        sendPasswordReset: sendPasswordReset,
      );

  setUp(() {
    authRepository = MockAuthRepository();
    signIn = MockSignInUseCase();
    signUp = MockSignUpUseCase();
    signOut = MockSignOutUseCase();
    sendPasswordReset = MockSendPasswordResetUseCase();
    when(authRepository.authStateChanges).thenAnswer((_) => const Stream.empty());
  });

  blocTest<AuthBloc, AuthState>(
    'emits Authenticated when sign in succeeds',
    build: buildBloc,
    setUp: () {
      when(signIn(email: 'ana@example.com', password: 'secret1'))
          .thenAnswer((_) async => profile);
    },
    act: (bloc) => bloc.add(
      const SignInSubmitted(
        email: 'ana@example.com',
        password: 'secret1',
      ),
    ),
    expect: () => [
      const AuthLoading(),
      Authenticated(profile),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits AuthFailure then Unauthenticated when sign in fails',
    build: buildBloc,
    setUp: () {
      when(signIn(email: 'ana@example.com', password: 'bad'))
          .thenThrow(const domain.InvalidCredentialsFailure());
    },
    act: (bloc) => bloc.add(
      const SignInSubmitted(
        email: 'ana@example.com',
        password: 'bad',
      ),
    ),
    expect: () => [
      const AuthLoading(),
      const AuthFailure(message: 'Email o contraseña incorrectos'),
      const Unauthenticated(),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits Authenticated when sign up succeeds',
    build: buildBloc,
    setUp: () {
      when(
        signUp(
          email: 'ana@example.com',
          password: 'secret1',
          displayName: 'Ana',
        ),
      ).thenAnswer((_) async => profile);
    },
    act: (bloc) => bloc.add(
      const SignUpSubmitted(
        displayName: 'Ana',
        email: 'ana@example.com',
        password: 'secret1',
      ),
    ),
    expect: () => [
      const AuthLoading(),
      Authenticated(profile),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits Unauthenticated when sign out succeeds',
    build: buildBloc,
    seed: () => Authenticated(profile),
    setUp: () {
      when(signOut()).thenAnswer((_) async {});
    },
    act: (bloc) => bloc.add(const SignOutRequested()),
    expect: () => [
      const AuthLoading(),
      const Unauthenticated(),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits Authenticated from auth state changes',
    build: buildBloc,
    setUp: () {
      when(authRepository.authStateChanges).thenAnswer(
        (_) => Stream.value(profile),
      );
    },
    act: (bloc) => bloc.add(const AuthStarted()),
    expect: () => [
      Authenticated(profile),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits PasswordResetEmailSent then Unauthenticated when reset succeeds',
    build: buildBloc,
    setUp: () {
      when(sendPasswordReset(email: 'ana@example.com'))
          .thenAnswer((_) async {});
    },
    act: (bloc) => bloc.add(
      const PasswordResetRequested(email: 'ana@example.com'),
    ),
    expect: () => [
      const PasswordResetEmailSent(),
      const Unauthenticated(),
    ],
  );

  blocTest<AuthBloc, AuthState>(
    'emits AuthFailure then Unauthenticated when reset fails',
    build: buildBloc,
    setUp: () {
      when(sendPasswordReset(email: 'missing@example.com'))
          .thenThrow(const domain.UserNotFoundFailure());
    },
    act: (bloc) => bloc.add(
      const PasswordResetRequested(email: 'missing@example.com'),
    ),
    expect: () => [
      const AuthFailure(
        message: 'No hay ninguna cuenta asociada a este email.',
      ),
      const Unauthenticated(),
    ],
  );
}
