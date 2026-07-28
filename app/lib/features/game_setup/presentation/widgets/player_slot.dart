import 'package:flutter/material.dart';
import 'package:la_pocha/core/widgets/player_initial_avatar.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class PlayerSlot extends StatelessWidget {
  const PlayerSlot({
    super.key,
    required this.index,
    this.player,
    this.isEditing = false,
    this.isFavorite = false,
    this.isBusy = false,
    this.onActivateEdit,
    this.onCancelEdit,
    this.onConfirmName,
    this.onToggleFavorite,
    this.onRemove,
  });

  final int index;
  final PlayerEmbed? player;
  final bool isEditing;
  final bool isFavorite;
  final bool isBusy;
  final VoidCallback? onActivateEdit;
  final VoidCallback? onCancelEdit;
  final ValueChanged<String>? onConfirmName;
  final VoidCallback? onToggleFavorite;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    if (player != null) {
      return _FilledPlayerSlot(
        player: player!,
        colorIndex: player!.seatOrder,
        isFavorite: isFavorite,
        onToggleFavorite: isBusy ? null : onToggleFavorite,
        onRemove: isBusy ? null : onRemove,
      );
    }

    if (isEditing) {
      return _InlineEditPlayerSlot(
        onCancel: onCancelEdit,
        onConfirm: onConfirmName,
        isBusy: isBusy,
      );
    }

    return _EmptyPlayerSlot(
      onTap: isBusy ? null : onActivateEdit,
    );
  }
}

class _EmptyPlayerSlot extends StatelessWidget {
  const _EmptyPlayerSlot({this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colors = Theme.of(context).colorScheme;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            children: [
              Icon(
                Icons.add_circle_outline,
                color: colors.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Text(
                'Añadir jugador',
                style: textTheme.labelMedium?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InlineEditPlayerSlot extends StatefulWidget {
  const _InlineEditPlayerSlot({
    required this.onCancel,
    required this.onConfirm,
    required this.isBusy,
  });

  final VoidCallback? onCancel;
  final ValueChanged<String>? onConfirm;
  final bool isBusy;

  @override
  State<_InlineEditPlayerSlot> createState() => _InlineEditPlayerSlotState();
}

class _InlineEditPlayerSlotState extends State<_InlineEditPlayerSlot> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  bool _didCancelOnBlur = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChanged);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChanged);
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _onFocusChanged() {
    if (!_focusNode.hasFocus && !_didCancelOnBlur) {
      _didCancelOnBlur = true;
      widget.onCancel?.call();
    }
  }

  void _onSubmit() {
    if (widget.isBusy) {
      return;
    }
    final name = _controller.text.trim();
    widget.onConfirm?.call(name);
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              focusNode: _focusNode,
              controller: _controller,
              autofocus: true,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _onSubmit(),
              decoration: InputDecoration(
                hintText: 'Nombre del jugador',
                isDense: true,
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: colors.primary),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: colors.primary, width: 2),
                ),
              ),
            ),
          ),
          IconButton(
            onPressed: widget.isBusy ? null : _onSubmit,
            icon: Icon(
              Icons.check_circle,
              color: colors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilledPlayerSlot extends StatelessWidget {
  const _FilledPlayerSlot({
    required this.player,
    required this.colorIndex,
    required this.isFavorite,
    this.onToggleFavorite,
    this.onRemove,
  });

  final PlayerEmbed player;
  final int colorIndex;
  final bool isFavorite;
  final VoidCallback? onToggleFavorite;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colors = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          PlayerInitialAvatar(
            name: player.displayName,
            colorIndex: colorIndex,
            radius: 16,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  player.displayName,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  player.isGuest ? 'Invitado' : 'Jugador registrado',
                  style: textTheme.labelSmall?.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onToggleFavorite,
            icon: Icon(isFavorite ? Icons.star : Icons.star_border),
            color: isFavorite ? Colors.amber : colors.onSurfaceVariant,
          ),
          IconButton(
            onPressed: onRemove,
            icon: const Icon(Icons.close),
            color: colors.onSurfaceVariant,
          ),
        ],
      ),
    );
  }
}
