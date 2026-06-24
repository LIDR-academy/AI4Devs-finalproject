package com.stayhub.infrastructure.persistence

import com.stayhub.domain.property.Host
import com.stayhub.domain.property.HostRepository
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class HostRepositoryAdapter(
    private val databaseClient: DatabaseClient,
) : HostRepository {

    override suspend fun findById(id: UUID): Host? {
        val query = """
            SELECT id, first_name, last_name, avatar_url, is_verified
            FROM host
            WHERE id = :id
        """.trimIndent()

        return databaseClient.sql(query)
            .bind("id", id)
            .map { row, _ ->
                Host(
                    id = row.get("id", UUID::class.java)!!,
                    firstName = row.get("first_name", String::class.java)!!,
                    lastName = row.get("last_name", String::class.java)!!,
                    avatarUrl = row.get("avatar_url", String::class.java),
                    isVerified = row.get("is_verified", Boolean::class.java) ?: false,
                )
            }
            .one()
            .awaitFirstOrNull()
    }
}
