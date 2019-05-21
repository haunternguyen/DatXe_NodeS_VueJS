const Sequelize = require('sequelize');
const mysqlConfig = require('../../config/databases/mysql');
const sequelize = mysqlConfig.getInstance();
const mockData = require('./mock-data/request.json');
// const Driver = require('./driver.model');

const Request = sequelize.define('request', {
  name: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.STRING,
    isIn: [['received', 'geocoded', 'picked', 'moving', 'done', 'no-driver']]
  },
  pickupAddress: {
    type: Sequelize.STRING
  },
  reversedAddress:{
    type: Sequelize.STRING
  },
  destAddress: {
    type: Sequelize.STRING
  },
  pickupLat: {
    type: Sequelize.FLOAT
  },
  pickupLng: {
    type: Sequelize.FLOAT
  },
  destLat: {
    type: Sequelize.FLOAT
  },
  destLng: {
    type: Sequelize.FLOAT
  },
  phone: {
    type: Sequelize.STRING
  },
  note: {
    type: Sequelize.TEXT
  },
  destAddress: {
    type: Sequelize.STRING
  },
  driverId: {
    type: Sequelize.INTEGER
  },
  retryCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
});

// Request.belongsTo(Driver, { onDelete: 'SET NULL', onUpdate: 'CASCADE' }); // Will add driverId to request

Request.sync({force: true}).then(() => {
  // Table created
  return Request.bulkCreate(mockData);
});

module.exports = Request;
