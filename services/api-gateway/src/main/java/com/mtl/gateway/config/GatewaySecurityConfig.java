package com.mtl.gateway.config;

import com.mtl.gateway.web.error.ProblemServerAccessDeniedHandler;
import com.mtl.gateway.web.error.ProblemServerAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

  private final ProblemServerAuthenticationEntryPoint authenticationEntryPoint;
  private final ProblemServerAccessDeniedHandler accessDeniedHandler;

  public GatewaySecurityConfig(
      ProblemServerAuthenticationEntryPoint authenticationEntryPoint,
      ProblemServerAccessDeniedHandler accessDeniedHandler) {
    this.authenticationEntryPoint = authenticationEntryPoint;
    this.accessDeniedHandler = accessDeniedHandler;
  }

  /**
   * Lista blanca alineada con {@code docs/api/openapi.yaml} y {@code docs/security/jwt-gateway-strategy.md}.
   * El resto de {@code /api/**} exige JWT válido; el token se reenvía a los microservicios (token relay) por defecto
   * del cliente HTTP del gateway.
   */
  @Bean
  SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
    return http.csrf(ServerHttpSecurity.CsrfSpec::disable)
        .authorizeExchange(
            exchanges ->
                exchanges
                    .pathMatchers("/actuator/health", "/actuator/info", "/actuator/prometheus")
                    .permitAll()
                    .pathMatchers(HttpMethod.OPTIONS, "/api/**")
                    .permitAll()
                    .pathMatchers("/api/catalog/public/**")
                    .permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/media/public/**")
                    .permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/media/ejemplares/*/photos")
                    .permitAll()
                    .pathMatchers(HttpMethod.POST, "/api/notifications/subscriptions")
                    .permitAll()
                    .pathMatchers("/api/**")
                    .authenticated()
                    .anyExchange()
                    .denyAll())
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .build();
  }
}
