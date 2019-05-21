<template>
  <div class="card">
    <div class="card-header h4">Login</div>
    <div class="card-body">
      <form>
        <div class="form-group">
          <label for="formGroupExampleInput">Username</label>
          <input
            type="text"
            class="form-control"
            id="formGroupExampleInput"
            placeholder="username"
            v-model="user.user"
            autofocus
            @keyup.enter="login2"
          >
        </div>
        <div class="form-group">
          <label for="formGroupExampleInput2">Password</label>
          <input
            type="password"
            class="form-control"
            id="formGroupExampleInput2"
            placeholder="password"
            v-model="user.pwd"
            @keyup.enter="login2"
          >
        </div>
        <div class="form-group">
          <button @click="login2" type="button" class="btn btn-outline-primary">Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import EventBus from "@/components/EventBus";
import axios from "axios";
import io from "socket.io-client";
// import { serverBus } from '../main';
export default {
  data() {
    return {
      user: {
        user: "",
        pwd: ""
      },
      socket: io("localhost:3001")
    };
  },
  methods: {
    login2() {
      var self = this;
      axios
        .post("http://localhost:3000/users/login", {
          user: self.user.user,
          pwd: self.pwd
        })
        .then(res => {
          // console.log(localStorage.usertoken)
          this.email = "";
          this.password = "";
          if (res) {
            if (res.data.msg === "login true") {
              localStorage.setItem("usertoken", res.data.access_token);
              localStorage.setItem("refreshtoken", res.data.refresh_token);
              // alert(res.data.msg);
              // console.log(res.data.TenDangNhap);
              // alert(res.data.userStatusId);

              this.socket.emit("ServerDriverOnline", {
                data: res.data.TenDangNhap
              });
              EventBus.$emit("TenDangNhap", res.data.TenDangNhap);
              EventBus.$emit("PhanQuyenDangNhap", res.data.userTypeId);
              EventBus.$emit("TruyenID", res.data.id);
              //EventBus.$emit("LayDriverId", res.data.id);
             // serverBus.$emit('serverSelected', "abc");
              if (res.data.userTypeId === 1) {
                self.$router.push("/requestReceiver");
              }else{
                //self.$router.push("/Driver");
                self.$router.push({name: 'Driver', params: {userId: res.data.id}});
              }
              return;
            }
            alert(res.data.msg);
            self.$router.push("/login");
            // EventBus.$emit("logged-in", "");
            return;
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
