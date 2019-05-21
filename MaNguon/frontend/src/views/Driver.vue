

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
        <div>
          <b-form @submit="onSubmit">
            <b-form-group
              id="exampleInputGroup1"
              label="Địa chỉ:"
              label-for="exampleInput1"
              description="Sử dụng geocoding."
            >
              <b-form-input
                id="txtGeo"
                type="text"
                required
                placeholder="Nhập địa chỉ"
                v-model="form.geo"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              id="exampleInputGroup2"
              label="Tọa độ:"
              label-for="exampleInput2"
              description="Tọa độ geocoding"
            >
              <b-form-input id="txtToaDo" type="text" placeholder="X: Y: "></b-form-input>
            </b-form-group>
            <b-form-group>
              <div>
                <toggle-switch v-model="checkbox"></toggle-switch>
              </div>
            </b-form-group>
            <b-button @click="TimDiaChi" variant="success" class="pl-3">Tìm địa chỉ</b-button>
            <b-button @click="CapNhatDiaChiDriver" variant="primary">Cập nhật thông tin</b-button>
          </b-form>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-4 mt-2">
        <div id="app">
          <div v-if="seconds > 0">{{`${minutes}m ${seconds}s`}}</div>
          <div v-if="seconds > 0">{{`Họ Tên: ${HoTenKH}`}}</div>
          <div v-if="seconds > 0">{{`Địa Chỉ: ${DiaChiKH}`}}</div>
          <div v-if="seconds > 0">
            <b-button @click="chapNhanDatXe" variant="primary">Đặt xe</b-button>
          </div>
          <div v-else>Đang đợi đặt xe ...</div>
          <div v-if="CoXe == true">
            <div class="input-group">
              <b-form-select
                class="custom-select"
                id="inputGroupSelect04"
                aria-label="Example select with button addon"
                v-model="selected"
                :options="options"
              >
                <template slot="first">
                  <!-- this slot appears above the options from 'options' prop -->
                  <option :value="null" disabled>-- Trạng thái --</option>
                </template>
              </b-form-select>
              <div class="input-group-append">
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="btnThucHienClick"
                >Thực hiện</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-8 mt-2">
        <div>
          <pre class="mt-3">Khách hàng: </pre>
          <b-form-textarea
            id="textarea1"
            v-model="txtThongTinKhachHang"
            placeholder="Không có khách hàng"
            :rows="3"
            :max-rows="6"
          ></b-form-textarea>
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
import axios from "axios";
import io from "socket.io-client";
import ToggleSwitch from "./toggle-switch.vue";
import EventBus from "@/components/EventBus";
// import { serverBus } from '../main';

