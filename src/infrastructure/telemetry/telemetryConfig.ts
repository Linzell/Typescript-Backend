// backend/src/infrastructure/telemetry/telemetryConfig.ts
import { opentelemetry } from "@elysiajs/opentelemetry";
import Elysia from "elysia";

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { config } from '@/config';

export const tracing = new Elysia({ name: 'tracing' })
  .use(opentelemetry({
    spanProcessors: [
      //@ts-ignore - BatchSpanProcessor types are incorrect (this shouldn't cause problems)
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: config.OTEL_EXPORTER_OTLP_ENDPOINT
        })
      )
    ],
    serviceName: config.OTEL_SERVICE_NAME
  })
  );
