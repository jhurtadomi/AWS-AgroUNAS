// index.js - Backend AgroMarket API

const express = require('express');
const app = express();
const path = require('path');

const logger = require('./src/middleware/logger');
app.use(logger);

// Middleware para parsear JSON
app.use(express.json());

// ===== PUBLIC FOLDER =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== ROUTES =====
const authRoutes = require('./src/auth/auth.routes');
const mainRoutes = require('./src/routes/main.routes');
const middlewareRoutes = require('./src/middleware/custom.middleware'); // si existe

app.use('/auth', authRoutes);
app.use('/', mainRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`AgroMarket API running on port ${PORT}`);
});
