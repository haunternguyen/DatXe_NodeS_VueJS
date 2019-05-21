<template>
  <div>
    <template v-if="topBarMode == MODE_DISPLAY">
      <a-row>
        <a-col :span="16">
          <div>Chưa chọn hành khách</div>
        </a-col>
        <a-col :span="8"></a-col>
      </a-row>
    </template>
    <template v-else-if="topBarMode == MODE_GUEST_SELECTED">
      <a-button-group size="small">
        <a-button
          type="primary"
          @click="enableManualPick"
          :disabled="!isUpdateableRequest"
        >Xác định tương đối</a-button>
        <a-button
          type="primary"
          @click="runGecodePick"
          :disabled="!isUpdateableRequest"
        >Xác định nhanh</a-button>
        <a-button type="primary" @click="findDriver" :disabled="!isFindDriverRequest">Tìm tài xế</a-button>
        <a-button
          type="primary"
          @click="drawShortestPath"
          :disabled="!isPickedRequest"
        >Xem đường từ tài xế</a-button>
      </a-button-group>
    </template>
    <template v-else-if="topBarMode == MODE_MANUAL_PICK">
      <a-row>
        <a-col :span="12">
          <p>{{selectedRequest.name}} - Chọn tọa độ trên bảng đồ và bấm xác nhận</p>
        </a-col>
        <a-col :span="4">
          <a-button-group size="small">
            <a-button type="primary" @click="confirmManualPick">Xác nhận</a-button>
            <a-button type="primary" @click="cancelManualPick">Hủy</a-button>
          </a-button-group>
        </a-col>
      </a-row>
    </template>
    <template v-else-if="topBarMode == MODE_GEOCODE_PICK">
      <a-row>
        <a-col :span="12">
          <p v-if="isGeocodeRunning">Đang geocode tọa độ từ địa chỉ...</p>
          <p v-else-if="isGeocodeRunningSuccess">{{selectedRequest.name}} - Đã xác định được tọa độ</p>
          <p v-else>{{selectedRequest.name}} - Không xác định được tọa độ từ geocode</p>
        </a-col>
        <a-col :span="4">
          <a-button-group size="small">
            <a-button type="primary" v-if="!isGeocodeRunningSuccess" @click="runGecodePick">Thử lại</a-button>
            <a-button
              type="primary"
              v-if="isGeocodeRunningSuccess"
              @click="confirmGeocodePick"
            >Xác nhận</a-button>
            <a-button type="primary" @click="cancelGeocodePick">Hủy</a-button>
          </a-button-group>
        </a-col>
      </a-row>
    </template>
    <template v-else-if="topBarMode == MODE_DRAG_PICK">
      <a-row>
        <a-col :span="12">
          <p v-if="isDragging">Thả chuột để ghim vị trí mới ...</p>
          <p v-else>Tọa độ mới có địa chỉ: {{selectedRequestUpdateAddress}}</p>
        </a-col>
        <a-col :span="4">
          <a-button-group size="small" v-if="!isDragging">
            <a-button type="primary" @click="confirmDragPick">Xác nhận</a-button>
            <a-button type="primary" @click="cancelDragPick">Hủy</a-button>
          </a-button-group>
        </a-col>
      </a-row>
    </template>
  </div>
</template>

<style scoped>
</style>  
<script>
import { EventBus } from "../event-bus.js";
import appStore from "../stores/appStore.js";
import { TOP_BAR_MODES, REQUEST_STATUS } from "../constants";

export default {
  props: {},
  mounted() {},
  data() {
    return {
      MODE_DISPLAY: TOP_BAR_MODES.DISPLAY,
      MODE_GUEST_SELECTED: TOP_BAR_MODES.GUEST_SELECTED,
      MODE_MANUAL_PICK: TOP_BAR_MODES.MANUAL_PICK,
      MODE_GEOCODE_PICK: TOP_BAR_MODES.GEOCODE_PICK,
      MODE_DRAG_PICK: TOP_BAR_MODES.DRAG_PICK
    };
  },
  computed: {
    selectedRequest() {
      return appStore.state.selectedRequest;
    },
    topBarMode() {
      return appStore.state.topBarMode;
    },
    isGeocodeRunning() {
      return appStore.state.isGeocodeRunning;
    },
    isGeocodeRunningSuccess() {
      return appStore.state.isGeocodeRunningSuccess;
    },
    isDragging() {
      return appStore.state.isDragging;
    },
    selectedRequestUpdateAddress() {
      return appStore.state.selectedRequestUpdateAddress;
    },
    isUpdateableRequest() {
      if (
        this.selectedRequest.status === REQUEST_STATUS.RECEIVED ||
        this.selectedRequest.status === REQUEST_STATUS.GEOCODED ||
        this.selectedRequest.status === REQUEST_STATUS.NO_DRIVER
      ) {
        return true;
      }
      return false;
    },
    isFindDriverRequest() {
      if (
        this.selectedRequest.status === REQUEST_STATUS.GEOCODED ||
        this.selectedRequest.status === REQUEST_STATUS.NO_DRIVER
      ) {
        return true;
      }
      return false;
    },
    isPickedRequest() {
      if (this.selectedRequest.status === REQUEST_STATUS.PICKED) {
        return true;
      }
      return false;
    }
  },
  methods: {
    enableManualPick() {
      appStore.commit("enableGuestPositionPick");

      EventBus.$emit("map-enable-click-listener");
    },
    confirmManualPick() {
      appStore.commit("confirmPositionUpdate");
      appStore.commit("updateSelectedRequestToStore");
      appStore.commit("backToSelectedMode");

      EventBus.$emit("map-remove-position-update-marker");
      EventBus.$emit("map-disable-click-listener");
      EventBus.$emit("map-draw-selected-request-position");
    },
    cancelManualPick() {
      appStore.commit("backToSelectedMode");

      EventBus.$emit("map-remove-position-update-marker");
      EventBus.$emit("map-disable-click-listener");
      EventBus.$emit("map-draw-selected-request-position");
    },

    runGecodePick() {
      appStore.commit("setGeoCodeRunningSuccess", false);
      appStore.commit("enableGuestGeocodePositionPick");

      EventBus.$emit("map-geocode-pick-run");
    },
    confirmGeocodePick() {
      appStore.commit("confirmPositionUpdate");
      appStore.commit("updateSelectedRequestToStore");
      appStore.commit("backToSelectedMode");

      EventBus.$emit("map-remove-position-update-marker");
      EventBus.$emit("map-draw-selected-request-position");
    },
    cancelGeocodePick() {
      appStore.commit("backToSelectedMode");

      EventBus.$emit("map-remove-position-update-marker");
      EventBus.$emit("map-draw-selected-request-position");
    },
    confirmDragPick() {
      appStore.commit("confirmPositionUpdate");
      appStore.commit("confirmAddressUpdate");
      appStore.commit("updateSelectedRequestToStore");
      appStore.commit("backToSelectedMode");

      EventBus.$emit("map-draw-selected-request-position");
    },
    cancelDragPick() {
      appStore.commit("backToSelectedMode");

      EventBus.$emit("map-draw-selected-request-position");
    },
    findDriver() {
      appStore.commit("findAvailableDriver");
    },
    drawShortestPath() {
      EventBus.$emit("map-draw-shortest-path");
    }
  }
};
</script>  