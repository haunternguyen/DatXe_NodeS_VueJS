<template>
  <div>
    <div id="requests-filter">
      <a-radio-group
        id="requests-filter-radio"
        v-model="query"
        defaultValue
        buttonStyle="solid"
        size="small"
      >
        <a-radio-button value>Tất cả ({{countAllRequest}})</a-radio-button>
        <a-radio-button value="received">Chưa ĐV ({{countRequest(STATUS_RECEIVED)}})</a-radio-button>
        <a-radio-button value="geocoded">Đã ĐV ({{countRequest(STATUS_GEOCODED)}})</a-radio-button>
        <a-radio-button value="picked">Đang đón ({{countRequest(STATUS_PICKED)}})</a-radio-button>
        <a-radio-button value="moving">Trên đường ({{countRequest(STATUS_MOVING)}})</a-radio-button>
        <a-radio-button value="done">Đến nơi ({{countRequest(STATUS_DONE)}})</a-radio-button>
      </a-radio-group>
    </div>
    <a-list
      id="requests-list"
      size="small"
      bordered
      :dataSource="filteredList"
      itemLayout="vertical"
    >
      <a-list-item
        slot="renderItem"
        slot-scope="item"
        v-on:click="itemClicked(item)"
        v-bind:class="{ selectrequest: isActive(item.id) }"
      >
        <div style="float: right;">{{item.createdAt | formatDate}}</div>
        <div>{{item.name}}</div>
        <div>{{item.reversedAddress | truncate(48)}}</div>
        <div>{{item.phone}}</div>
        <div>{{item.status | requestStatusToText}}</div>
      </a-list-item>
    </a-list>
  </div>
</template>

<style scoped>
#requests-list {
  margin: 0px 8px;
  background: #e4e3e3;
}

#requests-filter {
  text-align: center;
}

#requests-filter-radio {
  display: inherit;
  line-height: 2;
}

.selectrequest {
  background: #c7c7c7;
  border: 1px black solid !important;
}
</style>  
<script>
import appStore from "../stores/appStore.js";
import { EventBus } from "../event-bus.js";
import { REQUEST_STATUS } from "../constants";

export default {
  props: {},
  mounted() {},
  data() {
    return {
      requests: appStore.state.requests,
      STATUS_RECEIVED: REQUEST_STATUS.RECEIVED,
      STATUS_GEOCODED: REQUEST_STATUS.GEOCODED,
      STATUS_PICKED: REQUEST_STATUS.PICKED,
      STATUS_MOVING: REQUEST_STATUS.MOVING,
      STATUS_DONE: REQUEST_STATUS.DONE,
      query: ""
    };
  },
  computed: {
    selectedRequest() {
      return appStore.state.selectedRequest;
    },
    countAllRequest() {
      return appStore.state.requests.length;
    },
    countRequest() {
      return targetStatus => {
        let count = 0;
        for (var i = 0; i < appStore.state.requests.length; ++i) {
          if (appStore.state.requests[i].status === targetStatus) count++;
        }
        return count;
      };
    },
    filteredList() {
      return appStore.state.requests.filter(
        item => !this.query || item.status === this.query
      );
    },
    isActive() {
      return itemId => {
        if (this.selectedRequest && itemId === this.selectedRequest.id) {
          return true;
        }
        return false;
      };
    }
  },
  methods: {
    async itemClicked(request) {
      EventBus.$emit("remove-position-marker");
      appStore.commit("setSelectedRequest", request);

      if (request.status !== REQUEST_STATUS.RECEIVED) {
        EventBus.$emit("map-draw-selected-request-position");

        if (
          request.status === REQUEST_STATUS.PICKED ||
          request.status === REQUEST_STATUS.MOVING
        ) {
          if (request.driverId) {
            await this.getSelectedRequestDriver();
          }
        }
      }
      EventBus.$emit("request-selected", request.id);
    },
    async getSelectedRequestDriver() {
      await appStore.dispatch("getSelectedRequestDriver");
      EventBus.$emit("map-draw-driver-marker");
    }
  }
};
</script>  