<template>
    <v-container fluid>
        <ts-header v-if="true" :cols="cols"></ts-header>
        <v-row :height="photoHeight">
            <v-col v-for="user in users" v-bind:key="user.id" :cols="cols">
                <link rel="preload" as="image" :href="user.videoMetas[0][image]" />
                <v-carousel
                    cycle
                    :interval="interval[user.id]"
                    :v-show="true"
                    v-model="carousel[user.id]"
                    hide-delimiters
                    hide-delimiter-background
                    @change="carouselChange($event, user.id)"
                    :show-arrows="false"
                >
                    <v-carousel-item
                        @contextmenu="photoContextMenuHandler($event, user.id)"
                        transition="fade-transition"
                        v-for="(videoMeta, i) in user.videoMetas"
                        :key="videoMeta._id"
                    >
                        <photo-context-menu
                            :admin="admin"
                            :user="user"
                            :index="i"
                            :url="videoMeta[image] ? videoMeta[image] : videoMeta.image"
                            :ref="`photoContextMenu-${user.id}`"
                            showRemarks="small"
                        >
                            <router-link
                                @click.native="$emit('navigate')"
                                :href="(!preloadedUsers && !user.reduction) || (!preloadedUsers && !user.aftermath) ? videoMeta.url : ''"
                                :to="user.reduction && user.aftermath ? `/reduction/${user.id}` : preloadedUsers ? `/profile/${user.id}` : ''"
                                :target="user.reduction && user.aftermath ? '_self' : preloadedUsers ? '_self' : '_blank'"
                            >
                                <v-img
                                    style="background-image"
                                    contain
                                    :ref="`carousel-img-${user.id}${i}`"
                                    :src="videoMeta[image] ? videoMeta[image] : videoMeta.image"
                                >
                                    <template v-slot:placeholder>
                                        <v-row class="fill-height ma-0" align="center" justify="center">
                                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                        </v-row>
                                    </template>
                                </v-img>
                            </router-link>
                        </photo-context-menu>
                    </v-carousel-item>
                </v-carousel>

                <v-dialog v-model="loading" hide-overlay width="100">
                    <v-progress-circular :size="100" :width="1" indeterminate color="primary"></v-progress-circular>
                </v-dialog>
                <link v-for="image of getUnCachedForwardImageUrls(user.id)" rel="prefetch" as="image" :href="image" v-bind:key="image" />
            </v-col>
        </v-row>
        <v-flex v-intersect="infiniteScrolling"></v-flex>
    </v-container>
</template>
<style>
.v-dialog {
    box-shadow: unset !important;
    overflow-x: hidden !important;
    overflow-y: hidden !important;
}
</style>
<script>
import TsHeader from './TsHeader.vue'
import PhotoContextMenu from './PhotoContextMenu.vue'
import Vue from 'vue'
import VueCookies from 'vue-cookies'

Vue.use(VueCookies)

export default {
    name: 'Grid',
    components: {
        PhotoContextMenu,
        TsHeader,
    },
    props: {
        query: Object,
        preloadedUsers: Object,
        filter: String,
        photoWidth: { type: Object, default: () => ({}) },
        photoHeight: { type: Object, default: () => ({}) },
        columns: { type: Object, default: () => ({}) },
    },
    data: function() {
        return {
            loading: false,
            users: null,
            previousCarouselImg: {},
            forwardImageUrls: {},
            downloadedForwardImgUrls: {},
            carousel: {},
            interval: {},
            infiniteScroll: false,
        }
    },
    mounted() {
        let self = this
        if (!self.preloadedUsers) {
            self.$backend.getUsers(self.query).then((response) => {
                self.users = response.data.results
                    .map((user) => {
                        user.videoMetas = user.videoMetas.filter((videoMeta) => videoMeta[self.filter])
                        self.interval[user.id] = Math.ceil(Math.random() * 5000) + 11000
                        return user
                    })
                    .reduce((acc, cur) => ({ [cur.id]: cur, ...acc }), {})
            })
        } else {
            self.users = self.preloadedUsers
        }
    },
    computed: {
        cols() {
            switch (this.$vuetify.breakpoint.name) {
                case 'xs':
                    return 12
                case 'sm':
                    return 6
                case 'md':
                    return 4
                case 'lg':
                    return 3
                case 'xl':
                    return 2
                default:
                    return 1
            }
        },
        admin() {
            return this.$cookies.get('__secure-admin') === 'true'
        },
        width() {
            return this.$vuetify.breakpoint.mobile ? this.photoWidth.mobile || 200 : this.photoWidth.desktop || 400
        },
        height() {
            return this.$vuetify.breakpoint.mobile ? this.photoHeight.mobile || 200 : this.photoHeight.desktop || 400
        },
        image() {
            const imageName = this.filter === 'imageHighlyRated' ? 'processedHighlyRatedImage' : 'processedReductionImage'
            return imageName
        },
    },
    methods: {
        photoContextMenuHandler: function(event, userId) {
            this.$refs[`photoContextMenu-${userId}`][this.carousel[userId]].show(event)
        },
        getForwardImageUrls: function(currentIndex, howMany, userId) {
            let self = this
            if (!self.users[userId]) return
            let indexes = []
            for (let i = 0; i < howMany; i++) {
                let index
                if (currentIndex + 1 >= self.users[userId].videoMetas.length || index + 1 >= self.users[userId].videoMetas.length) {
                    index = 0
                } else {
                    index = currentIndex + 1
                }
                indexes.push(self.users[userId].videoMetas[index].image)
                currentIndex++
            }
            return indexes
        },
        carouselChange: function(index, userId) {
            const self = this
            const total = self.users[userId].videoMetas.length
            const prevIndex = index - 1 < 0 ? total : index - 1
            self.previousCarouselImg[userId] = self.users[userId].videoMetas[prevIndex]
                ? self.users[userId].videoMetas[prevIndex].image
                : self.users[userId].tiktokPhoto
            self.forwardImageUrls[userId] = self.getForwardImageUrls(index, 3, userId)
        },
        getUnCachedForwardImageUrls: function(userId) {
            let self = this
            if (!self.forwardImageUrls[userId]) return
            return self.forwardImageUrls[userId]
                .map((url) => {
                    if (!self.downloadedForwardImgUrls[url]) {
                        self.downloadedForwardImgUrls[url] = true
                        return url
                    }
                })
                .filter((url) => url)
        },
        infiniteScrolling(entries, observer, isIntersecting) {
            entries
            observer
            isIntersecting
            const self = this
            if (self.preloadedUsers) return
            if (!isIntersecting) return
            if (self.infiniteScroll) return
            self.infiniteScroll = true
            const exclude = this.users ? Object.keys(this.users) : []
            this.loading = true
            setTimeout(() => {
                self.$backend
                    .getUsers({ ...self.query, exclude: JSON.stringify(exclude) })
                    .then((response) => {
                        const users = response.data.results
                            .map((user) => {
                                user.videoMetas = user.videoMetas.filter((videoMeta) => videoMeta[self.filter])
                                self.interval[user.id] = Math.ceil(Math.random() * 5000) + 11000
                                return user
                            })
                            .reduce((acc, cur) => ({ [cur.id]: cur, ...acc }), {})

                        self.users = { ...self.users, ...users }
                        this.loading = false
                    })
                    .catch((error) => {
                        error
                        this.loading = false
                    })
            }, 500)
            setTimeout(() => {
                self.infiniteScroll = false
            }, 3000)
        },
    },
}
</script>
