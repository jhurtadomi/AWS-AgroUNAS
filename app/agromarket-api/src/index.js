const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path'); // 

const configJson = require('../config/default.json');
const { createAuthMiddleware } = require('./middleware/auth-middleware');

const pricesRouter = require('./routes/prices.routes');
const inventoryRouter = require('./routes/inventory.routes');
const reportsRouter = require('./routes/reports.routes');

const app = express();

// 👉 Servir archivos estáticos (index.html, dashboard.html, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Config de autenticación (env > json)
const authConfig = {
  users: configJson.auth.users,            // lista de usuarios
  apiKeys: configJson.auth.apiKeys,        // objeto con API keys
  allowedIp: process.env.AUTH_ALLOWED_IP || configJson.auth.allowedIp,
  tokenSecret: process.env.AUTH_TOKEN_SECRET || configJson.auth.tokenSecret,
  tokenTTLSeconds: parseInt(
    process.env.AUTH_TOKEN_TTL || configJson.auth.tokenTTLSeconds,
    10
  )
};

const { loginHandler, protectRoute } = createAuthMiddleware(authConfig);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Página principal: login web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login con usuario/contraseña -> devuelve token
app.post('/auth/login', loginHandler);

// Rutas protegidas (token o API key + IP)
app.use('/api/precios', protectRoute, pricesRouter);
app.use('/api/inventario', protectRoute, inventoryRouter);
app.use('/api/reportes', protectRoute, reportsRouter);

const port = process.env.PORT || configJson.port || 3000;
app.listen(port, () => {
  console.log(`AgroMarket API escuchando en puerto ${port}`);
});