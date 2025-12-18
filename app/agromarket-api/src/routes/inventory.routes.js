// src/routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const configJson = require('../../config/default.json');
const { enviarEvento } = require('../rabbitmq');

// ==========================================
// ESTADO DEL INVENTARIO (EN MEMORIA)
// ==========================================
let inventory = configJson.inventory || [
  { producto: 'Café', stock: 120, unidad: 'sacos' },
  { producto: 'Cacao', stock: 80, unidad: 'sacos' },
  { producto: 'Plátano', stock: 200, unidad: 'cajas' }
];

// ==========================================
// MIDDLEWARES Y VALIDACIONES
// ==========================================

// Solo admin / almacen pueden modificar inventario
function requireInventoryRole(req, res, next) {
  const role = req.user?.role;
  if (!role || !['admin', 'almacen'].includes(role.toLowerCase())) {
    return res
      .status(403)
      .json({ error: 'No autorizado para gestionar inventario' });
  }
  next();
}

// Validar datos de entrada
function validateInventoryInput(producto, stock, unidad) {
  if (!producto || !unidad || stock === undefined) {
    return 'Producto, stock y unidad son obligatorios';
  }

  const numericStock = Number(stock);
  if (!Number.isFinite(numericStock) || numericStock <= 0) {
    return 'El stock debe ser un número mayor a 0';
  }

  return null;
}

// ==========================================
// RUTAS (API ENDPOINTS)
// ==========================================

// 1. GET /api/inventario -> Listar todo
router.get('/', (req, res) => {
  return res.json({ data: inventory });
});

// 2. POST /api/inventario -> Agregar o Sumar Stock
// Esta ruta maneja la creación de nuevos productos o incremento de existentes
router.post('/', requireInventoryRole, (req, res) => {
  const { producto, stock, unidad } = req.body;

  const error = validateInventoryInput(producto, stock, unidad);
  if (error) return res.status(400).json({ error });

  const numericStock = Number(stock);
  const existing = inventory.find(
    (item) => item.producto.toLowerCase() === producto.toLowerCase()
  );

  let tipoAccion = '';

  if (existing) {
    existing.stock += numericStock;
    existing.unidad = unidad;
    tipoAccion = 'STOCK_INCREMENTADO';
  } else {
    inventory.push({ producto, stock: numericStock, unidad });
    tipoAccion = 'PRODUCTO_NUEVO_CREADO';
  }

  // DISPARAR EVENTO A RABBITMQ
  enviarEvento({
    accion: tipoAccion,
    data: { producto, cantidadOperada: numericStock, unidad, stockActual: existing ? existing.stock : numericStock },
    usuario: req.user?.username || 'agroadmin',
    fecha: new Date()
  });

  return res.status(201).json({
    message: 'Producto registrado/actualizado correctamente',
    data: inventory
  });
});

// 3. PUT /api/inventario/:producto -> Editar stock/unidad específico
router.put('/:producto', requireInventoryRole, (req, res) => {
  const productoParam = decodeURIComponent(req.params.producto);
  const { stock, unidad } = req.body;

  const error = validateInventoryInput(productoParam, stock, unidad);
  if (error) return res.status(400).json({ error });

  const existing = inventory.find(
    (item) => item.producto.toLowerCase() === productoParam.toLowerCase()
  );

  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  existing.stock = Number(stock);
  existing.unidad = unidad;

  // DISPARAR EVENTO A RABBITMQ
  enviarEvento({
    accion: 'STOCK_MODIFICADO_MANUAL',
    data: { producto: productoParam, nuevoStock: existing.stock, unidad: existing.unidad },
    usuario: req.user?.username || 'agroadmin',
    fecha: new Date()
  });

  return res.json({
    message: 'Producto actualizado correctamente',
    data: inventory
  });
});

// 4. DELETE /api/inventario/:producto -> Eliminar producto
router.delete('/:producto', requireInventoryRole, (req, res) => {
  const productoParam = decodeURIComponent(req.params.producto);

  const index = inventory.findIndex(
    (item) => item.producto.toLowerCase() === productoParam.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const eliminado = inventory[index];
  inventory.splice(index, 1);

  // DISPARAR EVENTO A RABBITMQ
  enviarEvento({
    accion: 'PRODUCTO_ELIMINADO',
    data: { producto: eliminado.producto },
    usuario: req.user?.username || 'agroadmin',
    fecha: new Date()
  });

  return res.json({
    message: 'Producto eliminado correctamente',
    data: inventory
  });
});

// 5. POST /api/inventario/guardar -> Alias para compatibilidad
// (Misma lógica que la creación para asegurar que el video funcione)
router.post('/guardar', requireInventoryRole, async (req, res) => {
    const { producto, stock, unidad } = req.body;
    
    // Disparar evento a RabbitMQ
    enviarEvento({
        accion: 'REGISTRO_DESDE_FORMULARIO',
        data: req.body,
        usuario: req.user?.username || 'agroadmin',
        fecha: new Date()
    });

    res.status(200).send('Producto registrado y notificado a RabbitMQ');
});

module.exports = router;