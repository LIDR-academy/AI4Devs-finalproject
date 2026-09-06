package com.mecatrack.mobile.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class IntakeValidatorsTest {
    @Test
    fun normalizePlateRemovesSpacesAndUppercases() {
        assertEquals("ABC123", IntakeValidators.normalizePlate(" abc 123 "))
    }

    @Test
    fun validatePlateAcceptsTwoToFifteenCharacters() {
        assertNull(IntakeValidators.validatePlate("AB"))
        assertNull(IntakeValidators.validatePlate("ABCDEFGHIJKLMNO"))
    }

    @Test
    fun validatePlateRejectsShortAndLongValues() {
        assertEquals(
            "La placa debe tener al menos 2 caracteres",
            IntakeValidators.validatePlate("A"),
        )
        assertEquals(
            "La placa no puede superar 15 caracteres",
            IntakeValidators.validatePlate("ABCDEFGHIJKLMNOP"),
        )
    }

    @Test
    fun validateClientAcceptsValidPayload() {
        assertNull(
            IntakeValidators.validateClient(
                fullName = "Ana Pérez",
                nationalId = "1-2345-6789",
                phone = "8888-1234",
                email = "ana@taller.com",
            ),
        )
    }

    @Test
    fun validateClientRejectsNameBounds() {
        assertEquals(
            "El nombre debe tener al menos 2 caracteres",
            IntakeValidators.validateClient("A", "12345", "", ""),
        )
        assertEquals(
            "El nombre no puede superar 150 caracteres",
            IntakeValidators.validateClient("A".repeat(151), "12345", "", ""),
        )
    }

    @Test
    fun validateClientRejectsNationalIdBoundsAndCharset() {
        assertEquals(
            "La identificación debe tener al menos 5 caracteres",
            IntakeValidators.validateClient("Ana Perez", "1234", "", ""),
        )
        assertEquals(
            "La identificación no puede superar 20 caracteres",
            IntakeValidators.validateClient("Ana Perez", "A".repeat(21), "", ""),
        )
        assertEquals(
            "La identificación solo puede contener letras, números y guiones",
            IntakeValidators.validateClient("Ana Perez", "12_345", "", ""),
        )
    }

    @Test
    fun validateClientRejectsInvalidOptionalPhoneAndEmail() {
        assertEquals(
            "El teléfono debe tener entre 8 y 15 dígitos",
            IntakeValidators.validateClient("Ana Perez", "12345", "123", ""),
        )
        assertEquals(
            "Introduce un correo electrónico válido",
            IntakeValidators.validateClient("Ana Perez", "12345", "", "not-an-email"),
        )
    }

    @Test
    fun validateVehicleAcceptsValidPayload() {
        assertNull(
            IntakeValidators.validateVehicle("ABC123", "Toyota", "Yaris", 2020, "Rojo", 2026),
        )
    }

    @Test
    fun validateVehicleRejectsMissingBrandAndModel() {
        assertEquals(
            "La marca es obligatoria",
            IntakeValidators.validateVehicle("ABC123", "  ", "Yaris", 2020, "", 2026),
        )
        assertEquals(
            "El modelo es obligatorio",
            IntakeValidators.validateVehicle("ABC123", "Toyota", " ", 2020, "", 2026),
        )
    }

    @Test
    fun validateVehicleRejectsYearAndColorBounds() {
        assertEquals(
            "El año debe ser 1900 o posterior",
            IntakeValidators.validateVehicle("ABC123", "Toyota", "Yaris", 1899, "", 2026),
        )
        assertEquals(
            "El año no puede ser posterior a 2027",
            IntakeValidators.validateVehicle("ABC123", "Toyota", "Yaris", 2028, "", 2026),
        )
        assertEquals(
            "El color no puede superar 40 caracteres",
            IntakeValidators.validateVehicle("ABC123", "Toyota", "Yaris", 2020, "C".repeat(41), 2026),
        )
    }

    @Test
    fun validateWorkOrderRequiresBroughtByWhenOwnerless() {
        assertEquals(
            "Indica quién trajo el vehículo",
            IntakeValidators.validateWorkOrder(
                entryReason = "Ruido en motor",
                mileageText = "12000",
                taskDescription = "Revisar motor",
                requiresBroughtBy = true,
                broughtByName = "",
                broughtByPhone = "",
            ),
        )
    }

    @Test
    fun validateWorkOrderAcceptsOwnerIntake() {
        assertNull(
            IntakeValidators.validateWorkOrder(
                entryReason = "Cambio de aceite",
                mileageText = "",
                taskDescription = "Aceite y filtro",
                requiresBroughtBy = false,
                broughtByName = "",
                broughtByPhone = "",
            ),
        )
    }

    @Test
    fun validateWorkOrderRejectsReasonTaskMileageAndBroughtByPhone() {
        assertEquals(
            "El motivo debe tener al menos 5 caracteres",
            IntakeValidators.validateWorkOrder("abcd", "", "Revisar", false, "", ""),
        )
        assertEquals(
            "El kilometraje debe ser un número entero",
            IntakeValidators.validateWorkOrder("Cambio de aceite", "12.5", "Revisar", false, "", ""),
        )
        assertEquals(
            "El kilometraje no puede ser negativo",
            IntakeValidators.validateWorkOrder("Cambio de aceite", "-1", "Revisar", false, "", ""),
        )
        assertEquals(
            "La tarea inicial debe tener al menos 3 caracteres",
            IntakeValidators.validateWorkOrder("Cambio de aceite", "", "ab", false, "", ""),
        )
        assertEquals(
            "El teléfono de quien trae debe tener entre 8 y 15 dígitos",
            IntakeValidators.validateWorkOrder(
                entryReason = "Cambio de aceite",
                mileageText = "",
                taskDescription = "Revisar",
                requiresBroughtBy = true,
                broughtByName = "Carlos",
                broughtByPhone = "123",
            ),
        )
    }
}
