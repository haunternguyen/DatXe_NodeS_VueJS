var randtoken = require('rand-token'),
  jwt = require('jsonwebtoken'),
  moment = require('moment');

var db = require('../fn/mysql-db'),
  opts = require('../fn/opts');
(authRepo = require('../repos/authRepo')),
  (userRepo = require('../repos/userRepo'));
//
// acccess-token

exports.generateAccessToken = userObj => {
  var payload = {
    user: userObj,
    info: 'more info for you'
  };
  var token = jwt.sign(payload, opts.ACCESS_TOKEN.SECRET_KEY, {
    expiresIn: opts.ACCESS_TOKEN.LIFETIME
  });

  return token;
};

const axios = require('axios');

exports.verifyAccessToken = (req, res, next) => {
  var token = req.headers['x-access-token'];
  // console.log('Xac nhan token ' +  token)
  if (token) {
    jwt.verify(token, opts.ACCESS_TOKEN.SECRET_KEY, (err, payload) => {
      if (err) {
        f1(req, res);

        // res.json({
        //     msg: 'renew token',
        //     error: err
        //   });
        // res.json({
        //   msg: 'verify failed',
        //   error: err
        // });
      } else {
        req.token_payload = payload;
        next();
      }
    });
  } else {
    res.statusCode = 403;
    res.json({
      msg: 'no token found'
    });
  }
};
var f1 = (req, res) => {
  var rToken = req.query.refreshtoken;
  // console.log('refreshtoken: ' + rToken);
  var id = this.verifyRefreshToken(rToken);
  // console.log(id);
  var userObj = userRepo.load(id).catch(err => console.log(err));
  var token = authRepo.generateAccessToken(userObj);
  res.json({
    msg: 'newtoken',
    access_token: token
  });
};
//
// refresh-token

exports.generateRefreshToken = () => {
  return randtoken.generate(opts.REFRESH_TOKEN.SIZE);
};

exports.updateRefreshToken = (id, TenDangNhap, refreshToken) => {
  return new Promise((resolve, reject) => {
    var rdt = moment().format('YYYY-MM-DD HH:mm:ss');
    var sql = `delete from userRefreshTokenExt where ID = ${id}`;
    db.delete(sql)
      .then(affectedRows => {
        //, '${TenDangNhap}'
        sql = `insert into userRefreshTokenExt values(${id}, '${TenDangNhap}', '${refreshToken}', '${rdt}')`;
        return db.insert(sql);
      })
      .then(insert_id => {
        resolve(true);
      })
      .catch(err => reject(err));
  });
};

exports.verifyRefreshToken = refreshToken => {
  var sql = `select * from userRefreshTokenExt where refreshToken = '${refreshToken}'`;
  return db.load(sql);
};

exports.deleteRefreshToken = id => {
  var sql = `delete from userRefreshTokenExt where ID = ${id}`;
  return db.delete(sql);
};
exports.deleteRefreshTokenTenDangNhap = TenDangNhap => {
  var sql = `delete from userRefreshTokenExt where TenDangNhap = '${TenDangNhap}'`;
  return db.delete(sql);
};
