import 'package:flutter/material.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/core/widgets/player_initial_avatar.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/round/presentation/widgets/bid_input_stepper.dart';
import 'package:la_pocha/features/round/presentation/widgets/forbidden_bid_warning.dart';

enum BiddingPlayerRowStatus { pending, active, completed }

class BiddingPlayerRow extends StatelessWidget {
  const BiddingPlayerRow({
    super.key,
    required this.player,
    required this.index,
    required this.status,
    this.bid,
    required this.isDealer,
    this.draftBid = 0,
    required this.cardsInRound,
    this.forbiddenBid,
    required this.canConfirmBid,
    this.isSubmitting = false,
    this.onBidChanged,
    this.onBidConfirmed,
  });

  final PlayerEmbed player;
  final int index;
  final BiddingPlayerRowStatus status;
  final int? bid;
  final bool isDealer;
  final int draftBid;
  final int cardsInRound;
  final int? forbiddenBid;
  final bool canConfirmBid;
  final bool isSubmitting;
  final ValueChanged<int>? onBidChanged;
  final VoidCallback? onBidConfirmed;

  @override
  Widget build(BuildContext context) {
    final opacity = status == BiddingPlayerRowStatus.pending ? 0.5 : 1.0;

    return Opacity(
      opacity: opacity,
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: status == BiddingPlayerRowStatus.active
              ? const BorderSide(color: AppTheme.primary, width: 2)
              : BorderSide.none,
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  PlayerInitialAvatar(
                    name: player.displayName,
                    colorIndex: index,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                player.displayName,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w600),
                              ),
                            ),
                            if (isDealer)
                              const Icon(
                                Icons.style,
                                color: AppTheme.onSurfaceVariant,
                                size: 18,
                              ),
                          ],
                        ),
                        if (status == BiddingPlayerRowStatus.active)
                          Text(
                            'TURNO DE APUESTAS',
                            style:
                                Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppTheme.onSurfaceVariant,
                                      letterSpacing: 1.1,
                                    ),
                          ),
                      ],
                    ),
                  ),
                  if (status == BiddingPlayerRowStatus.completed)
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: const Color(0xFFD7ECE0),
                      child: Text(
                        '$bid',
                        style: const TextStyle(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              if (status == BiddingPlayerRowStatus.active) ...[
                const SizedBox(height: 12),
                BidInputStepper(
                  value: draftBid,
                  min: 0,
                  max: cardsInRound,
                  onChanged: onBidChanged ?? (_) {},
                  onConfirm: onBidConfirmed ?? () {},
                  canConfirm: canConfirmBid,
                  isSubmitting: isSubmitting,
                ),
                if (isDealer && forbiddenBid != null) ...[
                  const SizedBox(height: 12),
                  ForbiddenBidWarning(forbiddenBid: forbiddenBid!),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}
