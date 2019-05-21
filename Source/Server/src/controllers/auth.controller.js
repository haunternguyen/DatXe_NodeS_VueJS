const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/errorHandlers/APIError');
const config = require('../../config/config');
const Driver = require('../models/driver.model');

module.exports = {
  driverLogin: driverLogin
};

function driverLogin(req, res, next) {
  Driver.findOne({
    where: {
      phone: req.body.phone,
      password: req.body.password
    }
  }).then((result) => {
    if (result) {
      const token = jwt.sign({
        driverId: result.id,
        phone: result.phone
      }, config.jwtSecret, {expiresIn: '2h'});
      return res.json({
        token,
        phone: result.phone,
        driverId: result.id,
        driverName: result.name,
      });
    }

    const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
    return next(err);
  }).catch((err) => {
    next(err);
  });
}
