import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

export function initOpenTelemetry(serviceName: string, serviceVersion?: string): NodeSDK {
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {},
  });

  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(
      parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '0.1')
    ),
  });

  const resource = {
    attributes: {
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    },
    merge: () => resource,
    getRawAttributes: () => Object.entries(resource.attributes).map(([key, value]) => ({ key, value })) as any
  };

  const sdk = new NodeSDK({
    resource,
    sampler,
    spanProcessor: new BatchSpanProcessor(traceExporter),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (request) => {
            return ['/health', '/metrics', '/ready'].some(path =>
              request.url?.startsWith(path)
            );
          },
        },
        '@opentelemetry/instrumentation-express': {
          ignoreLayers: ['/health', '/metrics', '/ready'],
        },
        '@opentelemetry/instrumentation-pg': {
          enhancedDatabaseReporting: true,
        },
      }),
    ],
  });

  return sdk;
}

export async function startOpenTelemetry(serviceName: string, serviceVersion?: string): Promise<void> {
  const sdk = initOpenTelemetry(serviceName, serviceVersion);
  
  try {
    await sdk.start();
    console.log(`OpenTelemetry initialized for ${serviceName}`);
  } catch (error) {
    console.error('Error initializing OpenTelemetry:', error);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown();
      console.log('OpenTelemetry terminated');
    } catch (error) {
      console.error('Error terminating OpenTelemetry:', error);
    } finally {
      process.exit(0);
    }
  });
}
