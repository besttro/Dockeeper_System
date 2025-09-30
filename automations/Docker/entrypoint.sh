#!/bin/sh
# entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running Prisma migrations for application startup..."
npx prisma migrate deploy

echo "Starting Next.js server..."
# "exec" replaces the shell process with the command,
# so signals are passed correctly to the Node.js process.
exec "$@"