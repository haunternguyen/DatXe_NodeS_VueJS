const express = require('express');
const authRoutes = require('./auth.route');
const driverRoutes = require('./driver.route');
const requestRoutes = require('./request.route');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/driver', driverRoutes);
router.use('/request', requestRoutes);

module.exports = router;
