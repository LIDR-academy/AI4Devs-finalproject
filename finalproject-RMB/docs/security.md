# Prácticas de Seguridad

## 1. Autenticación y Autorización

### 1.1 Autenticación con Certificado Digital
```php
// src/Security/CertificateAuthenticator.php
namespace App\Security;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class CertificateAuthenticator extends AbstractAuthenticator
{
    public function authenticate(Request $request): Passport
    {
        $certificate = $request->server->get('SSL_CLIENT_CERT');
        if (!$certificate) {
            throw new AuthenticationException('Certificado digital requerido');
        }

        // Validación del certificado
        $certData = openssl_x509_parse($certificate);
        if (!$this->isValidCertificate($certData)) {
            throw new AuthenticationException('Certificado inválido o expirado');
        }

        return new Passport(
            new UserBadge($certData['subject']['CN']),
            new CustomCredentials([$this, 'validateCertificate'], $certData)
        );
    }
}
```

### 1.2 Control de Acceso Basado en Roles (RBAC)
```yaml
# config/packages/security.yaml
security:
    role_hierarchy:
        ROLE_EMPLOYEE: []
        ROLE_SUPERVISOR: [ROLE_EMPLOYEE]
        ROLE_HR: [ROLE_SUPERVISOR]
        ROLE_ADMIN: [ROLE_HR]

    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/hr, roles: ROLE_HR }
        - { path: ^/supervisor, roles: ROLE_SUPERVISOR }
        - { path: ^/timeclock, roles: ROLE_EMPLOYEE }
```

## 2. Protección de Datos

