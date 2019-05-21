const express = require('express');
const router = express.Router();
const expressJwt = require('express-jwt');
const authCtrl = require('../controllers/auth.controller');
const requestCtrl = require('../controllers/request.controller');
const config = require('../../config/config');

router.route('/')
  .get((req, res, next) => {
    requestCtrl.getList().then((result) =>
      res.json(result)
    ).catch(err => next(err))
  })
  .post(requestCtrl.createOne);

router.route('/:id')
  .get(requestCtrl.getOne)
  .put(requestCtrl.updateOne)
  .delete(requestCtrl.deleteItem);

router.route('/:id/findAvailableDriver')
  .get(requestCtrl.findAvailableDriver);

module.exports = router;
