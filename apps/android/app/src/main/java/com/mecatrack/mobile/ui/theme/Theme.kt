package com.mecatrack.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Navy = Color(0xFF0F172A)
private val Accent = Color(0xFF0F766E)
private val Surface = Color(0xFFF8FAFC)

private val ColorScheme = lightColorScheme(
    primary = Accent,
    onPrimary = Color.White,
    secondary = Navy,
    background = Surface,
    surface = Color.White,
    onBackground = Navy,
    onSurface = Navy,
)

@Composable
fun MecaTrackTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ColorScheme,
        content = content,
    )
}
