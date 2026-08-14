package com.mecatrack.mobile.ui.intake

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mecatrack.mobile.data.api.ClientDto
import com.mecatrack.mobile.data.api.VehicleDto
import com.mecatrack.mobile.ui.components.AppTextField
import com.mecatrack.mobile.ui.components.ErrorBanner

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IntakeWizardScreen(
    viewModel: IntakeViewModel,
    onClose: () -> Unit,
) {
    val state = viewModel.uiState
    val title = when (state.step) {
        IntakeStep.SEARCH_VEHICLE -> "Buscar vehículo"
        IntakeStep.REGISTER_CLIENT -> "Registrar cliente"
        IntakeStep.REGISTER_VEHICLE -> "Registrar vehículo"
        IntakeStep.CREATE_ORDER -> "Nueva orden"
        IntakeStep.SUCCESS -> "Orden creada"
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(
                        onClick = {
                            if (state.step == IntakeStep.SEARCH_VEHICLE ||
                                state.step == IntakeStep.SUCCESS
                            ) {
                                onClose()
                            } else {
                                viewModel.goBack()
                            }
                        },
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Atrás")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            ErrorBanner(state.errorMessage)
            if (state.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                Spacer(Modifier.height(16.dp))
            }
            when (state.step) {
                IntakeStep.SEARCH_VEHICLE -> SearchVehicleStep(state, viewModel)
                IntakeStep.REGISTER_CLIENT -> RegisterClientStep(state, viewModel)
                IntakeStep.REGISTER_VEHICLE -> RegisterVehicleStep(state, viewModel)
                IntakeStep.CREATE_ORDER -> CreateOrderStep(state, viewModel)
                IntakeStep.SUCCESS -> SuccessStep(state, onClose)
            }
        }
    }
}

@Composable
private fun SearchVehicleStep(state: IntakeUiState, viewModel: IntakeViewModel) {
    Text("Paso 1 — Busca por placa. Si no existe, registra cliente y vehículo.")
    Spacer(Modifier.height(12.dp))
    AppTextField(
        value = state.plateQuery,
        onValueChange = viewModel::onPlateQueryChange,
        label = "Placa",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(16.dp))
    state.vehicleResults.forEach { vehicle ->
        VehicleResultCard(vehicle, enabled = !state.isLoading) {
            viewModel.selectVehicle(vehicle)
        }
        Spacer(Modifier.height(8.dp))
    }
    if (state.vehicleSearchDone && state.vehicleResults.isEmpty() && !state.isLoading) {
        Text("No se encontró esa placa")
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = viewModel::startRegisterVehicle,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Registrar cliente y vehículo")
        }
    }
}

@Composable
private fun VehicleResultCard(
    vehicle: VehicleDto,
    enabled: Boolean,
    onSelect: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(vehicle.licensePlate, style = MaterialTheme.typography.titleMedium)
            Text("${vehicle.brand} ${vehicle.model} ${vehicle.year}")
            Text(
                "Propietario: ${vehicle.currentOwner?.fullName ?: "Sin propietario"}",
            )
            Button(onClick = onSelect, enabled = enabled, modifier = Modifier.fillMaxWidth()) {
                Text("Seleccionar")
            }
        }
    }
}

@Composable
private fun RegisterClientStep(state: IntakeUiState, viewModel: IntakeViewModel) {
    Text("Paso 2 — Busca un cliente existente o crea uno nuevo.")
    Spacer(Modifier.height(12.dp))
    AppTextField(
        value = state.clientQuery,
        onValueChange = viewModel::onClientQueryChange,
        label = "Buscar cliente (nombre o cédula)",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(12.dp))
    state.clientResults.forEach { client ->
        ClientResultCard(client, enabled = !state.isLoading) {
            viewModel.selectClient(client)
        }
        Spacer(Modifier.height(8.dp))
    }
    if (state.clientSearchDone && state.clientResults.isEmpty()) {
        Text("No hay coincidencias. Completa los datos para crear el cliente.")
        Spacer(Modifier.height(8.dp))
    }
    AppTextField(
        value = state.clientName,
        onValueChange = { viewModel.onClientField(name = it) },
        label = "Nombre completo",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.clientNationalId,
        onValueChange = { viewModel.onClientField(nationalId = it) },
        label = "Identificación",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.clientPhone,
        onValueChange = { viewModel.onClientField(phone = it) },
        label = "Teléfono (opcional)",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.clientEmail,
        onValueChange = { viewModel.onClientField(email = it) },
        label = "Correo (opcional)",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(16.dp))
    Button(
        onClick = viewModel::createClient,
        enabled = !state.isLoading,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text("Crear cliente y continuar")
    }
    Spacer(Modifier.height(8.dp))
    OutlinedButton(
        onClick = viewModel::skipClientAndRegisterVehicle,
        enabled = !state.isLoading,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text("Continuar sin propietario")
    }
}

