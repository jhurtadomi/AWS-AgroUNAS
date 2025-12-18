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

  const loginHandler = (req, res) => {
    // ... (El código de loginHandler no se modifica) ...
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
        console.error('Error en loginHandler:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
    // ... (fin del código de loginHandler) ...
  };

  /**
   * Middleware para proteger rutas:
   *  1. Verifica IP permitida (AHORA OPCIONAL)
   *  2. Acepta API key (x-api-key)
   *  3. Acepta JWT (Authorization: Bearer xxx)
   */
  const protectRoute = (req, res, next) => {
    try {
        // 1. Validación por IP
        
        // 🛑 FIX CLAVE: Saltar la validación de IP si estamos en la nube (EKS)
        if (!authConfig.disableIpCheck) {
            
            let allowedIpArray = [];

            if (Array.isArray(authConfig.allowedIp)) {
                allowedIpArray = authConfig.allowedIp;
            } else if (typeof authConfig.allowedIp === 'string' && authConfig.allowedIp.length > 0) {
                allowedIpArray = authConfig.allowedIp.split(',').filter(Boolean);
            }
            
            // Si allowedIpArray no está vacío y la IP no coincide, se devuelve 403
            if (allowedIpArray.length > 0 && !isIpAllowed(req.ip, allowedIpArray)) {
                return res.status(403).json({ error: 'IP no autorizada' }); 
            }
        }
        // Si disableIpCheck es true, el código salta la validación de IP y continúa aquí.


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

        // Si falla API Key y Token:
        return res.status(401).json({
          error: 'No autorizado. Usa token Bearer o API key válida.'
        });
    } catch (error) {
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