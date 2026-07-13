import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
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
import 'package:la_pocha/features/game_setup/domain/usecases/cancel_game_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/randomize_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/reorder_players_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/set_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/start_game_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/cancel_game_cubit.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/create_game_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/game_setup_bloc.dart';
import 'package:la_pocha/features/round/domain/services/bid_order_service.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';
import 'package:la_pocha/features/round/domain/services/score_calculator_service.dart';
import 'package:la_pocha/features/round/domain/services/ranking_service.dart';
import 'package:la_pocha/features/round/domain/services/tricks_sum_validator.dart';
import 'package:la_pocha/features/round/domain/usecases/advance_to_next_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/close_bidding_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/correct_bids_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/close_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/repeat_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/finish_game_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_result_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/load_bidding_context_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_bid_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_tricks_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/repeat_round_cubit.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_bloc.dart';
import 'package:la_pocha/features/history/data/datasources/hidden_games_local_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_firestore_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_local_datasource.dart';
import 'package:la_pocha/features/history/data/repositories/history_repository_impl.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';
import 'package:la_pocha/features/history/domain/services/game_detail_mapper.dart';
import 'package:la_pocha/features/history/domain/usecases/delete_local_game_usecase.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_detail_usecase.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_history_usecase.dart';
import 'package:la_pocha/features/history/domain/usecases/hide_cloud_game_usecase.dart';
import 'package:la_pocha/features/history/presentation/bloc/delete_game_from_history_cubit.dart';
import 'package:la_pocha/features/history/presentation/bloc/game_detail_bloc.dart';
import 'package:la_pocha/features/history/presentation/bloc/history_list_bloc.dart';
import 'package:la_pocha/features/auth/data/datasources/auth_firebase_datasource.dart';
import 'package:la_pocha/features/auth/data/datasources/user_firestore_datasource.dart';
import 'package:la_pocha/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_in_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_out_usecase.dart';
import 'package:la_pocha/features/auth/domain/usecases/sign_up_usecase.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';
import 'package:la_pocha/features/sync/data/repositories/game_sync_repository_impl.dart';
import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';
import 'package:la_pocha/features/sync/domain/usecases/retry_pending_uploads_usecase.dart';
import 'package:la_pocha/features/sync/domain/usecases/upload_finished_game_usecase.dart';
import 'package:la_pocha/features/sync/presentation/bloc/game_sync_bloc.dart';

final GetIt getIt = GetIt.instance;

