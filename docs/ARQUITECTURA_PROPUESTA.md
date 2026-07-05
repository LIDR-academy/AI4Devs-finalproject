# Arquitectura Propuesta — Backend en Java

## 1. Contexto

### Propósito del sistema

Gestión del ciclo de vida completo de certificados mercantiles electrónicos de la Cámara de Comercio de Bogotá: solicitud, liquidación, pago, almacenamiento, descarga y verificación pública.

### Métricas de operación


| Métrica                        | Valor              |
| ------------------------------ | ------------------ |
| Certificados/día (promedio)    | ~12,000            |
| Certificados/año               | ~4,000,000         |
| Pico estimado (temporada alta) | ~20,000-25,000/día |
| Infraestructura actual         | 5-8 servidores IIS |




### Motivación de Java

- La mayor parte del equipo de desarrollo de la CCB tiene experiencia en Java
- Gran parte de los sistemas institucionales ya están desarrollados en Java
- Unificar el stack técnico reduce costos de capacitación, rotación y mantenimiento
- El ecosistema Java/Spring es maduro, probado en alta concurrencia y con soporte empresarial

---



## 2. Stack Tecnológico



### Backend


| Capa                        | Tecnología                                       | Versión                                                 |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| Runtime                     | Java (Eclipse Temurin)                           | 25 LTS (última versión LTS disponible)                  |
| Framework                   | Spring Boot                                      | 4.1.x (OSS hasta jul. 2027, enterprise hasta jul. 2028) |
| Web                         | Spring MVC (servlet) o Spring WebFlux (reactive) | 7.x (Spring Framework)                                  |
| Arquitectura                | Clean Architecture + CQRS                        | -                                                       |
| Inyección de dependencias   | Spring IoC (built-in)                            | -                                                       |
| Validación                  | Jakarta Validation (Hibernate Validator)         | 3.x                                                     |
| ORM (consultas)             | Spring JDBC + NamedParameterJdbcTemplate         | Built-in                                                |
| ORM (entidades/migraciones) | Spring Data JPA (Hibernate)                      | 7.x                                                     |
| Migraciones BD              | Liquibase                                        | 4.x                                                     |
| Autenticación               | Spring Security + OAuth2 Resource Server (JWT)   | 7.x                                                     |
| HTTP clients                | RestClient (blocking) o WebClient (reactive)     | Built-in                                                |
| SOAP/WCF clients            | Spring WS + JAX-WS (CXF)                         | 4.x / 4.x                                               |
| Storage                     | AWS SDK for Java v2 (S3)                         | 2.x                                                     |
| Cache                       | Spring Cache + Redis (Lettuce)                   | Built-in                                                |
| Rate limiting               | Bucket4j + Spring Boot Starter                   | 8.x                                                     |
| Logging                     | SLF4J + Logback (JSON)                           | 2.x / 1.x                                               |
| Observabilidad              | Micrometer + OpenTelemetry + Dynatrace Agent     | 1.x                                                     |
| Documentación API           | SpringDoc OpenAPI (Swagger UI)                   | 2.x                                                     |
| Tests                       | JUnit 5 + Mockito + AssertJ + Testcontainers     | Latest                                                  |
| Build                       | Gradle (Kotlin DSL)                              | 9.x                                                     |




### Frontend (2 aplicaciones Angular)


| Capa             | Tecnología                         | Versión     |
| ---------------- | ---------------------------------- | ----------- |
| Framework        | Angular                            | 22 (Active) |
| Build            | Angular CLI (esbuild)              | 22.x        |
| UI               | Tailwind CSS                       | 4.x         |
| Componentes      | PrimeNG o Angular Material         | Latest      |
| State management | Angular Signals + NgRx SignalStore | Built-in    |
| HTTP             | HttpClient + interceptors          | Built-in    |
| PDF viewer       | pdf.js                             | 4.x         |




#### Distribución de frontends


| Aplicación              | Dominio                   | Autenticación          | Alcance                                                                        |
| ----------------------- | ------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| **Portal Certificados** | `certificados.ccb.org.co` | JWT MAUC (obligatorio) | Búsqueda, carrito, liquidación, pago, historial de descargas, descarga de PDFs |
| **Portal Verificación** | `verificacion.ccb.org.co` | Ninguna (público)      | Ingreso de código, visualización de PDF, registro de verificación              |


Se separan en 2 (no 3) porque el usuario que solicita un certificado es el mismo que lo descarga. Verificación es un portal público con audiencia distinta (terceros que reciben el certificado).

### Infraestructura


