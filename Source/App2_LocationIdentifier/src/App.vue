<template>
  <a-layout id="app-layout">
    <a-layout-header style="background: #c7c7c7">
      <div class="logo"/>
      <request-header-info></request-header-info>
    </a-layout-header>
    <a-layout-content>
      <a-layout>
        <a-layout-sider style="background: #f0f2f5" width="300">
          <requests-list></requests-list>
        </a-layout-sider>
        <a-layout-content>
          <requests-map></requests-map>
        </a-layout-content>
      </a-layout>
    </a-layout-content>
  </a-layout>
</template>

<script>
import { notification } from "ant-design-vue";

import appStore from "./stores/appStore.js";
import { getRequests } from "./services/apiClient.js";
import {
  connect,
  EVENT_REQUESTS_CHANGED,
  EVENT_INIT_IDENTIFIER
} from "./services/socket-io-client.js";

import { EventBus } from "./event-bus.js";

import { REQUEST_STATUS } from "./constants.js";

export default {
  name: "app",
  components: {},
  data() {
    return {
      socketClient: null,
      existingSocketName: null
    };
  },
  methods: {
    getRequests: function() {
      getRequests().then(result => {
        if (result && result.data) {
          appStore.commit("setRequests", result.data);
        }
      });
    },
    subscribeEventBus: function() {
      EventBus.$on("request-selected", requestId => {
        if (this.existingSocketName !== null) {
          this.socketClient.off(this.existingSocketName);
        }

        this.existingSocketName = `${requestId}-request-status-change`;
        this.socketClient.on(this.existingSocketName, data => {
          appStore.commit("updateSelectedRequest", data);

          if (data.status === REQUEST_STATUS.PICKED) {
            EventBus.$emit("map-draw-driver-marker");
            notification["success"]({
              message: "Tài xế đã nhận xe",
              description: `Tài xế '${
                data.driver.name
              }' đã nhận yêu cầu của khách '${data.name}'.`
            });
          } else if (data.status === REQUEST_STATUS.MOVING) {
            notification["success"]({
              message: "Tài xế đang đưa khách",
              description: `Tài xế '${data.driver.name}' đang đưa khách '${
                data.name
              }' đến nơi.`
            });
          } else if (data.status === REQUEST_STATUS.DONE) {
            notification["success"]({
              message: "Tài xế đã xong chuyến",
              description: `Tài xế '${
                data.driver.name
              }' đã hoàn thành yêu cầu của khách '${data.name}'.`
            });
          } else if (data.status === REQUEST_STATUS.NO_DRIVER) {
            notification["success"]({
              message: "Không có tài xế",
              description: `Không tìm được tài xế cho khách '${data.name}'.`
            });
          }
        });
      });
    }
  },
  beforeMount() {
    this.getRequests();
    this.socketClient = connect();

    this.socketClient.on("connect", () => {
      this.socketClient.emit(EVENT_INIT_IDENTIFIER, "dvv-" + Date.now());
    });

    this.socketClient.on(EVENT_REQUESTS_CHANGED, () => {
      this.getRequests();
    });
  },
  mounted() {
    this.subscribeEventBus();
  }
};
</script>

<style>
#app-layout .logo {
  width: 248px;
  height: 31px;
  margin: 16px 28px 16px 0;
  float: left;
}
</style>