Future<void> configureDependencies() async {
  if (getIt.isRegistered<AppDatabase>()) {
    return;
  }

  getIt.registerLazySingleton<AppDatabase>(AppDatabase.defaults);

  getIt.registerLazySingleton<FirebaseAuth>(() => FirebaseAuth.instance);
  getIt.registerLazySingleton<FirebaseFirestore>(
    () => FirebaseFirestore.instance,
  );

  getIt.registerLazySingleton<AuthFirebaseDatasource>(
    () => AuthFirebaseDatasource(getIt<FirebaseAuth>()),
  );

  getIt.registerLazySingleton<UserFirestoreDatasource>(
    () => UserFirestoreDatasource(getIt<FirebaseFirestore>()),
  );

  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      authDatasource: getIt<AuthFirebaseDatasource>(),
      userDatasource: getIt<UserFirestoreDatasource>(),
    ),
  );

  getIt.registerLazySingleton<SignUpUseCase>(
    () => SignUpUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<SignInUseCase>(
    () => SignInUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<SignOutUseCase>(
    () => SignOutUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<GetCurrentUserUseCase>(
    () => GetCurrentUserUseCase(getIt<AuthRepository>()),
  );

  getIt.registerLazySingleton<GameFirestoreDatasource>(
    () => GameFirestoreDatasource(getIt<FirebaseFirestore>()),
  );

  getIt.registerLazySingleton<GameSyncRepository>(
    () => GameSyncRepositoryImpl(
      gameLocalDatasource: getIt<GameLocalDatasource>(),
      roundLocalDatasource: getIt<RoundLocalDatasource>(),
      firestoreDatasource: getIt<GameFirestoreDatasource>(),
    ),
  );

  getIt.registerLazySingleton<UploadFinishedGameUseCase>(
    () => UploadFinishedGameUseCase(
      authRepository: getIt<AuthRepository>(),
      gameSyncRepository: getIt<GameSyncRepository>(),
      gameLocalDatasource: getIt<GameLocalDatasource>(),
    ),
  );

  getIt.registerLazySingleton<RetryPendingUploadsUseCase>(
    () => RetryPendingUploadsUseCase(
      gameSyncRepository: getIt<GameSyncRepository>(),
      uploadFinishedGame: getIt<UploadFinishedGameUseCase>(),
    ),
  );

  getIt.registerLazySingleton<GameSyncBloc>(
    () => GameSyncBloc(
      uploadFinishedGame: getIt<UploadFinishedGameUseCase>(),
    ),
  );

  getIt.registerLazySingleton<AuthBloc>(
    () => AuthBloc(
      authRepository: getIt<AuthRepository>(),
      signIn: getIt<SignInUseCase>(),
      signUp: getIt<SignUpUseCase>(),
      signOut: getIt<SignOutUseCase>(),
    ),
  );

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

  getIt.registerLazySingleton<GameDetailMapper>(
    () => const GameDetailMapper(),
  );

  getIt.registerLazySingleton<HiddenGamesLocalDatasource>(
    () => HiddenGamesLocalDatasource(getIt<AppDatabase>()),
  );

  getIt.registerLazySingleton<HistoryLocalDatasource>(
    () => HistoryLocalDatasource(
      getIt<AppDatabase>(),
      getIt<GameLocalDatasource>(),
      getIt<RoundLocalDatasource>(),
    ),
  );

  getIt.registerLazySingleton<HistoryFirestoreDatasource>(
    () => HistoryFirestoreDatasource(getIt<FirebaseFirestore>()),
  );

  getIt.registerLazySingleton<HistoryRepository>(
    () => HistoryRepositoryImpl(
      getIt<HistoryLocalDatasource>(),
      getIt<HistoryFirestoreDatasource>(),
      getIt<HiddenGamesLocalDatasource>(),
      getIt<GameRepository>(),
    ),
  );

  getIt.registerFactory<DeleteLocalGameUseCase>(
    () => DeleteLocalGameUseCase(
      getIt<HistoryRepository>(),
      getIt<GameRepository>(),
    ),
  );

  getIt.registerFactory<HideCloudGameUseCase>(
    () => HideCloudGameUseCase(getIt<HistoryRepository>()),
  );

  getIt.registerFactory<DeleteGameFromHistoryCubit>(
    () => DeleteGameFromHistoryCubit(
      deleteLocalGame: getIt<DeleteLocalGameUseCase>(),
      hideCloudGame: getIt<HideCloudGameUseCase>(),
    ),
  );

  getIt.registerFactory<GetGameHistoryUseCase>(
    () => GetGameHistoryUseCase(getIt<HistoryRepository>()),
  );

  getIt.registerFactory<GetGameDetailUseCase>(
    () => GetGameDetailUseCase(getIt<HistoryRepository>()),
  );

  getIt.registerFactory<HistoryListBloc>(
    () => HistoryListBloc(
      getGameHistory: getIt<GetGameHistoryUseCase>(),
      retryPendingUploads: getIt<RetryPendingUploadsUseCase>(),
    ),
  );

  getIt.registerFactory<GameDetailBloc>(
    () => GameDetailBloc(getGameDetail: getIt<GetGameDetailUseCase>()),
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

  getIt.registerFactory<CorrectBidsUseCase>(
    () => CorrectBidsUseCase(getIt<RoundRepository>()),
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

  getIt.registerFactory<RepeatRoundUseCase>(
    () => RepeatRoundUseCase(
      getIt<GameRepository>(),
      getIt<RoundRepository>(),
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
    () => FinishGameUseCase(
      getIt<GameRepository>(),
      getIt<GameSyncBloc>(),
    ),
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

  getIt.registerFactory<CancelGameUseCase>(
    () => CancelGameUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<CreateGameBloc>(
    () => CreateGameBloc(createGameDraft: getIt<CreateGameDraftUseCase>()),
  );

  getIt.registerFactory<CancelGameCubit>(
    () => CancelGameCubit(cancelGame: getIt<CancelGameUseCase>()),
  );

  getIt.registerFactory<RepeatRoundCubit>(
    () => RepeatRoundCubit(repeatRound: getIt<RepeatRoundUseCase>()),
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
      correctBids: getIt<CorrectBidsUseCase>(),
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
