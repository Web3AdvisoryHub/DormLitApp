module.exports = {
  // Security headers
  headers: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.dormlit.app wss://ws.dormlit.app;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },

  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  },

  // Authentication
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
      refreshTokenExpiresIn: '7d'
    },
    oauth: {
      google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
      },
      github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback'
      }
    }
  },

  // Database security
  database: {
    ssl: true,
    connectionLimit: 10,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000
  },

  // File upload security
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ]
  },

  // WebSocket security
  websocket: {
    port: 8080,
    maxConnectionsPerIp: 10,
    pingInterval: 30000,
    pingTimeout: 5000,
    maxPayload: 1048576 // 1MB
  },

  // Monitoring configuration
  monitoring: {
    // External monitoring services
    sentry: {
      enabled: true,
      dsn: process.env.SENTRY_DSN
    },
    datadog: {
      enabled: true,
      apiKey: process.env.DATADOG_API_KEY,
      appKey: process.env.DATADOG_APP_KEY
    },

    // Alert configuration
    alerts: {
      mediumSeverity: true,
      lowSeverity: false,
      slack: {
        enabled: true,
        webhookUrl: process.env.SLACK_WEBHOOK_URL
      },
      email: {
        enabled: true,
        from: process.env.ALERT_EMAIL_FROM,
        to: process.env.ALERT_EMAIL_TO
      }
    },

    // Logging configuration
    logging: {
      level: 'info',
      file: {
        enabled: true,
        path: './logs/security.log',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      },
      console: {
        enabled: true
      }
    },

    // Performance monitoring
    performance: {
      enabled: true,
      interval: 60000, // 1 minute
      metrics: {
        cpu: true,
        memory: true,
        responseTime: true,
        errorRate: true
      }
    },

    // Security monitoring
    security: {
      enabled: true,
      alertThresholds: {
        failedLogins: 5,
        suspiciousActivity: 3,
        bruteForceAttempts: 10
      },
      scanInterval: 300000 // 5 minutes
    }
  },

  // Backup configuration
  backup: {
    enabled: true,
    schedule: '0 0 * * *', // Daily at midnight
    retention: 30, // Keep 30 days of backups
    storage: {
      type: 's3',
      bucket: process.env.BACKUP_BUCKET,
      region: process.env.AWS_REGION
    },
    encryption: {
      enabled: true,
      key: process.env.BACKUP_ENCRYPTION_KEY
    }
  }
}; 