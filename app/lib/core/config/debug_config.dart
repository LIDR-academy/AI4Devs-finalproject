import 'package:flutter/foundation.dart';

/// Flag de debug para probar el flujo completo de partida sin jugar
/// todas las rondas reales. Solo activo en modo debug (kDebugMode).
/// En release siempre se usa la secuencia real del PRD.
///
/// Para activar: cambia kShortGameMode a true y define la secuencia
/// en kShortRoundSequence. Ejemplo: [1, 4, 8, 8, 4, 1] = 6 rondas.
const bool kShortGameMode = kDebugMode && false;
const List<int> kShortRoundSequence = [1, 4, 8, 8, 4, 1];
