#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
    echo "Waiting for database..."
    sleep 1
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed the database if SEED_DATABASE is set to true
if [ "$SEED_DATABASE" = "true" ]; then
    echo "Seeding database..."
    bun run prisma:seed
fi

# Start the application
echo "Starting application..."
exec bun run dev
