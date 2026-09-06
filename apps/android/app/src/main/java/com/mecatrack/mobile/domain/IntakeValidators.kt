package com.mecatrack.mobile.domain

object IntakeValidators {
    private val nationalIdPattern = Regex("^[a-zA-Z0-9-]+$")
    private val phonePattern = Regex("^[0-9]{8,15}$")
    private val emailPattern = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")

    fun normalizePlate(value: String): String =
        value.trim().uppercase().replace("\\s+".toRegex(), "")

    fun normalizePhone(value: String): String =
        value.filter { it.isDigit() }

    fun validatePlate(value: String): String? {
        val plate = normalizePlate(value)
        return when {
            plate.length < 2 -> "La placa debe tener al menos 2 caracteres"
            plate.length > 15 -> "La placa no puede superar 15 caracteres"
            else -> null
        }
    }

    fun validateClient(
        fullName: String,
        nationalId: String,
        phone: String,
        email: String,
    ): String? {
        val name = fullName.trim()
        if (name.length < 2) return "El nombre debe tener al menos 2 caracteres"
        if (name.length > 150) return "El nombre no puede superar 150 caracteres"

        val id = nationalId.trim()
        if (id.length < 5) return "La identificación debe tener al menos 5 caracteres"
        if (id.length > 20) return "La identificación no puede superar 20 caracteres"
        if (!nationalIdPattern.matches(id)) {
            return "La identificación solo puede contener letras, números y guiones"
        }

        val digits = normalizePhone(phone)
        if (phone.isNotBlank() && !phonePattern.matches(digits)) {
            return "El teléfono debe tener entre 8 y 15 dígitos"
        }

        val mail = email.trim()
        if (mail.isNotEmpty() && !emailPattern.matches(mail)) {
            return "Introduce un correo electrónico válido"
        }
        return null
    }

    fun validateVehicle(
        licensePlate: String,
        brand: String,
        model: String,
        year: Int,
        color: String,
        currentYear: Int,
    ): String? {
        validatePlate(licensePlate)?.let { return it }
        if (brand.trim().isEmpty()) return "La marca es obligatoria"
        if (brand.trim().length > 60) return "La marca no puede superar 60 caracteres"
        if (model.trim().isEmpty()) return "El modelo es obligatorio"
        if (model.trim().length > 60) return "El modelo no puede superar 60 caracteres"
        if (year < 1900) return "El año debe ser 1900 o posterior"
        if (year > currentYear + 1) return "El año no puede ser posterior a ${currentYear + 1}"
        if (color.trim().length > 40) return "El color no puede superar 40 caracteres"
        return null
    }

    fun validateWorkOrder(
        entryReason: String,
        mileageText: String,
        taskDescription: String,
        requiresBroughtBy: Boolean,
        broughtByName: String,
        broughtByPhone: String,
    ): String? {
        val reason = entryReason.trim()
        if (reason.length < 5) return "El motivo debe tener al menos 5 caracteres"
        if (reason.length > 500) return "El motivo no puede superar 500 caracteres"

        if (mileageText.isNotBlank()) {
            val mileage = mileageText.trim().toIntOrNull()
                ?: return "El kilometraje debe ser un número entero"
            if (mileage < 0) return "El kilometraje no puede ser negativo"
        }

        val task = taskDescription.trim()
        if (task.length < 3) return "La tarea inicial debe tener al menos 3 caracteres"
        if (task.length > 300) return "La tarea inicial no puede superar 300 caracteres"

        if (requiresBroughtBy) {
            val name = broughtByName.trim()
            if (name.length < 2) return "Indica quién trajo el vehículo"
            if (name.length > 150) return "El nombre de quien trae no puede superar 150 caracteres"
            val digits = normalizePhone(broughtByPhone)
            if (broughtByPhone.isNotBlank() && !phonePattern.matches(digits)) {
                return "El teléfono de quien trae debe tener entre 8 y 15 dígitos"
            }
        }
        return null
    }
}
