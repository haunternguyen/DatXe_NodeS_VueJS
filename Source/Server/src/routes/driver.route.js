const express = require('express');
const router = express.Router();
const expressJwt = require('express-jwt');
const authCtrl = require('../controllers/auth.controller');
const driverCtrl = require('../controllers/driver.controller');
const config = require('../../config/config');

router.route('/')
  .get((req, res, next) => {
    driverCtrl.getList().then((result) =>
      res.json(result)
    ).catch(err => next(err))
  })
  .post((req, res, next) => {
    driverCtrl.createOne(req).then((result) =>
      res.json(result)
    ).catch(err => next(err))
  });

router.route('/:id')
  .get(expressJwt({ secret: config.jwtSecret }), driverCtrl.getOne)
  .put(expressJwt({ secret: config.jwtSecret }), driverCtrl.updateOne)

router.route('/:id/updateLocation')
  .put(expressJwt({ secret: config.jwtSecret }), driverCtrl.updateLocation)

router.route('/:id/acceptRequest')
  .post(expressJwt({ secret: config.jwtSecret }), driverCtrl.acceptRequest)

router.route('/:id/movingRequest')
  .post(expressJwt({ secret: config.jwtSecret }), driverCtrl.movingRequest)

router.route('/:id/doneRequest')
  .post(expressJwt({ secret: config.jwtSecret }), driverCtrl.doneRequest)

router.route('/:id/rejectRequest')
  .post(expressJwt({ secret: config.jwtSecret }), driverCtrl.rejectRequest)


module.exports = router;
