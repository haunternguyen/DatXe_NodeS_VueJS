const express = require('express');
const router = express.Router();
const expressJwt = require('express-jwt');
const authCtrl = require('../controllers/auth.controller');
const config = require('../../config/config');

router.route('/driver/login')
  .post(authCtrl.driverLogin);

module.exports = router;
