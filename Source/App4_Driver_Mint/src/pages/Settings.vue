<template>
  <div class="settings-page">
    <h5>Trạng thái</h5>
    <mt-cell :title="statusText" v-if="!isStatusBusy">
      <mt-switch v-model="status" @change="onChangeStatus"></mt-switch>
    </mt-cell>
    <mt-cell :title="statusText" v-if="isStatusBusy">
    </mt-cell>
    <!-- <mt-cell title="Tìm Khách">
      <mt-button size="normal" @click="findWaitingCustomer">Tìm</mt-button>
    </mt-cell> -->
  </div>
</template>

<script>
import { Toast } from 'mint-ui';
import { apiService, getUserInfo } from '../services/index';
import EventBus from '../EventBus';

export default {
  name: 'settings',
  components: {
  },
  mounted() {
    const user = getUserInfo();
    this.user = {...user};
    if (user && user.id) {
      apiService({
        path: `/driver/${user.id}`,
        method: 'get'
      }).then((result) => {
        this.status = result.status === 'online' ? true : false;
        this.statusText = result.status;
      }).catch(err => err);
    }

    // on accepted request
    EventBus.$on('map-accepted-request', (e) => {
      this.status = false;
      this.isStatusBusy = true;
      this.statusText = 'Đang bận';
    });

    // on finished request
    EventBus.$on('map-finished-request', (e) => {
      this.status = true;
      this.isStatusBusy = false;
      this.statusText = 'online';
    });
  },
  destroyed() {
    EventBus.$off('map-accepted-request');
    EventBus.$off('map-finished-request');
  },
  data() {
    return {
      status: false,
      statusText: 'offline',
      isStatusBusy: false,
      user: {}
    }
  },
  methods: {
    onChangeStatus(status) {
      const payload = {
        status: this.status === true ? 'online' : 'offline'
      };
      apiService({
        path: `/driver/${this.user.id}`,
        method: 'put',
        data: payload
      }).then((result) => {
        this.statusText = result.status;
        Toast({
          message: 'Cập nhật thành công',
          position: 'bottom'
        });
      });
    },
    findWaitingCustomer() {
      apiService({
        path: `/request/1/findAvailableDriver`,
        method: 'get',
      }).then((result) => {
        console.log(result);
      });
    }
  }
}
</script>

<style>
.setting-page {
}
</style>
