const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    data: [
      { producto: 'Café', precio: 12.5, unidad: 'kg' },
      { producto: 'Cacao', precio: 9.8, unidad: 'kg' },
      { producto: 'Plátano', precio: 2.1, unidad: 'kg' }
    ]
  });
});

module.exports = router;