| Componente               | Tecnología                               |
| ------------------------ | ---------------------------------------- |
| Servidor de aplicaciones | Embedded Tomcat (Spring Boot)            |
| Despliegue               | Docker + Docker Compose                  |
| Load Balancer            | Nginx / HAProxy / F5 / ALB               |
| Base de datos            | SQL Server 2022 (driver JDBC mssql-jdbc) |
| Cache                    | Redis 7                                  |
| Storage                  | Amazon S3                                |
| Secrets                  | HashiCorp Vault o AWS Secrets Manager    |
| CI/CD                    | Jenkins / GitHub Actions / Azure DevOps  |
| IaC                      | Terraform o Ansible                      |
| Observabilidad           | Dynatrace (APM corporativo CCB)          |
| Logs centralizados       | Dynatrace Log Management (vía OneAgent)  |


---



## 3. Arquitectura de Alto Nivel



### Diagrama

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INTERNET                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                  ┌──────────▼──────────┐
                  │   Load Balancer     │  ← Nginx / HAProxy / ALB
                  │   + SSL termination │
                  └──────────┬──────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼───────┐  ┌────────▼───────┐  ┌───────▼────────┐
│  SOLICITUDES   │  │   DESCARGAS    │  │  VERIFICACIÓN  │
│  SERVICE       │  │   SERVICE      │  │  SERVICE       │
│  (Spring Boot) │  │  (Spring Boot) │  │  (Spring Boot) │
│                │  │                │  │                │
│ • Crear        │  │ • Listar       │  │ • Validar      │
│   solicitante  │  │   certificados │  │   código       │
│ • Crear        │  │   por usuario  │  │ • Descargar    │
│   solicitud    │  │ • Descargar    │  │   PDF (Base64) │
│ • Liquidar     │  │   PDF (stream) │  │ • Registrar    │
│   (PUP SOAP)   │  │ • URL          │  │   verificación │
│ • Cotizar      │  │   pre-firmada  │  │   + IP         │
│ • Trazabilidad │  │   S3           │  │                │
│ • Notificar    │  │                │  │                │
│   certificado  │  │                │  │                │
│ • Catálogos    │  │                │  │                │
│ • Auth MAUC    │  │                │  │                │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
        │         ┌─────────┼───────────────────┤
        │         │         │                   │
┌───────▼─────┐   │  ┌──────▼──────┐    ┌──────▼──────┐
│ SQL Server  │◄──┘  │  Amazon S3  │    │    Redis    │
│ (JDBC)      │      │             │    │             │
│             │      │• PDFs       │    │• Catálogos  │
│• Solicitudes│      │• Certificados│   │• Rate limit │
│• Cotizaciones│     │             │    │• Códigos    │
│• Trazabilidad│     │             │    │  (hot cache)│
│• Códigos    │      │             │    │             │
│• Verificac. │      │             │    │             │
└─────────────┘      └─────────────┘    └─────────────┘
        │
        │  Integraciones (solo Solicitudes)
        │
┌───────▼─────────────────────────────────┐
│  SOAP PUP     → Liquidación (CXF/JAX-WS)│
│  SOAP TiendaWS→ Consultas mercantiles   │
│  SOAP SHD     → Matrícula principal     │
│  REST Inscritos→ Buscar inscritos       │
│  REST AWS     → Encriptar ID            │
│  REST MAUC    → SSO JWT                 │
└─────────────────────────────────────────┘
```

---



## 4. Estructura del Proyecto



### Multi-módulo Gradle

```
certificados-electronicos/
├── build.gradle.kts                        ← Root build (plugins, versions catalog)
├── settings.gradle.kts                     ← Incluye todos los módulos
├── gradle/
│   └── libs.versions.toml                  ← Version catalog centralizado
│
├── solicitudes/
│   ├── solicitudes-api/                    ← Spring Boot app, controllers, config
│   │   └── src/main/java/co/org/ccb/certificados/solicitudes/api/
│   ├── solicitudes-application/            ← Use cases, commands, queries, ports
│   │   └── src/main/java/co/org/ccb/certificados/solicitudes/application/
│   ├── solicitudes-domain/                 ← Entidades, value objects, reglas
│   │   └── src/main/java/co/org/ccb/certificados/solicitudes/domain/
│   └── solicitudes-infrastructure/         ← Repos JDBC, SOAP clients, S3
│       └── src/main/java/co/org/ccb/certificados/solicitudes/infrastructure/
│
├── descargas/
│   ├── descargas-api/
│   ├── descargas-application/
│   └── descargas-infrastructure/
│
├── verificacion/
│   ├── verificacion-api/
│   ├── verificacion-application/
│   └── verificacion-infrastructure/
│
├── shared/
│   ├── shared-kernel/                      ← Result, DomainException, Entity base
│   ├── shared-auth/                        ← JWT filter, SecurityConfig (MAUC)
│   └── shared-contracts/                   ← DTOs compartidos, interfaces S3
│
├── frontend/
│   ├── portal-certificados/                ← Angular 22 (autenticado: solicitudes + descargas)
│   │   ├── angular.json
│   │   └── src/app/
│   │       ├── core/                       ← Auth guard, interceptors, layout, navigation
│   │       ├── shared/                     ← Componentes reutilizables
│   │       └── features/
│   │           ├── busqueda/               ← Lazy loaded
│   │           ├── carrito/                ← Lazy loaded
│   │           ├── liquidacion/            ← Lazy loaded
│   │           ├── descargas/              ← Lazy loaded
│   │           ├── afiliados/              ← Lazy loaded
│   │           ├── depositos/              ← Lazy loaded
│   │           ├── costumbres/             ← Lazy loaded
│   │           └── especiales/             ← Lazy loaded
│   │
│   └── portal-verificacion/                ← Angular 22 (público, sin auth)
│       ├── angular.json
│       └── src/app/
│           └── verificacion/               ← Única feature: código → PDF → registro
│
└── deploy/
    ├── docker/
    │   ├── Dockerfile.solicitudes
    │   ├── Dockerfile.descargas
    │   ├── Dockerfile.verificacion
    │   └── docker-compose.yml
    └── scripts/
        └── deploy.sh
