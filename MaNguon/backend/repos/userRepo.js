var md5 = require('crypto-js/md5');

var db = require('../fn/mysql-db');

exports.add = function(poco) {
  var md5_password = md5(poco.Password);
  var sql = `insert into users(TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, NgaySinh, userTypeId,userStatusId) values('${
    poco.TenDangNhap
  }', '${md5_password}', '${poco.HoTen}', '${poco.Email}', '${
    poco.SoDienThoai
  }',' ${poco.NgaySinh}',${poco.typeId},0)`;
  console.log(sql);
  return db.insert(sql);
};

exports.addUserlocation = function(id) {
  var sql = `insert into userlocation values(null,null,null,null,${id})`;
  console.log(sql);
  return db.insert(sql);
};

exports.login = function(userName, password) {
  return new Promise((resolve, reject) => {
    var md5_password = md5(password);
    var sql = `select * from users where TenDangNhap = '${userName}' and MatKhau = '${md5_password}'`;
    console.log(sql);
    db.load(sql)
      .then(rows => {
        if (rows.length === 0) {
          resolve(null);
        } else {
          var user = rows[0];
          resolve(user);
        }
      })
      .catch(err => reject(err));
  });
};

exports.load = function(id) {
  var sql = `select * from users where id = ${id}`;
  return db.load(sql);
};

exports.updateUserStatus = function(id, status) {
  var sql = `update users set userStatusId = '${status}' where id = '${id}'`;
  console.log(sql);
  return db.load(sql);
};

exports.updateUserStatusByTenDangNhap = function(TenDangNhap, status) {
  var sql = `update users set userStatusId = '${status}' where TenDangNhap = '${TenDangNhap}'`;
  return db.load(sql);
};

exports.getDriverOnline = function() {
  var sql = `select * from users where userTypeId = '2' and userStatusId='1'`;
  return db.load(sql);
};

exports.getFullDriverOnline = function() {
  var sql = `select * from users s inner join userlocation l on s.id = l.driverId where s.userTypeId = '2' and s.userStatusId='1'`;
  return db.load(sql);
};

exports.updateDiaChiDriver = function(poco) {
  var sql = `update userlocation set DiaChi = '${poco.DiaChi}',X = '${
    poco.X
  }',Y = '${poco.Y}'
     where driverId = '${poco.id}'`;
  console.log(sql);
  return db.load(sql);
};

exports.getDiaChiDriver = function(poco) {
  var sql = `select * from userlocation where driverId = '${poco.id}'`;
  console.log(sql);
  return db.load(sql);
};

exports.getStatusFromUsersRequests = function(poco) {
  var sql = `select * from usersrequests r inner join userlocation l on r.userid = l.driverId  where userid = '${
    poco.userid
  }' and requestid ='${poco.requestid}'`;
  console.log(sql);
  return db.load(sql);
};

exports.loadAll = function() {
  var sql = `select s.*, t.Loai as 'LoaiTaiKhoan' from users s inner join usertype t on s.userTypeId = t.id`;
  return db.load(sql);
};
