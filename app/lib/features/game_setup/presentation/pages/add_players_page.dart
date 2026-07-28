import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/widgets/pocha_app_bar.dart';
import 'package:la_pocha/core/widgets/primary_button.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/cancel_game_cubit.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/cancel_game_dialog.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/favorites_chip_section.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/players_roster_section.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/search_player_stub.dart';

class AddPlayersPage extends StatelessWidget {
  const AddPlayersPage({super.key, required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => getIt<AddPlayersBloc>()..add(AddPlayersStarted(gameId: gameId)),
        ),
        BlocProvider(
          create: (_) => getIt<CancelGameCubit>(),
        ),
      ],
      child: _AddPlayersView(gameId: gameId),
    );
  }
}

class _AddPlayersView extends StatelessWidget {
  const _AddPlayersView({required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<CancelGameCubit, CancelGameState>(
          listener: (context, state) {
            if (state is CancelGameSuccess) {
              context.go('/');
            } else if (state is CancelGameFailure) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
            }
          },
        ),
        BlocListener<AddPlayersBloc, AddPlayersState>(
          listener: (context, state) {
            if (state is AddPlayersLoaded && state.errorMessage != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.errorMessage!)),
              );
            }
          },
        ),
      ],
      child: Scaffold(
        body: SafeArea(
          child: BlocBuilder<AddPlayersBloc, AddPlayersState>(
            builder: (context, state) {
              if (state is AddPlayersLoading || state is AddPlayersInitial) {
                return const Center(child: CircularProgressIndicator());
              }
              if (state is AddPlayersFailure) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(state.message),
                  ),
                );
              }
              if (state is! AddPlayersLoaded) {
                return const SizedBox.shrink();
              }

              final visibleFavorites = _visibleFavorites(state);
              final remaining = state.playerCount - state.players.length;
              final isComplete = remaining == 0;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  PochaAppBar(
                    title: 'Añadir jugadores',
                    subtitle: '${state.players.length} de ${state.playerCount} añadidos',
                    showBackConfirmation: true,
                    backConfirmationMessage:
                        '¿Descartar esta partida? Se perderá la configuración actual.',
                    onBack: () => context.read<CancelGameCubit>().cancel(gameId),
                    actions: [
                      IconButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => const SearchPlayerStub(),
                              fullscreenDialog: true,
                            ),
                          );
                        },
                        icon: const Icon(Icons.search, color: Colors.white),
                      ),
                      _CancelMenuAction(gameId: gameId),
                    ],
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            FavoritesChipSection(
                              visibleFavorites: visibleFavorites,
                              onFavoriteTap: (favorite) {
                                context.read<AddPlayersBloc>().add(
                                      FavoriteChipTapped(favorite: favorite),
                                    );
                              },
                            ),
                            const SizedBox(height: 16),
                            PlayersRosterSection(
                              playerCount: state.playerCount,
                              players: state.players,
                              activeEditIndex: state.activeEditIndex,
                              isLoading: state.isLoading,
                              isFavoritePlayer: (player) =>
                                  _isFavoritePlayer(player, state.favorites),
                              onEditActivated: (index) {
                                context.read<AddPlayersBloc>().add(
                                      EditSlotActivated(index: index),
                                    );
                              },
                              onEditCancelled: () {
                                context.read<AddPlayersBloc>().add(
                                      const EditSlotCancelled(),
                                    );
                              },
                              onNameConfirmed: (index, name) {
                                context.read<AddPlayersBloc>().add(
                                      PlayerNameConfirmed(index: index, name: name),
                                    );
                              },
                              onFavoriteToggle: (playerId) {
                                context.read<AddPlayersBloc>().add(
                                      PlayerFavoriteToggled(playerId: playerId),
                                    );
                              },
                              onRemovePlayer: (playerId) {
                                context.read<AddPlayersBloc>().add(
                                      PlayerRemoved(playerId: playerId),
                                    );
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: PrimaryButton(
                      label: isComplete
                          ? 'Continuar'
                          : 'Faltan $remaining jugadores',
                      onPressed: isComplete && !state.isLoading
                          ? () => context.go('/games/$gameId/setup')
                          : null,
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  List<FavoritePlayer> _visibleFavorites(AddPlayersLoaded state) {
    return state.favorites
        .where((favorite) => !_playersContainsFavorite(state.players, favorite))
        .toList();
  }

  bool _playersContainsFavorite(List<PlayerEmbed> players, FavoritePlayer favorite) {
    for (final player in players) {
      if (_isFavoriteMatch(player, favorite)) {
        return true;
      }
    }
    return false;
  }

  bool _isFavoritePlayer(PlayerEmbed player, List<FavoritePlayer> favorites) {
    for (final favorite in favorites) {
      if (_isFavoriteMatch(player, favorite)) {
        return true;
      }
    }
    return false;
  }

  bool _isFavoriteMatch(PlayerEmbed player, FavoritePlayer favorite) {
    if (player.userId != null && favorite.userId == player.userId) {
      return true;
    }
    return player.userId == null &&
        favorite.userId == null &&
        player.displayName.toLowerCase() == favorite.displayName.toLowerCase();
  }
}

class _CancelMenuAction extends StatelessWidget {
  const _CancelMenuAction({required this.gameId});

  final String gameId;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert, color: Colors.white),
      onSelected: (value) async {
        if (value != 'cancel') {
          return;
        }
        final confirmed = await showCancelGameDialog(context);
        if (!confirmed) {
          return;
        }
        if (!context.mounted) {
          return;
        }
        await context.read<CancelGameCubit>().cancel(gameId);
      },
      itemBuilder: (context) => const [
        PopupMenuItem(
          value: 'cancel',
          child: Text(
            'Cancelar partida',
            style: TextStyle(color: Color(0xFFD9772E)),
          ),
        ),
      ],
    );
  }
}
