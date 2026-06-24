package com.stayhub.presentation.middleware

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.router
import reactor.core.publisher.Mono
import java.util.concurrent.atomic.AtomicReference

/**
 * Verifies the [TraceIdFilter] behaviour against a minimal reactive route using
 * [WebTestClient].
 */
class TraceIdFilterTest {

    private val capturedTraceId = AtomicReference<String?>()
    private val log = LoggerFactory.getLogger(TraceIdFilterTest::class.java)

    private fun client(): WebTestClient {
        val routes = router {
            GET("/ping") {
                // Capture the trace ID from MDC inside a reactive operator, which is
                // where Reactor's automatic context propagation restores the MDC.
                Mono.fromCallable { MDC.get(TraceIdFilter.MDC_KEY) }
                    .doOnNext { tid ->
                        capturedTraceId.set(tid)
                        log.info("handling /ping with traceId={}", tid)
                    }
                    .flatMap { ServerResponse.ok().bodyValue("pong") }
            }
        }
        return WebTestClient.bindToRouterFunction(routes)
            .webFilter<WebTestClient.RouterFunctionSpec>(TraceIdFilter())
            .build()
    }

    @Test
    fun `response contains an X-Trace-Id header`() {
        client()
            .get().uri("/ping")
            .exchange()
            .expectStatus().isOk
            .expectHeader().exists(TraceIdFilter.TRACE_ID_HEADER)
    }

    @Test
    fun `incoming X-Trace-Id is echoed back unchanged`() {
        val incoming = "11111111-2222-3333-4444-555555555555"
        client()
            .get().uri("/ping")
            .header(TraceIdFilter.TRACE_ID_HEADER, incoming)
            .exchange()
            .expectStatus().isOk
            .expectHeader().valueEquals(TraceIdFilter.TRACE_ID_HEADER, incoming)
    }

    @Test
    fun `generated trace id is a non-blank value`() {
        client()
            .get().uri("/ping")
            .exchange()
            .expectStatus().isOk
            .expectHeader().value(TraceIdFilter.TRACE_ID_HEADER) { value ->
                value shouldNotBe null
                value.isNotBlank() shouldBe true
            }
    }

    @Test
    fun `trace id is available in MDC at a downstream log point`() {
        val incoming = "abc-trace-id-123"
        capturedTraceId.set(null)
        client()
            .get().uri("/ping")
            .header(TraceIdFilter.TRACE_ID_HEADER, incoming)
            .exchange()
            .expectStatus().isOk
        capturedTraceId.get() shouldBe incoming
    }
}
