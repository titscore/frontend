import axios from 'axios'
import { EventEmitter } from 'events'

const axiosCache = axios.create({
    headers: {
        withCredentials: true,
    },
})

axiosCache.defaults.raxConfig = {
    instance: axiosCache,
}

class BackendService extends EventEmitter {
    constructor(auth) {
        super()
        this.axiosCache = axiosCache
        this.$auth = auth
        this.awards = []
        this.surveys = []
        this.getAwards()
    }
    async getAwards() {
        let self = this
        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/awards`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                    params: {},
                })
                .then((response) => {
                    self.awards = response.data.results
                    resolve()
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getUsers(params) {
        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/users/random`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                    params,
                })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getUser(params) {
        let { userId, tiktokId } = params,
            url
        if (userId) url = `${process.env.VUE_APP_API_SERVER}/v1/users/${userId}`
        else if (tiktokId) url = `${process.env.VUE_APP_API_SERVER}/v1/users/tiktok/${tiktokId}`
        return new Promise((resolve, reject) => {
            axiosCache
                .get(url, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getUserStats(params) {
        let { socialNetwork, userId } = params

        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/users/stats/${socialNetwork}/${userId}?sortBy=updatedAt`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getUserSentiments(params) {
        let { socialNetwork, userId } = params

        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/users/sentiments/${socialNetwork}/${userId}?sortBy=updatedAt`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getComments(params) {
        let { socialNetwork, userId } = params

        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/users/comments/${socialNetwork}/${userId}?sortBy=updatedAt`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getSurveys(params) {
        let { user, survey } = params

        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/surveys/?sortBy=updatedAt`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                    params: {
                        user,
                        'survey.name': survey.name,
                    },
                })
                .then((response) => {
                    if (response.data.results.brasize) response.data.results.brasize = response.data.results.brasize.map((data) => JSON.parse(data))
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getRemarks(params) {
        let { user, url } = params

        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/remarks/?sortBy=updatedAt`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                    params: {
                        user,
                        url,
                    },
                })
                .then((response) => {
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async postSurvey(params) {
        let { userId, survey } = params

        return new Promise((resolve, reject) => {
            axiosCache
                .post(
                    `${process.env.VUE_APP_API_SERVER}/v1/surveys`,
                    {
                        user: userId,
                        survey,
                    },
                    {
                        headers: {
                            //Authorization: `Bearer ${token}`
                        },
                    }
                )
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async postRemark(params) {
        let remark = params

        return new Promise((resolve, reject) => {
            axiosCache
                .post(
                    `${process.env.VUE_APP_API_SERVER}/v1/remarks`,
                    {
                        remark,
                    },
                    {
                        headers: {
                            //Authorization: `Bearer ${token}`
                        },
                    }
                )
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async updateUser(options) {
        const token = await this.$auth.getTokenSilently(),
            { userId, params } = options
        return new Promise((resolve, reject) => {
            axiosCache
                .patch(
                    `${process.env.VUE_APP_API_SERVER}/v1/users/${userId}`,
                    {
                        ...params,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async postGofundmeVote(params) {
        return new Promise((resolve, reject) => {
            let { userId } = params
            axiosCache
                .post(
                    `${process.env.VUE_APP_API_SERVER}/v1/gofundme/votes/${userId}`,
                    {},
                    {
                        headers: {
                            //Authorization: `Bearer ${token}`
                        },
                    }
                )
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getGofundmeVotes(params) {
        return new Promise((resolve, reject) => {
            let { userId } = params
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/gofundme/votes/${userId}`, {
                    headers: {
                        //Authorization: `Bearer ${token}`
                    },
                })
                .then((response) => {
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async postPoll(params) {
        const token = await this.$auth.getTokenSilently()
        return new Promise((resolve, reject) => {
            const { userId, name, value } = params
            axiosCache
                .post(
                    `${process.env.VUE_APP_API_SERVER}/v1/polls`,
                    {
                        name,
                        userId,
                        polleeId: this.$auth.user.sub,
                        value,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then((response) => {
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getPoll(params) {
        return new Promise((resolve, reject) => {
            let { userId, name } = params
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/polls/${name}/${userId}`)
                .then((response) => {
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async search(params) {
        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/users/search`, {
                    headers: {},
                    params,
                })
                .then((response) => {
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async buildInfo() {
        return new Promise((resolve, reject) => {
            axiosCache
                .get(`${window.origin}/build-info.json`, {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0',
                    },
                })
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
    async getStats(params = {}) {
        return new Promise((resolve, reject) => {
            let { name } = params
            axiosCache
                .get(`${process.env.VUE_APP_API_SERVER}/v1/stats/${name ? name : ''}`)
                .then((response) => {
                    resolve(response.data.results)
                })
                .catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    }
}

export default (auth) => new BackendService(auth)
