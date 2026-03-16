#!/bin/bash
# Script to populate S3 with dummy files for the 41 meditations in the demo DB
# Targets LocalStack (meditation-localstack)

BUCKET="meditation-media"

# Create a local dummy file (5KB)
head -c 5120 /dev/urandom > /tmp/dummy_media.mp3
echo "1
00:00:01,000 --> 00:00:10,000
Esta es una meditación de prueba generada automáticamente." > /tmp/dummy_subs.srt

# Get all COMPLETED meditations with their paths
MEDIA_FILES=$(docker exec meditation-postgres psql -U meditation_user -d meditation -t -c "SELECT output_media_url FROM generation.meditation_output WHERE status = 'COMPLETED';" | grep -o "generation/.*")
SUBTITLE_FILES=$(docker exec meditation-postgres psql -U meditation_user -d meditation -t -c "SELECT subtitle_url FROM generation.meditation_output WHERE status = 'COMPLETED';" | grep -o "generation/.*")

for file in $MEDIA_FILES; do
    echo "Creating dummy media file: $file"
    DIR=$(dirname "/tmp/$file")
    mkdir -p "$DIR"
    cp /tmp/dummy_media.mp3 "/tmp/$file"
    docker exec meditation-localstack awslocal s3 cp "/tmp/$file" "s3://$BUCKET/$file"
done

for file in $SUBTITLE_FILES; do
    echo "Creating dummy subtitle file: $file"
    DIR=$(dirname "/tmp/$file")
    mkdir -p "$DIR"
    cp /tmp/dummy_subs.srt "/tmp/$file"
    docker exec meditation-localstack awslocal s3 cp "/tmp/$file" "s3://$BUCKET/$file"
done

echo "Population complete."
rm /tmp/dummy_media.mp3 /tmp/dummy_subs.srt
