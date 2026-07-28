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
  State<DebugConfigPanel> createState() => _DebugConfigPanelState();
}

class _DebugConfigPanelState extends State<DebugConfigPanel> {
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
    _debugConfig.addListener(_onDebugConfigChanged);
  }

  void _onDebugConfigChanged() {
    if (!mounted) {
      return;
    }
    setState(() {});
  }

  @override
  void dispose() {
    _debugConfig.removeListener(_onDebugConfigChanged);
    _sequenceController.dispose();
    super.dispose();
  }

  void _applySequence() {
    final parsed =
        DebugConfigNotifier.parseRoundSequence(_sequenceController.text);
    if (parsed == null) {
      setState(() {
        _sequenceError =
            'Formato inválido. Usa números separados por comas.';
      });
      return;
    }

    setState(() => _sequenceError = null);
    _debugConfig.updateSequence(parsed);
    _sequenceController.text = parsed.join(',');
    FocusScope.of(context).unfocus();
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
      child: Column(
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
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: TextField(
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
                      FilteringTextInputFormatter.allow(RegExp(r'[0-9,\s]')),
                    ],
                    onChanged: (_) {
                      if (_sequenceError != null) {
                        setState(() => _sequenceError = null);
                      }
                    },
                    onSubmitted: (_) => _applySequence(),
                  ),
                ),
                const SizedBox(width: 8),
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: FilledButton(
                    onPressed: _applySequence,
                    child: const Text('Aplicar'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