@Composable
private fun ClientResultCard(
    client: ClientDto,
    enabled: Boolean,
    onSelect: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(client.fullName, style = MaterialTheme.typography.titleMedium)
            Text(client.nationalId)
            Button(onClick = onSelect, enabled = enabled, modifier = Modifier.fillMaxWidth()) {
                Text("Usar este cliente")
            }
        }
    }
}

@Composable
private fun RegisterVehicleStep(state: IntakeUiState, viewModel: IntakeViewModel) {
    val ownerLabel = state.selectedClient?.fullName ?: "Sin propietario"
    Text("Paso 3 — Datos del vehículo. Propietario: $ownerLabel")
    Spacer(Modifier.height(12.dp))
    AppTextField(
        value = state.vehiclePlate,
        onValueChange = { viewModel.onVehicleField(plate = it) },
        label = "Placa",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.vehicleBrand,
        onValueChange = { viewModel.onVehicleField(brand = it) },
        label = "Marca",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.vehicleModel,
        onValueChange = { viewModel.onVehicleField(model = it) },
        label = "Modelo",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.vehicleYear,
        onValueChange = { viewModel.onVehicleField(year = it) },
        label = "Año",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.vehicleColor,
        onValueChange = { viewModel.onVehicleField(color = it) },
        label = "Color (opcional)",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(16.dp))
    Button(
        onClick = viewModel::createVehicle,
        enabled = !state.isLoading,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text("Registrar vehículo y continuar")
    }
}

@Composable
private fun CreateOrderStep(state: IntakeUiState, viewModel: IntakeViewModel) {
    val vehicle = state.selectedVehicle
    if (vehicle != null) {
        Text("${vehicle.licensePlate} · ${vehicle.brand} ${vehicle.model}")
        Text("Propietario: ${vehicle.currentOwner?.fullName ?: "Sin propietario"}")
        Spacer(Modifier.height(12.dp))
    }
    if (state.activeWorkOrder != null) {
        Text(IntakeViewModel.ACTIVE_ORDER_BLOCK)
        return
    }
    val needsBroughtBy = vehicle?.currentOwner == null
    AppTextField(
        value = state.entryReason,
        onValueChange = { viewModel.onOrderField(reason = it) },
        label = "Motivo de ingreso",
        enabled = !state.isLoading,
        singleLine = false,
        minLines = 3,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.mileage,
        onValueChange = { viewModel.onOrderField(mileage = it) },
        label = "Kilometraje (opcional)",
        enabled = !state.isLoading,
    )
    Spacer(Modifier.height(8.dp))
    AppTextField(
        value = state.taskDescription,
        onValueChange = { viewModel.onOrderField(task = it) },
        label = "Tarea inicial",
        enabled = !state.isLoading,
    )
    if (needsBroughtBy) {
        Spacer(Modifier.height(8.dp))
        AppTextField(
            value = state.broughtByName,
            onValueChange = { viewModel.onOrderField(broughtByName = it) },
            label = "Quién trajo el vehículo",
            enabled = !state.isLoading,
        )
        Spacer(Modifier.height(8.dp))
        AppTextField(
            value = state.broughtByPhone,
            onValueChange = { viewModel.onOrderField(broughtByPhone = it) },
            label = "Teléfono de quien trae (opcional)",
            enabled = !state.isLoading,
        )
    }
    Spacer(Modifier.height(8.dp))
    Text("Mecánico asignado", style = MaterialTheme.typography.bodyMedium)
    OutlinedButton(
        onClick = { viewModel.onOrderField(mechanicId = "") },
        enabled = !state.isLoading,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text(if (state.assignedMechanicId.isBlank()) "Sin asignar ✓" else "Sin asignar")
    }
    state.mechanics.forEach { mechanic ->
        val selected = mechanic.id == state.assignedMechanicId
        OutlinedButton(
            onClick = { viewModel.onOrderField(mechanicId = mechanic.id) },
            enabled = !state.isLoading,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(
                if (selected) {
                    "${mechanic.fullName} ✓"
                } else {
                    "${mechanic.fullName} (${mechanic.role})"
                },
            )
        }
    }
    Spacer(Modifier.height(16.dp))
    Button(
        onClick = viewModel::createWorkOrder,
        enabled = !state.isLoading,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text("Crear orden de trabajo")
    }
}

@Composable
private fun SuccessStep(state: IntakeUiState, onClose: () -> Unit) {
    val created = state.createdWorkOrder
    Text("La orden se creó correctamente.", style = MaterialTheme.typography.titleMedium)
    if (created != null) {
        Spacer(Modifier.height(8.dp))
        Text("Placa: ${created.vehicle.licensePlate}")
        Text("Motivo: ${created.entryReason}")
        created.owner?.let { Text("Propietario: ${it.fullName}") }
    }
    Spacer(Modifier.height(16.dp))
    Button(onClick = onClose, modifier = Modifier.fillMaxWidth()) {
        Text("Volver al panel")
    }
}
