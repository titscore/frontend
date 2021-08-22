<template>
    <v-container v-bind:style="profileStyle">
        <v-row>
            <v-spacer></v-spacer>
            <v-col lg="3" xs="auto" align-self="center"></v-col>
            <v-col lg="4" xs="12" align-self="center">
                <v-card :loading="progress['profileCard']" shaped :outlined="user.delete ? true : false" class="pt-4 my-auto">
                    <template slot="progress">
                        <v-progress-circular class="profile-progress" color="red" size="200" width="10" indeterminate></v-progress-circular>
                    </template>
                    <v-container style="max-height: 350px" class="mb-4">
                        <router-link :to="{ path: `/profile/${user.id}`, props: { userId: user.id } }">
                            <v-img
                                class="mx-auto"
                                v-show="$route.name === 'profile' ? !hover : true"
                                max-height="350"
                                ref="profile-img"
                                contain
                                @mouseover="hover = true"
                                :src="user.tiktokPhoto ? user.tiktokPhoto : 'https://picsum.photos/id/497/1080/1080'"
                                lazy-src="https://picsum.photos/id/497/1080/1080"
                                ><template v-slot:placeholder>
                                    <v-row class="fill-height ma-0" align="center" justify="center">
                                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                    </v-row> </template
                            ></v-img>
                        </router-link>
                        <span id="labels">
                            <span id="carousel-image-index" class="caption font-weight-light" v-if="user.videoMetas"
                                ><span v-if="$route.name === 'profile'">{{ carousel + 1 }}/</span>{{ user.videoMetas.length }}
                                <sup v-if="user.videoMetas[carousel] && user.videoMetas[carousel].imageHighlyRated"><v-icon x-small>fa-star</v-icon></sup>
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
                            v-if="$route.name === 'profile' && user.videoMetas"
                            max-height="350"
                            v-show="hover"
                            v-model="carousel"
                            hide-delimiters
                            hide-delimiter-background
                            @change="carouselChange"
                            :show-arrows="!$vuetify.breakpoint.mobile"
                        >
                            <!--<template v-slot:prev="{ on, attrs }">
                                <v-img contain max-width="150" :src="previousCarouselImg" v-bind="attrs" v-on="on"></v-img>
                            </template>-->

                            <v-carousel-item
                                @contextmenu="photoContextMenuHandler"
                                transition="fade-transition"
                                v-for="(videoMeta, i) in user.videoMetas"
                                :key="videoMeta._id"
                            >
                                <photo-context-menu :admin="admin" :user="user" :index="i" :ref="`photoContextMenu-${i}`">
                                    <a :href="videoMeta.url" target="_blank">
                                        <v-img contain max-height="350" :ref="`carousel-img${i}`" :src="videoMeta.image">
                                            <template v-slot:placeholder>
                                                <v-row class="fill-height ma-0" align="center" justify="center">
                                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                                </v-row>
                                            </template>
                                        </v-img>
                                    </a>
                                </photo-context-menu>
                            </v-carousel-item>
                        </v-carousel>
                        <link v-for="image of getUnCachedForwardImageUrls()" rel="preload" as="image" :href="image" v-bind:key="image" />
                    </v-container>
                    <v-list-item id="stats-area" three-line>
                        <v-list-item-content>
                            <v-container>
                                <v-row>
                                    <v-col class="pa-0 overline" cols="auto" id="brasize-label">Bra:</v-col>
                                    <v-col class="pa-0 ml-1" style="line-height: 1.8; white-space: nowrap;"
                                        ><v-tooltip :disabled="brasize.polled !== undefined" v-if="surveys.length > 0" top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <span @mouseover="surveyFab = true" v-on="on" v-bind:attrs="attrs" class="font-weight-light"
                                                    >{{ brasize && brasize.actual ? brasize.actual : 'real size uknown'
                                                    }}<sup v-if="brasize && brasize.polled"
                                                        ><i> (vs {{ brasize.polled.band }}{{ brasize.polled.cup.toUpperCase() }} polled)</i></sup
                                                    ></span
                                                > </template
                                            >Be the first to take the bra size survey!</v-tooltip
                                        >
                                        <span class="font-weight-light" v-else>
                                            {{ brasize && brasize.actual ? brasize.actual : 'real size uknown'
                                            }}<sup v-if="brasize && brasize.polled"
                                                ><i> (vs {{ brasize.polled.band }}{{ brasize.polled.cup.toUpperCase() }} polled)</i></sup
                                            ></span
                                        >
                                    </v-col>
                                    <v-spacer></v-spacer>
                                    <v-col class="d-flex justify-end">
                                        <v-tooltip v-if="highlyRated" top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-icon :x-small="$vuetify.breakpoint.mobile" v-on="on" v-bind:attrs="attrs" color="amber">fas fa-th</v-icon>
                                            </template>
                                            On The Grid!
                                        </v-tooltip>
                                    </v-col>
                                </v-row>
                            </v-container>
                            <v-list-item-title class="headline-1 mb-1">
                                <router-link style="text-decoration: none;" :to="{ path: `/profile/${user.id}`, props: { userId: user.id } }">
                                    {{ username.first }} <span class="font-italic font-weight-light">({{ username.nickname }})</span> {{ username.last
                                    }}<v-icon class="ml-2" small>fa-user</v-icon>
                                </router-link>
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                <v-row v-if="sentiments && sentiments.stats" class="d-flex flex-column">
                                    <v-col class="pb-0"></v-col>
                                    <v-col class="pb-0" cols="auto">
                                        <v-chip v-for="(stat, name) in sentiments.stats" v-bind:key="name" outlined class="mb-1"
                                            ><v-avatar left><v-icon small class="ml-2">fa-thermometer-half</v-icon></v-avatar
                                            ><span class="font-italic">{{ stat.description }}:</span
                                            ><b class="ml-2">{{ stat.value.toLocaleString() }}</b></v-chip
                                        >
                                    </v-col>
                                </v-row>
                                <v-row v-if="parsedComments && parsedComments.highestSentimentComment" class="d-flex flex-column">
                                    <v-col class="py-0"></v-col>
                                    <v-col class="py-0" cols="auto">
                                        <v-tooltip ref="highestSentimentTooltip" open-on-click :open-on-hover="false" top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-chip v-on="on" v-bind:attrs="attrs" outlined class="mb-1">
                                                    <v-avatar left
                                                        ><v-icon small class="ml-2">{{ getAwardIcon('highestSentimentComment') }}</v-icon></v-avatar
                                                    >
                                                    <span class="font-italic">{{ parsedComments.highestSentimentComment.description }}:</span>
                                                    <span class="ml-2 font-weight-light comment-text">{{
                                                        parsedComments.highestSentimentComment.comment.text
                                                    }}</span>
                                                </v-chip>
                                            </template>
                                            <div @mouseleave="$refs.highestSentimentTooltip.isActive = false">
                                                <span
                                                    ><a
                                                        class="tiktok-link"
                                                        :href="
                                                            `https://www.tiktok.com/@${user.tiktokId}/video/${parsedComments.highestSentimentComment.comment.videoId}?is_copy_url=1&is_from_webapp=v1`
                                                        "
                                                        ><v-icon small dark class="mx-2">fab fa-tiktok</v-icon>On TikTok</a
                                                    ></span
                                                ><br />
                                                <span
                                                    ><span class="font-italic font-weight-light body-1"
                                                        >{{ parsedComments.highestSentimentComment.comment.text }}<br /><a
                                                            class="commenter-link"
                                                            :href="`https://tiktok.com/@${parsedComments.highestSentimentComment.comment.commenter}`"
                                                            target="_blank"
                                                        >
                                                            @{{ parsedComments.highestSentimentComment.comment.commenter }}</a
                                                        ></span
                                                    >
                                                </span>
                                            </div>
                                        </v-tooltip>
                                    </v-col>
                                </v-row>
                                <v-row v-if="commentTopics && commentTopics.sizes && commentTopics.sizes.length > 0"> </v-row>
                                <v-row v-if="commentTopics && commentTopics.reduction && commentTopics.reduction.length > 0">
                                    <v-col class="pt-0">
                                        <v-tooltip v-if="!user.reduction" ref="gofundmetooltip" content-class="tooltip-mouse" :open-on-hover="false" top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-chip v-on="on" v-bind:attrs="attrs" outlined class="mb-1"
                                                    ><v-avatar left><v-icon small class="ml-2">fa-exclamation</v-icon></v-avatar>
                                                    <span class="font-italic">Reduction Risk:</span><b class="ml-2">{{ commentTopics.reduction.length }}</b
                                                    ><v-icon small class="ml-2"></v-icon>
                                                    <sup
                                                        >(<span class="gofundme-link mr-1">GoFundMe:</span
                                                        ><span class="font-weight-bold caption">{{ gofundmeVotes }}</span> votes!)</sup
                                                    >
                                                </v-chip>
                                            </template>
                                            <span @mouseleave="$refs.gofundmetooltip.isActive = false" class="font-weight-light body-1"
                                                >Donate to Her Breast Support<sup
                                                    ><!--<a
                                                        class="font-italic pink--text text--lighten-5"
                                                        style="text-decoration: none;"
                                                        @click="breastSupportModal = true"
                                                        >(What?)</a
                                                    >-->
                                                    <router-link to="/faq" class="font-italic pink--text text--lighten-5" style="text-decoration: none;"
                                                        >(What?)</router-link
                                                    >
                                                </sup>
                                                <a v-if="user.gofundme" class="gofundme-link ml-2" :href="`${user.gofundme}`" target="_blank">GoFundMe</a>
                                                <a v-else class="gofundme-link ml-2" @click="gofundmeVote"
                                                    >Click to vote for starting a GoFundMe for {{ username.first }}</a
                                                >
                                            </span>
                                        </v-tooltip>
                                        <v-chip v-else outlined color="red" class="mb-1"
                                            ><v-avatar left><v-icon small class="ml-2">fa-exclamation</v-icon></v-avatar>
                                            <span class="font-italic">Reduction:</span
                                            ><b class="ml-2">{{
                                                new Date(user.reduction)
                                                    .toLocaleString()
                                                    .split(',')[0]
                                                    .split('/')
                                                    .splice(0, 3)
                                                    .join('/')
                                            }}</b
                                            ><v-icon small class="ml-2"></v-icon
                                        ></v-chip>
                                        <v-overlay opacity="0.7" :value="breastSupportModal" :style="overlay ? 'backdrop-filter: blur(6px)' : ''">
                                            <v-container>
                                                <v-row>
                                                    <v-col class="d-flex justify-end">
                                                        <div @click="breastSupportModal = false" style="cursor: pointer">X</div>
                                                    </v-col>
                                                </v-row>
                                                <v-row>
                                                    <v-col>
                                                        <div id="breastSupportContainer"></div>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-overlay>
                                    </v-col>
                                </v-row>
                                <v-row v-if="awards.length > 0" class="d-flex flex-column">
                                    <v-col></v-col>
                                    <v-col cols="auto">
                                        <v-chip v-for="award in awards" v-bind:key="award.id" outlined class="mb-1"
                                            ><v-avatar :color="getAwardColor(award.rank)" left
                                                >{{ award.rank }}<sup>{{ getAbbreviation(award.rank) }}</sup></v-avatar
                                            ><span class="font-italic">{{ award.description }}:</span><b class="ml-2">{{ award.value.toLocaleString() }}</b
                                            ><v-icon small class="ml-2">{{ getAwardIcon(award.name) }}</v-icon></v-chip
                                        >
                                        <!--
                                        <v-chip outlined class="mb-1"
                                            ><v-avatar :color="getAwardColor(2)" left>{{ 2 }}<sup>{{ getAbbreviation(2) }}</sup></v-avatar><span class="font-italic">silver test:</span><b class="ml-2">{{ Number(1000000).toLocaleString() }}</b><v-icon small class="ml-2"
                                                >{{getAwardIcon('biggestBreastsGuessed')}}</v-icon
                                            ></v-chip
                                        >
                                        <v-chip outlined class="mb-1"
                                            ><v-avatar :color="getAwardColor(3)" left>{{ 3 }}<sup>{{ getAbbreviation(3) }}</sup></v-avatar><span class="font-italic">bronze test:</span><b class="ml-2">{{ Number(100000).toLocaleString() }}</b><v-icon small class="ml-2"
                                                >{{getAwardIcon('biggestBreastsConfirmed')}}</v-icon
                                            ></v-chip
                                        >-->
                                    </v-col>
                                </v-row>
                                <v-row class="pt-2"></v-row>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-card-actions class="justify-center">
                        <v-row>
                            <v-spacer></v-spacer>
                            <v-col cols="6" class="d-flex justify-center" id="user-buttons">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            class="mx-1"
                                            v-show="$route.name !== 'profile'"
                                            fab
                                            outlined
                                            x-small
                                            v-on="on"
                                            v-bind="attrs"
                                            color="primary"
                                            @click="
                                                disqusReset(user.id, `${origin}/profile/${user.id}`, `${user.username} aka @${user.tiktokId} on tiktok`, null)
                                            "
                                        >
                                            <v-icon dark>
                                                fa-comment
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    Comments
                                </v-tooltip>
                                <v-tooltip v-if="surveys.length > 0" top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-speed-dial v-model="surveyFab" direction="right">
                                            <template v-slot:activator>
                                                <v-btn v-on="on" v-bind="attrs" v-model="surveyFab" outlined x-small fab class="mx-1">
                                                    <v-icon small v-if="surveyFab">
                                                        fa-edit
                                                    </v-icon>
                                                    <v-icon v-else>
                                                        fa-tasks
                                                    </v-icon>
                                                </v-btn>
                                            </template>
                                            <v-btn fab outlined small :color="color3" @click="overlay = true">
                                                size
                                            </v-btn>
                                            <v-btn v-if="false" fab dark small color="indigo">
                                                <v-icon>mdi-plus</v-icon>
                                            </v-btn>
                                            <v-btn v-if="false" fab dark small :color="!user.delete ? 'red' : ''">
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </v-speed-dial>
                                    </template>
                                    Surveys
                                </v-tooltip>
                                <v-overlay opacity="0.7" :value="overlay" :style="overlay ? 'backdrop-filter: blur(6px)' : ''">
                                    <v-container>
                                        <v-row>
                                            <v-col class="d-flex justify-end">
                                                <div @click="overlay = false" style="cursor: pointer">X</div>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <div id="surveyContainer"><survey :survey="surveyModel"></survey></div>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-overlay>
                            </v-col>
                            <v-col cols="3" v-if="admin" id="admin-buttons" class="d-flex justify-end">
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
                            <v-col cols="3" v-else></v-col>
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col lg="4" xs="12">
                <v-card shaped class="mx-auto my-auto">
                    <template slot="progress">
                        <v-progress-linear color="deep-purple" height="10" indeterminate></v-progress-linear>
                    </template>
                    <v-card-title>
                        <a target="_blank" :href="`https://tiktok.com/@${user.tiktokId}`" style="text-decoration: none;">
                            <v-icon small>fab fa-tiktok</v-icon>
                            <span class="subtitle-1">@{{ user.tiktokId }}</span>
                        </a>
                    </v-card-title>
                    <v-card-text>
                        <line-chart :width="400" v-if="loaded" :chart-data="chartdata" :options="chartOptions"></line-chart>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
        <v-row>
            <v-spacer></v-spacer>
            <v-col cols="10">
                <div v-if="active || $route.name === 'profile'" id="disqus_thread"></div>
                <div v-if="$route.name === 'profile'" id="postscribe"></div>
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
</style>
<script>
import postscribe from 'postscribe'
import LineChart from './LineChart.js'
import * as Vibrant from 'node-vibrant'
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import * as SurveyVue from 'survey-vue'
import PhotoContextMenu from './PhotoContextMenu.vue'
import { format } from 'd3-format'

