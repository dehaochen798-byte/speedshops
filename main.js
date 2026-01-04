
// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import './utils/request.js'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
import './utils/request.js'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif