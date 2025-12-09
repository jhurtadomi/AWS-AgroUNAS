const { generateToken, verifyToken, extractBearerToken } = require('../auth/token-auth');
const { isValidApiKey } = require('../auth/api-key-auth');
const { isIpAllowed } = require('../auth/ip-whitelist');

/**
 * Crea middleware de autenticación basado en:
 * - Lista de usuarios (username/password/role)
 * - API keys
 * - Whitelist de IP
 * - JWT (Bearer token)
 */
function createAuthMiddleware(authConfig) {
  // Buscar usuario en la lista de config
  const findUser = (username, password) => {
    if (!authConfig.users || !Array.isArray(authConfig.users)) return null;
    return (
      authConfig.users.find(
        (u) => u.username === username && u.password === password
      ) || null
    );
  };

  /**
   * POST /auth/login
   * Acepta:
   *  - Basic Auth (Authorization: Basic base64(user:pass))
   *  - JSON body { username, password }
   * Devuelve: token + datos de usuario
   */
  const loginHandler = (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    let user = null;

    try {
      // 1) Intentar con Basic Auth en el header
      if (authHeader.startsWith('Basic ')) {
        const base64 = authHeader.replace('Basic ', '');
        const decoded = Buffer.from(base64, 'base64').toString('utf8');
        const [username, password] = decoded.split(':');
        if (username && password) {
          user = findUser(username, password);
        }
      }

      // 2) Si no hubo usuario aún, probar con JSON body
      if (!user && req.body && req.body.username && req.body.password) {
        user = findUser(req.body.username, req.body.password);
      }

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // payload del token: user + role
      const payload = {
        user: user.username,
        role: user.role
      };

      const token = generateToken(
        payload,
        authConfig.tokenSecret,
        authConfig.tokenTTLSeconds
      );

      return res.json({
        message: 'Login correcto',
        user: { username: user.username, role: user.role },
        token
      });
    } catch (error) {
      // Si ocurre algún error inesperado, responder con 500
      console.error('Error en loginHandler:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  /**
   * Middleware para proteger rutas:
   *  1. Verifica IP permitida
   *  2. Acepta API key (x-api-key)
   *  3. Acepta JWT (Authorization: Bearer xxx)
   */
  const protectRoute = (req, res, next) => {
    try {
      // 1. Validación por IP
      if (!Array.isArray(authConfig.allowedIp)) {
        throw new Error('allowedIp debe ser un array');
      }

      if (!isIpAllowed(req.ip, authConfig.allowedIp)) {
        return res.status(403).json({ error: 'IP no autorizada' }); // Cambiado a 403
      }

      // 2. API Key (cualquiera de las configuradas)
      const apiKeyHeader = req.headers['x-api-key'];
      if (apiKeyHeader && authConfig.apiKeys) {
        if (isValidApiKey(apiKeyHeader, authConfig.apiKeys)) {
          req.client = { apiKey: apiKeyHeader };
          return next();
        }
      }

      // 3. Token Bearer (JWT)
      const authHeader = req.headers['authorization'] || '';
      const token = extractBearerToken(authHeader);

      if (token) {
        const payload = verifyToken(token, authConfig.tokenSecret);
        if (payload) {
          req.user = payload;
          return next();
        }
      }

      return res.status(401).json({
        error: 'No autorizado. Usa token Bearer o API key válida.'
      });
    } catch (error) {
      // Si ocurre algún error inesperado en protectRoute, responder con 500
      console.error('Error en protectRoute:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  return {
    loginHandler,
    protectRoute
  };
}

module.exports = {
  createAuthMiddleware
};