```



### Dependencias entre módulos

```
solicitudes-api  →  solicitudes-application  →  solicitudes-domain
                                             →  shared-kernel
                 →  solicitudes-infrastructure →  solicitudes-domain
                                              →  shared-contracts
                 →  shared-auth
```

El módulo `domain` no tiene dependencias externas (solo Java puro). La infraestructura implementa los ports definidos en `application`.

---



## 5. Capas Internas (Clean Architecture)



### Domain Layer (`solicitudes-domain`)

Entidades ricas con reglas de negocio. Sin anotaciones de framework.

```java
package co.org.ccb.certificados.solicitudes.domain;

public class Solicitud {

    private Long id;
    private EstadoSolicitud estado;
    private LocalDateTime fechaGeneracion;
    private final List<CodigoVerificacion> codigos = new ArrayList<>();

    public void marcarCertificadoGenerado(List<String> codigosNuevos) {
        if (estado != EstadoSolicitud.GENERADA) {
            throw new ReglaNegocioException(
                "Solo solicitudes en estado GENERADA pueden recibir certificado");
        }

        this.estado = EstadoSolicitud.CERTIFICADO_EMITIDO;
        this.fechaGeneracion = LocalDateTime.now();

        codigosNuevos.forEach(codigo ->
            codigos.add(CodigoVerificacion.crear(codigo, 60))
        );
    }
}
```

```java
public class CodigoVerificacion {

    private String codigo;
    private LocalDate fechaVencimiento;
    private int maxVerificaciones;
    private int verificacionesRealizadas;

    public static CodigoVerificacion crear(String codigo, int diasVigencia) {
        var cv = new CodigoVerificacion();
        cv.codigo = codigo;
        cv.fechaVencimiento = LocalDate.now().plusDays(diasVigencia);
        cv.maxVerificaciones = 999;
        cv.verificacionesRealizadas = 0;
        return cv;
    }

    public boolean estaVigente() {
        return LocalDate.now().isBefore(fechaVencimiento.plusDays(1))
            && verificacionesRealizadas < maxVerificaciones;
    }
}
```



### Application Layer (`solicitudes-application`)

Use cases como commands/queries con ports (interfaces) para infraestructura.

```java
package co.org.ccb.certificados.solicitudes.application.commands;

public record NotificarCertificadoCommand(
    Long solicitudId,
    List<String> codigos
) {}
```

```java
@Service
@Transactional
public class NotificarCertificadoHandler {

    private final SolicitudRepository solicitudRepo;

    public NotificarCertificadoHandler(SolicitudRepository solicitudRepo) {
        this.solicitudRepo = solicitudRepo;
    }

    public Result<Void> handle(NotificarCertificadoCommand command) {
        var solicitud = solicitudRepo.findById(command.solicitudId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada"));

        solicitud.marcarCertificadoGenerado(command.codigos());

        solicitudRepo.save(solicitud);
        return Result.ok();
    }
}
```

Ports (interfaces que implementa la infraestructura):

```java
package co.org.ccb.certificados.solicitudes.application.ports;

public interface SolicitudRepository {
    Optional<Solicitud> findById(Long id);
    void save(Solicitud solicitud);
}

public interface PupLiquidacionService {
    LiquidacionResultado liquidar(LiquidacionRequest request);
}

public interface StorageService {
    byte[] descargar(String nombreArchivo);
    String generarUrlPrefirmada(String nombreArchivo, Duration duracion);
}
```



### Infrastructure Layer (`solicitudes-infrastructure`)

Implementación de ports con JDBC, SOAP clients, S3 SDK.

```java
@Repository
public class JdbcSolicitudRepository implements SolicitudRepository {

    private final NamedParameterJdbcTemplate jdbc;

    @Override
    public Optional<Solicitud> findById(Long id) {
        var params = Map.of("id", id);
        var result = jdbc.query(
            "SELECT * FROM solicitudes.Solicitud WHERE id = :id",
            params,
            new SolicitudRowMapper()
        );
        return result.stream().findFirst();
    }

