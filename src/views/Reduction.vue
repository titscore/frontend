<template>
    <v-container v-bind:style="reductionStyle">
        <v-row v-if="hover && $vuetify.breakpoint.mobile">
            <v-col class="d-flex justify-center pb-0">
                <span class="text-capitalize">Votes</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col lg="3" xs="12" class="d-flex justify-center" align-self="center" id="before-column">
                <v-container v-if="hover">
                    <v-row v-if="!$vuetify.breakpoint.mobile">
                        <v-col class="d-flex justify-center" align-self="center">
                            <span class="text-capitalize">Votes</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <number
                                v-bind:class="voteClass('before')"
                                class="text-h1"
                                ref="before-counter"
                                :from="0"
                                :to="beforeCount"
                                easing="Power4.easeOut"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <span class="font-italic caption">Large Breasts</span>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container v-if="hover && $vuetify.breakpoint.mobile">
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <number
                                v-bind:class="voteClass('after')"
                                class="text-h1"
                                ref="after-counter"
                                :from="0"
                                :to="afterCount"
                                easing="Power4.easeOut"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <span class="font-italic caption">Small Breasts</span>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
            <v-col lg="6" xs="12" align-self="center">
                <v-card :loading="progress['profileCard']" shaped :outlined="user.delete && admin ? true : false" class="pt-4 my-auto">
                    <template slot="progress">
                        <v-progress-circular class="profile-progress" color="red" size="200" width="10" indeterminate></v-progress-circular>
                    </template>
                    <v-container class="mb-4">
                        <router-link :to="{ path: `/profile/${user.id}`, props: { userId: user.id } }">
                            <v-img
                                class="mx-auto"
                                v-show="$route.name === 'reduction' ? !hover : true"
                                ref="profile-img"
                                contain
                                @mouseover="hover = true"
                                :src="processedReductionImage ? processedReductionImage : 'https://picsum.photos/id/497/1080/1080'"
                                lazy-src="https://picsum.photos/id/497/1080/1080"
                                ><template v-slot:placeholder>
                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                    </v-row> </template
                            ></v-img>
                        </router-link>
                        <span id="labels">
                            <span id="carousel-image-index" class="caption font-weight-light" v-if="user.aftermath"
                                ><span v-if="$route.name === 'reduction'">{{ carousel + 1 }}/</span>{{ user.aftermath.length }}
                            </span>
                            <sup v-if="admin && (user.delete || user.reduction)" class="ml-2">(</sup>
                            <span class="caption text-capitalize font-weight-light red--text text--accent-4">
                                <sup id="delete-label" v-if="admin && user.delete">
                                    deletion
                                </sup>
                                <sup v-if="admin && user.delete && user.reduction">,</sup>
                                <sup id="reduction-label" v-if="admin && user.reduction">
                                    reduction
                                </sup>
                            </span>
                            <sup v-if="admin && (user.delete || user.reduction)">)</sup>
                        </span>
                        <v-carousel
                            v-if="$route.name === 'reduction' && user.aftermath"
                            v-show="hover"
                            v-model="carousel"
                            hide-delimiters
                            hide-delimiter-background
                            @change="carouselChange"
                            :show-arrows="!$vuetify.breakpoint.mobile"
                        >
                            <v-carousel-item @contextmenu="photoContextMenuHandler" v-for="(aftermath, name, i) in user.aftermath" :key="i">
                                <photo-context-menu :admin="admin" :user="user" :index="i" :ref="`photoContextMenu-${i}`">
                                    <v-img
                                        contain
                                        :ref="`carousel-img-${aftermath.composite}`"
                                        :src="aftermath.composite"
                                        :max-height="aftermath.composite === '/bra-repair-replacement.jpg' ? 200 : 800"
                                        :max-width="aftermath.composite === '/bra-repair-replacement.jpg' ? 200 : undefined"
                                        lazy-src="https://picsum.photos/id/497/1080/1080"
                                    >
                                        <template v-slot:placeholder>
                                            <v-row class="fill-height ma-0" align="center" justify="center">
                                                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                            </v-row>
                                        </template>
                                    </v-img>
                                </photo-context-menu>
                            </v-carousel-item>
                        </v-carousel>
                        <link v-for="image of getUnCachedForwardImageUrls()" rel="preload" as="image" :href="image" v-bind:key="image" />
                    </v-container>
                    <v-card-actions class="justify-center">
                        <v-row>
                            <v-spacer></v-spacer>
                            <v-col cols="10" class="d-flex justify-center" id="user-buttons">
                                <v-tooltip top nudge-bottom="30" :disabled="pollButtonDebounce || alerts.signup">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-container v-on="on" v-bind="attrs" color="primary" fluid>
                                            <v-radio-group
                                                v-if="hover"
                                                @change="pollButtonHandler($event, 'reduction')"
                                                v-model="pollAnswers[carousel].reduction"
                                                dense
                                                row
                                            >
                                                <v-radio
                                                    on-icon="fas fa-check"
                                                    :off-icon="pollAnswers[carousel].reduction ? 'fas fa-times' : 'far fa-square'"
                                                    value="before"
                                                >
                                                    <template v-slot:label>
                                                        <span class="text-capitalize font-italic font-weight-light"><b>before</b></span>
                                                    </template>
                                                </v-radio>
                                                <v-radio
                                                    on-icon="fas fa-check"
                                                    :off-icon="pollAnswers[carousel].reduction ? 'fas fa-times' : 'far fa-square'"
                                                    value="after"
                                                >
                                                    <template v-slot:label>
                                                        <span class="text-capitalize font-italic font-weight-light"><b>after</b></span>
                                                    </template>
                                                </v-radio>
                                            </v-radio-group>
                                            <v-progress-linear :active="progress.poll" indeterminate></v-progress-linear>
                                            <v-alert :prominent="!$vuetify.breakpoint.mobile" :value="alerts.signup" type="info" :class="$vuetify.breakpoint.mobile ? 'signup-alert-mobile' : 'signup-alert'" >
                                                <v-row align="center">
                                                    <v-col class="grow">
                                                        <span :class="$vuetify.breakpoint.mobile ? 'caption' : undefined"
                                                            >Thanks for your vote!
                                                            <p>Signup to have your vote counted and access other features.</p></span
                                                        >
                                                        <v-btn v-if="$vuetify.breakpoint.mobile" x-small @click="login(true)">Signup</v-btn>
                                                    </v-col>
                                                    <v-col v-if="!$vuetify.breakpoint.mobile" class="shrink d-flex flex-column">
                                                        <v-btn @click="login(true)">Free Signup</v-btn>
                                                    </v-col>
                                                </v-row>
                                            </v-alert>
                                        </v-container>
                                    </template>
                                    {{ label }}
                                </v-tooltip>
                            </v-col>
                            <v-col cols="1" v-if="admin" id="admin-buttons" class="d-flex justify-end align-self-end">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-speed-dial v-model="adminFab" direction="left">
                                            <template v-slot:activator>
                                                <v-btn v-on="on" v-bind="attrs" v-model="adminFab" x-small fab text class="mx-0">
                                                    <v-icon small v-if="adminFab">
                                                        fa-edit
                                                    </v-icon>
                                                    <v-icon v-else>
                                                        fa-wrench
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <v-tooltip top>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn
                                                        v-on="on"
                                                        v-bind="attrs"
                                                        small
                                                        fab
                                                        text
                                                        :color="!user.delete ? 'red' : ''"
                                                        @click="adminButtonHandler($event, 'delete')"
                                                        class="mx-0"
                                                    >
                                                        <v-icon>fa-trash-alt</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span v-if="!user.delete">Mark Profile for Deletion and Stop Showing</span>
                                                <span v-else>Unmark Profile for Deletion and Start Showing</span>
                                            </v-tooltip>
                                            <v-tooltip top>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn
                                                        v-on="on"
                                                        v-bind="attrs"
                                                        small
                                                        fab
                                                        text
                                                        :color="!user.reduction ? 'red' : ''"
                                                        @click="adminButtonHandler($event, 'reduction')"
                                                        class="mx-0"
                                                    >
                                                        <v-icon>fa-cut</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span v-if="!user.reduction">Mark Profile as a Reduction and Move to oTituaries</span>
                                                <span v-else>Unmark Profile as a Reduction and Remove from oTituaries</span>
                                            </v-tooltip>
                                        </v-speed-dial>
                                    </template>
                                    Admin
                                </v-tooltip>
                            </v-col>
                            <v-col cols="1" v-else></v-col>
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col lg="3" xs="12" class="d-flex justify-center" align-self="center" id="after-column">
                <v-container v-if="hover && !$vuetify.breakpoint.mobile">
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <span class="text-capitalize">Votes</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <number
                                v-bind:class="voteClass('after')"
                                class="text-h1"
                                ref="after-counter"
                                :from="0"
                                :to="afterCount"
                                easing="Power4.easeOut"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex justify-center" align-self="center">
                            <span class="font-italic caption">Small Breasts</span>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>
        <v-row>
            <v-spacer></v-spacer>
            <v-col cols="10">
                <div v-if="active || $route.name === 'reduction'" id="disqus_thread"></div>
                <div v-if="$route.name === 'reduction'" id="postscribe"></div>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
    </v-container>
