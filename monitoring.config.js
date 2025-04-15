module.exports = {
  // Sentry configuration
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.BrowserTracing(),
      new Sentry.Integrations.Replay()
    ]
  },

  // New Relic configuration
  newrelic: {
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    appName: 'DormLitApp',
    distributedTracing: {
      enabled: true
    },
    transactionTracer: {
      enabled: true,
      transactionThreshold: 'apdex_f'
    }
  },

  // DataDog configuration
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    site: 'datadoghq.com',
    service: 'dormlit-app',
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    logInjection: true,
    runtimeMetrics: true
  },

  // Custom metrics
  metrics: {
    websocket: {
      connections: 'gauge',
      messages: 'counter',
      errors: 'counter'
    },
    performance: {
      pageLoad: 'histogram',
      apiLatency: 'histogram',
      renderTime: 'histogram'
    },
    business: {
      activeUsers: 'gauge',
      roomsCreated: 'counter',
      avatarsCreated: 'counter'
    }
  },

  // Alert thresholds
  alerts: {
    websocket: {
      maxConnections: 1000,
      errorRate: 0.05
    },
    performance: {
      pageLoadThreshold: 3000,
      apiLatencyThreshold: 1000,
      renderTimeThreshold: 500
    },
    business: {
      minActiveUsers: 10,
      maxRoomCreationRate: 100
    }
  },

  // Logging configuration
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: 'json',
    transports: ['console', 'file'],
    file: {
      filename: 'logs/app.log',
      maxSize: '10m',
      maxFiles: '14d'
    }
  }
}; 