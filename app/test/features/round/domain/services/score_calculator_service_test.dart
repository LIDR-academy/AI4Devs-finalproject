import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/round/domain/services/score_calculator_service.dart';

void main() {
  const calculator = ScoreCalculatorService();

  group('ScoreCalculatorService', () {
    test('returns 10 + 5×tricks when bid matches tricks', () {
      expect(calculator.calculateRoundScore(bid: 3, tricks: 3), 25);
      expect(calculator.calculateRoundScore(bid: 0, tricks: 0), 10);
    });

    test('returns -5×|bid - tricks| when bid differs from tricks', () {
      expect(calculator.calculateRoundScore(bid: 3, tricks: 1), -10);
      expect(calculator.calculateRoundScore(bid: 1, tricks: 3), -10);
    });

    test('handles zero tricks with non-zero bid', () {
      expect(calculator.calculateRoundScore(bid: 2, tricks: 0), -10);
    });
  });
}
