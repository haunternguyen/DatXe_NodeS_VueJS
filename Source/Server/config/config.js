// load vars from file .env to process.env
require('dotenv').config();

const envConfig = process.env;
const config = {
  env: envConfig.NODE_ENV,
  port: envConfig.PORT,
  jwtSecret: envConfig.JWT_SECRET,
  isUseMySQL: !!envConfig.IS_USE_MYSQL
};

module.exports = config;
