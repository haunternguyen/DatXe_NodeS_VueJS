<template>
  <a-layout-header class="header">
    <div class="logo">Nhận Thông Tin Khách</div>
    <a-menu
      theme="dark"
      mode="horizontal"
      :defaultSelectedKeys="['2']"
      :style="{ lineHeight: '64px' }"
    >
      <a-menu-item :key="index" v-for="(item, index) in menus">
        <router-link :to="item.path">
          <a-icon :type="item.icon" />
          <span>{{ item.name }}</span>
        </router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script>
const menus = [
  {
    name: 'Quản lý Yêu Cầu',
    path: '/request',
    icon: 'dashboard'
  }
];

export default {
  name: 'layout-header',
  components: {},
  data() {
    return {
      menus
    }
  }
}
</script>

<style>
.header .logo {
  display: inline-block;
  float: left;
  font-weight: bold;
  color: #fff;
  padding-right:  20px;
}
a.router-link-active, li.router-link-active a {
  font-weight: bold;
  color: #fff;
}
</style>
