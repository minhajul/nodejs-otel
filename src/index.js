const express = require("express");
const { trace, metrics, diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");

// Optional: Set up OpenTelemetry diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const PORT = parseInt(process.env.PORT || "8080");
const app = express();

// Get a tracer and meter from the global OpenTelemetry API
const tracer = trace.getTracer("my-app-tracer");
const meter = metrics.getMeter("my-app-meter");

// Create a counter metric
const requestCounter = meter.createCounter("http_requests_total", {
    description: "Total number of HTTP requests",
});

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get("/rolldice", (req, res) => {
    // Increment the request counter
    requestCounter.add(1, { route: "/rolldice" });

    // Create a span for this request
    const span = tracer.startSpan("rolldice-request");
    span.setAttribute("http.route", "/rolldice");

    const result = getRandomNumber(1, 6).toString();
    console.log(`Rolling dice: ${result}`); // Example of a log

    span.end();
    res.send(result);
});

app.get("/slow-operation", async (req, res) => {
    requestCounter.add(1, { route: "/slow-operation" });

    const parentSpan = tracer.startSpan("slow-operation-parent");
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate some work

    const childSpan = tracer.startSpan("slow-operation-child", { parent: parentSpan });
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate more work
    childSpan.end();

    parentSpan.end();
    res.send("Slow operation completed!");
});

app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});