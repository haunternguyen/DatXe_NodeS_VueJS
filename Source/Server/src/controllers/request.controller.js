const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const httpStatus = require('http-status');
const Request = require('../models/request.model');
const Driver = require('../models/driver.model');
const RequestDriverRejected = require('../models/request-driver-rejected.model');
const socketHandler = require('../helpers/socketHandler/index');
const APIError = require('../helpers/errorHandlers/APIError');
const helpers = require('../helpers/index');

module.exports = {
  getList: getList,
  getOne: getOne,
  createOne: createOne,
  updateOne: updateOne,
  deleteItem: deleteItem,
  findAvailableDriver: findAvailableDriver,
  findAvailableDriverHelper: findAvailableDriverHelper
};

function getList() {
  return Request.findAll({
    order: [['createdAt', 'DESC']]
  });
}

function getOne(req, res, next) {
  const requestId = req.params.id;

  Request.findById(requestId)
    .then(result => {
      if (result) {
        // get info driver
        if (result.driverId) {
          return Driver.findById(result.driverId).then(driver => {
            driver = driver.get({ plain: true });
            result = result.get({ plain: true });
            result.driver = driver;
            return res.json(result);
          }).catch(err => next(err));
        } else {
          return res.json(result);
        }
      } else {
        const err = new APIError(`Không tìm thấy yêu cầu id ${requestId}`, httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
    })
    .catch(err => next(err));
}

function createOne(req, res, next) {
  const data = req.body;

  Request.create(data).then(result => {
    const data = {
      action: 'create',
      data: result
    };
    // emit to all identifers requests has new data
    socketHandler.emitIdentifierRequestsChange(data);
    res.json(result);
  }).catch(err => {
    next(err);
  });
}

function deleteItem(req, res, next) {
  const id = req.params.id;

  Request.findById(id).then(result => {
    if (result) {
      return result.destroy();
    } else {
      const err = new APIError(`Không tìm thấy yêu cầu id ${id}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(result => res.json(result))
  .catch(err => next(err));
}

function updateOne(req, res, next) {
  const requestId = req.params.id;
  const data = req.body;

  Request.findById(requestId).then(result => {
    if (result) {
      return result.update(data);
    } else {
      const err = new APIError(`Không tìm thấy yêu cầu id ${requestId}`, httpStatus.NOT_FOUND, true);
      return Promise.reject(err);
    }
  })
  .then(result => {
    const data = {
      action: 'update',
      data: result
    };
    // emit to all identifers requests has update data
    socketHandler.emitIdentifierRequestsChange(data);
    res.json(result)
  })
  .catch(err => next(err));
}

function findAvailableDriver(req, res, next) {
  const requestId = req.params.id || req.query.id;

  findAvailableDriverHelper(requestId)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function findAvailableDriverHelper(requestId) {
  return new Promise((resolve, reject) => {
    Request.findOne({
      where: {
        id: requestId * 1
      }
    }).then(result => {
      if (result) {
        const requestInfo = result;
        const pickupLocation = {
          lat: result.pickupLat,
          lng: result.pickupLng
        };

        RequestDriverRejected.findAll({
          where: {
            requestId: requestId
          }
        }).then(result => {
          const rejectedDriverIds = result.map(item => item.driverId);

          Driver.findAll({
            where: {
              status: 'online',
              id: {
                [Op.notIn]: rejectedDriverIds
              }
            }
          }).then(drivers => {
            if (drivers && drivers.length > 0) {
              const haversineCalculated = drivers.map((modelInstance) => {
                const driver = modelInstance.get({ plain: true });
                driver.haversineDistance = helpers.calcHaversine(pickupLocation.lat, pickupLocation.lng, driver.lat, driver.lng);

                return driver;
              });

              // find driver has min distance haversine
              const minDistanceDriver = haversineCalculated.reduce((pre, cur) => {
                let res = pre;
                if (cur.haversineDistance < pre.haversineDistance) {
                  res = cur;
                }
                return res;
              });

              if (minDistanceDriver) {
                socketHandler.emitNewFitRequestToDriver(minDistanceDriver.id, requestInfo);
              }

              resolve(minDistanceDriver);
            } else {
              const err = new APIError('Không tìm thấy tài xế phù hợp.', httpStatus.NOT_FOUND, true);
              return Promise.reject(err);
            }
          }).catch(err => reject(err));

        }).catch(err => reject(err));
      } else {
        const err = new APIError(`Không tìm thấy yều cầu id ${requestId}`, httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
    })
    .catch(err => reject(err));
  });
}
