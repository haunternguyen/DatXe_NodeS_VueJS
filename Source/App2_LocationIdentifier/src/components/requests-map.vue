<template>
  <a-row>
    <a-col :span="18">
      <div>
        <div id="map" class="h-500"></div>
      </div>
    </a-col>
    <a-col :span="6" style="padding: 8px; background: #f0f3f5;">
      <a-row>
        <h2>Thông tin yêu cầu</h2>
        <a-form layout="vertical">
          <a-form-item label="Tên" class="request-form-item">
            <span class="ant-form-text">{{selectedRequest ? selectedRequest.name : ''}}</span>
          </a-form-item>
          <a-form-item label="Trạng thái" class="request-form-item">
            <span
              class="ant-form-text"
            >{{selectedRequest ? selectedRequest.status : '' | requestStatusToText}}</span>
          </a-form-item>
          <a-form-item label="Điện thoại" class="request-form-item">
            <span class="ant-form-text">{{selectedRequest ? selectedRequest.phone : ''}}</span>
          </a-form-item>
          <a-form-item label="Địa chỉ nhận" class="request-form-item">
            <span class="ant-form-text">{{selectedRequest ? selectedRequest.pickupAddress : ''}}</span>
          </a-form-item>
          <a-form-item label="Địa chỉ từ reserved geocode" class="request-form-item">
            <span class="ant-form-text">{{selectedRequest ? selectedRequest.reversedAddress : ''}}</span>
          </a-form-item>
          <a-form-item label="Ghi chú" class="request-form-item">
            <a-textarea
              class="ant-form-text"
              readonly
            >{{selectedRequest ? selectedRequest.note : ''}}</a-textarea>
          </a-form-item>
          <template v-if="selectedRequestDriver">
            <a-form-item label="Tên tài xế" class="request-form-item">
              <span
                class="ant-form-text"
              >{{selectedRequestDriver ? selectedRequestDriver.name : ''}}</span>
            </a-form-item>
            <a-form-item label="ĐT tài xế" class="request-form-item">
              <span
                class="ant-form-text"
              >{{selectedRequestDriver ? selectedRequestDriver.phone : ''}}</span>
            </a-form-item>
          </template>
        </a-form>
        <p v-if="!selectedRequest">Chưa chọn yêu cầu</p>
      </a-row>
    </a-col>
  </a-row>
</template>

<style scoped>
#map {
  margin: 0 auto;
  background: gray;
}

.h-500 {
  height: calc(100vh - 164px);
}

.request-form-item {
  margin-bottom: 4px;
}
</style>  
<script>
import appStore from "../stores/appStore.js";
import { EventBus } from "../event-bus.js";
import { REQUEST_STATUS } from "../constants";

let hcmc = [10.7771705, 106.695503];