    @Override
    public void save(Solicitud solicitud) {
        var params = new MapSqlParameterSource()
            .addValue("id", solicitud.getId())
            .addValue("estado", solicitud.getEstado().name())
            .addValue("fechaGeneracion", solicitud.getFechaGeneracion());

        jdbc.update("""
            UPDATE solicitudes.Solicitud
            SET estado = :estado, fecha_generacion = :fechaGeneracion
            WHERE id = :id
            """, params);
    }
}
```



### API Layer (`solicitudes-api`)

Controllers REST con validación y manejo de errores global.

```java
@RestController
@RequestMapping("/api/v1/solicitudes")
public class SolicitudesController {

    private final NotificarCertificadoHandler notificarHandler;

    @PutMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<Void>> notificarCertificado(
            @PathVariable Long id,
            @Valid @RequestBody NotificarCertificadoRequest request) {

        var command = new NotificarCertificadoCommand(id, request.codigos());
        var result = notificarHandler.handle(command);

        return result.isSuccess()
            ? ResponseEntity.ok(ApiResponse.ok())
            : ResponseEntity.badRequest().body(ApiResponse.error(result.getError()));
    }
}
```

---



## 6. Integración con Servicios SOAP (WCF Legacy)



### Consumo de WCF desde Java con Apache CXF

Los servicios WCF de la CCB (PUP, TiendaWS, SHD) se consumen generando clientes SOAP via `wsdl2java`:

```kotlin
// build.gradle.kts (solicitudes-infrastructure)
plugins {
    id("com.github.bjornvester.wsdl2java") version "2.0.2"
}

wsdl2java {
    wsdlDir.set(layout.projectDirectory.dir("src/main/resources/wsdl"))
    includes.set(listOf("ModuloPrincipal.wsdl", "TiendaWS.wsdl", "ShdWS.wsdl"))
}
```

Los WSDLs se descargan de los servicios actuales y se versionan en el repo.

### Adapter para PUP

```java
@Component
public class PupSoapLiquidacionService implements PupLiquidacionService {

    private final ModuloPrincipalPortType pupClient;

    public PupSoapLiquidacionService(ModuloPrincipalPortType pupClient) {
        this.pupClient = pupClient;
    }

    @Override
    public LiquidacionResultado liquidar(LiquidacionRequest request) {
        var soapRequest = new RealizarLiquidacion();
        soapRequest.setNumeroSolicitud(request.numeroSolicitud());
        soapRequest.setServicioId(request.servicioId());
        // ... mapeo de campos

        var soapResponse = pupClient.realizarLiquidacion(soapRequest);

        return new LiquidacionResultado(
            soapResponse.getNumeroSolicitud(),
            soapResponse.getTotalLiquidacion(),
            Integer.parseInt(soapResponse.getNumeroCliente())
        );
    }
}
```



### Configuración del SOAP client con timeout y retry

```java
@Configuration
public class SoapClientConfig {

