package com.mecatrack.mobile

import android.app.Application
import com.mecatrack.mobile.di.AppContainer

class MecaTrackApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
