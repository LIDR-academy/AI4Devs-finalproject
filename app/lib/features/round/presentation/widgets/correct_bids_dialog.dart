import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

/// Opens a modal that lets the organizer correct the bids of the current
/// round. Returns the updated bids map, or `null` when the correction is
/// discarded.
Future<Map<String, int>?> showCorrectBidsDialog(
  BuildContext context, {
  required List<PlayerEmbed> players,
  required Round round,
}) {
  return showDialog<Map<String, int>>(
    context: context,
    barrierDismissible: false,
    builder: (_) => _CorrectBidsDialog(players: players, round: round),
  );
}

class _CorrectBidsDialog extends StatefulWidget {
  const _CorrectBidsDialog({required this.players, required this.round});

  final List<PlayerEmbed> players;
  final Round round;

  @override
  State<_CorrectBidsDialog> createState() => _CorrectBidsDialogState();
}

class _CorrectBidsDialogState extends State<_CorrectBidsDialog> {
  static const Color _warningColor = Color(0xFFD9772E);

  late final Map<String, int> _initialBids;
  late Map<String, int> _draftBids;

  @override
  void initState() {
    super.initState();
    _initialBids = {
      for (final player in widget.players)
        player.id: widget.round.bids[player.id] ?? 0,
    };
    _draftBids = Map<String, int>.from(_initialBids);
  }

  bool get _isDirty {
    for (final entry in _initialBids.entries) {
      if (_draftBids[entry.key] != entry.value) {
        return true;
      }
    }
    return false;
  }

  int get _bidSum => _draftBids.values.fold(0, (sum, bid) => sum + bid);

  bool get _restrictionBroken => _bidSum == widget.round.cardsInRound;

  void _changeBid(String playerId, int value) {
    setState(() {
      _draftBids[playerId] = value;
    });
  }

  Future<void> _onCancel() async {
    if (!_isDirty) {
      Navigator.of(context).pop();
      return;
    }

    final discard = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Descartar correcciones'),
        content: const Text(
          'Se perderan los cambios que has hecho en las apuestas. '
          'Quieres descartarlos?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Seguir editando'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(dialogContext).colorScheme.error,
            ),
            child: const Text('Descartar'),
          ),
        ],
      ),
    );

    if (discard ?? false) {
      if (!mounted) {
        return;
      }
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final cardsInRound = widget.round.cardsInRound;

    return AlertDialog(
      title: const Text('Corregir apuestas'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final player in widget.players)
              _BidRow(
                name: player.displayName,
                isDealer: player.id == widget.round.dealerPlayerId,
                value: _draftBids[player.id] ?? 0,
                max: cardsInRound,
                onChanged: (value) => _changeBid(player.id, value),
              ),
            const SizedBox(height: 12),
            Text(
              'Suma de apuestas: $_bidSum / $cardsInRound',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            if (_restrictionBroken)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'La suma iguala $cardsInRound: el repartidor debera ajustar '
                  'su apuesta antes de continuar.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _warningColor,
                      ),
                ),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _onCancel,
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: _isDirty
              ? () => Navigator.of(context).pop(
                    Map<String, int>.from(_draftBids),
                  )
              : null,
          style: FilledButton.styleFrom(
            minimumSize: const Size(120, 44),
          ),
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}

class _BidRow extends StatelessWidget {
  const _BidRow({
    required this.name,
    required this.isDealer,
    required this.value,
    required this.max,
    required this.onChanged,
  });

  final String name;
  final bool isDealer;
  final int value;
  final int max;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(
              isDealer ? '$name (repartidor)' : name,
              style: Theme.of(context).textTheme.bodyLarge,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            onPressed: value > 0 ? () => onChanged(value - 1) : null,
            icon: const Icon(Icons.remove_circle_outline),
            color: AppTheme.primary,
          ),
          SizedBox(
            width: 28,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          IconButton(
            onPressed: value < max ? () => onChanged(value + 1) : null,
            icon: const Icon(Icons.add_circle_outline),
            color: AppTheme.primary,
          ),
        ],
      ),
    );
  }
}