    @Bean
    public ModuloPrincipalPortType pupClient(
            @Value("${integrations.pup.url}") String url,
            @Value("${integrations.pup.timeout-ms}") int timeout) {

        var factory = new JaxWsProxyFactoryBean();
        factory.setServiceClass(ModuloPrincipalPortType.class);
        factory.setAddress(url);

        var client = (ModuloPrincipalPortType) factory.create();

        var httpConduit = (HTTPConduit) ClientProxy.getClient(client).getConduit();
        httpConduit.getClient().setConnectionTimeout(timeout);
        httpConduit.getClient().setReceiveTimeout(timeout);

        return client;
    }
}
```

---



## 7. Seguridad



### Spring Security con JWT (MAUC)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfig()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/verificaciones/**").permitAll()
                .requestMatchers("/health", "/health/**").permitAll()
                .requestMatchers("/api/v1/**").authenticated()
            )
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt -> jwt.jwtDecoder(maucJwtDecoder()))
            )
            .build();
    }

    @Bean
    public JwtDecoder maucJwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("${mauc.jwk-set-uri}").build();
    }

    private CorsConfigurationSource corsConfig() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "https://certificados.ccb.org.co",
            "https://verificacion.ccb.org.co"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("*"));

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```



### Rate Limiting para Verificación (pública)

```java
@Configuration
public class RateLimitConfig {

    @Bean
    public Bucket verificationBucket() {
        return Bucket.builder()
            .addLimit(BandwidthBuilder.builder()
                .capacity(100)
                .refillGreedy(100, Duration.ofSeconds(1))
                .build())
            .build();
    }
}
```



### Capas de protección


| Capa              | Mecanismo                                                |
| ----------------- | -------------------------------------------------------- |
| Perímetro         | WAF (AWS WAF o ModSecurity en Nginx)                     |
| Transporte        | TLS 1.3 + HSTS                                           |
| Rate limiting     | Bucket4j (por IP para verificación pública)              |
| Autenticación     | Spring Security OAuth2 Resource Server (JWT MAUC)        |
| Autorización      | Claims-based (`@PreAuthorize`)                           |
| Validación        | Jakarta Validation (`@Valid`, `@NotNull`, `@Size`)       |
| Secrets           | HashiCorp Vault o AWS Secrets Manager (via Spring Cloud) |
| Cifrado en reposo | SQL Server TDE + S3 SSE                                  |
| Red               | VPC + Security Groups                                    |
| Auditoría         | Logging estructurado con MDC (correlation ID)            |
| CORS              | Solo `*.ccb.org.co`                                      |


---



## 8. Distribución de Endpoints



### Solicitudes Service (`solicitudes.ccb.org.co`)


| Método | Ruta                                           | Función                        |
| ------ | ---------------------------------------------- | ------------------------------ |
| POST   | `/api/v1/auth/token-mauc`                      | Validar sesión MAUC            |
| GET    | `/api/v1/inscritos`                            | Buscar inscritos               |
| GET    | `/api/v1/inscritos/{matricula}/principal`      | Matrícula principal (SHD)      |
| GET    | `/api/v1/inscritos/{matricula}/certificados`   | Tipos disponibles              |
| POST   | `/api/v1/liquidaciones`                        | Liquidar estándar              |
| POST   | `/api/v1/liquidaciones/depositos`              | Liquidar depósitos             |
| POST   | `/api/v1/liquidaciones/especiales`             | Liquidar especiales            |
| POST   | `/api/v1/liquidaciones/afiliados`              | Liquidar afiliados             |
| PUT    | `/api/v1/solicitudes/{id}/estado`              | Notificar certificado generado |
| PUT    | `/api/v1/solicitudes/{id}/devolucion`          | Devolver solicitud             |
| GET    | `/api/v1/catalogos/{tipo}`                     | Catálogos                      |
| GET    | `/api/v1/afiliados/saldo`                      | Saldo afiliado                 |
| GET    | `/api/v1/afiliados/kardex`                     | Kardex mercantil               |
| GET    | `/api/v1/afiliados/representantes/{matricula}` | Representantes legales         |
| GET    | `/api/v1/matriculas/{matricula}/vinculadas`    | Matrículas vinculadas          |




### Descargas Service (`descargas.ccb.org.co`)


| Método | Ruta                                   | Función                          |
| ------ | -------------------------------------- | -------------------------------- |
| GET    | `/api/v1/certificados`                 | Listar certificados descargables |
| GET    | `/api/v1/certificados/{id}/archivo`    | Stream descarga S3               |
| GET    | `/api/v1/certificados/{id}/url`        | URL pre-firmada S3 (15 min)      |
| GET    | `/api/v1/certificados/{codigo}/base64` | PDF en Base64                    |




### Verificación Service (`verificacion.ccb.org.co`)


| Método | Ruta                                        | Función                     |
| ------ | ------------------------------------------- | --------------------------- |
| GET    | `/api/v1/verificaciones/{codigo}`           | Validar código              |
| GET    | `/api/v1/verificaciones/{codigo}/documento` | PDF Base64 para visor       |
| POST   | `/api/v1/verificaciones/{codigo}/registros` | Registrar verificación + IP |


---



## 9. Configuración por Ambiente



### application.yml (estructura)

```yaml
# application.yml (base)
spring:
  application:
    name: solicitudes-service
  datasource:
    url: jdbc:sqlserver://${DB_HOST}:1433;databaseName=ccbCertificados;encrypt=true
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
    hikari:
      minimum-idle: 10
      maximum-pool-size: 50
      connection-timeout: 5000

  data:
    redis:
      host: ${REDIS_HOST}
      port: 6379

integrations:
  pup:
    url: ${PUP_WSDL_URL}
    timeout-ms: 10000
  tienda:
    url: ${TIENDA_WSDL_URL}
    timeout-ms: 8000
  shd:
    url: ${SHD_WSDL_URL}
    timeout-ms: 8000
  inscritos:
    url: ${INSCRITOS_REST_URL}
  mauc:
    jwk-set-uri: ${MAUC_JWK_URI}
  encriptacion:
    url: ${AWS_ENCRYPT_URL}

aws:
  s3:
    bucket: certificadospdf
    region: us-east-1

server:
  port: 8080
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/plain

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      dynatrace:
        api-token: ${DYNATRACE_API_TOKEN}
        uri: ${DYNATRACE_ENVIRONMENT_URL}
        v2:
          metric-key-prefix: certificados-electronicos
```



### Profiles por ambiente

```yaml
# application-production.yml
spring:
  datasource:
    url: jdbc:sqlserver://sql-prod.ccb.org.co:1433;databaseName=ccbCertificados;encrypt=true
  data:
    redis:
      host: redis-prod.ccb.org.co

integrations:
  pup:
    url: http://apps-prod.ccb.org.co/WCFPagos/ModuloPrincipal.svc?wsdl

logging:
  level:
    root: WARN
    co.org.ccb: INFO
```

---



## 10. Acceso a Datos



### Spring JDBC (consultas y comandos)

```java
@Repository
public class JdbcCotizacionRepository implements CotizacionRepository {

    private final NamedParameterJdbcTemplate jdbc;

    @Override
    public Long crear(Cotizacion cotizacion) {
        var params = new MapSqlParameterSource()
            .addValue("solicitudId", cotizacion.getSolicitudId())
            .addValue("total", cotizacion.getTotal())
            .addValue("fechaCreacion", cotizacion.getFechaCreacion())
            .addValue("numeroOrden", cotizacion.getNumeroOrden());

        var keyHolder = new GeneratedKeyHolder();

        jdbc.update("""
            INSERT INTO solicitudes.Cotizacion
                (solicitud_id, total, fecha_creacion, numero_orden)
            VALUES
                (:solicitudId, :total, :fechaCreacion, :numeroOrden)
            """, params, keyHolder, new String[]{"id"});

        return keyHolder.getKey().longValue();
    }
}
```



### Migraciones con Liquibase

```
src/main/resources/db/changelog/
├── db.changelog-master.xml
├── changes/
│   ├── 001-create-schema-solicitudes.xml
│   ├── 002-create-schema-verificaciones.xml
│   ├── 003-create-schema-catalogos.xml
│   ├── 004-create-tables-solicitudes.xml
│   ├── 005-create-tables-verificaciones.xml
│   ├── 006-create-tables-catalogos.xml
│   ├── 007-seed-catalogos.xml
│   └── 008-create-indexes.xml
```



### Modelo de datos (SQL Server via JDBC)

```sql
-- V4__create_tables_solicitudes.sql
CREATE TABLE solicitudes.Solicitante (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tipo_documento INT NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombres VARCHAR(200),
    email VARCHAR(200),
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE solicitudes.Solicitud (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitante_id BIGINT NOT NULL REFERENCES solicitudes.Solicitante(id),
    tipo_solicitud INT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'CREADA',
    fecha_inicio DATETIME2 DEFAULT GETDATE(),
    fecha_generacion DATETIME2 NULL,
    servicio_negocio_virtual_id INT NOT NULL
);

CREATE TABLE solicitudes.Cotizacion (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id BIGINT NOT NULL REFERENCES solicitudes.Solicitud(id),
    numero_orden VARCHAR(50),
    total DECIMAL(12,2) NOT NULL,
    fecha_creacion DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE solicitudes.Trazabilidad (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    solicitud_id BIGINT NOT NULL REFERENCES solicitudes.Solicitud(id),
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    fecha DATETIME2 DEFAULT GETDATE()
);
```

```sql
-- V5__create_tables_verificaciones.sql
CREATE TABLE verificaciones.CodigoVerificacion (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(14) NOT NULL UNIQUE,
    solicitud_id BIGINT NOT NULL,
    matricula VARCHAR(20),
    tipo_certificado INT,
    nombre_archivo VARCHAR(500) NOT NULL,
    fecha_cargue DATETIME2 DEFAULT GETDATE(),
    fecha_vencimiento DATE NOT NULL,
    max_verificaciones INT DEFAULT 999,
    verificaciones_realizadas INT DEFAULT 0
);

CREATE TABLE verificaciones.RegistroVerificacion (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    codigo_verificacion_id BIGINT NOT NULL REFERENCES verificaciones.CodigoVerificacion(id),
    ip_verificador VARCHAR(45) NOT NULL,
    fecha DATETIME2 DEFAULT GETDATE()
);
```

---



## 11. Observabilidad



### Logging estructurado con MDC

```java
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain) throws Exception {

        var correlationId = Optional.ofNullable(request.getHeader("X-Correlation-Id"))
            .orElse(UUID.randomUUID().toString());

        MDC.put("correlationId", correlationId);
        response.setHeader("X-Correlation-Id", correlationId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```



### Logback con formato JSON (ingestión vía Dynatrace OneAgent)

```xml
<!-- logback-spring.xml -->
<configuration>
    <springProfile name="production">
        <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LogstashEncoder">
                <includeMdcKeyName>correlationId</includeMdcKeyName>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="JSON" />
        </root>
    </springProfile>
</configuration>
```

> **Nota:** El Dynatrace OneAgent intercepta automáticamente los logs JSON del proceso Java y los envía a Dynatrace Log Management. No se requiere configuración adicional de destino de logs.



### Métricas con Micrometer + Dynatrace

```java
@RestController
public class LiquidacionesController {

    private final Timer liquidacionTimer;

    public LiquidacionesController(MeterRegistry registry) {
        this.liquidacionTimer = Timer.builder("liquidacion.duration")
            .description("Tiempo de liquidación PUP")
            .tag("tipo", "estandar")
            .register(registry);
    }

    @PostMapping("/api/v1/liquidaciones")
    public ResponseEntity<?> liquidar(@Valid @RequestBody LiquidacionRequest request) {
        return liquidacionTimer.record(() -> {
            // lógica de liquidación
        });
    }
}
```

Configuración en `application.yml` para exportar a Dynatrace:

```yaml
management:
  metrics:
    export:
      dynatrace:
        api-token: ${DYNATRACE_API_TOKEN}
        uri: ${DYNATRACE_ENVIRONMENT_URL}
        v2:
          metric-key-prefix: certificados-electronicos
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```



### Health Checks

```java
@Component
public class PupHealthIndicator implements HealthIndicator {

    private final ModuloPrincipalPortType pupClient;

    @Override
    public Health health() {
        try {
            pupClient.ping();
            return Health.up().build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

Endpoints de actuator expuestos:

- `GET /health` → liveness
- `GET /health/readiness` → readiness (BD + Redis + S3)
- `GET /actuator/metrics` → métricas exportadas automáticamente a Dynatrace vía `micrometer-registry-dynatrace`

---



## 12. Despliegue con Docker

```dockerfile
# Dockerfile.solicitudes
FROM eclipse-temurin:25-jre-alpine AS runtime

WORKDIR /app
COPY solicitudes/solicitudes-api/build/libs/solicitudes-api.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Xmx512m", \
    "-Dspring.profiles.active=production", \
    "app.jar"]
```

```yaml
# docker-compose.yml
services:
  solicitudes:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile.solicitudes
    ports:
      - "8081:8080"
    environment:
      - DB_HOST=sql-server
      - REDIS_HOST=redis
    deploy:
      replicas: 2

