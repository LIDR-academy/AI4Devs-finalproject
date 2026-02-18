#!/bin/bash
set -e

# Configuration
BUCKET="meditation-media"
USER_ID="550e8400-e29b-41d4-a716-446655440000"
BASE_URL="http://localhost:4566/$BUCKET/"

# 1. Bucket and Policies (Redundant but safe)
docker exec meditation-localstack awslocal s3 mb s3://$BUCKET || true

# 2. Extract paths from DB for COMPLETED meditations
# Get both output_media_url and subtitle_url
QUERY="SELECT output_media_url, subtitle_url FROM generation.meditation_output WHERE status = 'COMPLETED' AND user_id = '$USER_ID'"
URLS=$(docker exec meditation-postgres psql -U meditation_user -d meditation -t -c "$QUERY")

# 3. Create a local dummy file
dd if=/dev/zero of=dummy.bin bs=1k count=5

# 4. Upload to S3 for each path
for url in $URLS; do
    # Skip if URL is not localhost (e.g. s3.amazonaws.com links if any)
    if [[ $url == http://localhost:4566/$BUCKET/* ]]; then
        path=${url#$BASE_URL}
        echo "Uploading dummy to $path..."
        docker cp dummy.bin meditation-localstack:/tmp/upload.bin
        docker exec meditation-localstack awslocal s3 cp /tmp/upload.bin s3://$BUCKET/$path
    fi
done

rm dummy.bin
echo "All media and subtitle paths populated in S3."
