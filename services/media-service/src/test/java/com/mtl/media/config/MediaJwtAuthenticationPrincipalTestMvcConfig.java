package com.mtl.media.config;

import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * En {@code @WebMvcTest} con OAuth2 Resource Server excluido, Spring MVC no registra el
 * {@code AuthenticationPrincipalArgumentResolver}. Resuelve {@link Jwt} desde el contexto de seguridad.
 */
@Configuration
public class MediaJwtAuthenticationPrincipalTestMvcConfig implements WebMvcConfigurer {

  @Override
  public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
    resolvers.add(0, new JwtAuthenticationPrincipalResolver());
  }

  private static final class JwtAuthenticationPrincipalResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
      return Jwt.class.equals(parameter.getParameterType())
          && parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
    }

    @Override
    public Object resolveArgument(
        MethodParameter parameter,
        ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest,
        WebDataBinderFactory binderFactory) {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
        return jwtAuthenticationToken.getToken();
      }
      if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
        return jwt;
      }
      throw new IllegalStateException(
          "En tests WebMvc se esperaba JwtAuthenticationToken o principal Jwt en SecurityContextHolder.");
    }
  }
}
