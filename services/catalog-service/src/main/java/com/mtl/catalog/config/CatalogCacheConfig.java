package com.mtl.catalog.config;

import java.time.Duration;
import java.util.Map;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import tools.jackson.databind.jsontype.PolymorphicTypeValidator;

/**
 * Configuración mínima de caché Redis para el catálogo (maestros).
 *
 * <p>Se cachean lecturas de baja cardinalidad y alta frecuencia (provincias, especies sin
 * filtro) para reducir presión sobre Postgres. Las escrituras de catálogo no se invalidan
 * activamente en el MVP: el TTL gobierna la frescura; la invalidación activa con
 * {@code @CacheEvict} queda pendiente para futuras HU de administración de maestros.
 *
 * <p>Los valores JSON incluyen metadatos de tipo (default typing) con validación por prefijos
 * de paquete: DTOs del catálogo más {@code java.lang} y {@code java.util} (listas, cadenas,
 * envoltorios) para que la deserialización desde Redis no falle en aciertos de caché. Sin
 * {@code java.util}/{@code java.lang}, nodos como {@code ArrayList} o {@code String} quedan
 * rechazados por el validador y el cliente ve combos vacíos o errores.
 */
@Configuration
@EnableCaching
public class CatalogCacheConfig {

  public static final String CACHE_PUBLIC_PROVINCE_NAMES = "catalog.publicProvinceNames";
  public static final String CACHE_PROVINCES_UNPAGED = "catalog.provincesUnpaged";
  public static final String CACHE_SPECIES_UNPAGED = "catalog.speciesUnpaged";

  @Bean
  public RedisCacheManager catalogCacheManager(RedisConnectionFactory connectionFactory) {
    PolymorphicTypeValidator typeValidator =
        BasicPolymorphicTypeValidator.builder()
            .allowIfSubType("com.mtl.catalog.dto")
            .allowIfSubType("java.lang")
            .allowIfSubType("java.util")
            .build();
    GenericJacksonJsonRedisSerializer valueSerializer =
        GenericJacksonJsonRedisSerializer.builder()
            .enableDefaultTyping(typeValidator)
            .build();

    RedisCacheConfiguration defaults =
        RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .disableCachingNullValues()
            .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(SerializationPair.fromSerializer(valueSerializer));

    Map<String, RedisCacheConfiguration> perCache =
        Map.of(
            CACHE_PUBLIC_PROVINCE_NAMES, defaults.entryTtl(Duration.ofMinutes(10)),
            CACHE_PROVINCES_UNPAGED, defaults.entryTtl(Duration.ofMinutes(5)),
            CACHE_SPECIES_UNPAGED, defaults.entryTtl(Duration.ofMinutes(5)));

    return RedisCacheManager.builder(connectionFactory)
        .cacheDefaults(defaults)
        .withInitialCacheConfigurations(perCache)
        .build();
  }
}
