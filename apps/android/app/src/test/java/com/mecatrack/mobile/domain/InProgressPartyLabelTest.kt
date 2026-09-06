package com.mecatrack.mobile.domain

import org.junit.Assert.assertEquals
import org.junit.Test

class InProgressPartyLabelTest {
    @Test
    fun ownerNameWinsOverBroughtBy() {
        assertEquals("Ana", inProgressPartyLabel("Ana", "Carlos"))
    }

    @Test
    fun blankOwnerUsesBroughtBy() {
        assertEquals("Traído por Carlos", inProgressPartyLabel(null, "Carlos"))
        assertEquals("Traído por Carlos", inProgressPartyLabel("  ", "Carlos"))
    }

    @Test
    fun missingOwnerAndBroughtByIsSinPropietario() {
        assertEquals("Sin propietario", inProgressPartyLabel(null, null))
        assertEquals("Sin propietario", inProgressPartyLabel("", ""))
        assertEquals("Sin propietario", inProgressPartyLabel("  ", "  "))
    }
}
