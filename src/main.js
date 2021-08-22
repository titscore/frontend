import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueCookies from 'vue-cookies'

import router from './router'
import { Auth0Plugin } from './auth'
import BackendPlugin from './plugins/backend'
import GhostPlugin from './plugins/ghost.plugin'
import { domain, clientId, audience } from '../auth_config.json'
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)
Vue.use(Auth0Plugin, {
    domain,
    clientId,
    audience,
    onRedirectCallback: (appState) => {
        router.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname)
    },
})
Vue.use(GhostPlugin)
Vue.use(BackendPlugin)
Vue.use(VueCookies)

Vue.config.productionTip = false

const store = new Vuex.Store({
    state: {},
    plugins: [createPersistedState()],
    mutations: {
      
    },
})

new Vue({
    store,
    vuetify,
    router,
    render: (h) => h(App),
}).$mount('#app')
