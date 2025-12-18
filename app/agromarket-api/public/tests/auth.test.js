//Pruebas CI-CD.yml

const request = require('supertest');
const express = require('express');
const { createAuthMiddleware } = require('../../src/middleware/auth-middleware');
const app = express();

// Configuración de autenticación
const authConfig = {
  users: [{ username: 'admin', password: 'agro123', role: 'admin' }],
  tokenSecret: 'mysecret',
  tokenTTLSeconds: 3600,
  allowedIp: ['127.0.0.1'],  // Asegúrate de que sea un array de IPs
  apiKeys: ['valid-api-key']
};

// Crear middleware
const { loginHandler, protectRoute } = createAuthMiddleware(authConfig);

// Rutas para login
app.use(express.json());
app.post('/api/auth/login', loginHandler);

// Ruta protegida
app.get('/api/protected', protectRoute, (req, res) => {
  res.status(200).json({ message: 'Acceso permitido' });
});

describe('Pruebas de inicio de sesión', () => {
  test('Login exitoso con usuario y contraseña válidos', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'agro123' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login correcto');
    expect(response.body.token).toBeDefined();
  });

  test('Login con usuario incorrecto', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'agro123' });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });

  test('Login con contraseña incorrecta', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });

  test('Login con Basic Auth', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Authorization', 'Basic YWRtaW46YWdybzEyMw==')  // Base64 de admin:agro123
      .send();
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login correcto');
  });

  test('Login con JSON body', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'agro123' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login correcto');
  });

  test('Login sin credenciales', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: '', password: '' });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciales inválidas');
  });
});

describe('Middleware protectRoute', () => {
  test('API Key no válida', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('X-API-Key', 'invalid-api-key');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No autorizado. Usa token Bearer o API key válida.');
  });

  test('Token Bearer no válido', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No autorizado. Usa token Bearer o API key válida.');
  });
});
