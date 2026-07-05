import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_in_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'sign_in_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<AuthRepository>()])
void main() {
  group('SignInUseCase', () {
    late MockAuthRepository repository;
    late SignInUseCase useCase;

    final profile = UserProfile(
      uid: 'uid-1',
      displayName: 'Ana',
      email: 'ana@example.com',
      createdAt: DateTime(2026),
      updatedAt: DateTime(2026),
    );

    setUp(() {
      repository = MockAuthRepository();
      useCase = SignInUseCase(repository);
    });

    test('calls repository when input is valid', () async {
      when(
        repository.signIn(
          email: 'ana@example.com',
          password: 'secret1',
        ),
      ).thenAnswer((_) async => profile);

      final result = await useCase(
        email: 'ana@example.com',
        password: 'secret1',
      );

      expect(result, profile);
      verify(
        repository.signIn(
          email: 'ana@example.com',
          password: 'secret1',
        ),
      ).called(1);
    });

    test('trims email before sign in', () async {
      when(
        repository.signIn(
          email: anyNamed('email'),
          password: anyNamed('password'),
        ),
      ).thenAnswer((_) async => profile);

      await useCase(
        email: '  ana@example.com  ',
        password: 'secret1',
      );

      verify(
        repository.signIn(
          email: 'ana@example.com',
          password: 'secret1',
        ),
      ).called(1);
    });

    test('throws ValidationFailure when email is invalid', () {
      expect(
        () => useCase(
          email: 'bad-email',
          password: 'secret1',
        ),
        throwsA(isA<ValidationFailure>()),
      );
    });

    test('throws ValidationFailure when password is empty', () {
      expect(
        () => useCase(
          email: 'ana@example.com',
          password: '',
        ),
        throwsA(isA<ValidationFailure>()),
      );
    });
  });
}