export default {
  props: {
    latitude: {
      type: Number,
      default() {
        return hcmc[0];
      }
    },
    longitude: {
      type: Number,
      default() {
        return hcmc[1];
      }
    },
    zoom: {
      type: Number,
      default() {
        return 14;
      }
    }
  },
  mounted() {
    this.initEventBus();
    this.initMap();
    this.initGeocoder();
    // eslint-disable-next-line
  },
  data() {
    return {
      mapComponent: null,
      clickListener: null,

      geocoder: null,
      directionsService: null,
      directionsDisplay: null,

      positionUpdateMarker: null,
      positionMarker: null,
      driverMarker: null
    };
  },
  computed: {
    selectedRequest() {
      return appStore.state.selectedRequest;
    },
    selectedRequestDriver() {
      return appStore.state.selectedRequestDriver;
    }
  },
  methods: {
    initEventBus: function() {
      EventBus.$on("remove-position-marker", () => {
        this.removePositionMarker();
      });

      EventBus.$on("map-draw-selected-request-position", () => {
        this.removePositionMarker();
        this.drawSelectedRequestPosition();
      });

      EventBus.$on("map-draw-driver-marker", () => {
        this.drawDriverMarker();
      });

      EventBus.$on("map-enable-click-listener", () => {
        this.clickListener = this.mapComponent.addListener("click", e => {
          this.removePositionUpdateMarker();
          this.setPositionUpdateMarker(e.latLng);

          appStore.commit("setSelectedRequestUpdatePosition", {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          });
        });
      });

      EventBus.$on("map-disable-click-listener", () => {
        if (this.clickListener) {
          // eslint-disable-next-line
          google.maps.event.removeListener(this.clickListener);
        }
      });

      EventBus.$on("map-geocode-pick-run", () => {
        this.runGeocodePick();
      });

      EventBus.$on("map-remove-position-update-marker", () => {
        this.removePositionUpdateMarker();
      });

      EventBus.$on("map-draw-shortest-path", () => {
        this.drawShortestPath();
      });
    },
    initMap: function() {
      const mapOptions = {
        // eslint-disable-next-line
        center: new google.maps.LatLng(this.latitude, this.longitude),
        zoom: this.zoom,
        clickableIcons: false,
        disableDefaultUI: true,
        styles: [
          {
            featureType: "administrative.land_parcel",
            elementType: "labels",
            stylers: [
              {
                visibility: "off"
              }
            ]
          },
          {
            featureType: "poi.business",
            stylers: [
              {
                visibility: "off"
              }
            ]
          },
          {
            featureType: "poi.park",
            elementType: "labels.text",
            stylers: [
              {
                visibility: "off"
              }
            ]
          },
          {
            featureType: "road.local",
            elementType: "labels",
            stylers: [
              {
                visibility: "off"
              }
            ]
          }
        ]
      };

      // eslint-disable-next-line
      this.mapComponent = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );
      // eslint-disable-next-line
      this.directionsService = new google.maps.DirectionsService();

      // eslint-disable-next-line
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
      });
      this.directionsDisplay.setMap(this.mapComponent);
    },
    initGeocoder: function() {
      // eslint-disable-next-line
      this.geocoder = new google.maps.Geocoder();
    },
    drawSelectedRequestPosition: function() {
      let dragable = false;
      if (
        this.selectedRequest.status === REQUEST_STATUS.GEOCODED ||
        this.selectedRequest.status === REQUEST_STATUS.RECEIVED
      ) {
        dragable = true;
      }
      if (this.selectedRequest.status === REQUEST_STATUS.RECEIVED) return;

      // eslint-disable-next-line
      const pst = new google.maps.LatLng(
        this.selectedRequest.pickupLat,
        this.selectedRequest.pickupLng
      );

      // eslint-disable-next-line
      this.positionMarker = new google.maps.Marker({
        position: pst,
        icon: null,
        map: this.mapComponent,
        draggable: dragable,
        title: null
      });

      if (dragable) {
        this.positionMarker.addListener("drag", () => {
          appStore.commit("enableGuestDragPositionPick");
          appStore.commit("setDragging", true);
        });

        this.positionMarker.addListener("dragend", e => {
          this.geocoder.geocode({ location: e.latLng }, function(
            results,
            status
          ) {
            appStore.commit("setDragging", false);
            if (status === "OK") {
              if (results[0]) {
                const addr = results[0].formatted_address;
                const pts = results[0].geometry.location;
                appStore.commit("setSelectedRequestUpdateAddress", addr);
                appStore.commit("setSelectedRequestUpdatePosition", {
                  lat: pts.lat(),
                  lng: pts.lng()
                });
              }
            }
          });
        });
      }

      this.mapComponent.panTo(pst);
    },
    drawDriverMarker: function() {
      // eslint-disable-next-line
      const pst = new google.maps.LatLng(
        this.selectedRequestDriver.lat,
        this.selectedRequestDriver.lng
      );

      // eslint-disable-next-line
      this.driverMarker = new google.maps.Marker({
        position: pst,
        icon: {
          // eslint-disable-next-line
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          strokeColor: "#393"
        },
        map: this.mapComponent,
        draggable: false,
        title: null
      });

      // eslint-disable-next-line
      var infowindow = new google.maps.InfoWindow({
        content: `
        <p>Tài xế nhận chuyến</p>
        <p>Tên: ${this.selectedRequestDriver.name}</p>
        <p>Điện thoại: ${this.selectedRequestDriver.phone}</p>`
      });

      infowindow.open(this.mapComponent, this.driverMarker);
    },
    removePositionMarker: function() {
      if (this.positionMarker) {
        this.positionMarker.setMap(null);
      }

      if (this.driverMarker) {
        this.driverMarker.setMap(null);
      }

      this.directionsDisplay.set("directions", null);
    },
    removePositionUpdateMarker: function() {
      if (this.positionUpdateMarker) {
        this.positionUpdateMarker.setMap(null);
      }
    },
    setPositionUpdateMarker: function(latLng) {
      // eslint-disable-next-line
      this.positionUpdateMarker = new google.maps.Marker({
        position: latLng,
        icon: {
          // eslint-disable-next-line
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7
        },
        map: this.mapComponent,
        title: null
      });
    },
    runGeocodePick: function() {
      appStore.commit("setGeoCodeRunning", true);
      this.geocoder.geocode(
        { address: this.selectedRequest.pickupAddress },
        (results, status) => {
          appStore.commit("setGeoCodeRunning", false);
          if (status === "OK") {
            const location = results[0].geometry.location;
            appStore.commit("setGeoCodeRunningSuccess", true);

            this.setPositionUpdateMarker(location);

            this.mapComponent.panTo(location);
            appStore.commit("setSelectedRequestUpdatePosition", {
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            appStore.commit("setGeoCodeRunningSuccess", false);
            appStore.commit("setGeoCodeRunningMessage", status);
          }
        }
      );
    },
    drawShortestPath: function() {
      if (this.positionMarker && this.driverMarker) {
        var requestLatLng = this.positionMarker.getPosition();
        var driverLatLng = this.driverMarker.getPosition();

        var request = {
          origin: driverLatLng,
          destination: requestLatLng,
          travelMode: "DRIVING"
        };
        this.directionsService.route(request, (result, status) => {
          if (status == "OK") {
            this.directionsDisplay.setDirections(result);
          }
        });
      }
    }
  }
};
</script>  