export default {
  name: "google_map",
  components: {
    ToggleSwitch
  },
  data() {
    return {
      id: this.$route.params.userId,
      checkbox: false,
      fields: [
        { key: "HoTen", label: "Họ Tên" },
        { key: "DiaChi", label: "Địa Chỉ" },
        { key: "GhiChu", label: "Ghi Chú" },
        { key: "ThoiGianNhan", label: "Thời Gian Nhận" }
      ],
      list: [],
      socket: io("localhost:3001"),
      map_name: this.map_id + "-map",
      form: {
        geo: ""
      },
      seconds: 0,
      minutes: 0,
      distance: 0,
      ClickMarker: false,
      X: 0,
      Y: 0,
      HoTenKH: "",
      DiaChiKH: "",
      rid: "",
      DriverX: 0,
      DriverY: 0,
      selected: null,
      options: [
        { value: "2", text: "Đang đi đón khách" },
        { value: "3", text: "Đang chở khách" },
        { value: "1", text: "Chở khách xong" }
      ],
      CoXe: false,
      txtThongTinKhachHang: ""
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
  /* eslint-disable */
  //lay du lieu table
  methods: {
    addMarker(latlng, title, map) {
      var marker = new google.maps.Marker({
        position: latlng,
        map: this.$map,
        title: title,
        draggable: true
      });
    },
    create_map(self) {
      const element = document.getElementById("google_map");
      const options = {
        zoom: 16,
        center: new google.maps.LatLng(10.7624176, 106.6811968)
      };
      const map = new google.maps.Map(element, options);
      google.maps.event.addListener(map, "click", function(e) {
        if (self.ClickMarker == false) {
          self.ClickMarker = true;
          // alert(e.latLng);
          var mk = new google.maps.Marker({
            position: e.latLng,
            icon: null,
            map: map,
            title: null,
            draggable: true
          });
          var txtTDThuCong = document.getElementById("txtToaDo");
          txtTDThuCong.value = e.latLng.lat() + "," + e.latLng.lng();
          var latlngRV = {
            lat: parseFloat(e.latLng.lat()),
            lng: parseFloat(e.latLng.lng())
          };
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: latlngRV }, function(results, status) {
            if (status === "OK") {
              if (results[0]) {
                var txtDCThuCong = document.getElementById("txtGeo");
                // alert(results[0].formatted_address);
                txtDCThuCong.value = results[0].formatted_address;
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });

          google.maps.event.addListener(mk, "dragend", function(e) {
            // alert(e.latLng);
            var txtTDThuCong = document.getElementById("txtToaDo");
            var TDTC = e.latLng.lat() + "," + e.latLng.lng();
            txtTDThuCong.value = TDTC;

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
                  var txtDCThuCong = document.getElementById("txtGeo");
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
        }
      });
    },
    myRowClickHandler(value) {
      var text = document.getElementById("txtGeo");
      text.value = value;
    },
    onSubmit(evt) {
      evt.preventDefault();
      alert(this.id);
      // alert(document.getElementById("lbTenDangNhap").value);
    },
    getLatLong(address) {
      axios
        .get("https://maps.googleapis.com/maps/api/geocode/json", {
          params: {
            address: address,
            key: "AIzaSyC18K6QYU90Yf5HK1Nbl3nYq_UiN1COG1s"
          }
        })
        .then(function(response) {
          // Log full response
          console.log(response);

          // Geometry
          var lat = response.data.results[0].geometry.location.lat;
          var lng = response.data.results[0].geometry.location.lng;
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
          var TD = lat + "," + lng;
          txtTD.value = TD;

          google.maps.event.addListener(mk, "dragend", function(e) {
            //alert(JSON.stringify(e.latLng));

            var txtTDThuCong = document.getElementById("txtToaDo");
            var TDTC = e.latLng.lat() + "," + e.latLng.lng();
            txtTDThuCong.value = TDTC;

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
                  var txtDCThuCong = document.getElementById("txtGeo");
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
    countTime: function() {
      var vm = this;
      vm.seconds = 0;
      var x = setInterval(function() {
        vm.seconds = vm.seconds - 1;
        // if (vm.seconds < 0) {
        //   vm.seconds = 5;
        // }
      }, 1000);
    },
    CapNhatDiaChiDriver: function() {
      var self = this;
      // alert(this.id);
      var address = document.getElementById("txtGeo").value;
      if (this.checkbox === true) {
        //alert(self.driverId);

        axios
          .post("http://localhost:3000/users/getDiaChiDriver", {
            id: this.id
          })
          .then(res => {
            if (res) {
              if (res.data.userObj.X !== 0) {
                // Cap nhat
                alert("Cập nhật lại!");

                var lat1 = res.data.userObj.X;
                var lon1 = res.data.userObj.Y;
                var res = document.getElementById("txtToaDo").value.split(",");
                var lat2 = res[0];
                var lon2 = res[1];

                var KhoangCach = self.haversineDistance(lat1, lon1, lat2, lon2);

                if (KhoangCach > 100.0) {
                  alert("Khoảng cách xa hơn 100m");
                } else {
                  axios
                    .post("http://localhost:3000/users/updateDiaChiDriver", {
                      DiaChi: address,
                      X: lat2,
                      Y: lon2,
                      id: this.id
                    })
                    .then(res => {
                      if (res) {
                        if (res.data.msg === "ok") {
                          // self.DriverX = lat2;
                          // self.DriverY = lon2;
                          alert("Cập nhật thành công!");
                        } else {
                          alert("Thất bại!");
                        }
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }
              } else {
                // Them lan dau
                // alert("Thất bại!");
                var res = document.getElementById("txtToaDo").value.split(",");
                axios
                  .post("http://localhost:3000/users/updateDiaChiDriver", {
                    DiaChi: address,
                    X: res[0],
                    Y: res[1],
                    id: this.id
                  })
                  .then(res => {
                    if (res) {
                      if (res.data.msg === "ok") {
                        // self.DriverX = res[0];
                        // self.DriverY = res[1];
                        alert("Cập nhật thành công!");
                      } else {
                        alert("Thất bại!");
                      }
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        axios
          .post("http://localhost:3000/users/updateDiaChiDriver", {
            DiaChi: "",
            X: 0,
            Y: 0,
            id: this.id
          })
          .then(res => {
            if (res) {
              if (res.data.msg === "ok") {
                alert("Cập nhật thành công!");
              } else {
                alert("Thất bại!");
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
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
    },
    chapNhanDatXe() {
      var self = this;
      self.txtThongTinKhachHang = self.HoTenKH + "\n" + self.DiaChiKH;
      self.CoXe = true;
      this.seconds = 0;
      axios({
        method: "post",
        url: "http://localhost:3000/requestReceiver/chapNhanTaiXeChoRequest",
        data: {
          userid: this.id,
          requestid: this.rid,
          status: 1
        }
      }).then(res => {
        axios({
          method: "post",
          url: "http://localhost:3000/users/updateUserStatus",
          data: {
            status: 4,
            id: self.id
          }
        }).then(res => {});
      });
      axios
        .get("http://localhost:3000/requestReceiver/getToaDoDaCapNhatById", {
          params: {
            id: this.rid
          }
        })
        .then(res => {
          const element1 = document.getElementById("google_map");
          var ToaDoDriver = document
            .getElementById("txtToaDo")
            .value.split(",");
          const options1 = {
            zoom: 15,
            center: new google.maps.LatLng(
              parseFloat(ToaDoDriver[0]),
              parseFloat(ToaDoDriver[1])
            )
          };
          const map1 = new google.maps.Map(element1, options1);

          console.log(
            "DriverX: " +
              parseFloat(
                ToaDoDriver[0] + ", DriverY: " + parseFloat(ToaDoDriver[1])
              )
          );
          console.log(
            "srcX: " +
              parseFloat(res.data.requestObject.X) +
              ", srcY: " +
              parseFloat(res.data.requestObject.Y)
          );

          var src = new google.maps.LatLng(
            parseFloat(ToaDoDriver[0]),
            parseFloat(ToaDoDriver[1])
          );
          var des = new google.maps.LatLng(
            parseFloat(res.data.requestObject.X),
            parseFloat(res.data.requestObject.Y)
          );
          // var src = new google.maps.LatLng(10.7724255, 106.6909826);
          // var des = new google.maps.LatLng(
          //   10.761616550173349,
          //   106.67948018623042
          // );
          //Intialize the Path Array
          var path = new google.maps.MVCArray();
          //Intialize the Direction Service
          var service = new google.maps.DirectionsService();
          //Set the Path Stroke Color
          var poly = new google.maps.Polyline({
            map: map1,
            strokeColor: "#4986E7"
          });
          //Loop and Draw Path Route between the Points on MAP
          path.push(src);
          poly.setPath(path);
          service.route(
            {
              origin: src,
              destination: des,
              travelMode: google.maps.DirectionsTravelMode.DRIVING
            },
            function(result, status) {
              console.log("Tìm đường");
              if (status == google.maps.DirectionsStatus.OK) {
                console.log("Tìm được đường");
                for (
                  var i = 0, len = result.routes[0].overview_path.length;
                  i < len;
                  i++
                ) {
                  path.push(result.routes[0].overview_path[i]);
                }
              }
            }
          );
        });
    },
    TimDiaChi() {
      var text = document.getElementById("txtGeo");
      this.getLatLong(text.value, self);
    },
    btnThucHienClick() {
      var self = this;
      if (self.selected == 1) {
        self.CoXe = false;
        self.txtThongTinKhachHang = "";
        axios({
          method: "post",
          url: "http://localhost:3000/users/updateUserStatus",
          data: {
            status: 1,
            id: self.id
          }
        }).then(res => {});
        axios({
          method: "post",
          url: "http://localhost:3000/requestReceiver/capNhatTrangThaiRequest",
          data: {
            requeststatusid: 4,
            id: self.rid
          }
        }).then(res => {
          self.socket.emit("SEND_MESSAGE", {
            data: "Du lieu chat"
          });
        });
        var text = document.getElementById("txtGeo");
        this.getLatLong(text.value, self);
      } else {
        // request 3: đang di chuyển
        // request 4: đã hoàn thành

        // user 2: đón
        // user 3: chở
        if (self.selected == 3) {
          axios({
            method: "post",
            url: "http://localhost:3000/users/updateUserStatus",
            data: {
              status: self.selected,
              id: self.id
            }
          }).then(res => {});

          axios({
            method: "post",
            url:
              "http://localhost:3000/requestReceiver/capNhatTrangThaiRequest",
            data: {
              requeststatusid: 3,
              id: self.rid
            }
          }).then(res => {
            self.socket.emit("SEND_MESSAGE", {
              data: "Du lieu chat"
            });
          });
          return;
        }
      }
    }
  },
  mounted: function() {
    // this.$root.$on("LayDriverId", () => {
    //   this.id = 2;
    // });

    this.socket.on("DriverNhanDatXe", data => {
      // console.log(data);
      // alert(data.data);
      // console.log(data.data + "===" + this.id + ", rid: " + data.rid);
      // console.log("hoten: " + data.hoten + ", dia chi: " + data.diachi);
      if (parseInt(data.data) === parseInt(this.id)) {
        // alert(data.data);
        this.HoTenKH = data.hoten;
        this.DiaChiKH = data.diachi;
        this.rid = data.rid;
        this.seconds = 10;
      }
    });

    this.countTime();
    EventBus.$emit("logged-in", "ok");
    var self = this;
    axios
      .get("http://localhost:3000/requestReceiver")
      .then(res => {
        self.list = res.data;
      })
      .catch(err => {
        console.log(err);
      });

    if (window.google && window.google.maps) {
      this.create_map(self);
      return;
    }
    var script = document.createElement("script");
    script.onload = function() {
      if (!window.google && !window.google.maps)
        return void console.error("no google maps script included");
      self.create_map(self);
    };
    // self.create_map();
    script.async = true;
    script.defer = true;
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyBQtJTgRmPAOo0p7m4IeqlhcQgWiD1bdZ4";

    // document.head.appendChild(script);
    document.getElementsByTagName("head")[0].appendChild(script);
    // console.log(script);
  }
};
</script>