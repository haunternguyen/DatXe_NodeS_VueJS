import Vue from 'vue'
import VueRouter from 'vue-router'
import { Button, Icon, Layout, Menu, Table, Popconfirm, Modal, Form, Input, Select } from 'ant-design-vue';
import App from './App.vue'
import Request from './components/Request.vue'
import './styles/main.css'

Vue.use(VueRouter)

Vue.component(Button.name, Button)
Vue.component(Icon.name, Icon)
Vue.component(Layout.name, Layout)
Vue.component(Layout.Header.name, Layout.Header)
Vue.component(Layout.Footer.name, Layout.Footer)
Vue.component(Layout.Sider.name, Layout.Sider)
Vue.component(Layout.Content.name, Layout.Content)
Vue.component(Menu.name, Menu)
Vue.component(Menu.SubMenu.name, Menu.SubMenu)
Vue.component(Menu.Item.name, Menu.Item)
Vue.component(Table.name, Table)
Vue.component(Popconfirm.name, Popconfirm)
Vue.component(Modal.name, Modal)
Vue.component(Form.name, Form)
Vue.component(Form.Item.name, Form.Item)
Vue.component(Input.name, Input)
Vue.component(Select.name, Select)
Vue.component(Select.Option.name, Select.Option)

Vue.config.productionTip = false

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', redirect: '/request' },
    { path: '/request', component: Request }
  ]
})

new Vue({
	router,
  render: h => h(App),
}).$mount('#app')
