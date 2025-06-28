# OpenTelemetry Node.js Demo with Prometheus

This project demonstrates how to instrument a Node.js Express application with OpenTelemetry and export metrics to Prometheus for monitoring.

## Features
- 📊 Automatic instrumentation of Express.js
- 📈 Custom metrics collection (`http_requests_total`)
- 🔭 Distributed tracing with parent/child spans
- 📉 Prometheus metrics endpoint
- 🐳 Dockerized Prometheus setup

### Prerequisites
- Node.js 18+
- Docker (for running Prometheus)

### Getting Started

1. Clone and install dependencies
    ```bash
    git clone https://github.com/minhajul/nodejs-otel.git
    cd nodejs-otel
    npm install
    ```

2. Start the application
    ```npm run dev```

    The application will start on port `8080` with OpenTelemetry instrumentation.

3. Generate Traffic
    ```
    # Roll dice endpoint
    curl http://localhost:8080/rolldice
    
    # Slow operation endpoint
    curl http://localhost:8080/slow-operation
    ```

4. View metrics
   Access raw metrics:
   ```curl http://localhost:9464/metrics```

5. Start Prometheus using Docker
   ```docker-compose up -d```
   Access Prometheus UI at: http://localhost:9090

### Key Metrics
`http_requests_total`: Total HTTP requests by route
`http_server_duration`:	HTTP request duration (auto-instr)
`process_cpu_seconds`:	CPU usage (auto-instr)
`nodejs_heap_space_size`: Heap memory usage (auto-instr)

### Prometheus Queries
1. Total requests for `/rolldice` or `/slow-operation`:
    ```http_requests_total{route="/rolldice"}```

2. Request rate per second:
    ```rate(http_requests_total[1m])```

3. Error rate (example):
    ```sum(rate(http_requests_total{http_status_code=~"5.."}[5m]))```

4. 95th percentile latency:
    ```histogram_quantile(0.95, sum(rate(http_server_duration_bucket[5m])) by (le))```

### Made with ❤️ by [[minhajul](https://github.com/minhajul)]