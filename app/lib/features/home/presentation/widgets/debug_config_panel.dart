import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:la_pocha/core/config/debug_config_notifier.dart';
import 'package:la_pocha/core/di/injection.dart';

/// Debug-only panel to toggle short game mode at runtime.
///
/// Must only be mounted when `kDebugMode` is true.
class DebugConfigPanel extends StatefulWidget {
  const DebugConfigPanel({super.key, this.debugConfig});

  /// Optional override for tests; defaults to the DI singleton.
  final DebugConfigNotifier? debugConfig;

  @override
  State<DebugConfigPanel> createState() => DebugConfigPanelState();
}

class DebugConfigPanelState extends State<DebugConfigPanel> {
  late final DebugConfigNotifier _debugConfig;
  late final TextEditingController _sequenceController;
  String? _sequenceError;

  @override
  void initState() {
    super.initState();
    _debugConfig = widget.debugConfig ?? getIt<DebugConfigNotifier>();
    _sequenceController = TextEditingController(
      text: _debugConfig.shortRoundSequence.join(','),
    );
  }

  @override
  void dispose() {
    _sequenceController.dispose();
    super.dispose();
  }

  /// Parses and applies the current text field value into [_debugConfig].
  ///
  /// Returns `true` when either `shortGameMode` is disabled (no-op)
  /// or when the current sequence text is valid and has been committed.
  bool commitSequence() {
    if (!_debugConfig.shortGameMode) {
      return true;
    }

    final parsed = DebugConfigNotifier.parseRoundSequence(_sequenceController.text);
    if (parsed == null) {
      setState(() {
        _sequenceError = 'Formato inválido. Usa números separados por comas.';
      });
      return false;
    }

    setState(() => _sequenceError = null);
    _debugConfig.updateSequence(parsed);
    // Normalize formatting once the user explicitly commits.
    _sequenceController.text = parsed.join(',');
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.15),
        border: Border.all(color: Colors.amber, width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: AnimatedBuilder(
        animation: _debugConfig,
        builder: (context, _) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '⚙️ MODO DEBUG',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.amber.shade800,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Switch(
                    value: _debugConfig.shortGameMode,
                    onChanged: _debugConfig.toggleShortGameMode,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Modo partida corta',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
              if (_debugConfig.shortGameMode) ...[
                const SizedBox(height: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: _sequenceController,
                      decoration: InputDecoration(
                        labelText: 'Secuencia de rondas',
                        hintText: '1,4,8,8,4,1',
                        isDense: true,
                        errorText: _sequenceError,
                        border: const OutlineInputBorder(),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: _sequenceError != null
                                ? Colors.red
                                : Colors.amber.shade700,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: _sequenceError != null
                                ? Colors.red
                                : Colors.amber.shade900,
                            width: 2,
                          ),
                        ),
                        errorBorder: const OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.red),
                        ),
                        focusedErrorBorder: const OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.red, width: 2),
                        ),
                      ),
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.done,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                          RegExp(r'[0-9,\s]'),
                        ),
                      ],
                      onChanged: (_) {
                        // No validation while typing; clear any previous error.
                        if (_sequenceError != null) {
                          setState(() => _sequenceError = null);
                        }
                      },
                      onSubmitted: (_) {
                        final committed = commitSequence();
                        if (!committed) {
                          return;
                        }
                        FocusScope.of(context).unfocus();
                      },
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
