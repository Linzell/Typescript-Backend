// backend/src/infrastructure/telemetry/telemetryConfig.ts
import { opentelemetry } from "@elysiajs/opentelemetry";
import Elysia from "elysia";

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { config } from '@/config';

export const tracing = new Elysia({ name: 'tracing' })
  .use(opentelemetry({
    spanProcessors: [
      // @ts-ignore - BatchSpanProcessor is not elysia OTEL type, but work
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: config.OTEL_EXPORTER_OTLP_ENDPOINT.replace('4317', '4318') + '/v1/traces', // Use HTTP port
          headers: {
            'Content-Type': 'application/json'
          },
        })
      )
    ],
    serviceName: config.OTEL_SERVICE_NAME,
    resourceAttributes: {
      'service.version': '1.0.0',
      'deployment.environment': 'development'
    }
  }));
