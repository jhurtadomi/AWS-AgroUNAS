const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    data: [
      { producto: 'Café', stock: 120, unidad: 'sacos' },
      { producto: 'Cacao', stock: 80, unidad: 'sacos' },
      { producto: 'Plátano', stock: 300, unidad: 'cajones' }
    ]
  });
});

module.exports = router;
