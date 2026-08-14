package com.mecatrack.mobile.data.repository

import com.mecatrack.mobile.data.api.ActiveWorkOrderResponse
import com.mecatrack.mobile.data.api.ClientDto
import com.mecatrack.mobile.data.api.CreateClientRequest
import com.mecatrack.mobile.data.api.CreateVehicleRequest
import com.mecatrack.mobile.data.api.CreateWorkOrderRequest
import com.mecatrack.mobile.data.api.InProgressResponse
import com.mecatrack.mobile.data.api.LoginRequest
import com.mecatrack.mobile.data.api.MecaTrackApi
import com.mecatrack.mobile.data.api.MechanicDto
import com.mecatrack.mobile.data.api.VehicleDto
import com.mecatrack.mobile.data.api.VehicleSearchResponse
import com.mecatrack.mobile.data.api.WorkOrderDetailDto
import com.mecatrack.mobile.data.session.SessionStore
import com.mecatrack.mobile.data.session.UserSession

class MecaTrackRepository(
    private val api: MecaTrackApi,
    private val sessionStore: SessionStore,
) {
    fun isLoggedIn(): Boolean = sessionStore.isLoggedIn()

    fun currentUser(): UserSession? = sessionStore.getUser()

    suspend fun login(email: String, password: String) {
        val response = api.login(LoginRequest(email.trim(), password))
        val refresh = response.refreshToken
            ?: throw IllegalStateException("Missing refresh token from API")
        sessionStore.saveSession(
            accessToken = response.accessToken,
            refreshToken = refresh,
            user = UserSession(
                id = response.user.id,
                email = response.user.email,
                fullName = response.user.fullName,
                role = response.user.role,
            ),
        )
    }

    suspend fun logout() {
        runCatching { api.logout() }
        sessionStore.clear()
    }

    suspend fun searchVehicles(query: String): VehicleSearchResponse =
        api.searchVehicles(query)

    suspend fun createVehicle(body: CreateVehicleRequest): VehicleDto =
        api.createVehicle(body)

    suspend fun searchClients(query: String) = api.searchClients(query)

    suspend fun createClient(body: CreateClientRequest): ClientDto =
        api.createClient(body)

    suspend fun mechanics(): List<MechanicDto> = api.mechanics()

    suspend fun activeWorkOrder(vehicleId: String): ActiveWorkOrderResponse =
        api.activeWorkOrder(vehicleId)

    suspend fun inProgress(): InProgressResponse =
        api.inProgress(limit = IN_PROGRESS_LIMIT, offset = 0)

    suspend fun createWorkOrder(body: CreateWorkOrderRequest): WorkOrderDetailDto =
        api.createWorkOrder(body)

    companion object {
        const val IN_PROGRESS_LIMIT = 50
    }
}
