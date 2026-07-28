import 'package:flutter/material.dart';
import 'package:la_pocha/core/widgets/warning_banner.dart';

class ForbiddenBidWarning extends StatelessWidget {
  const ForbiddenBidWarning({
    super.key,
    required this.forbiddenBid,
  });

  final int forbiddenBid;

  @override
  Widget build(BuildContext context) {
    return WarningBanner(
      message: 'Número prohibido: $forbiddenBid',
    );
  }
}
