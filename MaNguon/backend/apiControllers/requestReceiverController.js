var express = require('express');
var requestRepo = require('../repos/requestRepo');

var router = express.Router();

router.get('/', (req, res) => {
  // res.json({msg:'request'})
  requestRepo
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

router.post('/', (req, res) => {
  requestRepo
    .add(req.body)
    .then(insertId => {
      var poco = {
        id: insertId,
        HoTen: req.body.HoTen
      };
      res.statusCode = 201;
      res.json({ poco, msg: 'ok' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/updateToaDo', (req, res) => {
  requestRepo
    .updateToaDo(req.body)
    .then(updateId => {
      var poco = {
        id: updateId,
        HoTen: req.body.HoTen
      };
      res.statusCode = 201;
      res.json({ poco, msg: 'Cập nhật thành công' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.get('/getToaDoDaCapNhatById', (req, res) => {
  var id = req.query.id;
  requestRepo
    .getToaDoDaCapNhatById(id)
    .then(rows => {
      if (rows.length === 0) {
        res.json({ msg: 'Chưa định vị' });
      } else {
        var requestObject = rows[0];
        res.json({ requestObject, msg: 'ok' });
      }
    })
    .catch(err => reject(err));
});

router.post('/themTaiXeChoRequest', (req, res) => {
  requestRepo
    .themTaiXeChoRequest(req.body)
    .then(rows => {
      res.statusCode = 201;
      res.json({ rows, msg: 'Thêm thành công!' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/chapNhanTaiXeChoRequest', (req, res) => {
  requestRepo
    .chapNhanTaiXeChoRequest(req.body)
    .then(rows => {
      res.statusCode = 201;
      res.json({ rows, msg: 'Cập nhật thành công!' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/capNhatTrangThaiRequest', (req, res) => {
  requestRepo
    .capNhatTrangThaiRequest(req.body)
    .then(rows => {
      res.statusCode = 201;
      res.json({ rows, msg: 'Cập nhật thành công!' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/capNhatTaiXeChoRequest', (req, res) => {
  requestRepo
    .capNhatTaiXeChoRequest(req.body)
    .then(rows => {
      res.statusCode = 201;
      res.json({ rows, msg: 'Cập nhật thành công!' });
    })
    .catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
    });
});

router.post('/deleteRequest', (req, res) => {
  requestRepo.deleteRequest(req.body.id)
      .then(insertId => {
          res.statusCode = 201;
          res.json({msg: 'deleted' });
      })
      .catch(err => {
          console.log(err);
          res.statusCode = 500;
          res.end();
      });
});

router.get('/getList', (req, res) => {
  // res.json({msg:'request'})
  requestRepo.getList().then(rows => {
      res.json(rows);
  }).catch(err => {
      console.log(err);
      res.statusCode = 500;
      res.end('View error log on console.');
  });
});
module.exports = router;
