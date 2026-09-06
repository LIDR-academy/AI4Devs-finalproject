package com.mecatrack.mobile.data.api

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class RefreshRequest(
    val refreshToken: String,
)

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val fullName: String,
    val role: String,
    val active: Boolean? = null,
)

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String? = null,
    val user: UserDto,
)

@Serializable
data class RefreshResponse(
    val accessToken: String,
    val refreshToken: String? = null,
)

@Serializable
data class CurrentOwnerDto(
    val id: String,
    val fullName: String,
    val nationalId: String,
)

@Serializable
data class VehicleDto(
    val id: String,
    val licensePlate: String,
    val brand: String,
    val model: String,
    val year: Int,
    val color: String? = null,
    val currentOwner: CurrentOwnerDto? = null,
    val createdAt: String? = null,
)

@Serializable
data class VehicleSearchResponse(
    val items: List<VehicleDto>,
    val total: Int,
)

@Serializable
data class CreateVehicleRequest(
    val licensePlate: String,
    val brand: String,
    val model: String,
    val year: Int,
    val color: String? = null,
    val clientId: String? = null,
)

@Serializable
data class ClientDto(
    val id: String,
    val fullName: String,
    val nationalId: String,
    val phone: String? = null,
    val email: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class ClientSearchResponse(
    val items: List<ClientDto>,
    val total: Int,
)

@Serializable
data class CreateClientRequest(
    val fullName: String,
    val nationalId: String,
    val phone: String? = null,
    val email: String? = null,
)

@Serializable
data class MechanicDto(
    val id: String,
    val fullName: String,
    val role: String,
)

@Serializable
data class ActiveWorkOrderDto(
    val id: String,
    val status: String,
    val checkedInAt: String,
)

@Serializable
data class ActiveWorkOrderResponse(
    val activeWorkOrder: ActiveWorkOrderDto? = null,
)

@Serializable
data class InProgressVehicleDto(
    val id: String,
    val licensePlate: String,
    val brand: String,
    val model: String,
)

@Serializable
data class InProgressOwnerDto(
    val fullName: String,
    val nationalId: String,
)

@Serializable
data class InProgressItemDto(
    val id: String,
    val status: String,
    val entryReason: String,
    val checkedInAt: String,
    val updatedAt: String,
    val vehicle: InProgressVehicleDto,
    val owner: InProgressOwnerDto? = null,
    val broughtByName: String? = null,
    val intakeMode: String,
    val assignedMechanic: MechanicDto? = null,
)

@Serializable
data class InProgressResponse(
    val items: List<InProgressItemDto>,
    val total: Int,
    val limit: Int,
    val offset: Int,
)

@Serializable
data class InitialTaskRequest(
    val description: String,
)

@Serializable
data class CreateWorkOrderRequest(
    val vehicleId: String,
    val entryReason: String,
    val mileage: Int? = null,
    val assignedMechanicId: String? = null,
    val intakeMode: String? = null,
    val broughtByName: String? = null,
    val broughtByPhone: String? = null,
    val initialTasks: List<InitialTaskRequest>,
)

@Serializable
data class WorkOrderVehicleDto(
    val licensePlate: String,
    val brand: String,
    val model: String,
)

@Serializable
data class WorkOrderDetailDto(
    val id: String,
    val vehicleId: String,
    val status: String,
    val entryReason: String,
    val vehicle: WorkOrderVehicleDto,
    val owner: InProgressOwnerDto? = null,
)

@Serializable
data class ExistingVehicleDto(
    val id: String,
    val licensePlate: String,
    val brand: String,
    val model: String,
    val year: Int,
)

@Serializable
data class ApiErrorBody(
    val statusCode: Int? = null,
    val message: kotlinx.serialization.json.JsonElement? = null,
    val existingClient: ClientDto? = null,
    val existingVehicle: ExistingVehicleDto? = null,
    val activeWorkOrderId: String? = null,
)
