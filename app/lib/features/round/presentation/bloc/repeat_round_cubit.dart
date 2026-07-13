import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/round/domain/usecases/repeat_round_usecase.dart';

part 'repeat_round_state.dart';

class RepeatRoundCubit extends Cubit<RepeatRoundState> {
  RepeatRoundCubit({required this._repeatRound})
    : super(const RepeatRoundInitial());

  final RepeatRoundUseCase _repeatRound;

  Future<void> repeat({
    required String gameId,
    required int roundNumber,
  }) async {
    emit(const RepeatRoundInProgress());
    try {
      await _repeatRound(gameId: gameId, roundNumber: roundNumber);
      emit(RepeatRoundSuccess(gameId: gameId, roundNumber: roundNumber));
    } catch (error) {
      emit(RepeatRoundFailure(message: error.toString()));
    }
  }
}
