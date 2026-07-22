import 'package:la_pocha/features/auth/domain/failures/auth_failure.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/auth/domain/usecases/send_password_reset_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'send_password_reset_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<AuthRepository>()])
void main() {
  group('SendPasswordResetUseCase', () {
    late MockAuthRepository repository;
    late SendPasswordResetUseCase useCase;

    setUp(() {
      repository = MockAuthRepository();
      useCase = SendPasswordResetUseCase(repository);
    });

    test('calls repository when email is valid', () async {
      when(
        repository.sendPasswordReset(email: 'ana@example.com'),
      ).thenAnswer((_) async {});

      await useCase(email: 'ana@example.com');

      verify(
        repository.sendPasswordReset(email: 'ana@example.com'),
      ).called(1);
    });

    test('trims email before calling repository', () async {
      when(
        repository.sendPasswordReset(email: anyNamed('email')),
      ).thenAnswer((_) async {});

      await useCase(email: '  ana@example.com  ');

      verify(
        repository.sendPasswordReset(email: 'ana@example.com'),
      ).called(1);
    });

    test('throws ValidationFailure and does not call repository when email is invalid',
        () async {
      expect(
        () => useCase(email: 'bad-email'),
        throwsA(isA<ValidationFailure>()),
      );

      verifyNever(repository.sendPasswordReset(email: anyNamed('email')));
    });

    test('throws ValidationFailure when email is empty', () async {
      expect(
        () => useCase(email: '   '),
        throwsA(isA<ValidationFailure>()),
      );

      verifyNever(repository.sendPasswordReset(email: anyNamed('email')));
    });
  });
}
