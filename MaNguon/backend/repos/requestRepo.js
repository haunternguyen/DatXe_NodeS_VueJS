var db = require('../fn/mysql-db');

exports.loadAll = function() {
  var sql =
    'select *,r.id as rid from request r inner join requeststatus s where r.requeststatusid = s.id';
  return db.load(sql);
};

exports.add = function(poco) {
  var sql = `insert into request(HoTen,DiaChi,X,Y,XThuCong,YThuCong,latDriver,lonDriver,GhiChu,ThoiGianNhan,requeststatusid) values('${
    poco.HoTen
  }','${poco.DiaChi}',null,null,null,null,null,null,'${poco.GhiChu}','${
    poco.ThoiGianNhan
  }','${poco.requeststatusid}')`;
  console.log(sql);
  return db.insert(sql);
};
exports.updateToaDo = function(poco) {
  var sql = `update request set X = '${poco.X}', Y = '${poco.Y}', XThuCong = '${
    poco.XThuCong
  }', YThuCong = '${poco.YThuCong}', requeststatusid ='1' where id = '${
    poco.id
  }'`;
  console.log(sql);
  return db.insert(sql);
};

exports.getToaDoDaCapNhatById = function(id) {
  console.log(sql);
  var sql = `select * from request where id = '${id}' and requeststatusid ='1'`;
  return db.load(sql);
};

exports.themTaiXeChoRequest = function(poco) {
  var sql = `insert into usersrequests values(NULL,'${poco.requestid}','${poco.userid}','0')`;
  console.log(sql);
  return db.insert(sql);
};

exports.capNhatTrangThaiRequest = function(poco) {
  var sql = `update request set requeststatusid='${poco.requeststatusid}' where id ='${poco.id}'`;
  console.log(sql);
  return db.insert(sql);
};

exports.chapNhanTaiXeChoRequest = function(poco) {
  var sql = `update usersrequests set status='${poco.status}' where requestid ='${poco.requestid}' and userid ='${poco.userid}'`;
  console.log(sql);
  return db.insert(sql);
};

exports.capNhatTaiXeChoRequest = function(poco) {
  var sql = `update request set DriverId='${poco.DriverId}'
  , latDriver ='${poco.latDriver}' ,lonDriver='${poco.lonDriver}' where id ='${poco.id}'`;
  console.log(sql);
  return db.insert(sql);
};

exports.getList = function () {
	var sql = 'select r.id, r.HoTen as CustomerName, r.DiaChi, r.X, r.Y, r.XThuCong, r.YThuCong, r.latDriver, r.lonDriver, r.GhiChu, r.ThoiGianNhan, rs.status, u.HoTen as DriverName, u.SoDienThoai, r.requeststatusid from request r left join users u on r.DriverId = u.id join requeststatus rs on r.requeststatusid = rs.id order by ThoiGianNhan DESC ';
	return db.load(sql);
}

exports.deleteRequest = function (id) {
	var sql = `delete from request WHERE id='${id}'`;
	return db.delete(sql);
}