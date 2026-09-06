package com.mecatrack.mobile.data.session

import android.content.Context
import android.content.SharedPreferences

class SharedPrefsSessionStore(context: Context) : SessionStore {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    override fun getAccessToken(): String? = prefs.getString(KEY_ACCESS, null)

    override fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH, null)

    override fun getUser(): UserSession? {
        val id = prefs.getString(KEY_USER_ID, null) ?: return null
        val email = prefs.getString(KEY_EMAIL, null) ?: return null
        val fullName = prefs.getString(KEY_FULL_NAME, null) ?: return null
        val role = prefs.getString(KEY_ROLE, null) ?: return null
        return UserSession(id, email, fullName, role)
    }

    override fun isLoggedIn(): Boolean =
        !getAccessToken().isNullOrBlank() && getUser() != null

    override fun saveTokens(accessToken: String, refreshToken: String?) {
        prefs.edit()
            .putString(KEY_ACCESS, accessToken)
            .apply {
                if (!refreshToken.isNullOrBlank()) {
                    putString(KEY_REFRESH, refreshToken)
                }
            }
            .apply()
    }

    override fun saveSession(
        accessToken: String,
        refreshToken: String?,
        user: UserSession,
    ) {
        prefs.edit()
            .putString(KEY_ACCESS, accessToken)
            .putString(KEY_REFRESH, refreshToken)
            .putString(KEY_USER_ID, user.id)
            .putString(KEY_EMAIL, user.email)
            .putString(KEY_FULL_NAME, user.fullName)
            .putString(KEY_ROLE, user.role)
            .apply()
    }

    override fun clear() {
        prefs.edit().clear().apply()
    }

    private companion object {
        const val PREFS_NAME = "mecatrack_session"
        const val KEY_ACCESS = "access_token"
        const val KEY_REFRESH = "refresh_token"
        const val KEY_USER_ID = "user_id"
        const val KEY_EMAIL = "user_email"
        const val KEY_FULL_NAME = "user_full_name"
        const val KEY_ROLE = "user_role"
    }
}
