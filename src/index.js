const express = require("express");
const {trace, metrics} = require("@opentelemetry/api");

const PORT = parseInt(process.env.PORT || "8080");
const app = express();

// Safely get meter
function getMeter() {
    try {
        return metrics.getMeter("dice-meter");
    } catch (error) {
        console.error("Failed to get meter:", error);
        return {
            createCounter: () => ({
                add: () => {}
            }),
            createHistogram: () => ({
                record: () => {}
            })
        };
    }
}

const meter = getMeter();

const requestCounter = meter.createCounter("http_requests_total", {
    description: "Total number of HTTP requests"
});

// Get tracer with fallback
function getTracer() {
    try {
        return trace.getTracer("dice-tracer");
    } catch (error) {
        console.error("Failed to get tracer:", error);
        return {
            startSpan: (name) => ({
                setAttribute: () => {},
                end: () => {},
                isRecording: () => false
            })
        };
    }
}

const tracer = getTracer();

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get("/rolldice", (req, res) => {
    requestCounter.add(1, {route: "/rolldice"});

    const span = tracer.startSpan("rolldice-request");
    span.setAttribute("http.route", "/rolldice");

    const result = getRandomNumber(1, 6).toString();
    console.log(`Rolling dice: ${result}`);

    span.end();
    res.send(result);
});

app.get("/slow-operation", async (req, res) => {
    requestCounter.add(1, {route: "/slow-operation"});

    const parentSpan = tracer.startSpan("slow-operation-parent");
    await new Promise(resolve => setTimeout(resolve, 100));

    const childSpan = tracer.startSpan("slow-operation-child", {
        parent: parentSpan
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    childSpan.end();

    parentSpan.end();
    res.send("Slow operation completed!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});