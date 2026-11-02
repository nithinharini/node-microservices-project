import 'dotenv/config';
import express from 'express';

const app = express();

const port = Number(process.env.PORT || 3001);
const serviceName = process.env.SERVICE_NAME || 'identity-service';

app.disable('x-powered-by');

// Parse incoming JSON and limit request size.
app.use(express.json({ limit: '16kb' }));

// Liveness: can this process respond to HTTP requests?
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: serviceName,
    timestamp: new Date().toISOString(),
  });
});

// Return a consistent response for unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Centralized error handler: keep this after all routes.
app.use((error, req, res, next) => {
  console.error({
    service: serviceName,
    message: error.message,
  });

  const status = error.status || 500;

  res.status(status).json({
    error:
      status >= 500
        ? 'Internal server error'
        : 'Invalid request',
  });
});

const server = app.listen(port, () => {
  console.log(`${serviceName} listening on http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);
});