### 2.1 Cifrado en Tránsito
```nginx
# docker/nginx/conf.d/default.conf
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### 2.2 Cifrado en Reposo
```php
// src/Service/EncryptionService.php
namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class EncryptionService
{
    private $key;
    
    public function __construct(ParameterBagInterface $params)
    {
        $this->key = $params->get('app.encryption_key');
    }
    
    public function encrypt(string $data): string
    {
        $iv = random_bytes(openssl_cipher_iv_length('aes-256-gcm'));
        $encrypted = openssl_encrypt(
            $data,
            'aes-256-gcm',
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        return base64_encode($iv . $tag . $encrypted);
    }
}
```

## 3. Protección contra Ataques Comunes

### 3.1 Protección CSRF
```twig
{# templates/timeclock/clock_in.html.twig #}
<form action="{{ path('timeclock_clock_in') }}" method="POST">
    {{ csrf_token('timeclock_clock_in') }}
    <input type="hidden" name="_csrf_token" value="{{ csrf_token('timeclock_clock_in') }}">
    {# ... resto del formulario ... #}
</form>
```

### 3.2 Protección XSS
```php
// config/packages/framework.yaml
framework:
    html_sanitizer:
        sanitizers:
            app.sanitizer:
                allow_safe_elements: true
                allow_attributes:
                    a: ['href', 'title']
                    img: ['src', 'alt']
                drop_attributes:
                    '*': ['on*', 'style']
```

### 3.3 Protección SQL Injection
```php
// src/Repository/TimeClockRepository.php
namespace App\Repository;

use Doctrine\ORM\EntityRepository;

class TimeClockRepository extends EntityRepository
{
    public function findEmployeeClocks(string $employeeId, \DateTime $start, \DateTime $end)
    {
        return $this->createQueryBuilder('t')
            ->where('t.employee = :employeeId')
            ->andWhere('t.clockTime BETWEEN :start AND :end')
            ->setParameter('employeeId', $employeeId)
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getResult();
    }
}
```

## 4. Auditoría y Logging

### 4.1 Logging de Acciones Críticas
```php
// src/EventSubscriber/SecurityAuditSubscriber.php
namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Event\AuthenticationEvent;

class SecurityAuditSubscriber implements EventSubscriberInterface
{
    public function onAuthenticationSuccess(AuthenticationEvent $event): void
    {
        $user = $event->getAuthenticationToken()->getUser();
        $this->logger->info('Login exitoso', [
            'user' => $user->getUsername(),
            'ip' => $request->getClientIp(),
            'certificate' => $request->server->get('SSL_CLIENT_CERT'),
            'timestamp' => new \DateTime()
        ]);
    }
}
```

### 4.2 Registro de Cambios
```php
// src/Entity/TimeClock.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class TimeClock
{
    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    #[ORM\Column(type: 'string')]
    private string $createdBy;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTime $modifiedAt = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $modifiedBy = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
        $this->createdBy = $this->security->getUser()->getUsername();
    }
}
```

## 5. Gestión de Secretos

### 5.1 Uso de Vault
```php
// config/packages/vault.yaml
vault:
    address: '%env(VAULT_ADDR)%'
    token: '%env(VAULT_TOKEN)%'
    secrets:
        database:
            path: 'secret/database'
        api_keys:
            path: 'secret/api-keys'
```

### 5.2 Variables de Entorno
```env
# .env
APP_SECRET=your-secret-here
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/db?serverVersion=mariadb-10.6"
REDIS_URL="redis://redis:6379"
RABBITMQ_URL="amqp://user:pass@rabbitmq:5672"
VAULT_ADDR="https://vault:8200"
VAULT_TOKEN="s.xxxxxxxxxxxxxxxx"
```

## 6. Cumplimiento Normativo

### 6.1 RGPD
```php
// src/Service/DataRetentionService.php
namespace App\Service;

class DataRetentionService
{
    public function cleanupOldData(): void
    {
        // Retención de 4 años para registros de jornada
        $cutoffDate = new \DateTime('-4 years');
        $this->timeClockRepository->deleteOlderThan($cutoffDate);
        
        // Retención de 1 año para logs de auditoría
        $logCutoffDate = new \DateTime('-1 year');
        $this->auditLogRepository->deleteOlderThan($logCutoffDate);
    }
}
```

### 6.2 ISO 27001
- Políticas de seguridad documentadas
- Procedimientos de backup y recuperación
- Gestión de incidentes
- Control de acceso físico y lógico
- Formación en seguridad

## 7. Monitoreo de Seguridad

### 7.1 Detección de Intrusiones
```yaml
# prometheus/rules/security.yml
groups:
  - name: security
    rules:
      - alert: FailedLoginAttempts
        expr: rate(login_failures_total[5m]) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Múltiples intentos de login fallidos"
          
      - alert: UnauthorizedAccess
        expr: rate(unauthorized_access_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Acceso no autorizado detectado"
```

### 7.2 Escaneo de Vulnerabilidades
```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run OWASP ZAP
        uses: zaproxy/action-baseline@v0.4.0
        with:
          target: 'https://staging.ficharfirm.com'
          
      - name: Run Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'Ficharfirm'
          path: '.'
          format: 'HTML'
```

## 8. Respuesta a Incidentes

### 8.1 Procedimiento de Respuesta
1. Detección y notificación
2. Análisis inicial
3. Contención
4. Erradicación
5. Recuperación
6. Lecciones aprendidas

### 8.2 Plan de Recuperación
```php
// src/Service/IncidentResponseService.php
namespace App\Service;

class IncidentResponseService
{
    public function handleSecurityIncident(SecurityIncident $incident): void
    {
        // 1. Bloquear acceso si es necesario
        if ($incident->requiresAccessBlock()) {
            $this->blockAccess($incident->getAffectedUser());
        }
        
        // 2. Notificar a los responsables
        $this->notifySecurityTeam($incident);
        
        // 3. Iniciar investigación
        $this->investigateIncident($incident);
        
        // 4. Documentar incidente
        $this->documentIncident($incident);
    }
}
```

¿Necesitas más detalles sobre algún aspecto específico de la seguridad implementada? 