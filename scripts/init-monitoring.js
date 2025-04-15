const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { createLogger, format, transports } = winston;
const config = require('../security.config');
const axios = require('axios');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize Winston logger
const logger = createLogger({
  level: config.monitoring.logging.level,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // File transport
    ...(config.monitoring.logging.file.enabled ? [new transports.File({
      filename: config.monitoring.logging.file.path,
      maxsize: config.monitoring.logging.file.maxSize,
      maxFiles: config.monitoring.logging.file.maxFiles
    })] : []),
    // Console transport
    ...(config.monitoring.logging.console.enabled ? [new transports.Console()] : [])
  ]
});

// Initialize monitoring clients
const monitoringClients = {
  sentry: null,
  datadog: null
};

if (config.monitoring.sentry.enabled) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: config.monitoring.sentry.dsn,
    tracesSampleRate: 1.0
  });
  monitoringClients.sentry = Sentry;
}

if (config.monitoring.datadog.enabled) {
  const { StatsD } = require('hot-shots');
  monitoringClients.datadog = new StatsD({
    host: 'localhost',
    port: 8125,
    prefix: 'dormlit.',
    globalTags: { env: process.env.NODE_ENV }
  });
}

// Initialize performance monitoring
function startPerformanceMonitoring() {
  if (!config.monitoring.performance.enabled) return;

  setInterval(() => {
    const usage = process.memoryUsage();
    const metrics = {};

    if (config.monitoring.performance.metrics.memory) {
      metrics.memory = {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        rss: usage.rss
      };
    }

    if (config.monitoring.performance.metrics.cpu) {
      const cpuUsage = process.cpuUsage();
      metrics.cpu = {
        user: cpuUsage.user,
        system: cpuUsage.system
      };
    }

    // Send metrics to Datadog if enabled
    if (monitoringClients.datadog) {
      Object.entries(metrics).forEach(([key, value]) => {
        monitoringClients.datadog.gauge(`performance.${key}`, value);
      });
    }

    // Log metrics
    logger.info('Performance metrics', { metrics });
  }, config.monitoring.performance.interval);
}

// Initialize security monitoring
function startSecurityMonitoring() {
  if (!config.monitoring.security.enabled) return;

  // Existing security event scanning
  setInterval(async () => {
    const securityEvents = await scanForSecurityEvents();
    
    if (securityEvents.length > 0) {
      logger.warn('Security events detected', { events: securityEvents });
      
      if (monitoringClients.sentry) {
        securityEvents.forEach(event => {
          monitoringClients.sentry.captureEvent({
            level: 'warning',
            message: `Security event: ${event.type}`,
            extra: event.details
          });
        });
      }
    }
  }, config.monitoring.security.scanInterval);

  // Add new monitoring intervals
  setInterval(monitorDatabaseHealth, 300000); // Every 5 minutes
  setInterval(monitorApiEndpoints, 60000); // Every minute
}

// Scan for security events
async function scanForSecurityEvents() {
  const events = [];
  
  // Check for failed logins
  const failedLogins = await getFailedLoginCount();
  if (failedLogins > config.monitoring.security.alertThresholds.failedLogins) {
    events.push({
      type: 'failed_logins',
      details: { count: failedLogins }
    });
  }

  // Check for suspicious activity
  const suspiciousActivity = await getSuspiciousActivityCount();
  if (suspiciousActivity > config.monitoring.security.alertThresholds.suspiciousActivity) {
    events.push({
      type: 'suspicious_activity',
      details: { count: suspiciousActivity }
    });
  }

  // Check for brute force attempts
  const bruteForceAttempts = await getBruteForceAttemptCount();
  if (bruteForceAttempts > config.monitoring.security.alertThresholds.bruteForceAttempts) {
    events.push({
      type: 'brute_force_attempts',
      details: { count: bruteForceAttempts }
    });
  }

  return events;
}

// Helper functions for security monitoring
async function getFailedLoginCount() {
  try {
    const db = require('../server/services/database');
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM auth_logs 
       WHERE event_type = 'login_failure' 
       AND timestamp > NOW() - INTERVAL '1 hour'`
    );
    return result.rows[0].count;
  } catch (error) {
    logger.error('Error getting failed login count:', error);
    return 0;
  }
}

async function getSuspiciousActivityCount() {
  try {
    const db = require('../server/services/database');
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM security_logs 
       WHERE event_type IN ('suspicious_ip', 'unusual_pattern', 'malicious_activity')
       AND timestamp > NOW() - INTERVAL '5 minutes'`
    );
    return result.rows[0].count;
  } catch (error) {
    logger.error('Error getting suspicious activity count:', error);
    return 0;
  }
}

async function getBruteForceAttemptCount() {
  try {
    const db = require('../server/services/database');
    const result = await db.query(
      `SELECT COUNT(*) as count 
       FROM auth_logs 
       WHERE event_type = 'login_attempt' 
       AND ip_address IN (
         SELECT ip_address 
         FROM auth_logs 
         WHERE event_type = 'login_attempt' 
         GROUP BY ip_address 
         HAVING COUNT(*) > 10
       )
       AND timestamp > NOW() - INTERVAL '15 minutes'`
    );
    return result.rows[0].count;
  } catch (error) {
    logger.error('Error getting brute force attempt count:', error);
    return 0;
  }
}

// Add new monitoring functions
async function monitorDatabaseHealth() {
  try {
    const db = require('../server/services/database');
    const result = await db.query('SELECT 1');
    monitoringClients.datadog?.gauge('database.health', 1);
  } catch (error) {
    logger.error('Database health check failed:', error);
    monitoringClients.datadog?.gauge('database.health', 0);
    await sendAlert({
      type: 'database_error',
      severity: 'high',
      details: { error: error.message }
    });
  }
}

async function monitorApiEndpoints() {
  try {
    const endpoints = [
      '/api/health',
      '/api/auth/status',
      '/api/rooms/list',
      '/api/users/me'
    ];

    for (const endpoint of endpoints) {
      const start = Date.now();
      const response = await axios.get(`http://localhost:${process.env.PORT}${endpoint}`);
      const duration = Date.now() - start;

      monitoringClients.datadog?.gauge(`api.${endpoint.replace(/\//g, '.')}.response_time`, duration);
      monitoringClients.datadog?.gauge(`api.${endpoint.replace(/\//g, '.')}.status`, response.status);
    }
  } catch (error) {
    logger.error('API endpoint monitoring failed:', error);
    await sendAlert({
      type: 'api_monitoring_error',
      severity: 'medium',
      details: { error: error.message }
    });
  }
}

// Export monitoring functions
module.exports = {
  logger,
  monitoringClients,
  startPerformanceMonitoring,
  startSecurityMonitoring,
  monitorDatabaseHealth,
  monitorApiEndpoints
}; 