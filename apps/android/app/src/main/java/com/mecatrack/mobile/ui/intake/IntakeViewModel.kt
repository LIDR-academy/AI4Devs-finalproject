package com.mecatrack.mobile.ui.intake

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mecatrack.mobile.data.api.ActiveWorkOrderDto
import com.mecatrack.mobile.data.api.ClientDto
import com.mecatrack.mobile.data.api.CreateClientRequest
import com.mecatrack.mobile.data.api.CreateVehicleRequest
import com.mecatrack.mobile.data.api.CreateWorkOrderRequest
import com.mecatrack.mobile.data.api.ExistingVehicleDto
import com.mecatrack.mobile.data.api.InitialTaskRequest
import com.mecatrack.mobile.data.api.MechanicDto
import com.mecatrack.mobile.data.api.VehicleDto
import com.mecatrack.mobile.data.api.WorkOrderDetailDto
import com.mecatrack.mobile.data.api.readApiError
import com.mecatrack.mobile.data.repository.MecaTrackRepository
import com.mecatrack.mobile.domain.IntakeValidators
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import java.util.Calendar

enum class IntakeStep {
    SEARCH_VEHICLE,
    REGISTER_CLIENT,
    REGISTER_VEHICLE,
    CREATE_ORDER,
    SUCCESS,
}

data class IntakeUiState(
    val step: IntakeStep = IntakeStep.SEARCH_VEHICLE,
    val plateQuery: String = "",
    val vehicleResults: List<VehicleDto> = emptyList(),
    val vehicleSearchDone: Boolean = false,
    val selectedVehicle: VehicleDto? = null,
    val originatedFromNewVehicle: Boolean = false,
    val clientQuery: String = "",
    val clientResults: List<ClientDto> = emptyList(),
    val clientSearchDone: Boolean = false,
    val selectedClient: ClientDto? = null,
    val withoutOwner: Boolean = false,
    val clientName: String = "",
    val clientNationalId: String = "",
    val clientPhone: String = "",
    val clientEmail: String = "",
    val vehiclePlate: String = "",
    val vehicleBrand: String = "",
    val vehicleModel: String = "",
    val vehicleYear: String = Calendar.getInstance().get(Calendar.YEAR).toString(),
    val vehicleColor: String = "",
    val entryReason: String = "",
    val mileage: String = "",
    val taskDescription: String = "",
    val assignedMechanicId: String = "",
    val broughtByName: String = "",
    val broughtByPhone: String = "",
    val mechanics: List<MechanicDto> = emptyList(),
    val activeWorkOrder: ActiveWorkOrderDto? = null,
    val createdWorkOrder: WorkOrderDetailDto? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
)

