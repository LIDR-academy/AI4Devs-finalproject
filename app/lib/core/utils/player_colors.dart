import 'package:flutter/material.dart';

const List<Color> playerAvatarColors = [
  Color(0xFF2E7D5B),
  Color(0xFFF4A259),
  Color(0xFF4A7FBF),
  Color(0xFF9B7BB8),
];

Color playerAvatarColorForIndex(int index) {
  return playerAvatarColors[index % playerAvatarColors.length];
}
