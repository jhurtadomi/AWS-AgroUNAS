// src/routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const configJson = require('../../config/default.json');

// Inventario en memoria; si no hay en config, ponemos algunos por defecto
let inventory = configJson.inventory || [
  { producto: 'Café', stock: 120, unidad: 'sacos' },
  { producto: 'Cacao', stock: 80, unidad: 'sacos' },
  { producto: 'Plátano', stock: 200, unidad: 'cajas' }
];

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

// ====== RUTAS ======

// GET /api/inventario -> lista
router.get('/', (req, res) => {
  return res.json({ data: inventory });
});

// POST /api/inventario -> agregar/sumar producto
router.post('/', requireInventoryRole, (req, res) => {
  const { producto, stock, unidad } = req.body;

  const error = validateInventoryInput(producto, stock, unidad);
  if (error) {
    return res.status(400).json({ error });
  }

  const numericStock = Number(stock);

  // Si ya existe, sumamos stock
  const existing = inventory.find(
    (item) => item.producto.toLowerCase() === producto.toLowerCase()
  );

  if (existing) {
    existing.stock += numericStock;
    existing.unidad = unidad; // por si cambió la unidad
  } else {
    inventory.push({
      producto,
      stock: numericStock,
      unidad
    });
  }

  return res.status(201).json({
    message: 'Producto registrado/actualizado correctamente',
    data: inventory
  });
});

// PUT /api/inventario/:producto -> editar stock/unidad
router.put('/:producto', requireInventoryRole, (req, res) => {
  const productoParam = decodeURIComponent(req.params.producto);
  const { stock, unidad } = req.body;

  const error = validateInventoryInput(productoParam, stock, unidad);
  if (error) {
    return res.status(400).json({ error });
  }

  const numericStock = Number(stock);

  const existing = inventory.find(
    (item) => item.producto.toLowerCase() === productoParam.toLowerCase()
  );

  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  existing.stock = numericStock;
  existing.unidad = unidad;

  return res.json({
    message: 'Producto actualizado correctamente',
    data: inventory
  });
});

// DELETE /api/inventario/:producto -> eliminar
router.delete('/:producto', requireInventoryRole, (req, res) => {
  const productoParam = decodeURIComponent(req.params.producto);

  const index = inventory.findIndex(
    (item) => item.producto.toLowerCase() === productoParam.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  inventory.splice(index, 1);

  return res.json({
    message: 'Producto eliminado correctamente',
    data: inventory
  });
});

module.exports = router;
