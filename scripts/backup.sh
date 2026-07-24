#!/bin/bash
set -e

# Load environment variables
source ../.env

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="payload_backup_${TIMESTAMP}.sql.gz"

echo "Starting database backup..."

# Extract DB credentials from DATABASE_URI or use POSTGRES_PASSWORD
DB_CONTAINER="payload-cms-db-1"
DB_USER="payload"
DB_NAME="payload"

# Run pg_dump inside the container and compress it
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > /tmp/$BACKUP_FILE

echo "Backup created at /tmp/$BACKUP_FILE"

# If AWS CLI is configured (for Cloudflare R2), upload it
if command -v aws &> /dev/null; then
  echo "Uploading to R2..."
  aws s3 cp /tmp/$BACKUP_FILE s3://${S3_BUCKET}/backups/${BACKUP_FILE} \
    --endpoint-url ${S3_ENDPOINT}
  echo "Upload complete."
  
  # Clean up local backup
  rm /tmp/$BACKUP_FILE
else
  echo "AWS CLI not found. Local backup saved at /tmp/$BACKUP_FILE"
fi
