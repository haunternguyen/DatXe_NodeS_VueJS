import Vue from 'vue'
import App from './App.vue'
import Mint from 'mint-ui';
import 'mint-ui/lib/style.css';
import VueRouter from 'vue-router';
import routes from './routes';
import './styles/index.css';

Vue.use(Mint);
Vue.use(VueRouter);

Vue.config.productionTip = false

export const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
