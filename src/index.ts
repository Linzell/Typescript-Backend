/**
 * @fileoverview Main application entry point for the API
 * @module app
 */

import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { opentelemetry } from "@elysiajs/opentelemetry";

import { DatabaseService } from './infrastructure/database/DatabaseService';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'


/**
 * Import route handlers
 * @see {@link medicationRoutes}
 * @see {@link authRoutes}
 */
import medicationRoutes from "@/presentation/routes/medicationRoutes";
import authRoutes from "@/presentation/routes/authRoutes";
// import { createAuthMiddleware } from "@/infrastructure/auth/middleware";

import { config } from "@/config";

/**
 * Main application instance
 * @type {Elysia}
 */
const app = new Elysia()
  /**
   * Configure Swagger documentation
   * @param {Object} swagger - Swagger configuration object
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
   * @param {Object} cors - CORS configuration object
   */
  .use(cors({
    origin: [config.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
  /**
   * Configure OpenTelemetry for distributed tracing
   * @param {Object} opentelemetry - OpenTelemetry configuration object
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
   * @returns {Object} Health status object with 'ok' status
   */
  .get('/health', () => ({ status: 'ok' }))
  .use(authRoutes);

/**
 * Configure protected API routes under /api/v1 prefix
 * @param {string} prefix - API route prefix
 * @param {Function} callback - Route configuration callback
 */
app.group('/api/v1', app =>
  app
    // .use(createAuthMiddleware)
    .use(medicationRoutes)
);

/**
 * Initialize database connection and start the server
 * @async
 * @throws {Error} Database connection error
 */
DatabaseService.connect()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(config.PORT, () => {
      console.log(`🦊 Server running at http://localhost:${config.PORT}`);
      console.log(`📚 Documentation available at http://localhost:${config.PORT}/documentation`);
      console.log(`🏥 Health check available at http://localhost:${config.PORT}/health`);
      console.log(`🔐 CORS configured for ${config.FRONTEND_URL}`);
      console.log(`🔒 Protected routes available at http://localhost:${config.PORT}/api/v1`);
      console.log(`📊 OpenTelemetry configured`);
    });
  })
  .catch((error: Error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
