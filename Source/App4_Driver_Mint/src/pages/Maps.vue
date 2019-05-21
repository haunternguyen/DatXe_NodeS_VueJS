<template>
  <div class="maps-page">
    <div class="map-container">
      <div v-if="isAcceptRequest">
        <div>
          <h4>Thông tin khách</h4>
          <p><b>Tên: </b> {{ requestInfo.name }}</p>
          <p><b>Địa chỉ đón: </b> {{ requestInfo.pickupAddress }}</p>
        </div>
        <div>
          <mt-button v-if="!isClickedBegin" class="cus-button" size="large" type="primary" @click="beginWay">Bắt Đầu</mt-button>
          <mt-button v-if="isClickedBegin" class="cus-button" size="large" type="danger" @click="finishWay">Kết Thúc</mt-button>
        </div>
      </div>
      <div id="map-driver-location"></div>
    </div>
    <mt-popup
      v-model="popupRequestVisible"
      popup-transition="popup-fade"
      position="bottom"
      :close-on-click-modal="false"
      :style="{ width: '100%', padding: '10px'}">
      <div>
        <div>
          <h4 :style="{ textAlign: 'center'}">Yêu cầu đón khách 
            <small :style="{ float: 'right'}">Đóng ({{popupRequestHideSeconds}})</small>
          </h4>
          <p><b>Khách hàng: </b> {{ requestInfo.name }}</p>
          <p><b>Địa chỉ đón: </b> {{ requestInfo.pickupAddress }}</p>
        </div>
        <mt-button type="primary" size="large" :style="{ marginBottom: '5px'}" @click="acceptRequest">Đồng ý</mt-button>
        <mt-button type="default" size="large" @click="rejectRequest">Từ chối</mt-button>
      </div>

    </mt-popup>
  </div>
</template>

<script>
import { Toast, MessageBox, Popup } from 'mint-ui';
import { apiService, getUserInfo } from '../services/index';
import { connect, getEventDriverLocationChange, getEventDriverNewFitRequest } from '../services/socket-io-client';
import EventBus from '../EventBus';

