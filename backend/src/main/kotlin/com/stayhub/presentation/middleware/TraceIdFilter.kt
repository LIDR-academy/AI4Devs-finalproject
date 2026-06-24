package com.stayhub.presentation.middleware

import io.micrometer.context.ContextRegistry
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Hooks
import reactor.core.publisher.Mono
import java.util.UUID

/**
 * WebFlux [WebFilter] that establishes a per-request trace ID for distributed
 * tracing / log correlation.
 *
 * For every request it:
 *  - reuses an incoming `X-Trace-Id` request header when present, otherwise
 *    generates a fresh UUID;
 *  - writes `X-Trace-Id` onto the response headers so callers can correlate;
 *  - publishes the trace ID into the Reactor [reactor.util.context.Context] under
 *    the [MDC_KEY] key so it can be propagated to SLF4J's [MDC].
 *
 * ### Why not plain `MDC.put`?
 * WebFlux is non-blocking and hops between threads, so a `ThreadLocal`-backed
 * `MDC.put` set in the filter would not survive the thread switch and would leak
 * onto pooled threads. Instead we rely on Reactor's automatic context
 * propagation (Reactor 3.5+ / Spring Boot 3.2+): the trace ID is written into
 * the Reactor `Context`, and a registered [ContextRegistry] ThreadLocal accessor
 * for [MDC_KEY] restores it into the SLF4J [MDC] around each operator execution
 * (including blocking log points downstream). This keeps log lines correlated
 * without manual MDC bookkeeping on every thread boundary.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class TraceIdFilter : WebFilter {

    companion object {
        /** HTTP header carrying the trace ID on both request and response. */
        const val TRACE_ID_HEADER: String = "X-Trace-Id"

        /** MDC / Reactor context key used for the trace ID. Kept conventional for logback. */
        const val MDC_KEY: String = "traceId"

        /**
         * Enable Reactor automatic context propagation and register a ThreadLocal
         * accessor that bridges the Reactor context key [MDC_KEY] to the SLF4J [MDC].
         *
         * Performed in a static initializer (rather than `@PostConstruct`) so the
         * bridge is active for every [TraceIdFilter] instance, including ones created
         * directly in tests where Spring lifecycle callbacks do not run. Both calls
         * are idempotent: the accessor keys on [MDC_KEY] and the hook is global.
         */
        init {
            Hooks.enableAutomaticContextPropagation()
            ContextRegistry.getInstance().registerThreadLocalAccessor(
                MDC_KEY,
                { MDC.get(MDC_KEY) },
                { value -> MDC.put(MDC_KEY, value) },
                { MDC.remove(MDC_KEY) },
            )
        }
    }

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        val incoming = exchange.request.headers.getFirst(TRACE_ID_HEADER)
        val traceId = if (!incoming.isNullOrBlank()) incoming else UUID.randomUUID().toString()

        // Expose the trace ID on the response as early as possible.
        exchange.response.headers.set(TRACE_ID_HEADER, traceId)

        return chain.filter(exchange)
            // Publish into the Reactor context; automatic propagation copies it to MDC.
            .contextWrite { ctx -> ctx.put(MDC_KEY, traceId) }
    }
}
