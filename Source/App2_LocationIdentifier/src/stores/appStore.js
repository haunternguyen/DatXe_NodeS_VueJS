import Vue from 'vue';
import Vuex from 'vuex';

import { TOP_BAR_MODES, REQUEST_STATUS } from '../constants';
import {
  updateRequest,
  findAvaiableDriver,
  getRequest
} from '../services/apiClient';
import { notification } from 'ant-design-vue';

Vue.use(Vuex);
// 'geocoded', 'picked', 'moving', 'done'
export default new Vuex.Store({
  state: {
    requests: [],
    selectedRequest: null,
    selectedRequestUpdateAddress: null,
    selectedRequestUpdatePosition: null,
    selectedRequestDriver: null,

    topBarMode: TOP_BAR_MODES.DISPLAY,

    isGeocodeRunning: false,
    isGeocodeRunningSuccess: false,
    geocodeRunningMessage: null,

    isDragging: false
  },
  mutations: {
    setRequests(state, requests) {
      state.requests = requests;
    },

    setSelectedRequest(state, request) {
      state.selectedRequest = request;
      state.topBarMode = TOP_BAR_MODES.GUEST_SELECTED;
      state.selectedRequestDriver = null;
    },

    updateSelectedRequest(state, request) {
      for (let index = 0; index < state.requests.length; index++) {
        let existingRequest = state.requests[index];
        if (existingRequest.id === request.id) {
          existingRequest.status = request.status;
          existingRequest.driverId = request.driverId;
          existingRequest.driver = request.driver;
        }
      }
      state.selectedRequest.status = request.status;
      state.selectedRequestDriver = request.driver;
    },

    setSelectedRequestDriver(state, request) {
      state.selectedRequestDriver = request.data.driver;
    },

    backToSelectedMode(state) {
      state.topBarMode = TOP_BAR_MODES.GUEST_SELECTED;
      state.selectedRequestUpdatePosition = null;
      state.selectedRequestUpdateAddress = null;
    },

    enableGuestPositionPick(state) {
      state.topBarMode = TOP_BAR_MODES.MANUAL_PICK;
    },

    enableGuestGeocodePositionPick(state) {
      state.topBarMode = TOP_BAR_MODES.GEOCODE_PICK;
    },

    enableGuestDragPositionPick(state) {
      state.topBarMode = TOP_BAR_MODES.DRAG_PICK;
    },

    setGeoCodeRunning(state, isRunning) {
      state.isGeocodeRunning = isRunning;
    },
    setGeoCodeRunningSuccess(state, isSuccess) {
      state.isGeocodeRunningSuccess = isSuccess;
    },
    setGeoCodeRunningMessage(state, message) {
      state.geocodeRunningMessage = message;
    },

    setDragging(state, isDragging) {
      state.isDragging = isDragging;
    },

    setSelectedRequestUpdateAddress(state, address) {
      state.selectedRequestUpdateAddress = address;
    },
    setSelectedRequestUpdatePosition(state, position) {
      state.selectedRequestUpdatePosition = position;
    },
    confirmAddressUpdate(state) {
      state.selectedRequest.reversedAddress =
        state.selectedRequestUpdateAddress;
    },
    confirmPositionUpdate(state) {
      state.selectedRequest.pickupLat = state.selectedRequestUpdatePosition.lat;
      state.selectedRequest.pickupLng = state.selectedRequestUpdatePosition.lng;
      state.selectedRequest.status = REQUEST_STATUS.GEOCODED;
    },
    updateSelectedRequestToStore(state) {
      updateRequest(state.selectedRequest)
        .then(() => {
          notification['success']({
            message: 'Hoàn tất',
            description: `Hoàn tất cập nhật vị trí của '${
              state.selectedRequest.name
            }'.`
          });
        })
        .catch(() => {
          notification['error']({
            message: 'Lỗi',
            description: `Có lỗi khi cập nhật vị trí của '${
              state.selectedRequest.name
            }'.`
          });
        });
    },
    findAvailableDriver(state) {
      findAvaiableDriver(state.selectedRequest)
        .then(result => {
          if (result.status === 404) {
            notification['warning']({
              message: 'Không tìm thấy',
              description: `Không tìm thấy tài xế cho '${
                state.selectedRequest.name
              }'.`
            });
          } else if (result.status === 200) {
            notification['success']({
              message: 'Đang tìm',
              description: `Đang tìm tài xế cho '${
                state.selectedRequest.name
              }'.`
            });
          }
        })
        .catch(err => {
          if (err.response.status === 404) {
            notification['warning']({
              message: 'Không tìm thấy',
              description: `Không tìm thấy tài xế cho '${
                state.selectedRequest.name
              }'.`
            });
          } else {
            notification['error']({
              message: 'Lỗi',
              description: `Có lỗi tìm tài xế cho '${
                state.selectedRequest.name
              }'.`
            });
          }
        });
    }
  },
  actions: {
    async getSelectedRequestDriver({ commit, state }) {
      commit(
        'setSelectedRequestDriver',
        await getRequest(state.selectedRequest)
      );
    }
  }
});
