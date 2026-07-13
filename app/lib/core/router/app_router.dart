import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/router/auth_refresh_notifier.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/auth/presentation/pages/profile_page.dart';
import 'package:la_pocha/features/auth/presentation/pages/sign_in_page.dart';
import 'package:la_pocha/features/auth/presentation/pages/sign_up_page.dart';
import 'package:la_pocha/features/game_setup/presentation/pages/add_players_page.dart';
import 'package:la_pocha/features/game_setup/presentation/pages/create_game_page.dart';
import 'package:la_pocha/features/game_setup/presentation/pages/game_setup_page.dart';
import 'package:la_pocha/features/home/presentation/pages/home_page.dart';
import 'package:la_pocha/features/round/presentation/pages/bidding_page.dart';
import 'package:la_pocha/features/round/presentation/pages/play_page.dart';
import 'package:la_pocha/features/round/presentation/pages/game_final_result_page.dart';
import 'package:la_pocha/features/round/presentation/pages/round_result_page.dart';
import 'package:la_pocha/features/round/presentation/pages/scoring_page.dart';
import 'package:la_pocha/features/favorites/presentation/pages/favorites_page.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/presentation/pages/game_detail_page.dart';
import 'package:la_pocha/features/history/presentation/pages/history_list_page.dart';

GoRouter createAppRouter({
  required AuthRefreshNotifier refreshListenable,
  required AuthBloc authBloc,
}) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: refreshListenable,
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isAuthenticated = authBloc.state is Authenticated;

      if (!isAuthenticated && location == '/profile') {
        return '/auth/sign-in';
      }
      if (isAuthenticated && location.startsWith('/auth/')) {
        return '/';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/auth/sign-in',
        builder: (context, state) => const SignInPage(),
      ),
      GoRoute(
        path: '/auth/sign-up',
        builder: (context, state) => const SignUpPage(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
      GoRoute(
        path: '/favorites',
        builder: (context, state) => const FavoritesPage(),
      ),
      GoRoute(
        path: '/games/new',
        builder: (context, state) => const CreateGamePage(),
      ),
      GoRoute(
        path: '/games/:gameId/players',
        builder: (context, state) => AddPlayersPage(
          gameId: state.pathParameters['gameId']!,
        ),
      ),
      GoRoute(
        path: '/games/:gameId/setup',
        builder: (context, state) => GameSetupPage(
          gameId: state.pathParameters['gameId']!,
        ),
      ),
      GoRoute(
        path: '/games/:gameId/rounds/:roundNumber/bids',
        builder: (context, state) => BiddingPage(
          gameId: state.pathParameters['gameId']!,
          roundNumber: int.parse(state.pathParameters['roundNumber']!),
        ),
      ),
      GoRoute(
        path: '/games/:gameId/rounds/:roundNumber/play',
        builder: (context, state) => PlayPage(
          gameId: state.pathParameters['gameId']!,
          roundNumber: int.parse(state.pathParameters['roundNumber']!),
        ),
      ),
      GoRoute(
        path: '/games/:gameId/rounds/:roundNumber/tricks',
        builder: (context, state) => ScoringPage(
          gameId: state.pathParameters['gameId']!,
          roundNumber: int.parse(state.pathParameters['roundNumber']!),
        ),
      ),
      GoRoute(
        path: '/games/:gameId/rounds/:roundNumber/result',
        builder: (context, state) {
          final readOnly = state.uri.queryParameters['readOnly'] == 'true';

          return RoundResultPage(
            gameId: state.pathParameters['gameId']!,
            roundNumber: int.parse(state.pathParameters['roundNumber']!),
            readOnly: readOnly,
          );
        },
      ),
      GoRoute(
        path: '/games/:gameId/final',
        builder: (context, state) => GameFinalResultPage(
          gameId: state.pathParameters['gameId']!,
        ),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => const HistoryListPage(),
      ),
      GoRoute(
        path: '/history/:gameId',
        builder: (context, state) {
          final sourceName = state.uri.queryParameters['source'];
          final source = GameHistorySource.values.firstWhere(
            (value) => value.name == sourceName,
            orElse: () => GameHistorySource.local,
          );

          return GameDetailPage(
            gameId: state.pathParameters['gameId']!,
            source: source,
          );
        },
      ),
    ],
  );
}
