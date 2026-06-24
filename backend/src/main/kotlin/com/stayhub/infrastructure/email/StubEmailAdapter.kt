package com.stayhub.infrastructure.email

import com.stayhub.domain.booking.BookingConfirmation
import com.stayhub.domain.booking.EmailNotificationService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class StubEmailAdapter : EmailNotificationService {
    private val log = LoggerFactory.getLogger(StubEmailAdapter::class.java)

    // Exposed for test assertions
    val sentEmails = mutableListOf<BookingConfirmation>()

    override suspend fun sendBookingConfirmation(confirmation: BookingConfirmation) {
        sentEmails.add(confirmation)
        log.info(
            "STUB EMAIL — booking confirmation: ref={} guest={} property='{}' dates={} to {} total={}EUR",
            confirmation.referenceNumber,
            confirmation.guestEmail,
            confirmation.propertyTitle,
            confirmation.checkIn,
            confirmation.checkOut,
            confirmation.totalEur,
        )
    }
}
