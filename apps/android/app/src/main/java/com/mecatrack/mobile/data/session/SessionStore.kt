package com.mecatrack.mobile.data.session

data class UserSession(
    val id: String,
    val email: String,
    val fullName: String,
    val role: String,
)

interface SessionStore {
    fun getAccessToken(): String?
    fun getRefreshToken(): String?
    fun getUser(): UserSession?
    fun isLoggedIn(): Boolean
    fun saveTokens(accessToken: String, refreshToken: String?)
    fun saveSession(accessToken: String, refreshToken: String?, user: UserSession)
    fun clear()
}
