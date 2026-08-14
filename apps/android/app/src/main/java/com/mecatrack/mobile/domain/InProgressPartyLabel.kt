package com.mecatrack.mobile.domain

fun inProgressPartyLabel(ownerFullName: String?, broughtByName: String?): String {
    val owner = ownerFullName?.trim().orEmpty()
    if (owner.isNotEmpty()) {
        return owner
    }
    val broughtBy = broughtByName?.trim().orEmpty()
    if (broughtBy.isNotEmpty()) {
        return "Traído por $broughtBy"
    }
    return "Sin propietario"
}
