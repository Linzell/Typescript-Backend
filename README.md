# Medication API

A REST API built with ElysiaJS and TypeScript for managing medication data from the FDA Drug NDC API.

## 🏗️ Architecture

This project follows Clean Architecture and Domain-Driven Design principles:

```
src/
├── domain/         # Business logic and entities
├── infrastructure/ # External services and database
├── application/    # Use cases and DTOs
└── presentation/   # API routes and controllers
```

### Key Design Principles

- **Clean Architecture**: Separation of concerns with independent layers
- **SOLID Principles**: Following object-oriented design best practices
- **DDD (Domain-Driven Design)**: Focus on core domain logic
- **Clean Code**: Maintainable and self-documenting code
- **Test-Driven Development**: Comprehensive test coverage

## 🚀 Features

- Paginated list of medications with filtering capabilities
- Detailed medication information
- Authentication system with JWT
- Integration with FDA Drug NDC API
- Filtering by active substance and administration routes

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Bun Test
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## 🏃‍♂️ Getting Started

### Prerequisites

- Docker and Docker Compose
- Bun (for local development)
- Node.js 18+

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd medication-api
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configurations

### Running with Docker

```bash
# Build and start containers
bun run docker:build
bun run docker:up

# Stop containers
bun run docker:down

# View logs
bun run docker:logs
```

### Local Development

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run prisma:generate

# Run migrations
bun run prisma:migrate

# Start development server
bun run dev

# Run tests
bun run test
```

## 📚 API Documentation

The API documentation is available at `/documentation` when running the server.

### Main Endpoints

- `GET /api/medications` - Get paginated list of medications
- `GET /api/medications/:id` - Get medication details
- `POST /api/auth/login` - Authentication
- `POST /api/auth/refresh` - Refresh token

## 🧪 Testing

```bash
# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Watch mode
bun run test:watch
```

## 🚢 Deployment

This project is deployed on Railway.app, which provides a seamless deployment experience using AWS infrastructure.

### Railway Deployment Setup

1. Create a Railway account and install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize Railway project:
```bash
railway init
```

4. Add required environment variables in Railway Dashboard:
- `FRONTEND_URL`
- `FDA_API_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PORT`
- `DATABASE_URL` (Railway PostgreSQL plugin will provide this automatically)

5. Deploy the application:
```bash
railway up
```

### CI/CD Pipeline

The project uses Railway's automatic deployments connected to GitHub:

1. Push to `main` branch triggers production deployment
2. Push to `develop` branch triggers staging deployment

### Monitoring

- Railway provides built-in logging and monitoring
- Access logs via Railway Dashboard
- Monitor application metrics and health

### Current Deployment

- Production URL: `https://railway.com/project/cd091c49-2cc0-4fac-9bea-38aa41b9db11`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
