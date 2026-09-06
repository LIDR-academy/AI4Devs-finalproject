package com.mecatrack.mobile.data.api

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface MecaTrackApi {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("auth/refresh")
    suspend fun refresh(@Body body: RefreshRequest): RefreshResponse

    @POST("auth/logout")
    suspend fun logout()

    @GET("vehicles/search")
    suspend fun searchVehicles(@Query("q") query: String): VehicleSearchResponse

    @POST("vehicles")
    suspend fun createVehicle(@Body body: CreateVehicleRequest): VehicleDto

    @GET("clients/search")
    suspend fun searchClients(@Query("q") query: String): ClientSearchResponse

    @POST("clients")
    suspend fun createClient(@Body body: CreateClientRequest): ClientDto

    @GET("work-orders/mechanics")
    suspend fun mechanics(): List<MechanicDto>

    @GET("work-orders/active")
    suspend fun activeWorkOrder(@Query("vehicleId") vehicleId: String): ActiveWorkOrderResponse

    @GET("work-orders/in-progress")
    suspend fun inProgress(
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0,
    ): InProgressResponse

    @POST("work-orders")
    suspend fun createWorkOrder(@Body body: CreateWorkOrderRequest): WorkOrderDetailDto
}
