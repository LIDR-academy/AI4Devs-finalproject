import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/widgets/pocha_app_bar.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/home/presentation/widgets/debug_config_panel.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey<DebugConfigPanelState> _debugPanelKey =
      GlobalKey<DebugConfigPanelState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          children: [
            PochaAppBar(
              title: 'La Pocha',
              expanded: true,
              actions: [
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, state) {
                    final isAuthenticated = state is Authenticated;
                    return IconButton(
                      onPressed: () => context.push(
                        isAuthenticated ? '/profile' : '/auth/sign-in',
                      ),
                      icon: Icon(
                        isAuthenticated
                            ? Icons.account_circle
                            : Icons.person_outline,
                        color: Colors.white,
                      ),
                      tooltip: 'Mi cuenta',
                    );
                  },
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FilledButton.icon(
                    onPressed: () {
                      if (kDebugMode) {
                        final committed =
                            _debugPanelKey.currentState?.commitSequence() ??
                                true;
                        if (!committed) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Secuencia inválida. Revisa el formato.',
                              ),
                            ),
                          );
                          return;
                        }
                      }
                      context.push('/games/new');
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Nueva partida'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () => context.push('/history'),
                    icon: const Icon(Icons.history),
                    label: const Text('Ver historial'),
                  ),
                ],
              ),
            ),
            if (kDebugMode) DebugConfigPanel(key: _debugPanelKey),
          ],
        ),
      ),
    );
  }
}