class IntakeViewModel(
    private val repository: MecaTrackRepository,
    private val json: Json,
) : ViewModel() {
    var uiState by mutableStateOf(IntakeUiState())
        private set

    private var vehicleSearchJob: Job? = null
    private var clientSearchJob: Job? = null

    fun onPlateQueryChange(value: String) {
        uiState = uiState.copy(
            plateQuery = value,
            errorMessage = null,
            vehicleSearchDone = false,
        )
        vehicleSearchJob?.cancel()
        val query = value.trim()
        if (query.length < 2) {
            uiState = uiState.copy(vehicleResults = emptyList())
            return
        }
        vehicleSearchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            searchVehicles(query)
        }
    }

    fun selectVehicle(vehicle: VehicleDto, fromNewVehicle: Boolean = false) {
        viewModelScope.launch {
            uiState = uiState.copy(
                isLoading = true,
                errorMessage = null,
                selectedVehicle = vehicle,
                originatedFromNewVehicle = fromNewVehicle,
            )
            val result = runCatching {
                val active = repository.activeWorkOrder(vehicle.id)
                val mechanics = repository.mechanics()
                active to mechanics
            }
            result.fold(
                onSuccess = { (active, mechanics) ->
                    uiState = uiState.copy(
                        isLoading = false,
                        step = IntakeStep.CREATE_ORDER,
                        activeWorkOrder = active.activeWorkOrder,
                        mechanics = mechanics,
                    )
                },
                onFailure = { error ->
                    uiState = uiState.copy(
                        isLoading = false,
                        errorMessage = readApiError(error, json).first,
                    )
                },
            )
        }
    }

    fun startRegisterVehicle() {
        uiState = uiState.copy(
            step = IntakeStep.REGISTER_CLIENT,
            originatedFromNewVehicle = true,
            vehiclePlate = IntakeValidators.normalizePlate(uiState.plateQuery),
            errorMessage = null,
        )
    }

    fun onClientQueryChange(value: String) {
        uiState = uiState.copy(clientQuery = value, errorMessage = null, clientSearchDone = false)
        clientSearchJob?.cancel()
        val query = value.trim()
        if (query.length < 2) {
            uiState = uiState.copy(clientResults = emptyList())
            return
        }
        clientSearchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            uiState = uiState.copy(isLoading = true)
            val result = runCatching { repository.searchClients(query) }
            result.fold(
                onSuccess = { response ->
                    uiState = uiState.copy(
                        isLoading = false,
                        clientResults = response.items,
                        clientSearchDone = true,
                    )
                },
                onFailure = { error ->
                    uiState = uiState.copy(
                        isLoading = false,
                        clientSearchDone = true,
                        errorMessage = readApiError(error, json).first,
                    )
                },
            )
        }
    }

    fun selectClient(client: ClientDto) {
        uiState = uiState.copy(
            selectedClient = client,
            withoutOwner = false,
            step = IntakeStep.REGISTER_VEHICLE,
            errorMessage = null,
        )
    }

    fun onClientField(
        name: String = uiState.clientName,
        nationalId: String = uiState.clientNationalId,
        phone: String = uiState.clientPhone,
        email: String = uiState.clientEmail,
    ) {
        uiState = uiState.copy(
            clientName = name,
            clientNationalId = nationalId,
            clientPhone = phone,
            clientEmail = email,
            errorMessage = null,
        )
    }

    fun createClient() {
        val validation = IntakeValidators.validateClient(
            uiState.clientName,
            uiState.clientNationalId,
            uiState.clientPhone,
            uiState.clientEmail,
        )
        if (validation != null) {
            uiState = uiState.copy(errorMessage = validation)
            return
        }
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val phone = IntakeValidators.normalizePhone(uiState.clientPhone).ifBlank { null }
            val email = uiState.clientEmail.trim().ifBlank { null }
            val result = runCatching {
                repository.createClient(
                    CreateClientRequest(
                        fullName = uiState.clientName.trim(),
                        nationalId = uiState.clientNationalId.trim(),
                        phone = phone,
                        email = email,
                    ),
                )
            }
            result.fold(
                onSuccess = { client ->
                    uiState = uiState.copy(
                        isLoading = false,
                        selectedClient = client,
                        withoutOwner = false,
                        step = IntakeStep.REGISTER_VEHICLE,
                    )
                },
                onFailure = { error ->
                    val (message, body) = readApiError(error, json)
                    val existing = body?.existingClient
                    if (existing != null) {
                        uiState = uiState.copy(
                            isLoading = false,
                            selectedClient = existing,
                            withoutOwner = false,
                            step = IntakeStep.REGISTER_VEHICLE,
                            errorMessage = EXISTING_CLIENT,
                        )
                    } else {
                        uiState = uiState.copy(isLoading = false, errorMessage = message)
                    }
                },
            )
        }
    }

    fun skipClientAndRegisterVehicle() {
        uiState = uiState.copy(
            withoutOwner = true,
            selectedClient = null,
            step = IntakeStep.REGISTER_VEHICLE,
            errorMessage = null,
        )
    }

    fun onVehicleField(
        plate: String = uiState.vehiclePlate,
        brand: String = uiState.vehicleBrand,
        model: String = uiState.vehicleModel,
        year: String = uiState.vehicleYear,
        color: String = uiState.vehicleColor,
    ) {
        uiState = uiState.copy(
            vehiclePlate = plate,
            vehicleBrand = brand,
            vehicleModel = model,
            vehicleYear = year,
            vehicleColor = color,
            errorMessage = null,
        )
    }

    fun createVehicle() {
        val year = uiState.vehicleYear.trim().toIntOrNull()
        if (year == null) {
            uiState = uiState.copy(errorMessage = "El año debe ser un número entero")
            return
        }
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val validation = IntakeValidators.validateVehicle(
            uiState.vehiclePlate,
            uiState.vehicleBrand,
            uiState.vehicleModel,
            year,
            uiState.vehicleColor,
            currentYear,
        )
        if (validation != null) {
            uiState = uiState.copy(errorMessage = validation)
            return
        }
        if (!uiState.withoutOwner && uiState.selectedClient == null) {
            uiState = uiState.copy(errorMessage = "Selecciona o registra un propietario")
            return
        }
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val color = uiState.vehicleColor.trim().ifBlank { null }
            val result = runCatching {
                repository.createVehicle(
                    CreateVehicleRequest(
                        licensePlate = IntakeValidators.normalizePlate(uiState.vehiclePlate),
                        brand = uiState.vehicleBrand.trim(),
                        model = uiState.vehicleModel.trim(),
                        year = year,
                        color = color,
                        clientId = if (uiState.withoutOwner) null else uiState.selectedClient?.id,
                    ),
                )
            }
            result.fold(
                onSuccess = { vehicle -> selectVehicle(vehicle, fromNewVehicle = true) },
                onFailure = { error ->
                    val (message, body) = readApiError(error, json)
                    val existing = body?.existingVehicle
                    if (existing != null) {
                        openExistingVehicle(existing)
                    } else {
                        uiState = uiState.copy(isLoading = false, errorMessage = message)
                    }
                },
            )
        }
    }

    fun onOrderField(
        reason: String = uiState.entryReason,
        mileage: String = uiState.mileage,
        task: String = uiState.taskDescription,
        mechanicId: String = uiState.assignedMechanicId,
        broughtByName: String = uiState.broughtByName,
        broughtByPhone: String = uiState.broughtByPhone,
    ) {
        uiState = uiState.copy(
            entryReason = reason,
            mileage = mileage,
            taskDescription = task,
            assignedMechanicId = mechanicId,
            broughtByName = broughtByName,
            broughtByPhone = broughtByPhone,
            errorMessage = null,
        )
    }

    fun createWorkOrder() {
        val vehicle = uiState.selectedVehicle
        if (vehicle == null) {
            uiState = uiState.copy(errorMessage = "Selecciona un vehículo")
            return
        }
        if (uiState.activeWorkOrder != null) {
            uiState = uiState.copy(errorMessage = ACTIVE_ORDER_BLOCK)
            return
        }
        val requiresBroughtBy = vehicle.currentOwner == null
        val validation = IntakeValidators.validateWorkOrder(
            uiState.entryReason,
            uiState.mileage,
            uiState.taskDescription,
            requiresBroughtBy,
            uiState.broughtByName,
            uiState.broughtByPhone,
        )
        if (validation != null) {
            uiState = uiState.copy(errorMessage = validation)
            return
        }
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val mileage = uiState.mileage.trim().toIntOrNull()
            val mechanicId = uiState.assignedMechanicId.ifBlank { null }
            val result = runCatching {
                repository.createWorkOrder(
                    CreateWorkOrderRequest(
                        vehicleId = vehicle.id,
                        entryReason = uiState.entryReason.trim(),
                        mileage = mileage,
                        assignedMechanicId = mechanicId,
                        intakeMode = if (requiresBroughtBy) "THIRD_PARTY" else null,
                        broughtByName = if (requiresBroughtBy) uiState.broughtByName.trim() else null,
                        broughtByPhone = if (requiresBroughtBy) {
                            IntakeValidators.normalizePhone(uiState.broughtByPhone).ifBlank { null }
                        } else {
                            null
                        },
                        initialTasks = listOf(
                            InitialTaskRequest(uiState.taskDescription.trim()),
                        ),
                    ),
                )
            }
            result.fold(
                onSuccess = { created ->
                    uiState = uiState.copy(
                        isLoading = false,
                        createdWorkOrder = created,
                        step = IntakeStep.SUCCESS,
                    )
                },
                onFailure = { error ->
                    val (message, body) = readApiError(error, json)
                    if (body?.activeWorkOrderId != null) {
                        uiState = uiState.copy(
                            isLoading = false,
                            activeWorkOrder = ActiveWorkOrderDto(
                                id = body.activeWorkOrderId,
                                status = "EN_PROCESO",
                                checkedInAt = "",
                            ),
                            errorMessage = ACTIVE_ORDER_BLOCK,
                        )
                    } else {
                        uiState = uiState.copy(isLoading = false, errorMessage = message)
                    }
                },
            )
        }
    }

    fun goBack() {
        uiState = when (uiState.step) {
            IntakeStep.REGISTER_CLIENT -> uiState.copy(
                step = IntakeStep.SEARCH_VEHICLE,
                errorMessage = null,
            )
            IntakeStep.REGISTER_VEHICLE -> uiState.copy(
                step = IntakeStep.REGISTER_CLIENT,
                errorMessage = null,
            )
            IntakeStep.CREATE_ORDER -> uiState.copy(
                step = if (uiState.originatedFromNewVehicle) {
                    IntakeStep.REGISTER_VEHICLE
                } else {
                    IntakeStep.SEARCH_VEHICLE
                },
                selectedVehicle = null,
                activeWorkOrder = null,
                errorMessage = null,
            )
            else -> uiState
        }
    }

    private suspend fun searchVehicles(query: String) {
        uiState = uiState.copy(isLoading = true)
        val result = runCatching { repository.searchVehicles(query) }
        result.fold(
            onSuccess = { response ->
                uiState = uiState.copy(
                    isLoading = false,
                    vehicleResults = response.items,
                    vehicleSearchDone = true,
                )
            },
            onFailure = { error ->
                uiState = uiState.copy(
                    isLoading = false,
                    vehicleSearchDone = true,
                    errorMessage = readApiError(error, json).first,
                )
            },
        )
    }

    private fun openExistingVehicle(existing: ExistingVehicleDto) {
        viewModelScope.launch {
            val match = runCatching { repository.searchVehicles(existing.licensePlate) }
                .getOrNull()
                ?.items
                ?.firstOrNull { it.id == existing.id }
                ?: VehicleDto(
                    id = existing.id,
                    licensePlate = existing.licensePlate,
                    brand = existing.brand,
                    model = existing.model,
                    year = existing.year,
                )
            uiState = uiState.copy(originatedFromNewVehicle = false)
            selectVehicle(match, fromNewVehicle = false)
        }
    }

    companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
        const val ACTIVE_ORDER_BLOCK =
            "Este vehículo ya tiene una orden activa. No se puede crear otra hasta entregarla."
        const val EXISTING_CLIENT =
            "Ya existía un cliente con esa identificación; se usará ese registro."
    }
}
