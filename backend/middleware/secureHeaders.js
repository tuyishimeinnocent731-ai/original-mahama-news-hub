const helmet = require('helmet');

function attachSecureHeaders(req, res, next) {
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
  })(req, res, next);
}

module.exports = { attachSecureHeaders };