Vue.use(VueCookies)

const Survey = SurveyVue.Survey
Survey.cssType = 'modern'

export default {
    name: 'Profile',
    props: {
        userId: String,
    },
    components: {
        LineChart,
        Survey,
        PhotoContextMenu,
    },
    data: function() {
        return {
            //highlyRated: false,
            adminFab: null,
            breastSupportModal: false,
            parsedComments: null,
            previousCarouselImg: null,
            forwardImageUrls: null,
            downloadedForwardImgUrls: {},
            carousel: null,
            hover: null,
            completedSurveys: null,
            surveys: ['brasize'],
            overlay: false,
            surveyFab: null,
            surveyModel: null,
            comments: {
                tiktok: null,
            },
            profileStyle: null,
            pointRadiusChanged: {},
            tiktokId: null,
            active: false,
            chartdata: null,
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
            sentiments: null,
            stats: null,
            users: null,
            awards: {},
            titscore: {
                complain: 0.1,
                realistic: 0.1,
                proreduction: 0.1,
                antireduction: 0.1,
                onlyfans: 0,
                verified: 1,
            },
            commentTopics: null,
            color1: null,
            color2: null,
            color3: null,
            gofundmeVotes: 0,
            progress: {
                profileCard: false,
            },
        }
    },
    methods: {
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
        photoContextMenuHandler: function(event) {
            this.$refs[`photoContextMenu-${this.carousel}`][0].show(event)
        },
        getForwardImageUrls: function(currentIndex, howMany) {
            let self = this
            if (!self.user) return
            let indexes = []
            for (let i = 0; i < howMany; i++) {
                let index
                if (currentIndex + 1 >= self.user.videoMetas.length) {
                    index = 0
                } else {
                    index = currentIndex + 1
                }
                indexes.push(self.user.videoMetas[index].image)
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
            const total = self.user.videoMetas.length
            const prevIndex = index - 1 < 0 ? total : index - 1
            self.previousCarouselImg = self.user.videoMetas[prevIndex] ? self.user.videoMetas[prevIndex].image : self.user.tiktokPhoto
            self.forwardImageUrls = self.getForwardImageUrls(index, 3)
        },
        setProfileColor: function() {
            let self = this
            this.$nextTick(async () => {
                let image = self.$refs['profile-img'].image
                image.crossOrigin = 'anonymous'
                const palette = await Vibrant.from(image).getPalette()
                self.color1 = `rgba(${palette.LightMuted._rgb.concat([0.5]).toString()})`
                self.color2 = `rgba(${palette.LightVibrant._rgb.concat([0.5]).toString()})`
                self.color3 = `rgba(${palette.DarkVibrant._rgb.concat([1]).toString()})`
                self.profileStyle = { background: `linear-gradient(#FFFFFF, ${self.color1}, ${self.color2}, #FFFFFF)` }
            })
        },
        changePointRadius: function(ctx) {
            let pointRadius = 1
            if (!ctx.chart.pointRadiusChanged) ctx.chart.pointRadiusChanged = {}
            if (this.user.reduction && !ctx.chart.pointRadiusChanged[ctx.datasetIndex]) {
                let dateString = new Date(ctx.dataset.data[ctx.dataIndex].x).toDateString(),
                    redDateString = new Date(this.user.reduction).toDateString()
                if (dateString.match(redDateString)) {
                    ctx.chart.pointRadiusChanged[ctx.datasetIndex] = true
                    pointRadius = 10
                }
            }
            return pointRadius
        },
        getBorderDash: function(ctx) {
            if (this.user.reduction) {
                let index = ctx.dataset._meta[0].index || 0
                let dateString = new Date(ctx.dataset.data[index].x).toDateString(),
                    dateStringRed = new Date(this.user.reduction).toDateString()
                let timestamp = Date.parse(dateString),
                    timestampRed = Date.parse(dateStringRed)
                if (timestamp > timestampRed) {
                    let borderDash = [5, 5]
                    return borderDash
                }
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
        getAbbreviation(rank) {
            switch (rank) {
                case 1:
                    return 'st'
                case 2:
                    return 'nd'
                case 3:
                    return 'rd'
                default:
                    return 'wtf'
            }
        },
        getAwardColor(rank) {
            switch (rank) {
                case 1:
                    return 'yellow lighten-4'
                case 2:
                    return 'grey lighten-4'
                case 3:
                    return 'brown lighten-4'
            }
        },
        getAwardIcon(name) {
            switch (name) {
                case 'mostComments':
                    return 'fa-comments'
                case 'mostFollowers':
                    return 'fa-user-friends'
                case 'mostLikes':
                    return 'fa-heart'
                case 'mostVideos':
                    return 'fa-video'
                case 'highestSentimentComment':
                    return 'fa-smile'
                case 'lowestSentiment':
                    return 'fa-frown'
                case 'biggestBreastsConfirmed':
                    return 'fa-ruler-combined'
                case 'biggestBreastsGuessed':
                    return 'fa-poll'
            }
        },
        logNumbers(num) {
            const data = []

            for (let i = 0; i < num; ++i) {
                data.push(Math.ceil(Math.random() * 10.0) * Math.pow(10, Math.ceil(Math.random() * 5)))
            }

            return data
        },
        parseUsername: function(username) {
            username = username.match(/(.*)\s\((.*)\)\s(.*)/)
            let first = username[1],
                firstPlural = username[1].endsWith('s') ? `${username[1]}'` : `${username[1]}'s`,
                last = username[3],
                nickname = username[2]
            return { first, firstPlural, last, nickname }
        },
        parseSentiments(sentiments) {
            let self = this
            let stats = sentiments
                .filter((sentiment) => sentiment.score != 0) // exclude zeros to make the score more meaningful.
                .reduce(
                    (acc, cur, index) => {
                        acc.averageScore.value = (acc.averageScore.value + cur.score) / (index + 1)
                        return acc
                    },
                    {
                        averageScore: { description: 'Average Sentiment Score', value: 0 },
                    }
                )
            self.$set(self, 'sentiments', { data: sentiments, stats })
        },
        parseComments() {
            this.parsedComments = this.comments.tiktok.reduce(
                (acc, cur) => {
                    if (acc.highestSentimentComment.comment.sentiment.score < cur.sentiment.score) acc.highestSentimentComment.comment = cur
                    return acc
                },
                {
                    highestSentimentComment: { description: `Most Positive Comment`, comment: { sentiment: { score: 0 } } },
                }
            )
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
        setupSurvey(name) {
            let self = this
            this.surveyModel = new SurveyVue.Model(this.surveyJSON)
            this.surveyModel.onComplete.add((sender) => {
                this.$backend
                    .postSurvey({
                        userId: this.user.id,
                        survey: {
                            name: Object.keys(sender.data)[0],
                            data: Object.values(sender.data)[0],
                        },
                    })
                    .then(() => {
                        self.$backend.getSurveys({ user: self.user.id, survey: { name } }).then((response) => {
                            self.$set(self, 'completedSurveys', response)
                            self.$set(self.brasize, 'polled', self.completedSurveys.brasize[0])
                            this.setupSurveys()
                        })
                    })
                this.overlay = false
            })
        },
        setupSurveys() {
            let self = this
            self.surveys = self.surveys
                .map((survey) => {
                    survey = !self.$cookies.get(`${survey}SurveyDone-${self.user.id}`) ? survey : null
                    return survey
                })
                .filter((survey) => survey)
            this.surveys.map((survey) => this.setupSurvey(survey))
        },
        gofundmeVote() {
            let self = this
            self.$backend.postGofundmeVote({ userId: self.user.id }).then(() => {
                self.$backend.getGofundmeVotes({ userId: self.user.id }).then((response) => {
                    self.$set(self, 'gofundmeVotes', response.gofundmeVotes)
                })
            })
        },
    },
    computed: {
        origin: () => window.location.origin,
        chartOptions: function() {
            return {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                    },
                },
                scales: {
                    y: {
                        type: 'logarithmic',
                    },
                    yAxes: [
                        {
                            ticks: {
                                callback: (value) => {
                                    return format('.2s')(value)
                                },
                            },
                        },
                    ],
                },
                elements: {
                    point: {
                        radius: this.changePointRadius,
                    },
                },
            }
        },
        surveyJSON: function() {
            let self = this
            return {
                pages: [
                    {
                        name: 'brasize',
                        elements: [
                            {
                                type: 'multipletext',
                                name: 'brasize',
                                title: `Bra Size`,
                                description: `What is your best guess for ${self.username.firstPlural} bra size (band and cup)?`,
                                hideNumber: true,
                                isRequired: true,
                                items: [
                                    {
                                        name: 'band',
                                        isRequired: true,
                                        placeHolder: '32',
                                        title: 'band',
                                        size: 3,
                                        requiredErrorText: 'A size must include the band!',
                                        validators: [
                                            {
                                                type: 'regex',
                                                regex: /\b2[2|4|6|8]\b|\b[3|4|5|6|7|8|9][0|2|4|6|8]\b|\b10[0|2]\b/,
                                                text: 'Band size should be an EVEN NUMBER in the range 22 to 102.',
                                            },
                                        ],
                                    },
                                    {
                                        name: 'cup',
                                        isRequired: true,
                                        placeHolder: 'G',
                                        title: 'cup',
                                        requiredErrorText: 'A size must include the cup!',
                                        validators: [{ type: 'regex', regex: /\b[d-y]{1,3}\b|\bz{1,3}\b/i, text: 'Cup size should be in the range D to ZZZ.' }],
                                    },
                                ],
                                itemSize: 3,
                            },
                            {
                                type: 'html',
                                name: 'confused',
                                html:
                                    '<i>Confused about bra sizes: <a href="https://blog.thirdlove.com/bra-sizes-meaning">https://blog.thirdlove.com/bra-sizes-meaning</a></i>',
                            },
                        ],
                    },
                ],
                showCompletedPage: false,
                cookieName: `brasizeSurveyDone-${self.user.id}`,
            }
        },
        admin() {
            return this.$cookies.get('__secure-admin') === 'true'
        },
        highlyRated() {
            if (!this.user || !this.user.videoMetas) return false
            return this.user.videoMetas.find((videoMeta) => videoMeta.imageHighlyRated) ? true : false
        },
    },
    mounted() {
        let self = this
        let userId = self.userId || self.$route.query.userId || self.$route.params.userId
        self.tiktokId = self.$route.params.tiktokId || self.$route.query.tiktokId
        self.$backend
            .getUser({ userId, tiktokId: self.tiktokId })
            .then((response) => {
                self.user = response.data
                self.user.videoMetas = self.user.videoMetas.filter((meta) => meta.image).filter((meta) => meta.image.match(/https?:\/\/owncloud/))
                //self.highlyRated = self.user.videoMetas.find(videoMeta => videoMeta.imageHighlyRated) ? true : false
                self.username = self.parseUsername(self.user.username)
                self.setupSurveys()
                self.awards = self.$backend.awards.filter((award) => award.user === self.user.id)
                self.$backend.getSurveys({ user: self.user.id, survey: { name: 'brasize' } }).then((response) => {
                    self.completedSurveys = response
                    if (self.completedSurveys.brasize) self.$set(self.brasize, 'polled', self.completedSurveys.brasize[0])
                })
                self.$backend.getComments({ socialNetwork: 'tiktok', userId: self.user.tiktokId }).then((response) => {
                    self.comments.tiktok = response.data
                    self.parseComments()
                    self.commentTopics = self.comments.tiktok.reduce(
                        (acc, cur) => {
                            let brasize = cur.text.match(/(2[2-9]|[3-9][0-9]|10[0-2])([g-y]|z{1,3})/)
                            let size = cur.text.match(/size/i)
                            let bra = cur.text.match(/\sbra/i)
                            let cup = cur.text.match(/\scups?/i)
                            let reduction = cur.text.match(/reduction|reduce|surgery/i)
                            if (brasize && (size || bra || cup)) acc.size.push(brasize)
                            if (reduction) acc.reduction.push(reduction)
                            return acc
                        },
                        {
                            size: [],
                            reduction: [],
                        }
                    )
                })
                if (!self.user.gofundme)
                    self.$backend.getGofundmeVotes({ userId: self.user.id }).then((response) => {
                        self.$set(self, 'gofundmeVotes', response.gofundmeVotes)
                    })
            })
            .then(async () => {
                let requests = [
                    { stats: await self.$backend.getUserStats({ socialNetwork: 'tiktok', userId: self.user.tiktokId }) },
                    { sentiments: await self.$backend.getUserSentiments({ socialNetwork: 'tiktok', userId: self.user.tiktokId }) },
                ]
                requests = requests.reduce((acc, cur) => {
                    acc[Object.keys(cur)[0]] = Object.values(cur)[0]
                    return acc
                }, {})
                return requests
            })
            .then((responses) => {
                const stats = this.removeDuplicateDays(responses.stats)
                const sentiments = responses.sentiments
                self.$set(self, 'stats', stats.data.results)
                self.parseSentiments(sentiments.data.results)
                let data = stats.data.results.map((data) => ({
                    x: data.updatedAt,
                    following: data.stats.following || 0,
                    followers: data.stats.followers || 0,
                    likes: data.stats.likes || 0,
                    videos: data.stats.videos || 0,
                }))
                if (data.length == 0) return {}
                self.chartdata = {
                    labels: stats.data.results.map((data) =>
                        new Date(data.updatedAt)
                            .toLocaleString()
                            .split(',')[0]
                            .split('/')
                            .splice(0, 2)
                            .join('/')
                    ),
                    datasets: ['following', 'followers', 'likes', 'videos'].map((stat) => {
                        function statColor(statName) {
                            switch (statName) {
                                case 'following':
                                    return 'blue'
                                case 'followers':
                                    return 'pink'
                                case 'likes':
                                    return 'red'
                                case 'videos':
                                    return 'yellow'
                            }
                        }
                        return {
                            label: `${stat}`, //: ${data[data.length - 1][stat]}`,
                            fill: false,
                            borderColor: statColor(stat),
                            segment: {
                                borderColor: 'rgb(0,0,0,0.2)',
                                borderDash: [1, 2],
                            },
                            data: data.map((allDataSets) => {
                                let set
                                switch (stat) {
                                    case 'following':
                                        set = { x: allDataSets.x, y: allDataSets['following'] }
                                        break
                                    case 'followers':
                                        set = { x: allDataSets.x, y: allDataSets['followers'] }
                                        break
                                    case 'likes':
                                        set = { x: allDataSets.x, y: allDataSets['likes'] }
                                        break
                                    case 'videos':
                                        set = { x: allDataSets.x, y: allDataSets['videos'] }
                                        break
                                }
                                return set
                            }),
                            //pointRadius: self.changePointRadius,
                            //borderDash: this.getBorderDash,
                            parsing: {
                                yAxisKey: stat,
                            },
                        }
                    }),
                }
                self.setProfileColor()
                self.loaded = true
            })
        if (this.$route.name === 'profile')
            postscribe(
                '#postscribe',
                `
<script>
/**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = "${self.origin}/profile/${self.user.id}";  // Replace PAGE_URL with your page's canonical URL variable
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
