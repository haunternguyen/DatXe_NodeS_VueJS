const socketIO = require('socket.io');
const logger = require('../../../config/winston');

const socketData = {
  drivers: {},
  identifiers: {}
};

module.exports = {
  init: init,
  emitDriverLocationChange: emitDriverLocationChange,
  emitNewFitRequestToDriver: emitNewFitRequestToDriver,
  emitIdentifierRequestStatusChange: emitIdentifierRequestStatusChange,
  emitIdentifierRequestsChange: emitIdentifierRequestsChange
};

function init(app) {
  const io = socketIO(app);
  logger.info('Socket server listening...');
  io.on('connection', (socket) => {
    logger.info(`Socket ${socket.id} connected`);
    // init drivers info
    socket.on('init-driver-info', (data) => {
      if (data) {
        socketData.drivers[socket.id] = {};
        socketData.drivers[socket.id].info = data;
        socketData.drivers[socket.id].socket = socket;
      }
    });
    // init drivers info
    socket.on('init-identifier-info', (data) => {
      if (data) {
        socketData.identifiers[socket.id] = {};
        socketData.identifiers[socket.id].info = data;
        socketData.identifiers[socket.id].socket = socket;
      }
    });
    socket.on('disconnect', () => {
      logger.info(`Socket ${socket.id} disconnected`);
      delete socketData.drivers[socket.id];
      delete socketData.identifiers[socket.id];
    });
  });

  return io;
}

function emitEventByDriverId(driverId, callback) {
  for (const key in socketData.drivers) {
    if (socketData.drivers.hasOwnProperty(key)) {
      const obj = socketData.drivers[key];
      if (obj.socket && obj.info && obj.info.id == driverId) {
        callback(obj.socket)
      }
    }
  }
}

function emitEventToAllIdentifiers(callback) {
  for (const key in socketData.identifiers) {
    if (socketData.identifiers.hasOwnProperty(key)) {
      const obj = socketData.identifiers[key];
      if (obj && obj.socket) {
        callback(obj.socket)
      }
    }
  }
}

function emitEventByIdentifierId(identifierId, callback) {
  for (const key in socketData.identifiers) {
    if (socketData.identifiers.hasOwnProperty(key)) {
      const obj = socketData.identifiers[key];
      if (obj.socket && obj.info && obj.info.id == identifierId) {
        callback(obj.socket)
      }
    }
  }
}

function emitDriverLocationChange(driverId, data) {
  emitEventByDriverId(driverId, (socket) => {
    const eventName = `${driverId}-driver-location-change`;
    socket.emit(eventName, data); // emit event name dynamic with driver id
    logger.info(`Socket emitted ${eventName}; Data = ${JSON.stringify(data)}`);
  })
}

function emitNewFitRequestToDriver(driverId, data) {
  emitEventByDriverId(driverId, (socket) => {
    const eventName = `${driverId}-driver-new-fit-request`;
    socket.emit(eventName, data); // emit event name dynamic with driver id
    logger.info(`Socket emitted ${eventName}; Data = ${JSON.stringify(data)}`);
  })
}

function emitIdentifierRequestStatusChange(requestId, data) {
  emitEventToAllIdentifiers(socket => {
    const eventName = `${requestId}-request-status-change`;
    socket.emit(eventName, data);
    logger.info(`Socket emitted ${eventName}; Data = ${JSON.stringify(data)}`);
  });
}

function emitIdentifierRequestsChange(data) {
  emitEventToAllIdentifiers(socket => {
    const eventName = `identifier-requests-change`;
    socket.emit(eventName, data);
    logger.info(`Socket emitted ${eventName}; Data = ${JSON.stringify(data)}`);
  });
}
