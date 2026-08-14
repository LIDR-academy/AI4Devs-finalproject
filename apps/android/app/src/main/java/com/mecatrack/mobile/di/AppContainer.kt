package com.mecatrack.mobile.di

import android.content.Context
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.mecatrack.mobile.BuildConfig
import com.mecatrack.mobile.data.api.AccessTokenInterceptor
import com.mecatrack.mobile.data.api.MecaTrackApi
import com.mecatrack.mobile.data.api.MobileClientInterceptor
import com.mecatrack.mobile.data.api.TokenAuthenticator
import com.mecatrack.mobile.data.repository.MecaTrackRepository
import com.mecatrack.mobile.data.session.SessionStore
import com.mecatrack.mobile.data.session.SharedPrefsSessionStore
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

class AppContainer(context: Context) {
    val json: Json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        encodeDefaults = false
    }

    val sessionStore: SessionStore = SharedPrefsSessionStore(context.applicationContext)

    private val logging = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BASIC
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
    }

    private val refreshClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(MobileClientInterceptor())
        .addInterceptor(logging)
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val refreshApi: MecaTrackApi = createRetrofit(refreshClient)

    private val authenticatedClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(MobileClientInterceptor())
        .addInterceptor(AccessTokenInterceptor(sessionStore))
        .addInterceptor(logging)
        .authenticator(TokenAuthenticator(sessionStore, refreshApi))
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    val api: MecaTrackApi = createRetrofit(authenticatedClient)

    val repository: MecaTrackRepository = MecaTrackRepository(api, sessionStore)

    private fun createRetrofit(client: OkHttpClient): MecaTrackApi {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(MecaTrackApi::class.java)
    }
}
