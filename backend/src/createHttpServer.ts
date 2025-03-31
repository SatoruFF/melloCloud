import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import {
  PORT,
  PORT_HTTP,
  PORT_HTTPS,
  HTTPS,
  HTTPS_FORCE,
  HTTPS_CERTIFICATE_PATH,
  HTTPS_KEY_PATH,
  ROOT_DIR,
} from './configs/config';
import { logger } from './configs/logger';

function getAbsolutePath(filePath) {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.join(ROOT_DIR, filePath);
}

export function startHttpServer(app) {
  if (HTTPS) {
    if (!HTTPS_CERTIFICATE_PATH) {
      throw new Error('Certificate file not found by path ' + HTTPS_CERTIFICATE_PATH);
    }

    if (!HTTPS_KEY_PATH) {
      throw new Error('Key file not found by path ' + HTTPS_KEY_PATH);
    }

    https
      .createServer(
        {
          key: fs.readFileSync(getAbsolutePath(HTTPS_KEY_PATH)),
          cert: fs.readFileSync(getAbsolutePath(HTTPS_CERTIFICATE_PATH)),
          minVersion: 'TLSv1',
        },
        app,
      )
      .listen(PORT);

    logger.info('Start listen port to https', PORT);

    if (HTTPS_FORCE && PORT_HTTP && PORT_HTTPS !== PORT_HTTP) {
      http.createServer(app).listen(PORT_HTTP);

      logger.info('Start listen port to http', PORT_HTTP);

      app.use(function (req, res, next) {
        res.secure =
          res.secure == null ? req.protocol == 'https' || req.headers['x-forwarded-proto'] === 'https' : req.secure;

        if (!res.secure) {
          logger.info('request not secure, redirect to secure', req.originalUrl);

          const port = PORT_HTTPS == '443' ? '' : ':' + PORT_HTTPS;

          return res.redirect('https://' + req.hostname + port + req.originalUrl);
        }

        next();
      });
    }
  } else {
    app.listen(PORT);

    logger.info('Start listen port', PORT);
  }

  return app;
}
