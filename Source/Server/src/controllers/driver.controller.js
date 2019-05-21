const httpStatus = require('http-status');
const APIError = require('../helpers/errorHandlers/APIError');
const Driver = require('../models/driver.model');
const Request = require('../models/request.model');
const RequestDriverRejected = require('../models/request-driver-rejected.model');
const socketHandler = require('../helpers/socketHandler/index');
const helpers = require('../helpers/index');
const requestCtrl = require('./request.controller');

module.exports = {
  getList: getList,
  getOne: getOne,
  createOne: createOne,
  updateOne: updateOne,
  updateLocation: updateLocation,
  acceptRequest: acceptRequest,
  movingRequest: movingRequest,
  doneRequest: doneRequest,
  rejectRequest: rejectRequest
};

function getList() {
  return Driver.findAll();
}

function getOne(req, res, next) {
  const id = req.params.id;

  Driver.findById(id)
    .then(result => {
      if (result) {
        res.json(result)
      } else {
        const err = new APIError(`Không tìm thấy tài xế  id ${id}`, httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
    })
    .catch(err => next(err));
}

function createOne(req) {
  const data = req.body;

  return Driver.create(data);
}

function updateOne(req, res, next) {
  const id = req.params.id;
  const data = req.body;

  Driver.findById(id).then(result => {
    if (result) {
      return result.update(data);
    } else {
      const err = new APIError(`Không tìm thấy tài xế  id ${id}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(result => res.json(result))
  .catch(err => next(err));
}

function updateLocation(req, res, next) {
  const id = req.params.id;
  const payload = {
    lat: req.body.lat,
    lng: req.body.lng
  };

  Driver.findById(id).then(result => {
    if (result) {
      if (!result.lat && !result.lng) {
        return result.update(payload);
      } else {
        const isValidLocation = checkIsValidLocation(payload, result);
        if (isValidLocation) {
          return result.update(payload);
        } else {
          const err = new APIError(`Vị trí mới không được vượt quá 100m so với vị trí cũ.`, httpStatus.BAD_REQUEST, true);
          return Promise.reject(err);
        }
      }
    } else {
      const err = new APIError(`Không tìm thấy tài xế  id ${id}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(result => {
    const location = {
      lat: result.lat,
      lng: result.lng
    };
    socketHandler.emitDriverLocationChange(result.id, location);
    res.json(result)
  })
  .catch(err => next(err));
}

function acceptRequest(req, res, next) {
  const driverId = req.params.id;
  const data = req.body;
  const requestId = data.requestId;
  let driverInfo = null;

  // update status to busy
  Driver.findById(driverId).then(result => {
    if (result) {
      return result.update({
        status: 'busy'
      });
    } else {
      const err = new APIError(`Không tìm thấy tài xế  id ${driverId}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(driver => {
    driverInfo = driver;
    // update driverId to request
    return Request.findById(requestId).then(result => {
      if (result) {
        return result.update({
          driverId: driverId * 1,
          status: 'picked'
        });
      } else {
        const err = new APIError(`Không tìm thấy yêu cầu id ${requestId}`, httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
    })
    .then(result => {
      result = result.get({ plain: true });
      result.driver = driverInfo;
      // emit event request status has changed to all identifiers
      socketHandler.emitIdentifierRequestStatusChange(requestId, result);

      res.json(result)
    })
    .catch(err => next(err));
  })
  .catch(err => next(err));
}

function movingRequest(req, res, next) {
  const driverId = req.params.id;
  const data = req.body;
  const requestId = data.requestId;
  let driverInfo = null;

  Driver.findById(driverId).then(driver => {
    if (driver) {
      driverInfo = driver;

      // update request status is moving
      return Request.findById(requestId).then(result => {
        if (result) {
          return result.update({
            status: 'moving'
          });
        } else {
          const err = new APIError(`Không tìm thấy yêu cầu id ${requestId}`, httpStatus.NOT_FOUND, true);
          return Promise.reject(err);
        }
      })
    } else {
      const err = new APIError(`Không tìm thấy tài xế  id ${driverId}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(result => {
    result = result.get({ plain: true });
    result.driver = driverInfo;
    // emit event request status has changed to all identifiers
    socketHandler.emitIdentifierRequestStatusChange(requestId, result);

    res.json(result)
  })
  .catch(err => next(err));
}

function doneRequest(req, res, next) {
  const driverId = req.params.id;
  const data = req.body;
  const requestId = data.requestId;
  let driverInfo = null;

  // update status to busy
  Driver.findById(driverId).then(result => {
    if (result) {
      return result.update({
        status: 'online'
      });
    } else {
      const err = new APIError(`Không tìm thấy tài xế  id ${driverId}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(driver => {
    driverInfo = driver;
    // update driverId to request
    return Request.findById(requestId).then(result => {
      if (result) {
        return result.update({
          status: 'done'
        });
      } else {
        const err = new APIError(`Không tìm thấy yêu cầu id ${requestId}`, httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
    })
    .then(result => {
      result = result.get({ plain: true });
      result.driver = driverInfo;
      // emit event request status has changed to all identifiers
      socketHandler.emitIdentifierRequestStatusChange(requestId, result);

      res.json(result)
    })
    .catch(err => next(err));
  })
  .catch(err => next(err));
}

function rejectRequest(req, res, next) {
  const driverId = req.params.id * 1;
  const requestId = req.body.requestId * 1;
  const data = {
    requestId: requestId,
    driverId: driverId
  };

  RequestDriverRejected.create(data).then(result => {
    res.json(result);

    // find another driver for request if retryCount less than RETRY_FIND_DRIVER
    Request.findById(requestId).then(request => {
      if (request) {
        const retryCount = request.retryCount + 1;
        if (request.retryCount < process.env.RETRY_FIND_DRIVER) {
          requestCtrl.findAvailableDriverHelper(requestId).then((result) => {
            // find out new driver
            console.log(`Find out new driver...`);
          }).catch(err => {
            // update request status is no-driver if not found any driver
            request.update({
              status: 'no-driver'
            })
            .then(result => {
              result = result.get({ plain: true });
              result.driver = null;
              // emit event request status has changed to all identifiers
              socketHandler.emitIdentifierRequestStatusChange(requestId, result);
            })
            .catch(err => console.error(err));
          });
          request.update({
            retryCount: retryCount
          });
        } else {
          // update request status is no-driver
          request.update({
            status: 'no-driver',
            retryCount: retryCount
          })
          .then(result => {
            result = result.get({ plain: true });
            result.driver = null;
            // emit event request status has changed to all identifiers
            socketHandler.emitIdentifierRequestStatusChange(requestId, result);
          })
          .catch(err => console.error(err));
        }
      }
    }).catch(err => console.error(err));

  }).catch(err => next(err));
}

function checkIsValidLocation(previousLocation, currentLocation) {
  if (
    previousLocation &&
    currentLocation &&
    previousLocation.lat && previousLocation.lng &&
    currentLocation.lat && currentLocation.lng
  ) {
    const limitValue = 0.1 // 0.1 ~ 100m
    const distance = helpers.calcHaversine(currentLocation.lat, currentLocation.lng, previousLocation.lat, previousLocation.lng);
    if (distance > limitValue) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}
