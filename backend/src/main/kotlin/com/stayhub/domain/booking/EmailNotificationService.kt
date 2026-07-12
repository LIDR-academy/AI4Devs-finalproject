package com.stayhub.domain.booking

interface EmailNotificationService {
    suspend fun sendBookingConfirmation(confirmation: BookingConfirmation)
}
