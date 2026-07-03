import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

// TODO(LPT-19/LPT-21): Replace hardcoded result with Firestore user search
// by displayName via UserSearchRepository.
class SearchPlayerStub extends StatefulWidget {
  const SearchPlayerStub({super.key});

  @override
  State<SearchPlayerStub> createState() => _SearchPlayerStubState();
}

class _SearchPlayerStubState extends State<SearchPlayerStub> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

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
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
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
              title: const Text('Ana García'),
              subtitle: const Text('Usuario registrado'),
              trailing: IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Búsqueda real pendiente (LPT-19/LPT-21)',
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
