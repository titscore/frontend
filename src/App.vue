<template>
    <v-app id="app">
        <meta :version="version" />
        <v-navigation-drawer v-model="navigation" app floating permanent
            :disable-route-watcher="$vuetify.breakpoint.mobile ? true : false"
            :mini-variant="mini"
            :expand-on-hover="$vuetify.breakpoint.mobile ? false : true">
            <v-btn text v-show="$vuetify.breakpoint.mobile && !mini" @click="mini = true" style="float: right;">X</v-btn>
            <v-list nav dense>
                <v-list-item @click.prevent="$auth.isAuthenticated ? logout() : login()">
                    <v-list-item-icon v-if="!$auth.isAuthenticated">
                        <v-icon>{{ $auth.isAuthenticated ? 'fa-sign-out-alt' : 'fa-sign-in-alt' }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-avatar :size="40" style="left: -8px" rounded v-else>
                        <v-img :src="$auth.user.picture"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>{{ $auth.isAuthenticated ? 'Logout' : 'Login' }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item>
                    <v-list-item-icon @click="mini = !mini">
                        <v-icon>fas fa-search</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-text-field @change="search" hint="userid or tiktok @username" label="find user"></v-text-field>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item to="/grid">
                    <v-list-item-icon>
                        <v-icon>fas fa-th</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>The Grid</v-list-item-title>
                </v-list-item>
                <v-list-item to="/profiles">
                    <v-list-item-icon>
                        <v-icon>fas fa-th-list</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>List</v-list-item-title>
                </v-list-item>
                <v-list-item to="/otituaries">
                    <v-list-item-icon>
                        <v-icon>fas fa-remove-format</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>oTituaries</v-list-item-title>
                </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list nav dense>
                <v-list-item to="/faq">
                    <v-list-item-icon>
                        <v-icon>far fa-question-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>FAQ</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <keep-alive v-if="NODE_ENV === 'production'">
                <router-view :key="$route.fullPath" />
            </keep-alive>
            <router-view v-else :key="$route.fullPath" />
        </v-main>
        <v-overlay v-click-outside="onClickOutside" opacity="0.9" :value="searching">
            <span class="close" @click="searching = false">X</span>
            <ts-grid @navigate="searching = false" v-if="searchResult" :preloadedUsers="searchResult"></ts-grid>
        </v-overlay>
        <v-snackbar color="secondary" text :timeout="-1" v-model="notice">
            <v-row>
                <v-col cols="1" class="d-flex align-center justify-center">
                    <v-icon :x-small="$vuetify.breakpoint.mobile">fa-info-circle</v-icon>
                </v-col>
                <v-col cols="10" class="d-flex align-center justify-center">
                    <span class="font-weight-light" v-bind:class="$vuetify.breakpoint.mobile ? 'caption' : ''"
                        >Reload to update to the newest app version.</span
                    >
                </v-col>
                <v-col cols="1" class="d-flex align-center justify-center">
                    <v-btn text :x-small="$vuetify.breakpoint.mobile" @click="clickHandler">
                        X
                    </v-btn>
                </v-col>
            </v-row>
        </v-snackbar>
    </v-app>
</template>
<style>
.v-overlay__content {
    width: 100%;
    margin-left: 200px;
}
.v-overlay {
    align-items: unset;
}
.close {
    float: right;
    margin: 5px 10px;
    cursor: pointer;
}
</style>
<script>
import TsGrid from './components/TsGrid'

export default {
    components: {
        TsGrid,
    },
    data: function() {
        return {
            searching: false,
            searchResult: undefined,
            version: undefined,
            notice: false,
            versionCheckIntervalId: undefined,
            navigation: false,
            mini: true,
        }
    },
    methods: {
        search: function(searchString) {
            const self = this
            self.mini = true
            this.searching = true
            this.$backend
                .search({ searchString })
                .then((result) => {
                    self.searchResult = result.reduce((acc, cur) => ({ [cur.id]: cur, ...acc }), {})
                })
                .catch((error) => {
                    error
                    setTimeout(() => {
                        this.searching = false
                    }, 5000)
                })
        },
        onClickOutside: function() {
            this.searching = false
        },
        clickHandler: function() {
            this.notice = false
            clearInterval(this.versionCheckIntervalId)
        },
        login: function(signup = false) {
            this.$auth.loginWithRedirect({
                screen_hint: signup ? 'signup' : '',
                appState: { targetUrl: this.$route.fullPath }
            })
        },
        logout: function() {
            this.$auth.logout()
        },
    },
    computed: {
        NODE_ENV: () => {
            return process.env.NODE_ENV
        },
    },
    mounted() {
        const self = this
        let lastBuild
        this.versionCheckIntervalId = setInterval(
            async () => {
                const newestBuild = await self.$backend.buildInfo()
                self.version = newestBuild.commit_sha
                if (lastBuild && lastBuild.build_date !== newestBuild.build_date) {
                    self.notice = true
                } else {
                    lastBuild = newestBuild
                }
            },
            process.env.NODE_ENV !== 'production' ? 60000 : 60000
        )
    },
}
</script>
