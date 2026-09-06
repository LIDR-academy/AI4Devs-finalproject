package com.mecatrack.mobile.domain

import org.junit.Assert.assertEquals
import org.junit.Test

class WorkOrderStatusLabelTest {
    @Test
    fun mapsKnownActiveStatuses() {
        assertEquals("En proceso", workOrderStatusLabel("EN_PROCESO"))
        assertEquals("Lista para entrega", workOrderStatusLabel("LISTA_PARA_ENTREGA"))
        assertEquals("Propietario contactado", workOrderStatusLabel("OWNER_CONTACTED"))
    }

    @Test
    fun unknownAndDeliveredReturnRawStatus() {
        assertEquals("ENTREGADA", workOrderStatusLabel("ENTREGADA"))
        assertEquals("UNKNOWN_STATUS", workOrderStatusLabel("UNKNOWN_STATUS"))
    }
}
