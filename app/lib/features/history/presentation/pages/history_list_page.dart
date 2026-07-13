import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:la_pocha/features/history/presentation/bloc/history_list_bloc.dart';
import 'package:la_pocha/features/history/presentation/widgets/empty_history_view.dart';
import 'package:la_pocha/features/history/presentation/widgets/game_history_tile.dart';

class HistoryListPage extends StatelessWidget {
  const HistoryListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          getIt<HistoryListBloc>()..add(const HistoryListStarted()),
      child: const _HistoryListView(),
    );
  }
}

class _HistoryListView extends StatelessWidget {
  const _HistoryListView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _Header(onBack: () => context.pop()),
            BlocBuilder<AuthBloc, AuthState>(
              builder: (context, authState) {
                if (authState is! Authenticated) {
                  return const SizedBox.shrink();
                }
                return const _OfflineSyncBanner();
              },
            ),
            Expanded(
              child: BlocBuilder<HistoryListBloc, HistoryListState>(
                builder: (context, state) {
                  return switch (state) {
                    HistoryListInitial() ||
                    HistoryListLoading() =>
                      const Center(child: CircularProgressIndicator()),
                    HistoryListEmpty() => const EmptyHistoryView(),
                    HistoryListFailure(:final message) => Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(
                            message,
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .bodyLarge
                                ?.copyWith(color: AppTheme.onSurfaceVariant),
                          ),
                        ),
                      ),
                    HistoryListLoaded(:final items) => RefreshIndicator(
                        onRefresh: () async {
                          context
                              .read<HistoryListBloc>()
                              .add(const HistoryListRefreshed());
                          await context
                              .read<HistoryListBloc>()
                              .stream
                              .firstWhere(
                                (state) =>
                                    state is HistoryListLoaded ||
                                    state is HistoryListEmpty ||
                                    state is HistoryListFailure,
                              );
                        },
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          itemCount: items.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = items[index];
                            return GameHistoryTile(
                              item: item,
                              onTap: () => context.push(
                                '/history/${item.id}?source=${item.source.name}',
                              ),
                            );
                          },
                        ),
                      ),
                  };
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: onBack,
            icon: const Icon(Icons.arrow_back, color: Colors.white),
          ),
          Expanded(
            child: Text(
              'Historial',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OfflineSyncBanner extends StatelessWidget {
  const _OfflineSyncBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFCEFE0),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        children: [
          Icon(Icons.cloud_off, color: Color(0xFFF4A259)),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Sin conexión: mostrando solo partidas locales.',
              style: TextStyle(color: Color(0xFFF4A259)),
            ),
          ),
        ],
      ),
    );
  }
}
