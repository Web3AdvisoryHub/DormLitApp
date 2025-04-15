const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../security.config');
const { WebSocket } = require('ws');

// Initialize monitoring clients
const monitoringClients = {
  sentry: {
    enabled: config.monitoring.sentry.enabled,
    dsn: process.env.SENTRY_DSN
  },
  datadog: {
    enabled: config.monitoring.datadog.enabled,
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY
  }
};

// Security event types
const SECURITY_EVENTS = {
  AUTH_FAILURE: 'auth_failure',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  FILE_UPLOAD_VIOLATION: 'file_upload_violation',
  WEBSOCKET_ABUSE: 'websocket_abuse'
};

// Log security event
async function logSecurityEvent(eventType, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    details,
    severity: getEventSeverity(eventType)
  };

  // Log to file
  const logPath = path.join(__dirname, '../logs/security.log');
  fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

  // Send to monitoring services
  await sendToMonitoringServices(logEntry);

  // Alert if necessary
  if (shouldAlert(logEntry.severity)) {
    await sendAlert(logEntry);
  }
}

// Get event severity
function getEventSeverity(eventType) {
  const severityMap = {
    [SECURITY_EVENTS.AUTH_FAILURE]: 'medium',
    [SECURITY_EVENTS.RATE_LIMIT_EXCEEDED]: 'low',
    [SECURITY_EVENTS.SUSPICIOUS_ACTIVITY]: 'high',
    [SECURITY_EVENTS.FILE_UPLOAD_VIOLATION]: 'medium',
    [SECURITY_EVENTS.WEBSOCKET_ABUSE]: 'high'
  };
  return severityMap[eventType] || 'low';
}

// Send to monitoring services
async function sendToMonitoringServices(event) {
  if (monitoringClients.sentry.enabled) {
    try {
      await axios.post('https://sentry.io/api/0/store/', {
        event_id: crypto.randomUUID(),
        timestamp: event.timestamp,
        level: event.severity,
        message: `${event.eventType}: ${JSON.stringify(event.details)}`,
        platform: 'node',
        sdk: {
          name: 'sentry.javascript.node',
          version: '6.19.7'
        }
      }, {
        headers: {
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${monitoringClients.sentry.dsn}`
        }
      });
    } catch (error) {
      console.error('Failed to send to Sentry:', error);
    }
  }

  if (monitoringClients.datadog.enabled) {
    try {
      await axios.post('https://api.datadoghq.com/api/v1/events', {
        title: `Security Event: ${event.eventType}`,
        text: JSON.stringify(event.details),
        priority: event.severity === 'high' ? 'normal' : 'low',
        tags: [`severity:${event.severity}`, `type:${event.eventType}`]
      }, {
        headers: {
          'DD-API-KEY': monitoringClients.datadog.apiKey,
          'DD-APPLICATION-KEY': monitoringClients.datadog.appKey
        }
      });
    } catch (error) {
      console.error('Failed to send to Datadog:', error);
    }
  }
}

// Check if alert should be sent
function shouldAlert(severity) {
  return severity === 'high' || 
         (severity === 'medium' && config.monitoring.alerts.mediumSeverity) ||
         (severity === 'low' && config.monitoring.alerts.lowSeverity);
}

// Send alert
async function sendAlert(event) {
  if (config.monitoring.alerts.slack.enabled) {
    try {
      await axios.post(config.monitoring.alerts.slack.webhookUrl, {
        text: `🔒 Security Alert\nType: ${event.eventType}\nSeverity: ${event.severity}\nDetails: ${JSON.stringify(event.details)}`
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  if (config.monitoring.alerts.email.enabled) {
    // Implement email sending logic here
    console.log('Email alert would be sent:', event);
  }
}

// Monitor WebSocket connections
function monitorWebSocketConnections() {
  const wsServer = new WebSocket.Server({ port: config.websocket.port });
  const connectionCounts = new Map();

  wsServer.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    const count = (connectionCounts.get(ip) || 0) + 1;
    connectionCounts.set(ip, count);

    if (count > config.websocket.maxConnectionsPerIp) {
      logSecurityEvent(SECURITY_EVENTS.WEBSOCKET_ABUSE, {
        ip,
        connectionCount: count
      });
      ws.close();
      return;
    }

    ws.on('close', () => {
      const newCount = (connectionCounts.get(ip) || 1) - 1;
      connectionCounts.set(ip, newCount);
    });
  });
}

// Monitor rate limits
function monitorRateLimits() {
  const rateLimitCounts = new Map();

  return async (req, res, next) => {
    const ip = req.ip;
    const path = req.path;
    const key = `${ip}:${path}`;
    const count = (rateLimitCounts.get(key) || 0) + 1;
    rateLimitCounts.set(key, count);

    if (count > config.rateLimiting.maxRequests) {
      logSecurityEvent(SECURITY_EVENTS.RATE_LIMIT_EXCEEDED, {
        ip,
        path,
        count
      });
      res.status(429).send('Too Many Requests');
      return;
    }

    setTimeout(() => {
      const newCount = (rateLimitCounts.get(key) || 1) - 1;
      rateLimitCounts.set(key, newCount);
    }, config.rateLimiting.windowMs);

    next();
  };
}

// Monitor file uploads
function monitorFileUploads() {
  return async (req, res, next) => {
    if (!req.files) {
      next();
      return;
    }

    for (const file of Object.values(req.files)) {
      if (file.size > config.fileUpload.maxSize) {
        logSecurityEvent(SECURITY_EVENTS.FILE_UPLOAD_VIOLATION, {
          filename: file.name,
          size: file.size,
          maxSize: config.fileUpload.maxSize
        });
        res.status(413).send('File too large');
        return;
      }

      if (!config.fileUpload.allowedMimeTypes.includes(file.mimetype)) {
        logSecurityEvent(SECURITY_EVENTS.FILE_UPLOAD_VIOLATION, {
          filename: file.name,
          mimeType: file.mimetype,
          allowedTypes: config.fileUpload.allowedMimeTypes
        });
        res.status(415).send('Unsupported media type');
        return;
      }
    }

    next();
  };
}

module.exports = {
  logSecurityEvent,
  monitorWebSocketConnections,
  monitorRateLimits,
  monitorFileUploads,
  SECURITY_EVENTS
}; 