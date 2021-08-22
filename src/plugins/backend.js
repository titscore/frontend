import backendService from "../services/backend.service";

export default {
    install(Vue) {
        Vue.prototype.$backend = backendService(Vue.prototype.$auth);
    }
}