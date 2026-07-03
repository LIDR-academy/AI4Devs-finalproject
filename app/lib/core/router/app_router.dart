import 'package:go_router/go_router.dart';
import 'package:la_pocha/features/game_setup/presentation/pages/add_players_page.dart';
import 'package:la_pocha/features/game_setup/presentation/pages/create_game_page.dart';
import 'package:la_pocha/features/game_setup/presentation/pages/game_setup_page.dart';
import 'package:la_pocha/features/home/presentation/pages/home_page.dart';
import 'package:la_pocha/features/round/presentation/pages/bidding_page.dart';
import 'package:la_pocha/features/round/presentation/pages/play_placeholder_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
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
      builder: (context, state) => PlayPlaceholderPage(
        gameId: state.pathParameters['gameId']!,
        roundNumber: int.parse(state.pathParameters['roundNumber']!),
      ),
    ),
  ],
);
