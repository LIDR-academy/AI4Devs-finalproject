import 'package:get_it/get_it.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/data/repositories/game_repository_impl.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/create_game_bloc.dart';

final GetIt getIt = GetIt.instance;

Future<void> configureDependencies() async {
  if (getIt.isRegistered<AppDatabase>()) {
    return;
  }

  getIt.registerLazySingleton<AppDatabase>(AppDatabase.defaults);

  getIt.registerLazySingleton<GameLocalDatasource>(
    () => GameLocalDatasource(getIt<AppDatabase>()),
  );

  getIt.registerLazySingleton<GameRepository>(
    () => GameRepositoryImpl(getIt<GameLocalDatasource>()),
  );

  getIt.registerFactory<CreateGameDraftUseCase>(
    () => CreateGameDraftUseCase(getIt<GameRepository>()),
  );

  getIt.registerFactory<CreateGameBloc>(
    () => CreateGameBloc(createGameDraft: getIt<CreateGameDraftUseCase>()),
  );
}