</template>
<style>
.sv-root-modern .sv-container-modern,
.sv-root-modern .sv-description,
input.sv-text {
    color: white !important;
}
.comment-text {
    text-overflow: ellipsis;
    overflow: hidden;
}
.v-tooltip__content {
    pointer-events: initial !important;
}
.tiktok-link {
    color: white !important;
    text-decoration: none;
}
.commenter-link {
    color: white !important;
    float: right;
    margin-right: 20px;
    text-decoration: none;
}
.gofundme-link {
    color: pink !important;
}
.v-dialog {
    overflow-x: hidden !important;
    overflow-y: hidden !important;
}
#labels {
    position: absolute;
    top: 10px;
}
.profile-progress {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -100px;
    margin-left: -100px;
    z-index: 1;
}
.theme--light.v-sheet--outlined {
    border-color: red;
    border-width: thick;
}
.v-window,
.v-image {
    height: unset !important;
}
div[role='radiogroup'] {
    justify-content: center;
}
.winning-vote {
    color: green;
}
.losing-vote {
    color: red;
}
.signup-alert,
.signup-alert-mobile {
    top: 0%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.signup-alert {
    width: max-content;
}
</style>
<script>
import Vue from 'vue'
import postscribe from 'postscribe'
import PhotoContextMenu from '../components/PhotoContextMenu.vue'
import VueNumber from 'vue-number-animation'

Vue.use(VueNumber)

export default {
    name: 'Profile',
    props: {
        userId: String,
    },
    components: {
        PhotoContextMenu,
    },
    data: function() {
        return {
            processedReductionImage: null,
            adminFab: null,
            breastSupportModal: false,
            previousCarouselImg: null,
            forwardImageUrls: null,
            downloadedForwardImgUrls: {},
            carousel: null,
            hover: null,
            overlay: false,
            reductionStyle: null,
            tiktokId: null,
            active: false,
            loaded: false,
            user: {
                tiktokPhoto: null,
            },
            brasize: {
                actual: undefined,
                polled: undefined,
            },
            username: {
                first: null,
                firstPlural: null,
                last: null,
                nickname: null,
            },
            stats: null,
            users: null,
            color1: null,
            color2: null,
            color3: null,
            progress: {
                profileCard: false,
                poll: false,
            },
            polls: {
                reduction: null,
            },
            pollAnswers: {},
            pollResults: {
                reduction: null,
            },
            rawPollResults: {
                reduction: null,
            },
            pollButtonDebounce: false,
            update: false,
            alerts: {
                signup: false,
            },
        }
    },
    methods: {
        voteClass: function(boa) {
            if (this.beforeCount === this.afterCount) {
                return undefined
            } else if (boa === 'before') {
                return this.beforeCount > this.afterCount ? 'winning-vote' : 'losing-vote' 
            } else if (boa === 'after') {
                return this.beforeCount < this.afterCount ? 'winning-vote' : 'losing-vote' 
            }
        },
        login: function(signup = false) {
            this.$auth.loginWithRedirect({
                screen_hint: signup ? 'signup' : '',
            })
        },
        adminButtonHandler: function(event, action) {
            const self = this
            event
            self.progress.profileCard = true
            let params
            switch (action) {
                case 'delete':
                    params = { delete: !self.user.delete }
                    break
                case 'reduction':
                    params = { reduction: !self.user.reduction ? new Date().toLocaleDateString() : undefined }
                    break
            }
            self.$backend
                .updateUser({
                    userId: self.user.id,
                    params,
                })
                .then((response) => {
                    setTimeout(() => {
                        self.$set(self, 'user', response.data)
                        self.progress.profileCard = false
                    }, 500)
                })
                .catch((error) => {
                    error
                    setTimeout(() => {
                        self.progress.profileCard = false
                    }, 500)
                })
        },
        updateLocalPollAnswer: function(poll, value) {
            const self = this
            const myPollAnswer = self.rawPollResults[poll]
                ? self.rawPollResults[poll]
                      .filter((result) => result.name === poll)
                      .filter((result) => result.value.photo === value.photo)
                      .find((result) => result.pollee === self.$auth.user.sub)
                : undefined
            if (myPollAnswer && myPollAnswer.value) {
                self.$set(self.pollAnswers, [self.carousel][poll], myPollAnswer.value.before == 1 ? 'before' : 'after')
            } else {
                self.$set(self.pollAnswers, [self.carousel][poll], value.before == 1 ? 'before' : 'after')
            }
        },
        pollButtonHandler: function(value, name) {
            const self = this
            let params
            if (!this.$auth.isAuthenticated) {
                self.pollButtonDebounce = true
                setTimeout(() => {
                    self.alerts.signup = true
                    self.pollButtonDebounce = true
                }, 500)
                return
            } else {
                self.pollButtonDebounce = true
                setTimeout(() => (self.pollButtonDebounce = false), 3000)
                self.progress.poll = true
                switch (name) {
                    case 'reduction':
                        params = {
                            name,
                            userId: self.user.id,
                            value: {
                                photo: self.user.aftermath[self.carousel].compositeFilename,
                                before: value === 'before' ? 1 : 0,
                            },
                        }
                        break
                }
            }
            self.$backend
                .postPoll(params)
                .then((pollResults) => {
                    self.updateRawPollResults(pollResults.value.before)
                    self.updateLocalPollAnswer(name, pollResults.value)
                    setTimeout(() => {
                        const pollResultObjectName = self.user.aftermath[self.carousel].compositeFilename
                        if (!self.pollResults.reduction) self.pollResults.reduction = {}
                        if (!self.pollResults.reduction[pollResultObjectName]) self.pollResults.reduction[pollResultObjectName] = { before: 0, after: 0 }
                        if (pollResults.value.before == 1) {
                            self.$set(self.pollResults.reduction[pollResultObjectName], 'before', self.pollResults.reduction[pollResultObjectName].before + 1)
                            if (self.update) {
                                self.update = false
                                const pollCount =
                                    self.pollResults.reduction[pollResultObjectName].after -
                                    1 /* I think there's a bug that caused count to be negative, thus this fix */
                                self.$set(self.pollResults.reduction[pollResultObjectName], 'after', pollCount >= 0 ? pollCount : 0)
                            }
                        } else {
                            self.$set(self.pollResults.reduction[pollResultObjectName], 'after', self.pollResults.reduction[pollResultObjectName].after + 1)
                            if (self.update) {
                                self.update = false
                                self.$set(
                                    self.pollResults.reduction[pollResultObjectName],
                                    'before',
                                    self.pollResults.reduction[pollResultObjectName].before - 1
                                )
                            }
                        }
                        self.progress.poll = false
                    }, 500)
                })
                .catch((error) => {
                    error
                    setTimeout(() => {
                        self.progress.poll = false
                    }, 500)
                })
        },
        updateRawPollResults: function(value) {
            const rawPollResultsIndex = this.rawPollResults['reduction']
                .filter((result) => result.name === 'reduction')
                .filter((result) => result.value.photo === this.user.aftermath[this.carousel].compositeFilename)
                .findIndex((result) => result.pollee === this.$auth.user.sub)
            if (rawPollResultsIndex === -1) {
                this.$set(this.rawPollResults['reduction'], this.rawPollResults['reduction'].length, {
                    name: 'reduction',
                    pollee: this.$auth.user.sub,
                    value: {
                        before: value,
                        photo: this.user.aftermath[this.carousel].compositeFilename,
                    },
                })
            } else {
                this.update = true
                this.rawPollResults['reduction'][rawPollResultsIndex].value.before = value
            }
        },
        photoContextMenuHandler: function(event) {
            this.$refs[`photoContextMenu-${this.carousel}`][0].show(event)
        },
        getForwardImageUrls: function(currentIndex, howMany) {
            let self = this
            if (!self.user) return
            let indexes = []
            for (let i = 0; i < howMany; i++) {
                let index
                if (currentIndex + 1 >= self.user.aftermath.length) {
                    index = 0
                } else {
                    index = currentIndex + 1
                }
                indexes.push(self.user.aftermath[index].composite)
                currentIndex++
            }
            return indexes
        },
        getUnCachedForwardImageUrls: function() {
            let self = this
            if (!self.forwardImageUrls) return
            return self.forwardImageUrls
                .map((url) => {
                    if (!self.downloadedForwardImgUrls[url]) {
                        self.downloadedForwardImgUrls[url] = true
                        return url
                    }
                })
                .filter((url) => url)
        },
        carouselChange: function(index) {
            const self = this
            self.alerts.signup = false
            self.forwardImageUrls = self.getForwardImageUrls(index, 3)

            const myPollAnswer = self.rawPollResults['reduction']
                ? self.rawPollResults['reduction']
                      .filter((result) => result.name === 'reduction')
                      .filter((result) => result.value.photo === self.user.aftermath[index].compositeFilename)
                      .find((result) => result.pollee === self.$auth.user.sub)
                : undefined
            if (myPollAnswer && myPollAnswer.value) {
                self.$set(self.pollAnswers[self.carousel], 'reduction', myPollAnswer.value.before == 1 ? 'before' : 'after')
            } else {
                self.$set(self.pollAnswers[self.carousel], 'reduction', undefined)
            }
        },
        disqusReset: function(newIdentifier, newUrl, newTitle, newLanguage = 'en') {
            this.$emit('disqusReset', { newIdentifier, newUrl, newTitle, newLanguage })
            //window.reset(newIdentifier, newUrl, newTitle, newLanguage)
        },
        activate: function() {
            this.active = true
        },
        deactivate: function() {
            this.active = false
        },
        parseUsername: function(username) {
            username = username.match(/(.*)\s\((.*)\)\s(.*)/)
            let first = username[1],
                firstPlural = username[1].endsWith('s') ? `${username[1]}'` : `${username[1]}'s`,
                last = username[3],
                nickname = username[2]
            return { first, firstPlural, last, nickname }
        },
        removeDuplicateDays(stats) {
            stats.data.results = stats.data.results.filter((result, index, results) => {
                if (index === 0) return result
                let lastDayMonth = new Date(results[index - 1].updatedAt)
                    .toLocaleString()
                    .split(',')[0]
                    .split('/')
                    .splice(0, 2)
                    .join('/')
                let dayMonth = new Date(result.updatedAt)
                    .toLocaleString()
                    .split(',')[0]
                    .split('/')
                    .splice(0, 2)
                    .join('/')
                if (lastDayMonth !== dayMonth) return result
            })
            return stats
        },
        playCountersAnimations() {
            if (this.$refs['before-counter']) {
                this.$refs['before-counter'].restart()
            }
            if (this.$refs['after-counter']) {
                this.$refs['after-counter'].restart()
            }
        },
    },
    computed: {
        origin: () => window.location.origin,
        admin() {
            return this.$cookies.get('__secure-admin') === 'true'
        },
        highlyRated() {
            if (!this.user || !this.user.videoMetas) return false
            return this.user.videoMetas.find((videoMeta) => videoMeta.imageHighlyRated) ? true : false
        },
        label: function() {
            return this.pollAnswers && this.pollAnswers[this.carousel] && this.pollAnswers[this.carousel].reduction && !this.pollButtonDebounce
                ? `Looks like you've chosen... however, you can always update your answer anytime.`
                : 'Which photo do you prefer?'
        },
        beforeCount: function() {
            return this.user.aftermath &&
                this.user.aftermath[this.carousel] &&
                this.user.aftermath[this.carousel].compositeFilename &&
                this.pollResults.reduction &&
                this.pollResults.reduction[this.user.aftermath[this.carousel].compositeFilename].before
                ? this.pollResults.reduction[this.user.aftermath[this.carousel].compositeFilename].before
                : 0
        },
        afterCount: function() {
            return this.user.aftermath &&
                this.user.aftermath[this.carousel] &&
                this.user.aftermath[this.carousel].compositeFilename &&
                this.pollResults.reduction &&
                this.pollResults.reduction[this.user.aftermath[this.carousel].compositeFilename].after
                ? this.pollResults.reduction[this.user.aftermath[this.carousel].compositeFilename].after
                : 0
        },
    },
    mounted() {
        let self = this
        let userId = self.userId || self.$route.query.userId || self.$route.params.userId
        self.tiktokId = self.$route.params.tiktokId || self.$route.query.tiktokId
        const backendCall = self.$backend
            .getUser({ userId, tiktokId: self.tiktokId })
            .then((response) => {
                self.user = response.data
                self.pollAnswers = Object.keys(self.user.aftermath).map((key) => ({ [key]: {} }))
                self.user.videoMetas = self.user.videoMetas.filter((meta) => meta.image).filter((meta) => meta.image.match(/https?:\/\/owncloud/))
                self.processedReductionImage = self.user.videoMetas.find((videoMeta) => videoMeta.processedReductionImage).processedReductionImage
                self.username = self.parseUsername(self.user.username)
                self.user.aftermath = Object.values(self.user.aftermath)
                    .filter((aftermath) => aftermath.compositeFilename)
                    .map((aftermath) => ({ composite: aftermath.composite, compositeFilename: aftermath.compositeFilename }))
            })
            .then(async () => {
                let requests = [{ stats: await self.$backend.getUserStats({ socialNetwork: 'tiktok', userId: self.user.tiktokId }) }]
                requests = requests.reduce((acc, cur) => {
                    acc[Object.keys(cur)[0]] = Object.values(cur)[0]
                    return acc
                }, {})
                return requests
            })
            .then((responses) => {
                const stats = this.removeDuplicateDays(responses.stats)
                self.$set(self, 'stats', stats.data.results)
                let data = stats.data.results.map((data) => ({
                    x: data.updatedAt,
                    following: data.stats.following || 0,
                    followers: data.stats.followers || 0,
                    likes: data.stats.likes || 0,
                    videos: data.stats.videos || 0,
                }))
                if (data.length == 0) return {}
                self.loaded = true
            })
        Promise.all([
            backendCall,
            self.$backend.getPoll({ userId, name: 'reduction' }),
            new Promise((resolve) => {
                setInterval(() => {
                    if (self.$auth && !self.$auth.loading) resolve()
                }, 500)
            }),
        ])
            .then((promises) => {
                let pollResults = promises.filter((promise) => promise)[0]
                self.rawPollResults['reduction'] = Array.from(pollResults)
                if (!self.rawPollResults['reduction']) return
                const myPollAnswer = self.rawPollResults['reduction']
                    .filter((result) => result.name === 'reduction')
                    .filter((result) => result.value.photo === self.user.aftermath[self.carousel].compositeFilename)
                    .find((result) => result.pollee === self.$auth.user.sub)
                if (myPollAnswer && myPollAnswer.value) {
                    self.$set(self.pollAnswers[self.carousel], 'reduction', myPollAnswer.value.before == 1 ? 'before' : 'after')
                } else {
                    self.$set(self.pollAnswers[self.carousel], 'reduction', undefined)
                }
                pollResults = pollResults.reduce((acc, cur) => {
                    const { name } = cur
                    cur = cur.value
                    if (!acc[name]) {
                        acc[name] = {}
                    }
                    if (!acc[name][cur.photo]) {
                        acc[name][cur.photo] = {}
                    }
                    if (!acc[name][cur.photo].before) {
                        acc[name][cur.photo].before = 0
                    }
                    if (!acc[name][cur.photo].after) {
                        acc[name][cur.photo].after = 0
                    }
                    if (cur.before == 0) acc[name][cur.photo].after++
                    else acc[name][cur.photo].before++
                    return acc
                }, {})
                self.$set(self, 'pollResults', pollResults)
                setTimeout(self.playCountersAnimations, 500)
            })
            .catch((error) => {
                error
                console.error(error)
            })
        if (this.$route.name === 'reduction')
            postscribe(
                '#postscribe',
                `
<script>
/**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = "${self.origin}/reduction/${self.user.id}";  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = "${self.user.id}"; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    this.page.title = "${self.user.username} aka @${self.user.tiktokId} on tiktok";
    };
    */
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://titscore-com.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
<\/script>
`
            )
    },
}
</script>
