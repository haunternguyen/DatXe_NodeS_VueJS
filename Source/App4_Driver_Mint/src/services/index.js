import axios from 'axios';
import { router } from '../main';

const BASE_URL = 'http://localhost:5858/api/v1';

// Response interceptor
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response) {
    // redirect to login
    if (error.response.status === 401) {
      router.push({ path: '/login' });
    }
    
  }
  return Promise.reject(error);
});

export function apiService(opts = { path: '/', method: 'get' }) {
  return new Promise((resolve, reject) => {
    axios({
      url: `${BASE_URL}${opts.path}`,
      ...opts
    }).then((result) => {
      resolve(result.data);
    }).catch((err) => {
      reject(err && err.response ? err.response.data : null);
    })
  })
}

export function setAuthHeader(authToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export function setUserInfo(data) {
  if (data) {
    window.localStorage.setItem('id', data.driverId);
    window.localStorage.setItem('accessToken', data.token);
  }
}

export function getUserInfo() {
  const id = window.localStorage.getItem('id');
  const accessToken = window.localStorage.getItem('accessToken');

  return {
    id, accessToken
  }
}

export function removeUserInfo() {
  window.localStorage.removeItem('id');
  window.localStorage.removeItem('accessToken');
}