const express = require('express');
const routesController = require('../controllers/routesController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.get('/safe', routesController.getSafeRoute);

module.exports = router;
