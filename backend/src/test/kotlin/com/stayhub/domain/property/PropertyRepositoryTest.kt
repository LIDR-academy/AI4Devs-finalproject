package com.stayhub.domain.property

import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test
import java.util.*

class PropertyRepositoryTest {
    @Test
    fun `repository port interface is defined`() {
        val interface_ = PropertyRepository::class.java
        interface_.isInterface shouldBe true
    }
}
