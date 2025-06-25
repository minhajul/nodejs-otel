const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { PeriodicExportingMetricReader, MeterProvider } = require("@opentelemetry/sdk-metrics");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const { metrics } = require("@opentelemetry/api"); // Import metrics from API

// Create a Prometheus Exporter
const prometheusExporter = new PrometheusExporter({
    port: 9464, // Default Prometheus scrape port
});

// Create a PeriodicExportingMetricReader
const metricReader = new PeriodicExportingMetricReader({
    exporter: prometheusExporter,
});

// Create a MeterProvider and pass the metricReader to its constructor
// This is the most likely correct way for sdk-metrics@2.0.1 if addMetricReader is not available.
const meterProvider = new MeterProvider({
    readers: [metricReader], // Assuming 'readers' is the correct property name for passing metric readers
});

// Set the MeterProvider globally
metrics.setGlobalMeterProvider(meterProvider);

const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    // Do not pass metricReader here, as it's handled by the global MeterProvider
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
