<template>
  <div id="app" class="container">
    <div class="row">
      <div class="col-sm-8">
        <div>
          <div>
            <!-- <h1>Map is here</h1> -->
            <div id="google_map" class="google_map">abc</div>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <b-table :fields="fieldsOnline" :items="listOnline"></b-table>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-8">
        <b-container>
          <b-table
            :fields="fields"
            :items="list"
            :current-page="currentPage"
            :per-page="perPage"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
          >
            <template slot="HoTen" slot-scope="data">{{data.item.HoTen}}</template>
            <template slot="DiaChi" slot-scope="data">
              {{data.item.DiaChi}}
              <b-btn
                size="sm"
                @click="myRowClickHandler(data.item.DiaChi,data.item.rid,data.item.HoTen,data.item.status)"
              >Details</b-btn>
            </template>
            <template slot="GhiChu" slot-scope="data">{{data.item.GhiChu}}</template>
            <template
              slot="ThoiGianNhan"
              slot-scope="data"
            >{{new Date(data.item.ThoiGianNhan).toLocaleString()}}</template>
            <template slot="status" slot-scope="data">{{data.item.status}}</template>
          </b-table>
          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="totalRows"
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
          <p>
            Sắp xếp theo:
            <b>{{ sortBy }}</b>,
            Thứ tự:
            <b>{{ sortDesc ? 'Giảm dần' : 'Tăng dần' }}</b>
          </p>
        </b-container>
      </div>
      <div class="col-sm-4">
        <div>
          <b-form @submit="onSubmit">
            <b-form-group id="exampleInputGroup1" label="Địa chỉ:" label-for="exampleInput1">
              <b-form-input
                id="txtGeo"
                type="text"
                required
                placeholder="Nhập địa chỉ"
                v-model="form.geo"
              ></b-form-input>
            </b-form-group>
            <b-form-group id="exampleInputGroup2" label="Tọa độ:" label-for="exampleInput2">
              <b-form-input id="txtToaDo" type="text" placeholder="X: Y: "></b-form-input>
            </b-form-group>
            <b-form-group
              id="frmDiaChiThuCong"
              label="Địa chỉ thủ công:"
              label-for="txtDiaChiThuCong"
            >
              <b-form-input id="txtDiaChiThuCong" type="text" placeholder></b-form-input>
            </b-form-group>
            <b-form-group id="frmToaDoThuCong">
              <b-form-input id="txtToaDoThuCong" type="text" placeholder="X: Y: "></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Tìm</b-button>
            <b-button type="reset" variant="danger" @click="CapNhatDiaChiRequest">Cập nhật địa chỉ</b-button>
            <b-button @click="TimXe" variant="success">Gửi cho xe</b-button>
          </b-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.google_map {
  width: 100%;
  height: 300px;
}
</style>
<script>
// import Vue from "vue";
/* eslint-disable */
import axios from "axios";
import io from "socket.io-client";
import EventBus from "@/components/EventBus";
export default {
  name: "google_map",
  data() {
    return {
      id: "",
      X: "",
      Y: "",
      XThuCong: "",
      YThuCong: "",
      user: "",
      pwd: "",
      fields: [
        // { key: "id", label: "id" },
        { key: "HoTen", label: "Họ Tên", sortable: true },
        { key: "DiaChi", label: "Địa Chỉ", sortable: true },
        { key: "GhiChu", label: "Ghi Chú", sortable: true },
        { key: "ThoiGianNhan", label: "Thời Gian Nhận", sortable: true },
        { key: "status", label: "Tình trạng", sortable: true }
      ],
      list: [],
      socket: io("localhost:3001"),
      map_name: this.map_id + "-map",
      currentPage: 1,
      perPage: 4,
      totalRows: 0,
      pageOptions: [5, 10, 15],
      form: {
        geo: ""
      },
      listOnline: [],
      fieldsOnline: [
        {
          key: "TenDangNhap",
          label: "Tài xế online"
        }
      ],
      diachi: "",
      hoten: "",
      KiemTraDuocGui: true,
      sortBy: "status",
      sortDesc: false
    };
  },
  props: {
    latitude: {
      type: Number,
      default() {
        return 37.78268;
      }
    },
    longitude: {
      type: Number,
      default() {
        return -122.41136;
      }
    },
    zoom: {
      type: Number,
      default() {
        return 14;
      }
    }
  },
  mounted: function() {
    EventBus.$emit("logged-in", "ok");
    var self = this;
    axios
      .get("http://localhost:3000/requestReceiver")
      .then(res => {
        self.list = res.data;
        self.totalRows = self.list.length;
      })
      .catch(err => {
        console.log(err);
      });
    this.socket.on("MESSAGE", data => {
      console.log(data);
      // alert(" chat la" + data);
      self.list = data;
      self.totalRows = self.list.length;
      // you can also do this.messages.push(data)
    });
    //socket
    axios
      .get("http://localhost:3000/users/getDriverOnline")
      .then(res => {
        self.listOnline = res.data;
      })
      .catch(err => {
        console.log(err);
      });

    this.socket.on("ClientDriverOnline", data => {
      // alert(data);
      console.log("driver online: " + data);
      self.listOnline = data;
      // alert(listOnline);
    });
    if (window.google && window.google.maps) {
      this.create_map();
      return;
    }
    var script = document.createElement("script");
    script.onload = function() {
      if (!window.google && !window.google.maps)
        return void console.error("no google maps script included");
      self.create_map();
    };
    // self.create_map();
    script.async = true;
    script.defer = true;
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBQtJTgRmPAOo0p7m4IeqlhcQgWiD1bdZ4";

    // document.head.appendChild(script);
    document.getElementsByTagName("head")[0].appendChild(script);
    //console.log(script);
  },
  methods: {
    addMarker(latlng, title, map) {
      var marker = new google.maps.Marker({
        position: latlng,
        map: this.$map,
        title: title,
        draggable: true
      });
    },
    create_map() {
      const element = document.getElementById("google_map");
      const options = {
        zoom: 16,
        center: new google.maps.LatLng(10.7624176, 106.6811968)
      };
      const map = new google.maps.Map(element, options);
      const position = new google.maps.LatLng(51.501527, -0.1921837);
      // const marker = new google.maps.Marker({
      //   position,
      //   map
      // });
      google.maps.event.addListener(map, "click", function(e) {
        // alert(e.latLng);
        var mk = new google.maps.Marker({
          position: e.latLng,
          icon: null,
          map: map,
          title: null,
          draggable: true
        });
        // google.maps.event.addListener(mk, "dragend", function(e) {
        //   alert(e.latLng);
        // });
      });
    },
    myRowClickHandler(value, requestId, HoTen, status) {
      this.KiemTraDuocGui = true;
      if (status != "đã định vị xong" && status != "chưa được định vị") {
        alert(status);
        this.KiemTraDuocGui = false;
        return;
      } else {
        this.KiemTraDuocGui = true;
      }

      var text = document.getElementById("txtGeo");
      // alert(requestId);
      this.id = requestId;
      text.value = value;
      this.diachi = value;
      this.hoten = HoTen;
      axios
        .get("http://localhost:3000/requestReceiver/getToaDoDaCapNhatById", {
          params: {
            id: requestId
          }
        })
        .then(res => {
          if (res.data.msg == "ok") {
            // alert(res.data.requestObject.X);
            document.getElementById("txtToaDo").value =
              res.data.requestObject.X + "," + res.data.requestObject.Y;
            document.getElementById("txtToaDoThuCong").value =
              res.data.requestObject.X + "," + res.data.requestObject.Y;
            document.getElementById("txtDiaChiThuCong").value = value;
            this.HienGoogleMapTaiToaDo(
              res.data.requestObject.X,
              res.data.requestObject.Y
            );
          } else {
            document.getElementById("txtToaDo").value = "";
            document.getElementById("txtToaDoThuCong").value = "";
            document.getElementById("txtDiaChiThuCong").value = "";
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    onSubmit(evt) {
      var self = this;
      evt.preventDefault();
      var text = document.getElementById("txtGeo");
      this.getLatLong(text.value, self);
    },
    HienGoogleMapTaiToaDo(lat, lng) {
      var latlng = new google.maps.LatLng(lat, lng);

      // alert(lat + " == " + lng);

      // var map1 = new google.maps.Map(document.getElementById("google_map"));
      // map1.setCenter(response.data.results[0].geometry.location);
      const map1 = new google.maps.Map(document.getElementById("google_map"), {
        zoom: 18,
        center: latlng
      });
      var mk = new google.maps.Marker({
        position: latlng,
        icon: null,
        map: map1,
        title: null,
        draggable: true
      });

      google.maps.event.addListener(mk, "dragend", function(e) {
        //   alert(e.latLng);
        document.getElementById("txtToaDoThuCong").value = e.latLng;
      });
    },
    getLatLong(address, self) {
      axios
        .get("https://maps.googleapis.com/maps/api/geocode/json", {
          params: {
            address: address,
            key: "AIzaSyC18K6QYU90Yf5HK1Nbl3nYq_UiN1COG1s"
          }
        })
        .then(function(response) {
          // Log full response
          // console.log(response);

          // Geometry
          var lat = response.data.results[0].geometry.location.lat;
          var lng = response.data.results[0].geometry.location.lng;

          // alert(lat + " == " + lng);

          // var map1 = new google.maps.Map(document.getElementById("google_map"));
          // map1.setCenter(response.data.results[0].geometry.location);
          const map1 = new google.maps.Map(
            document.getElementById("google_map"),
            {
              zoom: 18,
              center: response.data.results[0].geometry.location
            }
          );
          var mk = new google.maps.Marker({
            position: response.data.results[0].geometry.location,
            icon: null,
            map: map1,
            title: null,
            draggable: true
          });

          var txtTD = document.getElementById("txtToaDo");
          var TD = "X: " + lat + " Y: " + lng;
          txtTD.value = TD;
          document.getElementById("txtToaDoThuCong").value = TD;
          document.getElementById(
            "txtDiaChiThuCong"
          ).value = document.getElementById("txtGeo").value;
          self.X = lat;
          self.Y = lng;

          self.XThuCong = lat;
          self.YThuCong = lng;

          google.maps.event.addListener(mk, "dragend", function(e) {
            //alert(JSON.stringify(e.latLng));

            var txtTDThuCong = document.getElementById("txtToaDoThuCong");
            var TDTC = e.latLng.lat() + "," + e.latLng.lng();
            txtTDThuCong.value = TDTC;
            self.XThuCong = e.latLng.lat();
            self.YThuCong = e.latLng.lng();

            // var latlngStr = TDTC.split(',', 2);
            var latlngRV = {
              lat: parseFloat(e.latLng.lat()),
              lng: parseFloat(e.latLng.lng())
            };
            // alert(latlngRV);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latlngRV }, function(results, status) {
              if (status === "OK") {
                if (results[0]) {
                  var txtDCThuCong = document.getElementById(
                    "txtDiaChiThuCong"
                  );
                  // alert(results[0].formatted_address);
                  txtDCThuCong.value = results[0].formatted_address;
                } else {
                  window.alert("No results found");
                }
              } else {
                window.alert("Geocoder failed due to: " + status);
              }
            });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    geocodeAddress(geocoder, resultsMap) {
      var address = document.getElementById("txtGeo").value;
      geocoder.geocode({ address: address }, function(results, status) {
        if (status === "OK") {
          alert(results[0].geometry.location);
          resultsMap.setCenter(results[0].geometry.location);

          var marker = new google.maps.Marker({
            map: resultsMap,
            position: results[0].geometry.location
          });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    },
    CapNhatDiaChiRequest() {
      if (document.getElementById("txtGeo").value == "") {
        alert("Không có địa chỉ!");
        return;
      }
      axios({
        method: "post",
        url: "http://localhost:3000/requestReceiver/updateToaDo",
        data: {
          id: this.id,
          X: this.X,
          Y: this.Y,
          XThuCong: this.XThuCong,
          YThuCong: this.YThuCong
        }
      }).then(res => {
        this.socket.emit("SEND_MESSAGE", {
          data: "Du lieu chat"
        });
        alert(res.data.msg);
      });
    },
    TimXe() {
      if (document.getElementById("txtGeo").value == "") {
        alert("Không có địa chỉ!");
        return;
      }
      var s = this;
      if (this.KiemTraDuocGui == false) {
        alert("Trạng thái request không hợp lệ");
        return;
      }
      axios({
        method: "get",
        url: "http://localhost:3000/users/getFullDriverOnline"
      }).then(res => {
        // console.log(res.data);
        if (res.data.length === 0) {
          alert("Không có xe");
        } else {
          const hmap = new Map();
          var ToaDo = document.getElementById("txtToaDo").value.split(",");
          var DanhSachTaiXe = res.data;
          for (var i in DanhSachTaiXe) {
            if (DanhSachTaiXe[i].X !== 0) {
              // console.log(ToaDo[0]);
              var KC = this.haversineDistance(
                ToaDo[0],
                ToaDo[1],
                DanhSachTaiXe[i].X,
                DanhSachTaiXe[i].Y
              );
              // console.log(
              //   "Khoang cach: " + KC + ", Driver: " + DanhSachTaiXe[i].driverId
              // );
              hmap.set(String(DanhSachTaiXe[i].driverId), parseFloat(KC));
            }
          }
          const mapSort1 = new Map(
            [...hmap.entries()].sort((a, b) => a[1] - b[1])
          );
          var DanhSachXe = [];
          for (let [key, value] of mapSort1) {
            // get data sorted
            axios({
              method: "post",
              url: "http://localhost:3000/requestReceiver/themTaiXeChoRequest",
              data: {
                requestid: this.id,
                userid: key
              }
            }).then(res => {});
            console.log(
              "Tài xế: " + key + ", Khoảng cách: " + parseFloat(value)
            );
            // console.log(key + " " + value + " rid: " + this.id);
            DanhSachXe.push(key);
          }
          // for (var i in DanhSachXe) {
          //   console.log("Thu tu uu tien cua xe: " + DanhSachXe[i]);
          // }
          var i = 0;
          var self = this;
          this.socket.emit("ServerDriverNhanDatXe", {
            data: DanhSachXe[i],
            rid: this.id,
            hoten: this.hoten,
            diachi: this.diachi
          });
          var b = setInterval(function() {
            if (i < DanhSachXe.length) {
              var j = i;
              // alert(DanhSachXe[i]);
              axios({
                method: "post",
                url: "http://localhost:3000/users/getStatusFromUsersRequests",
                data: {
                  userid: DanhSachXe[i],
                  requestid: self.id
                }
              }).then(res => {
                if (res.data.status === 1) {
                  console.log(
                    "Xe: " +
                      DanhSachXe[j] +
                      ", trang thai: " +
                      1 +
                      "/ lat: " +
                      parseFloat(res.data.X) +
                      ", lon: " +
                      parseFloat(res.data.Y)
                  );
                  var lat = parseFloat(res.data.X);
                  var lon = parseFloat(res.data.Y);
                  // alert(res.data.status);
                  axios({
                    method: "post",
                    url:
                      "http://localhost:3000/requestReceiver/capNhatTaiXeChoRequest",
                    data: {
                      DriverId: DanhSachXe[j],
                      id: self.id,
                      latDriver: lat,
                      lonDriver: lon
                    }
                  }).then(res => {});
                  axios({
                    method: "post",
                    url:
                      "http://localhost:3000/requestReceiver/capNhatTrangThaiRequest",
                    data: {
                      requeststatusid: 2,
                      id: self.id
                    }
                  }).then(res => {
                    self.socket.emit("SEND_MESSAGE", {
                      data: "Du lieu chat"
                    });
                    //alert(res.data.msg);
                  });
                  clearInterval(b);
                  alert("Đã có xe nhận");
                  return;
                } else {
                  console.log("Xe: " + DanhSachXe[j] + ", trang thai: " + 0);
                  //alert(res.data.status);
                  j = parseInt(j) + 1;
                  if (i < DanhSachXe.length) {
                    // console.log("gia tri j:" + j);
                    var nexid = DanhSachXe[j];
                    // console.log("next id: " + nexid);
                    self.socket.emit("ServerDriverNhanDatXe", {
                      data: nexid,
                      rid: self.id,
                      hoten: self.hoten,
                      diachi: self.diachi
                    });
                  }
                  // var nex = j++;
                  // if (j++ < DanhSachXe.length) {
                  //   //alert(DanhSachXe[i++]);

                  // }
                }
              });
            } else {
              // alert("Không có xe nhận");
              alert("Không có xe nhận");
              axios({
                method: "post",
                url:
                  "http://localhost:3000/requestReceiver/capNhatTrangThaiRequest",
                data: {
                  requeststatusid: 5,
                  id: self.id
                }
              }).then(res => {
                self.socket.emit("SEND_MESSAGE", {
                  data: "Du lieu chat"
                });
                //alert(res.data.msg);
              });
              clearInterval(b);
            }
            i++;
          }, 15000);
        }
      });
    },
    toRad: function(x) {
      return (x * Math.PI) / 180;
    },
    haversineDistance: function(lat1, lon1, lat2, lon2) {
      var self = this;
      var lat = [lat1, lat2];
      var lng = [lon1, lon2];
      var R = 6378137;
      var dLat = ((lat[1] - lat[0]) * Math.PI) / 180;
      var dLng = ((lng[1] - lng[0]) * Math.PI) / 180;
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat[0] * Math.PI) / 180) *
          Math.cos((lat[1] * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return Math.round(d);
    }
  }
};
</script>