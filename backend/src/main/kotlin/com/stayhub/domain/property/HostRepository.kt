package com.stayhub.domain.property

import java.util.UUID

interface HostRepository {
    suspend fun findById(id: UUID): Host?
}
