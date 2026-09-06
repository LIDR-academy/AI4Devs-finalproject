package com.mecatrack.mobile.data.api

import com.mecatrack.mobile.domain.AuthErrorMapper
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.io.IOException

class ReadApiErrorTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun mapsNonHttpFailuresToNetworkCopy() {
        val (message, body) = readApiError(IOException("failed to connect"), json)
        assertEquals(AuthErrorMapper.NETWORK, message)
        assertNull(body)
    }
}
