import Vue from 'vue';
import Router from 'vue-router';

import Login from './views/Login.vue';
import Orders from './views/Orders.vue';
import requestReceiver from './views/RequestReceiver.vue';
import locationIdentifier from './views/LocationIdentifier.vue';
import Driver from './views/Driver.vue';
import RequestManagement from './views/RequestManagement.vue'
import AccountManagement from './views/AccountManagement.vue'

Vue.use(Router);

var router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Login
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/orders',
      name: 'orders',
      component: Orders,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/requestReceiver',
      name: 'requestReceiver',
      component: requestReceiver,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/LocationIdentifier',
      name: 'LocationIdentifier',
      component: locationIdentifier,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/Driver',
      name: 'Driver',
      component: Driver,
      meta: {
        requiresAuth: true
      },
      props: true
    },
    {
      path: '/RequestManagement',
      name: 'RequestManagement',
      component: RequestManagement,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/AccountManagement',
      name: 'AccountManagement',
      component: AccountManagement,
      meta: {
        requiresAuth: true
      }
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
});

// eslint-disable-next-line
import axios from 'axios';
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('usertoken') === null) {
      // alert('usertoken null');
      next({
        path: '/login'
      });
    } else {
      // alert('usertoken not null');
      axios
        .get('http://localhost:3000/orders', {
          headers: { 'x-access-token': localStorage.getItem('usertoken') },
          params: {
            refreshtoken: localStorage.getItem('refreshtoken')
          }
        })
        .then(response => {
          //this.info = response.data.bpi
          // alert(response.data.msg);
          if (response.data.msg == 'newtoken') {
            localStorage.setItem('usertoken', response.data.access_token);
          }
        })
        .catch(error => {
          console.log(error);
          alert(error);
          this.errored = true;
        });
      next();
    }
  } else {
    next(); // make sure to always call next()!
  }
});

export default router;
