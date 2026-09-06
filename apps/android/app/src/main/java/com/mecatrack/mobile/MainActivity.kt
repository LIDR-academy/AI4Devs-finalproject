package com.mecatrack.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.mecatrack.mobile.ui.nav.MecaTrackNav
import com.mecatrack.mobile.ui.theme.MecaTrackTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val app = application as MecaTrackApp
        setContent {
            MecaTrackTheme {
                MecaTrackNav(container = app.container)
            }
        }
    }
}
