import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

const List<Color> playerAvatarColors = [
  Color(0xFF2E7D5B),
  Color(0xFFF4A259),
  Color(0xFF4A7FBF),
  Color(0xFF9B7BB8),
];

Color playerAvatarColorForIndex(int index) {
  return playerAvatarColors[index % playerAvatarColors.length];
}

class PlayerSlot extends StatelessWidget {
  const PlayerSlot({
    super.key,
    this.player,
    required this.index,
    this.onTap,
    this.onRemove,
  });

  final PlayerEmbed? player;
  final int index;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    if (player == null) {
      return _EmptyPlayerSlot(onTap: onTap);
    }
    return _FilledPlayerSlot(
      player: player!,
      index: index,
      onRemove: onRemove,
    );
  }
}

class _EmptyPlayerSlot extends StatelessWidget {
  const _EmptyPlayerSlot({this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: CustomPaint(
          painter: _DashedBorderPainter(
            color: AppTheme.onSurfaceVariant,
            radius: 12,
          ),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.add,
                  color: AppTheme.onSurfaceVariant,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Añadir jugador',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppTheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FilledPlayerSlot extends StatelessWidget {
  const _FilledPlayerSlot({
    required this.player,
    required this.index,
    this.onRemove,
  });

  final PlayerEmbed player;
  final int index;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final avatarColor = playerAvatarColorForIndex(index);
    final initial = player.displayName.isNotEmpty
        ? player.displayName[0].toUpperCase()
        : '?';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: avatarColor,
            foregroundColor: Colors.white,
            child: Text(
              initial,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  player.displayName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                _PlayerBadge(isGuest: player.isGuest),
              ],
            ),
          ),
          IconButton(
            onPressed: onRemove,
            icon: const Icon(Icons.close),
            color: AppTheme.onSurfaceVariant,
          ),
        ],
      ),
    );
  }
}

class _PlayerBadge extends StatelessWidget {
  const _PlayerBadge({required this.isGuest});

  final bool isGuest;

  @override
  Widget build(BuildContext context) {
    if (isGuest) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.onSurfaceVariant.withValues(alpha: 0.4)),
        ),
        child: Text(
          'Invitado',
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.onSurfaceVariant,
              ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFD7ECE0),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        'Registrado',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: AppTheme.primary,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class _DashedBorderPainter extends CustomPainter {
  _DashedBorderPainter({required this.color, required this.radius});

  final Color color;
  final double radius;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(0, 0, size.width, size.height),
          Radius.circular(radius),
        ),
      );

    const dashWidth = 6.0;
    const dashSpace = 4.0;
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        final next = distance + dashWidth;
        canvas.drawPath(
          metric.extractPath(distance, next.clamp(0, metric.length)),
          paint,
        );
        distance = next + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedBorderPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.radius != radius;
  }
}
