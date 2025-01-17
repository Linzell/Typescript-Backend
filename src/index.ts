/**
 * @fileoverview Main application entry point for the API
 */

import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { opentelemetry } from "@elysiajs/opentelemetry";

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'


// Import routes
import medicationRoutes from "@/presentation/routes/medicationRoutes";
import authRoutes from "@/presentation/routes/authRoutes";
import { createAuthMiddleware } from "@/infrastructure/auth/middleware";

import { config } from "@/config";

/**
 * Main application instance
 */
const app = new Elysia()
  /**
   * Configure Swagger documentation
   */
  .use(swagger({
    documentation: {
      info: {
        title: "Medications API",
        version: "1.0.0",
        description: "API for managing medications information"
      },
      tags: [
        { name: "auth", description: "Authentication endpoints" },
        { name: "medications", description: "Medication endpoints" }
      ],
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server"
        }
      ],
      security: [
        {
          bearerAuth: []
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        responses: {
          UnauthorizedError: {
            description: 'Authentication is required for medication endpoints'
          }
        }
      }
    },
    path: '/documentation'
  }))
  /**
   * Configure CORS settings
   */
  .use(cors({
    origin: [config.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
  /**
    * Configure opentelemetry
    */
  .use(
    opentelemetry({
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter()
        )
      ]
    })
  )
  /**
   * Configure public health check endpoint
   * @returns {Object} Health status object
   */
  .get('/health', () => ({ status: 'ok' }))
  .use(authRoutes);

/**
 * Configure protected API routes
 */
app.group('/api/v1', app =>
  app
    .use(createAuthMiddleware)
    .use(medicationRoutes)
);

/**
 * Start the server
 */
app.listen(config.PORT, () => {
  console.log(`🦊 Server running at http://localhost:${config.PORT}`);
  console.log(`📚 Documentation available at http://localhost:${config.PORT}/documentation`);
  console.log(`🏥 Health check available at http://localhost:${config.PORT}/health`);
  console.log(`🔐 CORS configured for ${config.FRONTEND_URL}`);
  console.log(`🔒 Protected routes available at http://localhost:${config.PORT}/api/v1`);
  console.log(`📊 OpenTelemetry configured`);
});
