const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { metrics } = require("@opentelemetry/api");

// Create Prometheus Exporter
const prometheusExporter = new PrometheusExporter({
    port: 9464
});

// Create resource with service name
const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "dice-service"
});

const sdk = new NodeSDK({
    resource: resource,
    traceExporter: new ConsoleSpanExporter(),
    metricReader: prometheusExporter,  // Use as metricReader
    instrumentations: [getNodeAutoInstrumentations()]
});

(async () => {
    try {
        await sdk.start();
        console.log("Tracing and metrics initialized");
        if (!metrics.getMeterProvider()) {
            console.warn("Meter provider not set! Forcing global meter provider");
            metrics.setGlobalMeterProvider(sdk.meterProvider);
        }
    } catch (error) {
        console.error("Error initializing SDK", error);
    }
})();

// Graceful shutdown
process.on("SIGTERM", () => {
    sdk.shutdown()
        .then(() => console.log("SDK shut down successfully"))
        .catch(err => console.error("Error shutting down SDK", err))
        .finally(() => process.exit(0));
});

// Debug: Check every 5 seconds if meter provider is set
setInterval(() => {
    console.log(`Meter provider set: ${!!metrics.getMeterProvider()}`);
}, 5000);