<template>
    <div>
        <v-container v-if="showRemarks != 'false'" class="remarks" style="position: absolute">
            <v-row>
                <v-spacer></v-spacer>
                <v-col class="py-0 px-0">
                    <span v-for="remark in remarks" v-bind:key="remark.name" class="ml-1">
                        <v-badge v-if="showRemarks != 'small' && !$vuetify.breakpoint.mobile" overlap bottom :content="remark.count">
                            <v-icon large :color="getIcon(remark.name).color" v-text="getIcon(remark.name).text"></v-icon>
                        </v-badge>
                        <span v-else-if="!$vuetify.breakpoint.mobile">
                            <v-icon small :color="getIcon(remark.name).color" v-text="getIcon(remark.name).text"></v-icon>
                            <sup class="remark-count">{{remark.count}}</sup>
                        </span>
                    </span>
                </v-col>
                <v-spacer></v-spacer>
            </v-row>
        </v-container>
        <slot></slot>
        <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
            <v-list dense rounded>
                <v-subheader>Add a Photo Remark</v-subheader>
                <v-list-item-group v-model="selected" color="primary">
                    <v-list-item @click="remarkHandler" v-for="(item, index) in items" :key="index">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon v-text="item.icon"></v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </v-list-item-group>
                <v-subheader></v-subheader>
                <v-list-item-group color="primary">
                    <v-list-item @click="generalMenuHandler" v-for="(item, index) in generalMenuItems" :key="index">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon v-text="item.icon"></v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </v-list-item-group>
                <v-subheader v-if="admin">Admin</v-subheader>
                <v-list-item-group v-if="admin" color="primary">
                    <v-list-item @click="adminHandler" v-for="(item, index) in adminItems" :key="index">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon :color="item.color" v-text="item.icon"></v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-menu>
    </div>
</template>
<style>
.hovering {
    color: red;
}
.remarks {
    z-index: 1;
}
.remark-count {
    position: relative;
    left: -5px;
}
</style>
<script>
export default {
    name: 'PhotoContextMenu',
    components: {},
    props: {
        user: Object,
        index: Number,
        admin: Boolean,
        showRemarks: { type: String, default: "true" }
    },
    data: function() {
        return {
            x: 0,
            y: 0,
            showMenu: false,
            selected: [],
            items: [
                { icon: 'fa-heart', title: 'Love', class: 'red--text' },
                { icon: 'fab fa-hotjar', title: 'Hot', class: 'red--text' },
                { icon: 'fab fa-sass', title: 'Sexy', class: 'red--text' },
            ],
            remarks: [],
            progress: {
                admin: false
            }
        }
    },
    methods: {
        show(e) {
            e.preventDefault()
            this.showMenu = false
            this.x = e.clientX
            this.y = e.clientY
            this.$nextTick(() => {
                this.showMenu = true
            })
        },
        getIcon: function(name) {
            let icon
            switch (name.toLowerCase()) {
                case 'love':
                    icon = { text: 'fa-heart', color: 'red' }
                    break
                case 'hot':
                    icon = { text: 'fab fa-hotjar', color: 'orange' }
                    break
                case 'sexy':
                    icon = { text: 'fab fa-sass', color: 'black' }
                    break
                default:
                    icon = { text: 'far fa-heart', color: 'primary' }
            }
            return icon
        },
        remarkHandler: function(event) {
            const self = this
            const index = self.index
            const userId = self.user.id

            self.$backend
                .postRemark({
                    user: userId,
                    name: event.srcElement.innerText,
                    url: self.user.videoMetas[index].image,
                })
                .then(() => {
                    self.getRemarks()
                })
        },
        adminHandler: function(event) {
            const self = this
            const index = self.index
            let action = event.srcElement.innerText
            switch(action) {
                case 'Highly Rated': action = 'imageHighlyRated'; break;
                case 'Reduction': action = 'reduction'; break;
            }
            if (self.user.videoMetas[self.index][action] !== undefined) {
                    self.$set(self.user.videoMetas[self.index], action, !self.user.videoMetas[index][action])
                } else {
                    self.$set(self.user.videoMetas[self.index], action, true)
                }
                self.progress.admin = true
                self.$backend
                    .updateUser({
                        userId: self.user.id,
                        params: { videoMeta: self.user.videoMetas[self.index] }
                    })
                    .then(response => {
                        console.log(response.data.videoMetas.filter(videoMeta => videoMeta[action]))
                    });
            self.progress.admin = false
            event.target.active = false
        },
        generalMenuHandler: function() {
            const self = this
            const userId = self.user.id
            self.$router.push({ path: '/profile', query: { userId }})
        },
        getRemarks: function() {
            const self = this
            const index = self.index
            const user = self.user.id
            if (!self.user.videoMetas[index]) return
            const url = self.user.videoMetas[index].image
            self.$backend.getRemarks({ user, url }).then((response) => {
                response = response.reduce((acc, cur) => {
                    if (!acc[cur.name]) {
                        acc[cur.name] = { name: cur.name, count: 1 }
                    } else {
                        acc[cur.name].count = acc[cur.name].count + 1
                    }
                    return acc
                }, {})
                self.$set(self, 'remarks', response)
            })
        }
    },
    computed: {
        generalMenuItems: function() {
            const items = []
            if (this.$route.name !== 'profile') items.push({ icon: 'fa-address-card', title: 'Open Profile' })
            return items
        },
        adminItems: function() {
            return [
                { icon: 'fa-star', title: 'Highly Rated', color: this.user && this.user.videoMetas && this.user.videoMetas[this.index] && this.user.videoMetas[this.index].imageHighlyRated ? 'amber' : ''  },
                { icon: 'fa-remove-format', title: 'Reduction', color: this.user && this.user.videoMetas && this.user.videoMetas[this.index] && this.user.videoMetas[this.index].reduction ? 'red' : '' },
            ]
        }
    },
    mounted() {
        let self = this
        self.getRemarks()
    },
}
</script>
