import axios from 'axios';

const BASE_URL = 'http://localhost:5858/api/v1';

export function getRequests() {
  return axios({
    url: `${BASE_URL}/request`,
    method: 'get',
    params: {},
    type: 'json'
  });
}

export function getRequest(request) {
  return axios({
    url: `${BASE_URL}/request/${request.id}`,
    method: 'get',
    params: {},
    type: 'json'
  });
}

export function updateRequest(request) {
  return axios({
    url: `${BASE_URL}/request/${request.id}`,
    method: 'put',
    data: request,
    type: 'json'
  });
}

export function findAvaiableDriver(request) {
  return axios({
    url: `${BASE_URL}/request/${request.id}/findAvailableDriver`,
    method: 'get',
    type: 'json'
  });
}
