import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/favorites/presentation/bloc/favorites_bloc.dart';

enum _AddFavoriteOption { freeName, search }

Future<void> showAddFavoriteBottomSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (sheetContext) {
      return SafeArea(
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
                'Añadir favorito',
                style: Theme.of(sheetContext).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.edit_outlined),
                title: const Text('Nombre libre'),
                subtitle: const Text('Invitado sin cuenta'),
                onTap: () => _openOption(sheetContext, _AddFavoriteOption.freeName),
              ),
              ListTile(
                leading: const Icon(Icons.search),
                title: const Text('Buscar usuario registrado'),
                subtitle: const Text('Requiere conexión'),
                onTap: () => _openOption(sheetContext, _AddFavoriteOption.search),
              ),
            ],
          ),
        ),
      );
    },
  );
}

Future<void> _openOption(
  BuildContext sheetContext,
  _AddFavoriteOption option,
) async {
  await Navigator.of(sheetContext).push<void>(
    MaterialPageRoute(
      builder: (context) {
        return switch (option) {
          _AddFavoriteOption.freeName => _FreeNameFavoriteInput(
              onAdded: () {
                Navigator.of(context).pop();
                Navigator.of(sheetContext).pop();
              },
            ),
          _AddFavoriteOption.search => _RegisteredFavoriteSearch(
              onAdded: () {
                Navigator.of(context).pop();
                Navigator.of(sheetContext).pop();
              },
            ),
        };
      },
      fullscreenDialog: true,
    ),
  );
}

class AddFavoriteFab extends StatelessWidget {
  const AddFavoriteFab({super.key});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: () => showAddFavoriteBottomSheet(context),
      icon: const Icon(Icons.add),
      label: const Text('Añadir'),
    );
  }
}

class _FreeNameFavoriteInput extends StatefulWidget {
  const _FreeNameFavoriteInput({required this.onAdded});

  final VoidCallback onAdded;

  @override
  State<_FreeNameFavoriteInput> createState() => _FreeNameFavoriteInputState();
}

class _FreeNameFavoriteInputState extends State<_FreeNameFavoriteInput> {
  final _controller = TextEditingController();
  String? _localError;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final name = _controller.text.trim();
    if (name.isEmpty) {
      setState(() => _localError = 'El nombre no puede estar vacío');
      return;
    }

    context.read<FavoritesBloc>().add(FavoriteAdded(displayName: name));
    widget.onAdded();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nombre libre'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _controller,
              autofocus: true,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: 'Nombre del jugador',
                errorText: _localError,
              ),
              onChanged: (_) {
                if (_localError != null) {
                  setState(() => _localError = null);
                }
              },
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _submit,
              child: const Text('Añadir'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RegisteredFavoriteSearch extends StatelessWidget {
  const _RegisteredFavoriteSearch({required this.onAdded});

  final VoidCallback onAdded;

  static const _stubUserId = 'stub-user-ana';
  static const _stubDisplayName = 'Ana García';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Buscar registrado'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const TextField(
              decoration: InputDecoration(
                labelText: 'Buscar por nombre',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Resultado de ejemplo (stub)',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 8),
            ListTile(
              tileColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              leading: const CircleAvatar(
                backgroundColor: Color(0xFFD7ECE0),
                child: Text(
                  'A',
                  style: TextStyle(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              title: const Text(_stubDisplayName),
              subtitle: const Text('Usuario registrado'),
              trailing: IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: () {
                  context.read<FavoritesBloc>().add(
                        const FavoriteAdded(
                          displayName: _stubDisplayName,
                          userId: _stubUserId,
                        ),
                      );
                  onAdded();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
