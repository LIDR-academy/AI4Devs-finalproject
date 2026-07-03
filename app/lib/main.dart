import 'package:flutter/material.dart';
import 'package:la_pocha/core/di/injection.dart';
import 'package:la_pocha/core/router/app_router.dart';
import 'package:la_pocha/core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const LaPochaApp());
}

class LaPochaApp extends StatelessWidget {
  const LaPochaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'La Pocha',
      theme: AppTheme.light,
      routerConfig: appRouter,
    );
  }
}
