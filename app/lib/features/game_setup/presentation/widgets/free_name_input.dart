import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/add_player_bottom_sheet.dart';

class FreeNameInput extends StatefulWidget {
  const FreeNameInput({super.key, required this.onAdd});

  final ValueChanged<String> onAdd;

  @override
  State<FreeNameInput> createState() => _FreeNameInputState();
}

class _FreeNameInputState extends State<FreeNameInput> {
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
    submitGuestPlayer(context, name);
    widget.onAdd(name);
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
                errorText: _localError ??
                    context.select<AddPlayersBloc, String?>(
                      (bloc) {
                        final state = bloc.state;
                        if (state is AddPlayersLoaded) {
                          return state.errorMessage;
                        }
                        return null;
                      },
                    ),
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
