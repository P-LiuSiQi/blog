import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { request } from './axios/index'

/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false;

/**
 * @description 全局注册请求变量
 */
Vue.prototype.$request = request

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
