import ghostService from "../services/ghost.service.js";

export default {
    install(Vue) {
        Vue.prototype.$ghost = ghostService(Vue);
    }
}