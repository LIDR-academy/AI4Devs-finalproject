# ADR-0001: Descubrimiento de servicios y configuración sin Eureka ni Spring Cloud Config

## Estado

Aceptada

## Contexto

En arquitecturas Spring Cloud suelen aparecer **Netflix Eureka** (u otro registro, p. ej. Consul) y **Spring Cloud Config Server** como piezas centrales. En **MyTreeLibrary** se usa un **API Gateway** y microservicios desplegables en **Docker Compose** (desarrollo) y, a medio plazo, en un **orquestador** tipo **Kubernetes** (producción).

## Funciones de las piezas que no adoptamos

1. **Eureka (service registry)**  
   - Los microservicios **se registran** al arrancar y **publican** host, puerto y metadatos.  
   - Los clientes o el gateway **resuelven** el nombre lógico del servicio a **instancias vivas** y permiten **balanceo** y tolerancia a altas/bajas **dinámicas** sin reconfigurar rutas a mano.

2. **Spring Cloud Config Server**  
   - **Centraliza** propiedades (perfiles, entornos) desde Git, Vault u otros backends.  
   - Los servicios **obtienen** configuración al arranque (y opcionalmente la **refrescan**) de forma homogénea.

## Decisión

**No** incorporar **Eureka** ni **Spring Cloud Config Server** como contenedores del sistema.

La **resolución de destinos** del API Gateway se basará en **rutas configuradas** con URIs estables derivadas del **entorno** (variables de entorno o manifiestos).

La **configuración por entorno** (URLs de Kafka, PostgreSQL, Keycloak, secretos, flags) la suministrará la **plataforma de despliegue**:

- **Docker Compose:** variables de entorno y ficheros de entorno en el `compose`.  
- **Kubernetes (u orquestador equivalente):** **ConfigMaps**, **Secrets**, nombres DNS de **Services** (`http://nombre-servicio:puerto`) y, si aplica, **Ingress**.

Ese conjunto **asume el papel** que en el ecosistema Spring Cloud cubrirían Eureka (descubrimiento y localización estable de servicios en la red del clúster) y Config Server (configuración externa y segregada por entorno), sin añadir dos servicios más que operar y monitorizar.

## Consecuencias

- **Positivas:** menos componentes en el diagrama de despliegue, menos acoplamiento a Netflix/Spring Cloud Config, alineación con prácticas habituales en K8s (12-factor, GitOps).  
- **Negativas:** no hay registro de instancias con heartbeat en el estilo Eureka; el escalado y el routing dependen del **Service** del orquestador o de actualizar definiciones de despliegue. La configuración centralizada con historial Git unificado para *todas* las props queda en manos del **repositorio de manifiestos/Helm** o del pipeline, no de un Config Server dedicado.

## Producción (sin Eureka)

En **producción** no se prevé un registro tipo Eureka: el **descubrimiento y el balanceo** los aporta el **orquestador** (p. ej. **Kubernetes** con `Service` + DNS interno `http://<nombre-servicio>:<puerto>`, o equivalente en la plataforma elegida). El gateway y los clientes deben recibir esas URIs vía **variables de entorno**, **ConfigMaps/Secrets** o manifiestos/Helm, no mediante registro dinámico en la aplicación. Escalar réplicas no exige reconfigurar Eureka; sí exige que las rutas del gateway apunten al **Service** estable del clúster (o a un Ingress interno acordado).

## Nota

Si en el futuro se exigiera **configuración central con auditoría fuerte** o **descubrimiento fuera de un orquestador** (p. ej. VMs sin K8s), se podría reabrir el debate y añadir Consul, Vault, Spring Cloud Config, etc., como ADR nueva.
