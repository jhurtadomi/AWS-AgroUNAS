const express = require('express');
const router = express.Router();

// Datos en memoria solo para demo
let inventario = [
  { id: 1, producto: 'Café', stock: 120, unidad: 'sacos' },
  { id: 2, producto: 'Cacao', stock: 80, unidad: 'sacos' },
  { id: 3, producto: 'Plátano', stock: 200, unidad: 'cajas' }
];

// GET inventario
router.get('/', (req, res) => {
  res.json({ data: inventario });
});

// POST inventario (solo admin/almacen)
router.post('/', (req, res) => {
  const role = req.user?.role; // viene del token JWT

  if (!['admin', 'almacen'].includes((role || '').toLowerCase())) {
    return res.status(403).json({
      error: 'Solo usuarios con rol admin o almacen pueden agregar productos.'
    });
  }

  const { producto, stock, unidad } = req.body;

  if (!producto || !unidad || typeof stock !== 'number') {
    return res.status(400).json({ error: 'producto, stock y unidad son obligatorios.' });
  }

  const newItem = {
    id: inventario.length + 1,
    producto,
    stock,
    unidad
  };

  inventario.push(newItem);

  return res.status(201).json({
    message: 'Producto agregado al inventario.',
    data: newItem
  });
});

module.exports = router;
