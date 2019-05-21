const Sequelize = require('sequelize');
const mysqlConfig = require('../../config/databases/mysql');
const sequelize = mysqlConfig.getInstance();

const RequestDriverRejected = sequelize.define('request_driver_rejected', {
  requestId: {
    type: Sequelize.INTEGER
  },
  driverId: {
    type: Sequelize.INTEGER
  }
});

RequestDriverRejected.sync({force: true});

module.exports = RequestDriverRejected;
