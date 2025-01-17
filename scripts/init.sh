#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
export ATTEMPTS=0
export MAX_ATTEMPTS=30

until pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER}; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        echo "Database not ready after $MAX_ATTEMPTS attempts. Exiting."
        exit 1
    fi
    echo "Waiting for database... attempt $ATTEMPTS of $MAX_ATTEMPTS"
    sleep 2
done
echo "Database is ready!"

# Print environment variables for debugging (remove in production)
echo "DB_USER: $DB_USER"
echo "DB_NAME: $DB_NAME"
echo "DATABASE_URL: $DATABASE_URL"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec bun run dev
