package com.mecatrack.mobile.domain

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class ApiErrorsTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun parsesStringMessage() {
        val body = ApiErrors.parseBody(
            """{"statusCode":401,"message":"Invalid email or password","error":"Unauthorized"}""",
            json,
        )
        assertEquals("Invalid email or password", ApiErrors.messageFrom(body))
    }

    @Test
    fun parsesArrayMessage() {
        val body = ApiErrors.parseBody(
            """{"statusCode":400,"message":["email must be an email"]}""",
            json,
        )
        assertEquals("email must be an email", ApiErrors.messageFrom(body))
    }

    @Test
    fun parsesExistingClientOnConflict() {
        val body = ApiErrors.parseBody(
            """
            {
              "statusCode":409,
              "message":"Client with this national ID already exists",
              "existingClient":{
                "id":"c1",
                "fullName":"Ana",
                "nationalId":"1-2345-6789",
                "phone":null,
                "email":null
              }
            }
            """.trimIndent(),
            json,
        )
        assertNotNull(body?.existingClient)
        assertEquals("c1", body?.existingClient?.id)
        assertEquals("Ana", body?.existingClient?.fullName)
        assertEquals("1-2345-6789", body?.existingClient?.nationalId)
    }

    @Test
    fun parsesExistingVehicleOnConflict() {
        val body = ApiErrors.parseBody(
            """
            {
              "statusCode":409,
              "message":"Vehicle with this license plate already exists",
              "existingVehicle":{
                "id":"v1",
                "licensePlate":"ABC123",
                "brand":"Toyota",
                "model":"Yaris",
                "year":2020
              }
            }
            """.trimIndent(),
            json,
        )
        assertNotNull(body?.existingVehicle)
        assertEquals("v1", body?.existingVehicle?.id)
        assertEquals("ABC123", body?.existingVehicle?.licensePlate)
        assertEquals("Toyota", body?.existingVehicle?.brand)
        assertEquals("Yaris", body?.existingVehicle?.model)
        assertEquals(2020, body?.existingVehicle?.year)
    }

    @Test
    fun parsesActiveWorkOrderIdOnConflict() {
        val body = ApiErrors.parseBody(
            """
            {
              "statusCode":409,
              "message":"Vehicle already has an active work order",
              "activeWorkOrderId":"wo-1"
            }
            """.trimIndent(),
            json,
        )
        assertEquals("wo-1", body?.activeWorkOrderId)
    }
}
