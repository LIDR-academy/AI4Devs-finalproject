#!/bin/bash
# MongoDB migration: backup anonymous volume data, create named volume, recreate container
set -e

ANON_VOL=/var/lib/docker/volumes/1796aef39e5291d743e750491e7e4cd38dde6676ce5c7096c798f2a2481f76a7/_data
BACKUP_DIR=/home/ubuntu/mongodb_backup
VOLUME_NAME=mongodb_data

echo "=== Step 1: Backup MongoDB data ==="
sudo mkdir -p $BACKUP_DIR
sudo rm -rf $BACKUP_DIR/*
sudo cp -a $ANON_VOL/* $BACKUP_DIR/
echo "Backup size: $(sudo du -sh $BACKUP_DIR)"

echo "=== Step 2: Stop MongoDB container ==="
sudo docker stop mongodb

echo "=== Step 3: Create named volume ==="
sudo docker volume create $VOLUME_NAME

echo "=== Step 4: Copy data to named volume ==="
VOL_PATH=/var/lib/docker/volumes/$VOLUME_NAME/_data
sudo cp -a $BACKUP_DIR/* $VOL_PATH/
sudo chown -R 999:999 $VOL_PATH 2>/dev/null || true
echo "Named volume data size: $(sudo du -sh $VOL_PATH)"

echo "=== Step 5: Remove old container ==="
sudo docker rm mongodb

echo "=== Step 6: Start new container with named volume ==="
sudo docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v $VOLUME_NAME:/data/db \
  mongo:latest

echo "=== Step 7: Verify ==="
sleep 3
sudo docker ps | grep mongodb
echo "MongoDB data is now persistent on named volume: $VOLUME_NAME"
echo "Backup saved at: $BACKUP_DIR"
echo "Migration complete."