  descargas:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile.descargas
    ports:
      - "8082:8080"
    deploy:
      replicas: 2

  verificacion:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile.verificacion
    ports:
      - "8083:8080"
    deploy:
      replicas: 1

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---



## 13. Escalado



### Por servicio


| Servicio     | Instancias min | Instancias max | Trigger                     |
| ------------ | -------------- | -------------- | --------------------------- |
| Solicitudes  | 2              | 8              | CPU > 65% o P95 > 800ms     |
| Descargas    | 2              | 6              | Requests concurrentes > 200 |
| Verificación | 2              | 6              | Requests/seg > 50           |




### Tuning JVM por servicio


| Servicio     | Heap (-Xmx) | GC recomendado | Notas                                        |
| ------------ | ----------- | -------------- | -------------------------------------------- |
| Solicitudes  | 1024m       | G1GC           | Más memoria por conexiones SOAP concurrentes |
| Descargas    | 512m        | ZGC            | Baja latencia para streaming                 |
| Verificación | 512m        | G1GC           | Carga predecible                             |


---



## 14. Testing



### Pirámide de tests


| Nivel        | Framework                         | Alcance                                  |
| ------------ | --------------------------------- | ---------------------------------------- |
| Unit         | JUnit 5 + Mockito                 | Domain + Application (sin I/O)           |
| Integration  | Spring Boot Test + Testcontainers | Repos + SOAP clients contra contenedores |
| API/Contract | MockMvc + RestAssured             | Controllers contra mocks                 |
| Architecture | ArchUnit                          | Verificar dependencias entre capas       |




### Test de arquitectura con ArchUnit

```java
@AnalyzeClasses(packages = "co.org.ccb.certificados.solicitudes")
class ArchitectureTest {

    @ArchTest
    static final ArchRule domain_no_depende_de_infrastructure =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infrastructure..");

    @ArchTest
    static final ArchRule domain_no_depende_de_spring =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("org.springframework..");
}
```

---



## 15. Justificación de Decisiones



### ¿Por qué Java 25 LTS?

- Es la última versión LTS disponible (la que mayor horizonte de soporte ofrece)
- Java 21 LTS pierde actualizaciones gratuitas (NFTC) en septiembre 2026 — insuficiente para un proyecto que inicia ahora
- Virtual Threads (introducidos en 21, maduros en 25) para manejar miles de conexiones concurrentes sin thread pools complejos
- Pattern matching, records, sealed classes y mejoras de rendimiento acumuladas desde JDK 21 a 25
- Rendimiento comparable a .NET 10 para cargas web típicas
- Eclipse Temurin provee builds gratuitos y con soporte comunitario extendido para versiones LTS



### ¿Por qué Spring Boot 4.1 y no Quarkus o Micronaut?

- Spring Boot 4.1.x es la rama activa (released junio 2026) con soporte OSS hasta julio 2027
- Spring Boot 3.4.x ya expiró su soporte OSS (dic 2025); 3.5.x expira este mes (jun 2026)
- Spring es el framework más usado en el ecosistema Java empresarial de la CCB
- Mayor base de conocimiento en el equipo
- Ecosistema maduro: Spring Security 7, Spring Data 7, Spring WS, Spring Cloud
- Soporte oficial para consumo SOAP/WCF via CXF (crítico para las integraciones legacy)
- Testcontainers y Spring Boot Test tienen integración profunda
- Spring Boot 4.x trae mejoras en observabilidad, virtual threads y AOT compilation



### ¿Por qué Spring JDBC y no solo JPA?

- Las consultas contra SQL Server son en su mayoría queries específicas (no CRUD genérico)
- Spring JDBC da control total sobre el SQL sin overhead de lazy loading/proxies
- Para entidades simples con CRUD, se puede usar Spring Data JPA en paralelo
- Dapper (.NET) y Spring JDBC son equivalentes filosóficos: queries explícitas, alto rendimiento



### ¿Por qué Gradle 9 y no Maven?

- Builds más rápidos (build cache, ejecución incremental, daemon mejorado en 9.x)
- Kotlin DSL con autocompletado en IDE
- Multi-módulo más limpio que Maven para proyecto con 12+ módulos
- Gradle 9.x es la versión activa (9.6.x, jun. 2026); Gradle 8.x solo recibe patches de seguridad
- Convención de la industria Java moderna para proyectos nuevos



### ¿Por qué SQL Server y no PostgreSQL?

- Los servicios WCF legacy (PUP, TiendaWS) probablemente tienen transacciones compartidas con la BD actual
- El equipo de DBA ya administra SQL Server
- Minimiza el riesgo de migración: se cambia la aplicación, no la BD
- El driver JDBC de SQL Server (`mssql-jdbc`) es maduro y bien mantenido por Microsoft
- Si en el futuro se decide migrar a PostgreSQL, los queries JDBC se adaptan sin cambios arquitectónicos



### ¿Por qué CXF para consumo SOAP?

- Apache CXF es el cliente SOAP más maduro en Java
- `wsdl2java` genera clientes tipados desde los WSDL existentes
- Soporta WS-Security, MTOM y transporte HTTP/HTTPS
- Integración probada con Spring Boot



### ¿Por qué 3 Spring Boot apps separadas y no un monolito?

- Patrones de carga diferentes (transaccional vs. streaming vs. público)
- JVM separadas: un memory leak en Solicitudes no tumba Verificación
- Cada servicio puede tener su propio tuning de GC y heap
- Despliegue independiente sin riesgo cruzado
- Verificación es pública (sin auth); aislarlo reduce superficie de ataque



### ¿Por qué 2 frontends y no 3?

- El usuario que solicita un certificado es el mismo que lo descarga (misma sesión, mismo token MAUC)
- Separar solicitudes y descargas en dos apps obligaría a doble login o transferencia de tokens entre dominios
- Con lazy loading, el módulo de descargas solo se carga cuando el usuario navega a "Mis certificados" — rendimiento equivalente a una app separada
- Verificación sí se separa: audiencia diferente (terceros), sin autenticación, flujo de una sola pantalla, perímetro de seguridad público

---



## 16. Plan de Migración


| Fase                        | Duración      | Alcance                                                                                                     |
| --------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| **0 — Fundación**           | 4-6 semanas   | Proyecto multi-módulo Gradle, CI/CD, estructura Clean Architecture, generación de clientes SOAP desde WSDLs |
| **1 — Verificación**        | 6-8 semanas   | Servicio Verificación completo (menor riesgo, alto impacto visible)                                         |
| **2 — Descargas**           | 4-6 semanas   | Servicio Descargas con S3, consolidar MySQL → SQL Server                                                    |
| **3 — Solicitudes core**    | 10-12 semanas | Flujo principal: búsqueda → liquidación → pago (integración SOAP PUP)                                       |
| **4 — Módulos especiales**  | 6-8 semanas   | Depósitos, afiliados, costumbres, especiales                                                                |
| **5 — Frontend Angular 22** | 8-10 semanas  | 2 SPAs: Portal Certificados + Portal Verificación (en paralelo desde Fase 1)                                |
| **6 — Hardening**           | 4-6 semanas   | Load testing (Gatling), penetration testing, cutover                                                        |


**Duración total estimada: 9-11 meses** con un equipo de 4-5 desarrolladores Java.

> Nota: la Fase 3 es ligeramente más larga que en las propuestas .NET porque la integración SOAP/WCF desde Java requiere generación y validación de clientes CXF contra los WSDLs existentes.

---



## 17. Resumen del Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                               │
│  Angular 22 (2 portales) · Tailwind CSS · pdf.js         │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP/JSON
┌────────────────────────────▼────────────────────────────┐
│                    BACKEND                                │
│  Java 25 LTS · Spring Boot 4.1 · Spring Security 7       │
│  Spring JDBC · Apache CXF · AWS SDK v2                   │
│  Micrometer · Bucket4j · Liquibase                       │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                 INFRAESTRUCTURA                           │
│  SQL Server · Redis · Amazon S3                          │
│  Nginx/HAProxy · Dynatrace (APM + Logs + Alertas)        │
│  Docker + Docker Compose                                 │
└─────────────────────────────────────────────────────────┘
```

