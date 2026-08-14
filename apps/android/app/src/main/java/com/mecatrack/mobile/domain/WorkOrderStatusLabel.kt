package com.mecatrack.mobile.domain

fun workOrderStatusLabel(status: String): String =
    when (status) {
        "EN_PROCESO" -> "En proceso"
        "LISTA_PARA_ENTREGA" -> "Lista para entrega"
        "OWNER_CONTACTED" -> "Propietario contactado"
        else -> status
    }
