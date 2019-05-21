<template>
  <div class="row">
    <div class="col-sm-4">
      <form @submit.prevent="sendRequest">
        <h3>Thông Tin Tài Khoản</h3>
        <div class="gorm-group pb-3">
          <label for="user">Tên đăng nhập:</label>
          <input type="text" v-model="TenDangNhap" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Mật khẩu:</label>
          <input type="password" v-model="MatKhau" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Loại tài khoản:</label>
          
          <select v-model="LoaiTaiKhoan">
            <option v-for="option in options" v-bind:value="option.value" v-bind:key="option.key">{{ option.text }}</option>
          </select>
          <div style="display: none;">
            <span>Selected: {{ selected }}</span>
          </div>
        </div>
        <br>

        <h3>Thông Tin Cá Nhân</h3>
        <div class="gorm-group pb-3">
          <label for="message">Họ tên:</label>
          <input type="text" v-model="HoTen" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Email:</label>
          <input type="text" v-model="Email" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Số điện thoại:</label>
          <input type="text" v-model="SoDienThoai" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Ngày sinh:</label>
          <input type="date" v-model="NgaySinh" class="form-control">
        </div>
        <button type="submit" class="btn btn-success">Tạo tài khoản</button>
      </form>
    </div>
    <div class="col-sm">
      <h3>Danh Sách Tài Khoản</h3>
      <b-table :fields="fields" :items="list">
        <template slot="TenDangNhap" slot-scope="data">{{data.item.TenDangNhap}}</template>
        <template slot="LoaiTaiKhoan" slot-scope="data">{{data.item.LoaiTaiKhoan}}</template>
        <template slot="HoTen" slot-scope="data">{{data.item.HoTen}}</template>
        <template slot="Email" slot-scope="data">{{data.item.Email}}</template>
        <template slot="SoDienThoai" slot-scope="data">{{data.item.SoDienThoai}}</template>
        <template
          slot="NgaySinh"
          slot-scope="data"
        >{{new Date(data.item.NgaySinh).toLocaleDateString('en-GB')}}</template>
      </b-table>
    </div>
  </div>
</template>

<script>

import EventBus from "@/components/EventBus";
import axios from "axios";
// import moment from "moment";
// import io from "socket.io-client";

export default {
  data() {
    return {
      fields: [
        { key: "TenDangNhap", label: "Tên đăng nhập" },
        { key: "LoaiTaiKhoan", label: "Loại tài khoản" },
        { key: "HoTen", label: "Họ tên" },
        { key: "Email", label: "Email" },
        { key: "SoDienThoai", label: "Số điện thoại" },
        { key: "NgaySinh", label: "Ngày sinh" }
      ],
      list: [],
      TenDangNhap: "",
      MatKhau: "",
      HoTen:"",
      LoaiTaiKhoan: "1",
      Email:"",
      SoDienThoai :"",
      NgaySinh:"",
      options: [
        { text: "Nhân viên", value: "1" },
        { text: "Tài xế", value: "2" }
      ],
      selected: ""
    };
  },
  methods: {
    /* eslint-disable */
    getLogin() {
      EventBus.$emit("logged-in", "ok");
    },
    sendRequest(e) {
      var self = this;
      e.preventDefault();
      axios({
        method: "post",
        url: "http://localhost:3000/users",
        data: {
          TenDangNhap: self.TenDangNhap,
          MatKhau: self.MatKhau,
          typeId: self.LoaiTaiKhoan,
          HoTen: self.HoTen,
          Email: self.Email,
          SoDienThoai: self.SoDienThoai,
          NgaySinh: self.NgaySinh,
          userStatusId: 0
        }
      })
        .then(res => {
          if (res.status == 201) {
            axios
              .get("http://localhost:3000/users/loadAll")
              .then(res => {
                self.list = res.data;
                alert('Tạo thành công');
              })
              .catch(err => {
                console.log(err);
              });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  mounted() {
    this.getLogin();
    var self = this;
    axios
      .get("http://localhost:3000/users/loadAll")
      .then(res => {
        self.list = res.data;
      })
      .catch(err => {
        console.log(err);
      });
  }
};
</script>