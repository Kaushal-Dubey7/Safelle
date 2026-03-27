const express = require('express');
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.use(verifyToken, adminOnly);

router.get('/incidents', adminController.getIncidents);
router.put('/incident/:id', adminController.verifyIncident);
router.delete('/incident/:id', adminController.deleteIncident);
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);

module.exports = router;
