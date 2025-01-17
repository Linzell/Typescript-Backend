#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
    echo "Waiting for database..."
    sleep 1
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
