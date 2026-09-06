package com.mecatrack.mobile.data.api

import com.mecatrack.mobile.data.session.SessionStore
import com.mecatrack.mobile.domain.ApiErrors
import com.mecatrack.mobile.domain.AuthErrorMapper
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import okhttp3.Authenticator
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import retrofit2.HttpException

const val MOBILE_CLIENT_HEADER = "X-MecaTrack-Client"
const val MOBILE_CLIENT_VALUE = "mobile"

class MobileClientInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .header(MOBILE_CLIENT_HEADER, MOBILE_CLIENT_VALUE)
            .build()
        return chain.proceed(request)
    }
}

class AccessTokenInterceptor(
    private val sessionStore: SessionStore,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = sessionStore.getAccessToken()
        val request = if (token.isNullOrBlank() || isAuthHandshake(chain.request())) {
            chain.request()
        } else {
            chain.request().newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        }
        return chain.proceed(request)
    }
}

class TokenAuthenticator(
    private val sessionStore: SessionStore,
    private val refreshApi: MecaTrackApi,
) : Authenticator {
    @Synchronized
    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.request.url.encodedPath.contains("auth/login") ||
            response.request.url.encodedPath.contains("auth/refresh")
        ) {
            return null
        }

        if (responseCount(response) >= 2) {
            return null
        }

        val refreshToken = sessionStore.getRefreshToken() ?: return null
        val refreshed = runCatching {
            runBlocking {
                refreshApi.refresh(RefreshRequest(refreshToken))
            }
        }.getOrNull() ?: return null

        sessionStore.saveTokens(refreshed.accessToken, refreshed.refreshToken)
        return response.request.newBuilder()
            .header("Authorization", "Bearer ${refreshed.accessToken}")
            .build()
    }

    private fun responseCount(response: Response): Int {
        var current = response.priorResponse
        var count = 1
        while (current != null) {
            count += 1
            current = current.priorResponse
        }
        return count
    }
}

private fun isAuthHandshake(request: Request): Boolean {
    val path = request.url.encodedPath
    return path.contains("auth/login") || path.contains("auth/refresh")
}

fun readApiError(throwable: Throwable, json: Json): Pair<String, ApiErrorBody?> {
    val http = throwable as? HttpException
        ?: return AuthErrorMapper.NETWORK to null
    val raw = http.response()?.errorBody()?.string().orEmpty()
    val body = ApiErrors.parseBody(raw, json)
    val apiMessage = ApiErrors.messageFrom(body)
    val message = when (http.code()) {
        400 -> apiMessage ?: AuthErrorMapper.NETWORK
        in 500..599 -> AuthErrorMapper.NETWORK
        else -> apiMessage ?: AuthErrorMapper.NETWORK
    }
    return message to body
}
