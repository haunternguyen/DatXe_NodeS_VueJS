var express = require('express'),
  axios = require('axios');

var userRepo = require('../repos/userRepo'),
  authRepo = require('../repos/authRepo'),
  jwt = require('jsonwebtoken'),
  opts = require('../fn/opts');

var router = express.Router();

router.post('/', (req, res) => {
  userRepo
    .add(req.body)
    .then(insertId => {
      userRepo
        .addUserlocation(insertId)
        .then(id => {
          console.log(id);
        })
        .catch(r => {
          console.log(r);
        });
      res.statusCode = 201;
      res.json(req.body);
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
});

router.get('/getDriverOnline', (req, res) => {
  userRepo
    .getDriverOnline()
    .then(rows => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});
router.get('/getFullDriverOnline', (req, res) => {
  userRepo
    .getFullDriverOnline()
    .then(rows => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});
router.post('/captcha', (req, res) => {
  var secret = '6LderVAUAAAAANlZ_RuqdomfqVp90ElsfXDP2WOX';
  var captcha_response = req.body.captcha_response;

  var url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captcha_response}`;
  axios
    .post(
      url,
      {
        // secret: _secret,
        // response: captcha_response
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    )
    .then(function(response) {
      // console.log(response.data);
      // res.end('ok');
      res.json(response.data);
    })
    .catch(function(error) {
      res.end('fail');
    });
});

router.post('/login', (req, res) => {
  userRepo
    .login(req.body.user, req.body.pwd)
    .then(userObj => {
      console.log(userObj);
      if (userObj) {
        var token = authRepo.generateAccessToken(userObj);
        var refreshToken = authRepo.generateRefreshToken();
        userRepo.updateUserStatus(userObj.id, 1);
        authRepo
          .updateRefreshToken(userObj.id, userObj.TenDangNhap, refreshToken)
          .then(rs => {
            // console.log(userObj);
            res.json({
              msg: 'login true',
              //user: userObj,
              access_token: token,
              refresh_token: refreshToken,
              TenDangNhap: userObj.TenDangNhap,
              userStatusId: userObj.userStatusId,
              userTypeId: userObj.userTypeId,
              id: userObj.id
            });
          })
          .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.end('View error log on console.');
          });
      } else {
        res.json({
          msg: 'login false'
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/renew-token', (req, res) => {
  var rToken = req.body.refreshToken;
  authRepo
    .verifyRefreshToken(rToken)
    .then(rows => {
      if (rows.length === 0) {
        res.statusCode = 400;
        res.json({
          msg: 'invalid refresh-token'
        });

        throw new Error('abort-chain'); // break promise chain
      } else {
        return rows[0].ID;
      }
    })
    .then(id => userRepo.load(id))
    .then(rows => {
      var userObj = rows[0];
      var token = authRepo.generateAccessToken(userObj);
      res.json({
        msg: 'newtoken',
        access_token: token
      });
    })
    .catch(err => {
      if (err.message !== 'abort-chain') {
        console.log(err);
        res.statusCode = 500;
        res.end('View error log on console.');
      }
    });
});

router.get('/logout', (req, res) => {
  var rToken = req.query.refreshtoken;
  var TenDangNhap = req.query.TenDangNhap;
  // console.log('TenDangNhap: ' + TenDangNhap);
  // console.log('rToken: ' + rToken);
  userRepo.updateUserStatusByTenDangNhap(TenDangNhap, 0);
  authRepo
    .deleteRefreshTokenTenDangNhap(TenDangNhap)
    .then(affectedRows => {
      res.json({
        msg: 'success'
      });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/updateDiaChiDriver', (req, res) => {
  userRepo
    .updateDiaChiDriver(req.body)
    .then(updateId => {
      res.statusCode = 201;
      res.json({ msg: 'ok' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
});

router.post('/getDiaChiDriver', (req, res) => {
  userRepo
    .getDiaChiDriver(req.body)
    .then(userObj => {
      res.statusCode = 201;
      res.json({ userObj: userObj[0] });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
});

router.post('/getStatusFromUsersRequests', (req, res) => {
  userRepo
    .getStatusFromUsersRequests(req.body)
    .then(userObj => {
      console.log('Trạng thái: ' + userObj[0].status);
      res.statusCode = 201;
      res.json({
        msg: 'ok',
        status: userObj[0].status,
        X: userObj[0].X,
        Y: userObj[0].Y
      });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
});

router.post('/updateUserStatus', (req, res) => {
  userRepo
    .updateUserStatus(req.body.id, req.body.status)
    .then(userObj => {
      res.statusCode = 201;
      // res.json({ userObj: userObj[0]});
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
});

router.get('/loadAll', (req, res) => {
  // res.json({msg:'request'})
  userRepo
    .loadAll()
    .then(rows => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

module.exports = router;
