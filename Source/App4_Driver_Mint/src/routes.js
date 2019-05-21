import Default from './pages/Default.vue';
import Maps from './pages/Maps.vue';
import Login from './pages/Login.vue';

export default [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/default',
    name: 'default',
    component: Default,
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }
]