package com.stayhub.infrastructure.email

import com.stayhub.domain.booking.BookingConfirmation
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

class StubEmailAdapterTest {

    private lateinit var adapter: StubEmailAdapter

    @BeforeEach
    fun setUp() {
        adapter = StubEmailAdapter()
    }

    @Test
    fun `sentEmails is empty before any call`() {
        assertTrue(adapter.sentEmails.isEmpty()) {
            "sentEmails should be empty before any sendBookingConfirmation call"
        }
    }

    @Test
    fun `sendBookingConfirmation adds confirmation to sentEmails`() {
        runBlocking {
            val confirmation = aConfirmation(referenceNumber = "BK-001")

            adapter.sendBookingConfirmation(confirmation)

            assertEquals(1, adapter.sentEmails.size) {
                "sentEmails should contain exactly 1 item after one send"
            }
        }
    }

    @Test
    fun `sentEmails contains correct referenceNumber after sending`() {
        runBlocking {
            val confirmation = aConfirmation(referenceNumber = "BK-REF-42")

            adapter.sendBookingConfirmation(confirmation)

            assertEquals("BK-REF-42", adapter.sentEmails[0].referenceNumber) {
                "Stored confirmation should have the expected referenceNumber"
            }
        }
    }

    @Test
    fun `sending twice results in sentEmails size 2`() {
        runBlocking {
            adapter.sendBookingConfirmation(aConfirmation(referenceNumber = "BK-001"))
            adapter.sendBookingConfirmation(aConfirmation(referenceNumber = "BK-002"))

            assertEquals(2, adapter.sentEmails.size) {
                "sentEmails should contain 2 items after two sends"
            }
        }
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    private fun aConfirmation(referenceNumber: String): BookingConfirmation =
        BookingConfirmation(
            bookingId = UUID.randomUUID(),
            referenceNumber = referenceNumber,
            guestEmail = "guest@example.com",
            guestFirstName = "Alice",
            propertyTitle = "Sunny Apartment Barcelona",
            checkIn = LocalDate.of(2025, 8, 1),
            checkOut = LocalDate.of(2025, 8, 5),
            nights = 4,
            totalEur = BigDecimal("320.00"),
        )
}