export default {
  name: 'maps',
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
        this.currentLocation = {
          lat: result.lat,
          lng: result.lng
        };
        // load map
        this.loadMap(this.currentLocation, this.handleUpdateLocation, (marker) => {
          // handle socket connection, init driver info
          this.initSocket(result);

          if (this.socket) {
            const eventLocationChange = getEventDriverLocationChange(user.id);
            this.socket.on(eventLocationChange, (location) => {
              marker.setPosition(location);
            });

            const eventNewFitRequest = getEventDriverNewFitRequest(user.id);
            this.socket.on(eventNewFitRequest, (requestInfo) => {
              // emit to parent component
              this.$emit('has-fit-request', requestInfo);
              this.requestInfo = requestInfo;
              this.popupRequestVisible = true;
              this.popupRequestHideSeconds = 20;
              this.popupRequestInterval = this.countDownTrigger(this.popupRequestHideSeconds, (currentSeconds) => {
                this.popupRequestHideSeconds = currentSeconds;
              }, () => {
                this.popupRequestHideSeconds = 0;
                this.popupRequestVisible = false;
              });

              console.log(requestInfo);
            });
          }
        });


      }).catch(err => err);
    }
  },
  destroyed() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  data() {
    return {
      map: {},
      user: {},
      requestInfo: {},
      socket: null,
      popupRequestVisible: false,
      popupRequestHideSeconds: 10,
      popupRequestInterval: undefined,
      currentLocation: {},
      isAcceptRequest: false,
      isClickedBegin: false,
      
    }
  },
  methods: {
    loadMap(currentLocation = {}, onChangeLocation, onLoaded) {
      const center = {lat:  10.762622, lng: 106.660172};
      const markerPosition = center;
      if (currentLocation.lat) {
        markerPosition.lat = currentLocation.lat;
      }
      if (currentLocation.lng) {
        markerPosition.lng = currentLocation.lng;
      }
      this.map = new window.google.maps.Map(document.getElementById('map-driver-location'), {zoom: 15, center: center});
      this.directionsService = new window.google.maps.DirectionsService;
      this.directionsDisplay = new window.google.maps.DirectionsRenderer;
      this.directionsDisplay.setMap(this.map);
      const marker = new window.google.maps.Marker({
        position: center,
        map: this.map,
        draggable: true
      });
      this.map.addListener('click', (event) => {
        markerPosition.lat = event.latLng.lat();
        markerPosition.lng = event.latLng.lng();
        marker.setPosition(markerPosition);
        if (typeof onChangeLocation === 'function') {
          onChangeLocation(markerPosition);
        }
      });
      marker.addListener('dragend', (event) => {
        markerPosition.lat = event.latLng.lat();
        markerPosition.lng = event.latLng.lng();
        if (typeof onChangeLocation === 'function') {
          onChangeLocation(markerPosition);
        }
      });

      // loaded map
      if (typeof onLoaded === 'function') {
        onLoaded(marker);
      }
    },
    handleUpdateLocation(location) {
      apiService({
        path: `/driver/${this.user.id}/updateLocation`,
        method: 'put',
        data: location
      }).then((result) => {
        console.log(result);
        this.currentLocation = result;
        Toast({
          message: 'Cập nhật ví trí thành công',
          position: 'bottom'
        });
      }).catch(err => {
        Toast({
          message: `ERROR: ${err.message}`,
          position: 'bottom'
        });
      });
    },
    initSocket(user) {
      this.socket = connect();
      const socket = this.socket;
      socket.on('connect', () => {
        console.log(`socket ${socket.id} connected`);
        socket.emit('init-driver-info', user);
      });

      socket.on('disconnect', () => {
        console.log(`socket disconnected`);
      });
    },
    acceptRequest() {
      if (this.requestInfo && this.requestInfo.id) {
        apiService({
          path: `/driver/${this.user.id}/acceptRequest`,
          method: 'post',
          data: {
            requestId: this.requestInfo.id
          }
        }).then((result) => {
          this.popupRequestVisible = false;
          // display direction route
          const originLocation = [this.currentLocation.lat, this.currentLocation.lng].toString();
          const destinationLocation = [this.requestInfo.pickupLat, this.requestInfo.pickupLng].toString();
          this.displayRoute(originLocation, destinationLocation);
          this.isAcceptRequest = true;
          // clear interval if click accept
          if (this.popupRequestInterval) {
            clearInterval(this.popupRequestInterval);
          }
          // emit event click accept request
          EventBus.$emit('map-accepted-request');

          Toast({
            message: 'Đã chấp nhận yêu cầu',
            position: 'bottom'
          });
        });
      }
    },
    rejectRequest() {
      if (this.requestInfo && this.requestInfo.id) {
        apiService({
          path: `/driver/${this.user.id}/rejectRequest`,
          method: 'post',
          data: {
            requestId: this.requestInfo.id
          }
        }).then((result) => {
          this.popupRequestVisible = false;
          // clear interval if click reject
          if (this.popupRequestInterval) {
            clearInterval(this.popupRequestInterval);
          }
        });
      }
    },
    displayRoute(origin, destination) {
      if (this.directionsService && this.directionsDisplay) {
        this.directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: 'DRIVING'
        }, (response, status) => {
          if (status === 'OK') {
            this.directionsDisplay.setDirections(response);
          } else {
            Toast({
              message: 'Error: ' + status,
              position: 'bottom'
            });
          }
        });
      }
    },
    beginWay() {
      if (this.requestInfo && this.requestInfo.id && this.user && this.user.id) {
        // update request status to moving
        apiService({
          path: `/driver/${this.user.id}/movingRequest`,
          method: 'post',
          data: {
            requestId: this.requestInfo.id
          }
        }).then((result) => {
          this.isClickedBegin = true;
          Toast({
            message: 'Đã xác nhận bắt đầu hành trình',
            position: 'bottom'
          });
        });
      }
    },
    finishWay() {
      if (this.requestInfo && this.requestInfo.id && this.user && this.user.id) {
        // update request status to done
        apiService({
          path: `/driver/${this.user.id}/doneRequest`,
          method: 'post',
          data: {
            requestId: this.requestInfo.id
          }
        }).then((result) => {
          // reset
          this.isAcceptRequest = false;
          this.isClickedBegin = false;
          this.requestInfo = {};
          this.directionsDisplay.set('directions', null);
          Toast({
            message: 'Đã xác nhận kết thúc hành trình',
            position: 'bottom'
          });
          // emit event click finished request
          EventBus.$emit('map-finished-request');
        });

      }
    },
    countDownTrigger(seconds = 20, onTimeChange, onTimeEnd) {
      let milliseconds = seconds * 1000;
      const everyMilliseconds = 1000;
      const interval = setInterval(() => {
        milliseconds = milliseconds - everyMilliseconds;
        if (typeof onTimeChange === 'function') {
          onTimeChange(milliseconds / 1000);
        }
        if (milliseconds <= 0) {
          clearInterval(interval);
          if (typeof onTimeEnd === 'function') {
            onTimeEnd();
          }
        }
      }, everyMilliseconds);

      return interval;
    }

  }
}
</script>

<style>
.map-container {
  height: 100%;
}
.map-container #map-driver-location {
  border: 1px solid #cdcdcd;
  height: 400px;
  margin-top: 3px;
}
</style>
