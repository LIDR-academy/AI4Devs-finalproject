#!/bin/bash
set -e

# Actualizar paquetes y dependencias
sudo apt-get update -y
sudo apt-get upgrade -y

# Instalar Docker y Docker Compose
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Habilitar Docker para el usuario ubuntu
sudo usermod -aG docker ubuntu

# Instalar Docker Compose (plugin)
sudo apt-get install -y docker-compose

# Clonar el repositorio y cambiar al branch indicado
cd /home/ubuntu
git clone https://github.com/rockeroicantonidev/AI4Devs-finalproject.git buscadoc
cd buscadoc
git fetch --all
git branch -r
git checkout JAPM-Implementación-Frontend

# Verificar archivos .env y docker-compose.yml
if [ ! -f backend/.env ]; then
  echo "Advertencia: Falta backend/.env"
fi
if [ ! -f frontend/.env ]; then
  echo "Advertencia: Falta frontend/.env"
fi
if [ ! -f docker-compose.yml ]; then
  echo "Advertencia: Falta docker-compose.yml"
fi

# Levantar los servicios con Docker Compose
sudo docker compose up -d

# Mensaje final
echo "Provisionamiento completado. Backend en puerto 3010, Frontend en puerto 3000."