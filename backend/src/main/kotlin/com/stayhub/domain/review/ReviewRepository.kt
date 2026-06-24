package com.stayhub.domain.review

import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import java.util.UUID

interface ReviewRepository {
    suspend fun findByPropertyId(
        propertyId: UUID,
        pageable: DomainPageRequest,
    ): PagedResult<Review>
}
