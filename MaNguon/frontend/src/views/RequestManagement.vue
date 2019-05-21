<template>
  <div class="container-fluid">
    <div class="row d-flex justify-content-center">
      <div class="col-sm-8">
        <div id="google_map" class="google_map">abc</div>
      </div>
    </div>
    <div class="row d-flex justify-content-center mt-3">
      <div class="col-sm-8">
        <b-table
          :fields="fields"
          :items="list"
          :current-page="currentPage"
          :per-page="perPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
        >
          <!-- A virtual column -->
          <template v-bind="id" slot="id" slot-scope="data">{{data.item.id}}</template>
          <template slot="CustomerName" slot-scope="data">{{data.item.CustomerName}}</template>
          <template slot="DiaChi" slot-scope="data">{{data.item.DiaChi}}</template>
          <template slot="GhiChu" slot-scope="data">{{data.item.GhiChu}}</template>
          <template
            slot="ThoiGianNhan"
            slot-scope="data"
          >{{new Date(data.item.ThoiGianNhan).toLocaleString()}}</template>
          <template slot="Status" slot-scope="data">{{data.item.status}}</template>
          <template slot="DriverName" slot-scope="data">{{data.item.DriverName}}</template>
          <template slot="SoDienThoai" slot-scope="data">{{data.item.SoDienThoai}}</template>
          <template slot="Delete" slot-scope="data">
            <b-btn size="sm" @click="deleteButtonClickHandler(data.item.id)">Xóa</b-btn>
          </template>
          <template slot="Action" slot-scope="data" v-if="data.item.requeststatusid === 4">
            <b-btn size="sm" @click="myRowClickHandler(data.item.X,data.item.Y,data.item.latDriver,data.item.lonDriver)">Xem đường đi</b-btn>
          </template>
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
      </div>
    </div>
  </div>
</template>

<style>
.google_map {
  width: 100%;
  height: 200px;
}
</style>

<script>
// const items = [
//   { isActive: true, age: 40, first_name: "Dickerson", last_name: "Macdonald" },
//   { isActive: false, age: 21, first_name: "Larsen", last_name: "Shaw" },
//   { isActive: false, age: 89, first_name: "Geneva", last_name: "Wilson" },
//   { isActive: true, age: 38, first_name: "Jami", last_name: "Carney" }
// ];
import EventBus from "@/components/EventBus";
import axios from "axios";
import moment from "moment";
import io from "socket.io-client";
export default {
  data() {
    return {
      fields: [
        // { key: "id", label: "id" },
        { key: "CustomerName", label: "KH", sortable: true },
        { key: "DiaChi", label: "Địa chỉ", sortable: true },
        // { key: "GhiChu", label: "Note" },
        { key: "ThoiGianNhan", label: "Thời gian", sortable: true },
        { key: "Status", label: "Trạng thái", sortable: true },
        { key: "DriverName", label: "Tài xế", sortable: true },
        { key: "SoDienThoai", label: "SĐT", sortable: true },
        { key: "Delete", label: "Sửa"},
        { key: "Action", label: "Chức năng"}
      ],
      list: [],
      id: "",
      CustomerName: "",
      DiaChi: "",
      GhiChu: "",
      ThoiGianNhan: "",
      Status: "",
      DriverName: "",
      SoDienThoai: "",
      socket: io("localhost:3001"),
      currentPage: 1,
      perPage: 4,
      totalRows: 0,
      pageOptions: [5, 10, 15],
      sortBy: "Thời Gian",
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
  methods: {
    /* eslint-disable */
    getLogin() {
      EventBus.$emit("logged-in", "ok");
    },
    sendRequest(e) {
      e.preventDefault();
      axios({
        method: "post",
        url: "http://localhost:3000/requestReceiver",
        data: {
          id: this.id,
          HoTen: this.HoTen,
          DiaChi: this.DiaChi,
          GhiChu: this.GhiChu,
          ThoiGianNhan: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
          X: null,
          Y: null,
          XThuCong: null,
          YThuCong: null,
          requeststatusid: 0
        }
      }).then(res => {
        console.log(res.data);
        this.socket.emit("SEND_MESSAGE", {
          data: "Du lieu chat"
        });
        //alert(res.data.msg);
      });
    },
    myRowClickHandler(X,Y,latDriver,lonDriver) {
      // alert(X +"," + Y +"," + latDriver +","+ lonDriver +",")
      const element1 = document.getElementById("google_map");
          const options1 = {
            zoom: 15,
            center: new google.maps.LatLng(
              parseFloat(X),
              parseFloat(Y)
            )
          };
          const map1 = new google.maps.Map(element1, options1);

          // console.log(
          //   "DriverX: " +
          //     parseFloat(
          //       ToaDoDriver[0] + ", DriverY: " + parseFloat(ToaDoDriver[1])
          //     )
          // );
          // console.log(
          //   "srcX: " +
          //     parseFloat(res.data.requestObject.X) +
          //     ", srcY: " +
          //     parseFloat(res.data.requestObject.Y)
          // );

          var src = new google.maps.LatLng(
            parseFloat(latDriver),
            parseFloat(lonDriver)
          );
          var des = new google.maps.LatLng(
            parseFloat(X),
            parseFloat(Y)
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
    },
    deleteButtonClickHandler(rowId) {
      axios({
        method: "post",
        url: "http://localhost:3000/requestReceiver/deleteRequest",
        data: {
          id: rowId
        }
      }).then(res => {
        //console.log(res.data);

        if (res.data.msg == "deleted") {
          this.socket.emit("SEND_MESSAGE", {
            data: "Du lieu chat"
          });
        }
      });
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

          alert(lat + " == " + lng);
        })
        .catch(function(error) {
          console.log(error);
        });
    },
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
        alert(e.latLng);
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
    }
  },
  mounted() {
    this.getLogin();
    var self = this;
    axios
      .get("http://localhost:3000/requestReceiver/getList")
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
  }
};
</script>

