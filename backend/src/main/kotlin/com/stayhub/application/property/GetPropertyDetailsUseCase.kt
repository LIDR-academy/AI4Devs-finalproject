package com.stayhub.application.property

import com.stayhub.domain.property.Property
import com.stayhub.domain.property.PropertyRepository
import com.stayhub.application.error.NotFoundException
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class GetPropertyDetailsUseCase(
    private val propertyRepository: PropertyRepository,
) {
    suspend fun execute(propertyId: UUID): Property {
        return propertyRepository.findById(propertyId)
            ?: throw NotFoundException("Property not found: $propertyId")
    }
}
