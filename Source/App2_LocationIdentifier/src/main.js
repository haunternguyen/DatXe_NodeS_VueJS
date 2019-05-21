import Vue from 'vue';
import Vuex from 'vuex';
import Antd from 'ant-design-vue';
import moment from 'moment';

import VueTruncate from 'vue-truncate-filter';

import App from './App.vue';
import RequestHeaderInfo from './components/request-header-info';
import RequestFooterInfo from './components/request-footer-info';
import RequestsMap from './components/requests-map';
import RequestsList from './components/requests-list';

import { statusToText } from './utils.js';

import 'ant-design-vue/dist/antd.css';

Vue.config.productionTip = false;

Vue.component('RequestsMap', RequestsMap);
Vue.component('RequestsList', RequestsList);
Vue.component('RequestHeaderInfo', RequestHeaderInfo);
Vue.component('RequestFooterInfo', RequestFooterInfo);

Vue.use(Vuex);
Vue.use(Antd);
Vue.use(VueTruncate);

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('DD/MM/YYYY HH:mm');
  }
});

Vue.filter('requestStatusToText', function(value) {
  if (value) {
    return statusToText(value);
  }
});

new Vue({
  render: h => h(App)
}).$mount('#app');
