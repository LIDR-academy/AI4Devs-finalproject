package com.stayhub.infrastructure.persistence

import com.stayhub.domain.auth.User
import com.stayhub.domain.auth.UserRepository
import io.r2dbc.spi.Row
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactive.awaitSingle
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * R2DBC adapter for [UserRepository].
 *
 * Reads/writes the `guest` table (V2 migration) which now includes the
 * `password_hash` column added by V10.
 *
 * `save` always does an INSERT (registration only — no update path needed).
 * `created_at` and `updated_at` are both set to `NOW()` on insert.
 */
@Repository
class UserRepositoryAdapter(
    private val databaseClient: DatabaseClient,
) : UserRepository {

    override suspend fun findByEmail(email: String): User? {
        val sql = """
            SELECT id, email, password_hash, first_name, last_name
              FROM guest
             WHERE email = :email
        """.trimIndent()

        return databaseClient.sql(sql)
            .bind("email", email)
            .map { row, _ -> mapRow(row) }
            .one()
            .awaitFirstOrNull()
    }

    override suspend fun save(user: User): User {
        val sql = """
            INSERT INTO guest (id, email, password_hash, first_name, last_name, created_at, updated_at)
            VALUES (:id, :email, :passwordHash, :firstName, :lastName, NOW(), NOW())
        """.trimIndent()

        databaseClient.sql(sql)
            .bind("id", user.id)
            .bind("email", user.email)
            .bind("passwordHash", user.passwordHash)
            .bind("firstName", user.firstName)
            .bind("lastName", user.lastName)
            .then()
            .awaitFirstOrNull()

        return user
    }

    private fun mapRow(row: Row): User =
        User(
            id = row.get("id", UUID::class.java)!!,
            email = row.get("email", String::class.java)!!,
            passwordHash = row.get("password_hash", String::class.java)!!,
            firstName = row.get("first_name", String::class.java)!!,
            lastName = row.get("last_name", String::class.java)!!,
        )
}
