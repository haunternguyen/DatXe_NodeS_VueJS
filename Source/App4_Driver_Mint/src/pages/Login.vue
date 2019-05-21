<template>
  <div class="login-page">
    <div class="page-title">
      <h2>App4 - Tài xế</h2>
      <h4>Đăng nhập</h4>
    </div>
    <mt-field label="SĐT" placeholder="Số điện thoại" type="tel" v-model="phone" :state="validationState.phone"></mt-field>
    <mt-field label="Mật khẩu" placeholder="Mật khẩu" type="password" v-model="password" :state="validationState.password"></mt-field>
    <mt-button type="primary" size="large" @click="login">Đăng Nhập</mt-button>
  </div>
</template>

<script>
import { Toast } from 'mint-ui';
import Default from './Default';
import { apiService, setUserInfo, getUserInfo, setAuthHeader } from '../services/index';

export default {
  name: 'login',
  components: {
  },
  data() {
    return {
      phone: undefined,
      password: undefined,
      validationState: {
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    login() {
      if (this.phone && this.password) {
        apiService({
          path: '/auth/driver/login',
          method: 'post',
          data: {
            phone: this.phone,
            password: this.password
          }
        }).then((result) => {
          setAuthHeader(result.token);
          setUserInfo(result);
          this.$router.push({ name: 'default', params: { user: result } });
        }).catch((err) => {
          Toast({
            message: err.message,
            position: 'bottom'
          });
          console.log(err.message)
        });
      } else {
        this.validationState.phone = 'error';
        this.validationState.password = 'error';
      }
    }
  }
}
</script>

<style>
.page-title h2, h4 {
  text-align: center
}
</style>
