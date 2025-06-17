#!/bin/bash

# ===========================================
# Script de configuración automática de Redmine en EC2
# ===========================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando configuración de Redmine en EC2..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
REDMINE_DIR="/opt/redmine"
DOMAIN=${1:-$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Actualizar sistema
print_status "Actualizando sistema..."
sudo yum update -y

# 2. Instalar Docker
print_status "Instalando Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# 3. Instalar Docker Compose
print_status "Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 4. Crear directorio de trabajo
print_status "Creando directorio de trabajo..."
sudo mkdir -p $REDMINE_DIR
sudo chown ec2-user:ec2-user $REDMINE_DIR
cd $REDMINE_DIR

# 5. Copiar configuración (asumiendo que los archivos están en el directorio actual)
print_status "Configurando Redmine..."

# Si los archivos no están presentes, clonar desde repositorio
if [ ! -f "docker-compose.yml" ]; then
    print_warning "Archivos no encontrados. Clonando configuración..."
    # Aquí puedes agregar comando git clone si tienes los archivos en un repo
    # git clone <tu-repo> .
    print_error "Necesitas copiar los archivos de configuración manualmente"
    exit 1
fi

# 6. Configurar variables de entorno
if [ ! -f ".env" ]; then
    print_status "Creando archivo .env..."
    cp env.example .env
    
    # Generar contraseñas seguras
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    
    # Actualizar .env con valores generados
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s/REDMINE_SECRET_KEY=.*/REDMINE_SECRET_KEY=$SECRET_KEY/" .env
    sed -i "s/REDMINE_PORT=.*/REDMINE_PORT=5000/" .env
    
    print_status "Archivo .env configurado con contraseñas generadas automáticamente"
fi

# 7. Crear directorios necesarios
print_status "Creando directorios..."
mkdir -p config plugins ssl themes init-scripts

# 8. Configurar firewall (si está habilitado)
print_status "Configurando firewall..."
sudo systemctl status firewalld >/dev/null 2>&1 && {
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --permanent --add-port=5000/tcp
    sudo firewall-cmd --reload
} || print_warning "Firewall no está activo"

# 9. Iniciar servicios
print_status "Iniciando servicios de Redmine..."
docker-compose up -d

# 10. Esperar a que Redmine esté listo
print_status "Esperando a que Redmine esté listo..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f http://localhost:5000 >/dev/null 2>&1; then
        print_status "¡Redmine está listo!"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    print_status "Intento $ATTEMPT/$MAX_ATTEMPTS - Esperando..."
    sleep 10
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    print_error "Redmine no está respondiendo después de $MAX_ATTEMPTS intentos"
    print_warning "Verifica los logs con: docker-compose logs redmine"
    exit 1
fi

# 11. Configurar SSL con Let's Encrypt (si se proporciona dominio)
if [ "$1" ] && [ "$1" != "$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" ]; then
    print_status "Configurando SSL para dominio: $1"
    
    # Instalar certbot
    sudo yum install -y certbot
    
    # Obtener certificado
    sudo certbot certonly --standalone --non-interactive --agree-tos --email admin@$1 -d $1
    
    # Copiar certificados
    sudo cp /etc/letsencrypt/live/$1/fullchain.pem ./ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$1/privkey.pem ./ssl/key.pem
    sudo chown ec2-user:ec2-user ./ssl/*
    
    # Reiniciar con proxy nginx
    docker-compose --profile production up -d
    
    print_status "SSL configurado para $1"
fi

# 12. Mostrar información final
echo ""
echo "======================================"
echo "🎉 REDMINE CONFIGURADO EXITOSAMENTE"
echo "======================================"
echo ""
echo "📍 URLs de acceso:"
if [ "$1" ] && [ "$1" != "$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" ]; then
    echo "   HTTPS: https://$1"
    echo "   HTTP:  http://$1"
else
    echo "   HTTP: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
fi
echo ""
echo "🔐 Credenciales iniciales:"
echo "   Usuario: admin"
echo "   Contraseña: admin"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña inmediatamente"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs:      docker-compose logs -f"
echo "   Reiniciar:     docker-compose restart"
echo "   Parar:         docker-compose down"
echo "   Backup DB:     docker-compose exec redmine-db pg_dump -U redmine redmine > backup.sql"
echo ""
echo "📁 Directorio de trabajo: $REDMINE_DIR"
echo ""

# 13. Configurar backup automático
print_status "Configurando backup automático..."
cat > /tmp/redmine-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/redmine/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cd /opt/redmine
docker-compose exec -T redmine-db pg_dump -U redmine redmine | gzip > $BACKUP_DIR/redmine_backup_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
echo "Backup creado: $BACKUP_DIR/redmine_backup_$DATE.sql.gz"
EOF

sudo mv /tmp/redmine-backup.sh /usr/local/bin/redmine-backup.sh
sudo chmod +x /usr/local/bin/redmine-backup.sh

# Agregar a crontab para backup diario a las 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/redmine-backup.sh") | crontab -

print_status "Backup automático configurado (diario a las 2 AM)"

echo ""
print_status "¡Configuración completada! 🎉"
print_warning "No olvides configurar los Security Groups de EC2 para permitir tráfico HTTP/HTTPS" 