<template>
  <b-navbar toggleable="md" type="light" variant="light">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <!-- <b-navbar-brand href="#">NavBar</b-navbar-brand> -->
    <!-- <router-link class="navbar-brand" to="/home">Home</router-link> -->
    <router-link class="navbar-brand" v-if="PhanQuyen=='1'" to="/requestReceiver">Request Receiver</router-link>
    <router-link class="navbar-brand" v-if="PhanQuyen=='1'" to="/LocationIdentifier"> | Location Identifier</router-link>
    <router-link class="navbar-brand" v-if="PhanQuyen=='1'" to="/requestManagement"> | Request Management</router-link>
    <router-link class="navbar-brand" v-if="PhanQuyen=='1'" to="/AccountManagement"> | Account Management</router-link>
    <router-link class="navbar-brand" v-if="PhanQuyen=='2'" to="/Driver">Driver</router-link>
    <!-- <router-link class="navbar-brand" to="/profile">Profile</router-link>
    <router-link class="navbar-brand" to="/orders">Orders</router-link>-->
    <b-collapse is-nav id="nav_collapse">
      <!-- <b-navbar-nav>
        <b-nav-item href="#">Link</b-nav-item>
        <b-nav-item href="#" disabled>Disabled</b-nav-item>
      </b-navbar-nav>-->
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-navbar-nav>
          <b-navbar-brand href="#">
            <div id="lbTenDangNhap"></div>
          </b-navbar-brand>
          <li class="nav-item" v-if="auth==''">
            <router-link to="/login" class="nav-link">Login</router-link>
          </li>
          <li class="nav-item" v-if="auth!==''">
            <router-link to="/" @click.native="exit" class="nav-link">Logout</router-link>
          </li>
        </b-navbar-nav>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
import axios from "axios";
import EventBus from "./EventBus";
import io from "socket.io-client";
// EventBus.$on("logged-in", test => {
//   console.log(test);
// });
export default {
  data() {
    return {
      auth: "",
      socket: io("localhost:3001"),
      PhanQuyen: "",
      id: 0
    };
  },
  methods: {
    exit() {
      //var self = this;
      axios
        .get("http://localhost:3000/users/logout", {
          headers: { "x-access-token": localStorage.getItem("usertoken") },
          params: {
            refreshtoken: localStorage.getItem("refreshtoken"),
            TenDangNhap: document.getElementById("lbTenDangNhap").innerHTML
          }
        })
        .then(response => {
          //this.info = response.data.bpi
          alert(response.data.msg);
          if (response.data.msg === "success") {
            localStorage.removeItem("usertoken");
            localStorage.removeItem("refreshtoken");
            EventBus.$emit("logged-in", "");
            document.getElementById("lbTenDangNhap").innerHTML = "";
          }
          // if(response.data.msg == 'newtoken'){
          //   localStorage.setItem('usertoken',response.data.access_token)
          // }
          // alert(this.id);
          axios
          .post("http://localhost:3000/users/updateDiaChiDriver", {
            DiaChi: "",
            X: 0,
            Y: 0,
            id: this.id
          })
          .then(res => {
            console.log(res);
            // if (res) {
            //   if (res.data.msg === "ok") {
            //     alert("Cập nhật thành công!");
            //   } else {
            //     alert("Thất bại!");
            //   }
            // }
          })
          .catch(err => {
            console.log(err);
          });
          this.socket.emit("ServerDriverOnline", {
            data: "out"
          });
        })
        .catch(error => {
          console.log(error);
          alert(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    }
  },
  mounted() {
    EventBus.$on("logged-in", status => {
      // document.getElementById("lbTenDangNhap").innerHTML = status;
      this.auth = status;
    });

    EventBus.$on("TenDangNhap", Ten => {
      document.getElementById("lbTenDangNhap").innerHTML = Ten;
    });

    EventBus.$on("PhanQuyenDangNhap", Quyen => {
      this.PhanQuyen = Quyen
    });

    EventBus.$on("TruyenID", id => {
      var self = this;
      self.id = id;
    });
  }
};
</script>