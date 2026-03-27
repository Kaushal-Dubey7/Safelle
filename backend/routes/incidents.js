const express = require('express');
const { body } = require('express-validator');
const incidentsController = require('../controllers/incidentsController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/', incidentsController.getIncidents);

router.post('/', verifyToken, [
  body('type').isIn(['harassment', 'theft', 'poor_lighting', 'unsafe_crowd', 'assault', 'other'])
    .withMessage('Invalid incident type'),
  body('severity').isInt({ min: 1, max: 5 }).withMessage('Severity must be between 1 and 5'),
  body('lat').isFloat().withMessage('Valid latitude is required'),
  body('lng').isFloat().withMessage('Valid longitude is required')
], incidentsController.createIncident);

router.get('/:id', incidentsController.getIncidentById);

module.exports = router;
