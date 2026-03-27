const express = require('express');
const { body } = require('express-validator');
const sosController = require('../controllers/sosController');
const verifyToken = require('../middleware/auth');
const { sosLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(verifyToken);

router.post('/', sosLimiter, [
  body('lat').isFloat().withMessage('Valid latitude is required'),
  body('lng').isFloat().withMessage('Valid longitude is required')
], sosController.triggerSOS);

router.get('/my', sosController.getMySOS);

module.exports = router;
