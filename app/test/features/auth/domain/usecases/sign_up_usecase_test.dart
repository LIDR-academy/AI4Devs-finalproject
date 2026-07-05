import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_up_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'sign_up_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<AuthRepository>()])
void main() {
  group('SignUpUseCase', () {
    late MockAuthRepository repository;
    late SignUpUseCase useCase;

    final profile = UserProfile(
      uid: 'uid-1',
      displayName: 'Ana',
      email: 'ana@example.com',
      createdAt: DateTime(2026),
      updatedAt: DateTime(2026),
    );

    setUp(() {
      repository = MockAuthRepository();
      useCase = SignUpUseCase(repository);
    });

    test('calls repository when input is valid', () async {
      when(
        repository.signUp(
          email: 'ana@example.com',
          password: 'secret1',
          displayName: 'Ana',
        ),
      ).thenAnswer((_) async => profile);

      final result = await useCase(
        email: 'ana@example.com',
        password: 'secret1',
        displayName: 'Ana',
      );

      expect(result, profile);
      verify(
        repository.signUp(
          email: 'ana@example.com',
          password: 'secret1',
          displayName: 'Ana',
        ),
      ).called(1);
    });

    test('trims display name and email', () async {
      when(
        repository.signUp(
          email: anyNamed('email'),
          password: anyNamed('password'),
          displayName: anyNamed('displayName'),
        ),
      ).thenAnswer((_) async => profile);

      await useCase(
        email: '  ana@example.com  ',
        password: 'secret1',
        displayName: '  Ana  ',
      );

      verify(
        repository.signUp(
          email: 'ana@example.com',
          password: 'secret1',
          displayName: 'Ana',
        ),
      ).called(1);
    });

    test('throws ValidationFailure when display name is empty', () {
      expect(
        () => useCase(
          email: 'ana@example.com',
          password: 'secret1',
          displayName: '   ',
        ),
        throwsA(isA<ValidationFailure>()),
      );
    });

    test('throws ValidationFailure when email is invalid', () {
      expect(
        () => useCase(
          email: 'not-an-email',
          password: 'secret1',
          displayName: 'Ana',
        ),
        throwsA(isA<ValidationFailure>()),
      );
    });

    test('throws ValidationFailure when password is shorter than 6', () {
      expect(
        () => useCase(
          email: 'ana@example.com',
          password: '12345',
          displayName: 'Ana',
        ),
        throwsA(isA<ValidationFailure>()),
      );
    });
  });
}
