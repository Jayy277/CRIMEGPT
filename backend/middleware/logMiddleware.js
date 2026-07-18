const { AuditLog } = require('../models');

const auditLogger = async (req, res, next) => {
  const { method, originalUrl, ip } = req;

  // We primarily want to log state-changing requests (POST, PUT, DELETE) or logins
  if (method === 'GET') {
    return next();
  }

  // Hook into response end/send to log details of action
  const originalSend = res.send;
  res.send = function (body) {
    res.send = originalSend;
    res.send(body);

    process.nextTick(async () => {
      try {
        let userId = req.user ? req.user.id : null;
        let action = `${method} ${originalUrl}`;
        let details = `Request Body: ${JSON.stringify(req.body)}`;

        // If login was successful, associate with the logged-in user
        if (originalUrl === '/api/auth/login' && res.statusCode === 200) {
          try {
            const parsed = JSON.parse(body);
            if (parsed && parsed.user) {
              userId = parsed.user.id || parsed.user._id;
              action = 'User Login';
              details = `User ${parsed.user.email} logged in successfully.`;
            }
          } catch (e) {}
        }

        // Sanitize passwords
        const sanitizedDetails = details.replace(/"password"\s*:\s*"[^"]*"/g, '"password":"[REDACTED]"');

        await AuditLog.create({
          userId,
          action,
          details: sanitizedDetails,
          method,
          url: originalUrl,
          ip: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        });
      } catch (error) {
        console.error('Error recording audit log:', error);
      }
    });
  };

  next();
};

module.exports = auditLogger;
