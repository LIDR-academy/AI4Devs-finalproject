package com.mtl.catalog.config;

import com.mtl.catalog.web.error.ProblemAccessDeniedHandler;
import com.mtl.catalog.web.error.ProblemAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class CatalogSecurityConfig {

  private final ProblemAuthenticationEntryPoint authenticationEntryPoint;
  private final ProblemAccessDeniedHandler accessDeniedHandler;

  public CatalogSecurityConfig(
      ProblemAuthenticationEntryPoint authenticationEntryPoint,
      ProblemAccessDeniedHandler accessDeniedHandler) {
    this.authenticationEntryPoint = authenticationEntryPoint;
    this.accessDeniedHandler = accessDeniedHandler;
  }

  @Bean
  SecurityFilterChain catalogSecurityFilterChain(HttpSecurity http) {
    return http.csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/actuator/health", "/actuator/info", "/actuator/prometheus")
                    .permitAll()
                    .requestMatchers("/api/catalog/public/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/catalog/species", "/api/catalog/provinces")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/catalog/families",
                        "/api/catalog/genera",
                        "/api/catalog/species/*")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/catalog/families",
                        "/api/catalog/genera",
                        "/api/catalog/species")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/catalog/species/*")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/catalog/species/*")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/catalog/trees")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/catalog/trees/*")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/catalog/trees/*")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/catalog/trees/*")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/catalog/trees")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .requestMatchers(
                        HttpMethod.GET, "/api/catalog/trees/*/media-submission-permission")
                    .hasAnyRole("COLABORADOR", "ADMIN")
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
        .oauth2ResourceServer(
            oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(KeycloakRealmRoleConverter.jwtAuthenticationConverter())))
        .httpBasic(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .logout(AbstractHttpConfigurer::disable)
        .build();
  }
}
