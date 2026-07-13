import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/features/favorites/presentation/bloc/favorites_bloc.dart';
import 'package:la_pocha/features/favorites/presentation/widgets/favorites_picker.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/free_name_input.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/search_player_stub.dart';

enum _AddPlayerOption { freeName, search, favorites }

Future<void> showAddPlayerBottomSheet(BuildContext context) {
  final bloc = context.read<AddPlayersBloc>();

  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (sheetContext) {
      return BlocProvider.value(
        value: bloc,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Añadir jugador',
                  style: Theme.of(sheetContext).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 12),
                ListTile(
                  leading: const Icon(Icons.edit_outlined),
                  title: const Text('Nombre libre'),
                  subtitle: const Text('Invitado sin cuenta'),
                  onTap: () => _openOption(
                    sheetContext,
                    bloc,
                    _AddPlayerOption.freeName,
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.search),
                  title: const Text('Buscar usuario registrado'),
                  subtitle: const Text('Requiere conexión'),
                  onTap: () => _openOption(
                    sheetContext,
                    bloc,
                    _AddPlayerOption.search,
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.star_outline),
                  title: const Text('Favoritos'),
                  subtitle: const Text('Jugadores frecuentes'),
                  onTap: () => _openOption(
                    sheetContext,
                    bloc,
                    _AddPlayerOption.favorites,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  );
}

Future<void> _openOption(
  BuildContext sheetContext,
  AddPlayersBloc bloc,
  _AddPlayerOption option,
) async {
  await Navigator.of(sheetContext).push<void>(
    MaterialPageRoute(
      builder: (context) {
        return BlocProvider.value(
          value: bloc,
          child: switch (option) {
            _AddPlayerOption.freeName => FreeNameInput(
                onAdd: (name) {
                  Navigator.of(context).pop();
                  Navigator.of(sheetContext).pop();
                },
              ),
            _AddPlayerOption.search => const SearchPlayerStub(),
            _AddPlayerOption.favorites => MultiBlocProvider(
                providers: [
                  BlocProvider.value(value: bloc),
                  BlocProvider(
                    create: (_) =>
                        getIt<FavoritesBloc>()..add(const FavoritesStarted()),
                  ),
                ],
                child: FavoritesPicker(
                  onSelected: () {
                    Navigator.of(context).pop();
                    Navigator.of(sheetContext).pop();
                  },
                ),
              ),
          },
        );
      },
      fullscreenDialog: true,
    ),
  );
}

void submitGuestPlayer(BuildContext context, String name) {
  context.read<AddPlayersBloc>().add(
        PlayerAdded(name: name, type: PlayerAddType.guest),
      );
}
