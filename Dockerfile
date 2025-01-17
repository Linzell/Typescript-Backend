# Dockerfile
FROM oven/bun:1.0.25

WORKDIR /app

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node --version && npm --version && bun --version

# Copy package files
COPY package*.json bun.lockb ./

# Install dependencies
RUN bun install

# Install prisma globally with npm
RUN npm install -g prisma

# Copy prisma schema
COPY prisma ./prisma/

# Copy source code
COPY . .

# Set permissions
RUN chmod +x ./scripts/init.sh && \
    chown -R bun:bun /app && \
    chmod -R 755 /app

# Generate Prisma Client using npm's prisma
RUN npx prisma generate

USER bun

EXPOSE 3000

CMD ["/bin/sh", "./scripts/init.sh"]
