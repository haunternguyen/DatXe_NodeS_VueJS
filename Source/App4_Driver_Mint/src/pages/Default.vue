<template>
  <div class="default-page">
    <mt-header title="App 4">
      <router-link to="/" slot="left">
        <mt-button icon="back" @click="logout">Thoát</mt-button>
      </router-link>
      <div slot="right" >
        <span>{{ user ? user.driverName : '' }}</span>
      </div>
    </mt-header>
    <mt-navbar v-model="selected">
      <mt-tab-item id="maps">Bản đồ</mt-tab-item>
      <mt-tab-item id="settings">Tùy chỉnh</mt-tab-item>
    </mt-navbar>
    <mt-tab-container v-model="selected">
      <mt-tab-container-item id="maps">
        <Maps v-on:has-fit-request="hasFitRequest"></Maps>
      </mt-tab-container-item>
      <mt-tab-container-item id="settings">
        <Settings></Settings>
      </mt-tab-container-item>
    </mt-tab-container>
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
import { Header } from 'mint-ui';
import Maps from './Maps';
import Settings from './Settings';
import { removeUserInfo } from '../services/index';

export default {
  name: 'default',
  components: {
    Maps, Settings
  },
  props: ['user'],
  mounted() {
  },
  data() {
    return {
      selected: 'maps'
    }
  },
  methods: {
    logout() {
      removeUserInfo();
    },
    hasFitRequest(data) {
      if (this.selected !== 'maps') {
        this.selected = 'maps';
      }
    }
  }
}
</script>

<style>
  html, body {
    background-color: #fafafa;
    -webkit-overflow-scrolling: touch;
    user-select: none;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  .page-back {
    display: inline-block;
    width: 40px;
    height: 40px;
    text-align: center;
  }
  .page-back i {
    font-size: 24px;
    line-height: 40px;
  }
</style>
