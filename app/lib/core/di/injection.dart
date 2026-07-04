import 'package:get_it/get_it.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/data/datasources/round_local_datasource.dart';
import 'package:la_pocha/features/game_setup/data/repositories/game_repository_impl.dart';
import 'package:la_pocha/features/game_setup/data/repositories/round_repository_impl.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/game_setup/domain/services/dealer_rotation_service.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/randomize_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/reorder_players_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/set_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/start_game_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/create_game_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/game_setup_bloc.dart';
import 'package:la_pocha/features/round/domain/services/bid_order_service.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';
import 'package:la_pocha/features/round/domain/services/score_calculator_service.dart';
import 'package:la_pocha/features/round/domain/services/ranking_service.dart';
import 'package:la_pocha/features/round/domain/services/tricks_sum_validator.dart';
import 'package:la_pocha/features/round/domain/usecases/advance_to_next_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/close_bidding_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/close_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/finish_game_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_result_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/load_bidding_context_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_bid_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_tricks_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_bloc.dart';

final GetIt getIt = GetIt.instance;

Future<void> configureDependencies() async {
  if (getIt.isRegistered<AppDatabase>()) {
    return;
  }

  getIt.registerLazySingleton<AppDatabase>(AppDatabase.defaults);

  getIt.registerLazySingleton<GameLocalDatasource>(
    () => GameLocalDatasource(getIt<AppDatabase>()),
  );

  getIt.registerLazySingleton<RoundLocalDatasource>(
    () => RoundLocalDatasource(getIt<AppDatabase>()),
  );

  getIt.registerLazySingleton<GameRepository>(
    () => GameRepositoryImpl(getIt<GameLocalDatasource>()),
  );

  getIt.registerLazySingleton<RoundRepository>(
    () => RoundRepositoryImpl(getIt<RoundLocalDatasource>()),
  );

  getIt.registerLazySingleton<DealerRotationService>(
    () => const DealerRotationService(),
  );

  getIt.registerLazySingleton<BidOrderService>(
    () => const BidOrderService(),
  );

  getIt.registerLazySingleton<DealerRestrictionValidator>(
    () => const DealerRestrictionValidator(),
  );

  getIt.registerLazySingleton<ScoreCalculatorService>(
    () => const ScoreCalculatorService(),
  );

  getIt.registerLazySingleton<TricksSumValidator>(
    () => const TricksSumValidator(),
  );

  getIt.registerLazySingleton<RankingService>(
    () => const RankingService(),
  );

  getIt.registerFactory<LoadBiddingContextUseCase>(
    () => LoadBiddingContextUseCase(
      getIt<GameRepository>(),
      getIt<RoundRepository>(),
      bidOrderService: getIt<BidOrderService>(),
    ),
  );

  getIt.registerFactory<SubmitBidUseCase>(
    () => SubmitBidUseCase(
      getIt<RoundRepository>(),
      validator: getIt<DealerRestrictionValidator>(),
    ),
  );

  getIt.registerFactory<CloseBiddingUseCase>(
    () => CloseBiddingUseCase(
      getIt<RoundRepository>(),
      validator: getIt<DealerRestrictionValidator>(),
    ),
  );

  getIt.registerFactory<GetRoundPlayStateUseCase>(
    () => GetRoundPlayStateUseCase(
      getIt<GameRepository>(),
      getIt<RoundRepository>(),
      validator: getIt<DealerRestrictionValidator>(),
    ),
  );

  getIt.registerFactory<SubmitTricksUseCase>(
    () => SubmitTricksUseCase(
      getIt<ScoreCalculatorService>(),
      getIt<TricksSumValidator>(),
    ),
  );

  getIt.registerFactory<CloseRoundUseCase>(
    () => CloseRoundUseCase(
      getIt<GameRepository>(),
      getIt<SubmitTricksUseCase>(),
    ),
  );

  getIt.registerFactory<GetRoundResultUseCase>(
    () => GetRoundResultUseCase(
      getIt<GameRepository>(),
      getIt<RoundRepository>(),
      rankingService: getIt<RankingService>(),
    ),
  );

  getIt.registerFactory<AdvanceToNextRoundUseCase>(
    () => AdvanceToNextRoundUseCase(
      getIt<GameRepository>(),
      getIt<DealerRotationService>(),
    ),
  );

  getIt.registerFactory<FinishGameUseCase>(
    () => FinishGameUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<CreateGameDraftUseCase>(
    () => CreateGameDraftUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<GetGameByIdUseCase>(
    () => GetGameByIdUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<AddPlayerUseCase>(
    () => AddPlayerUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<RemovePlayerUseCase>(
    () => RemovePlayerUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<ReorderPlayersUseCase>(
    () => const ReorderPlayersUseCase(),
  );

  getIt.registerFactory<SetFirstDealerUseCase>(
    () => const SetFirstDealerUseCase(),
  );

  getIt.registerFactory<RandomizeFirstDealerUseCase>(
    () => RandomizeFirstDealerUseCase(),
  );

  getIt.registerFactory<StartGameUseCase>(
    () => StartGameUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<CreateGameBloc>(
    () => CreateGameBloc(createGameDraft: getIt<CreateGameDraftUseCase>()),
  );

  getIt.registerFactory<AddPlayersBloc>(
    () => AddPlayersBloc(
      getGameById: getIt<GetGameByIdUseCase>(),
      addPlayer: getIt<AddPlayerUseCase>(),
      removePlayer: getIt<RemovePlayerUseCase>(),
    ),
  );

  getIt.registerFactory<GameSetupBloc>(
    () => GameSetupBloc(
      getGameById: getIt<GetGameByIdUseCase>(),
      reorderPlayers: getIt<ReorderPlayersUseCase>(),
      setFirstDealer: getIt<SetFirstDealerUseCase>(),
      randomizeFirstDealer: getIt<RandomizeFirstDealerUseCase>(),
      startGame: getIt<StartGameUseCase>(),
    ),
  );

  getIt.registerFactory<BiddingBloc>(
    () => BiddingBloc(
      loadBiddingContext: getIt<LoadBiddingContextUseCase>(),
      submitBid: getIt<SubmitBidUseCase>(),
      closeBidding: getIt<CloseBiddingUseCase>(),
      validator: getIt<DealerRestrictionValidator>(),
    ),
  );

  getIt.registerFactory<PlayStateBloc>(
    () => PlayStateBloc(
      getRoundPlayState: getIt<GetRoundPlayStateUseCase>(),
    ),
  );

  getIt.registerFactory<ScoringBloc>(
    () => ScoringBloc(
      getRoundPlayState: getIt<GetRoundPlayStateUseCase>(),
      submitTricks: getIt<SubmitTricksUseCase>(),
      closeRound: getIt<CloseRoundUseCase>(),
      validator: getIt<TricksSumValidator>(),
    ),
  );

  getIt.registerFactory<RoundResultBloc>(
    () => RoundResultBloc(
      getRoundResult: getIt<GetRoundResultUseCase>(),
      advanceToNextRound: getIt<AdvanceToNextRoundUseCase>(),
      finishGame: getIt<FinishGameUseCase>(),
    ),
  );
}
