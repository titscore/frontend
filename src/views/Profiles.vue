<template>
    <v-container>
        <!--<ts-header></ts-header>-->
        <!--<search></search>-->
        <v-flex v-for="(item, index) in users" :key="index">
            <profile :ref="`profile-${item.id}`" @disqusReset="disqusReset($event, item.id)" :userId="item.id"></profile>
        </v-flex>
        <div id="postscribe"></div>
        <v-dialog v-model="loading" hide-overlay width="100">
            <v-progress-circular :size="100" :width="1" indeterminate color="primary"></v-progress-circular>
        </v-dialog>
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
import postscribe from 'postscribe'
import Profile from '../components/Profile'
//import TsHeader from './TsHeader.vue'
import goTo from 'vuetify/es5/services/goto'
//import Search from '../components/Search'

export default {
    name: 'Profiles',
    components: {
        Profile,
        //TsHeader,
        //Search,
    },
    data: () => ({
        users: null,
        loading: false,
        infiniteScroll: false
    }),
    methods: {
        disqusReset($event, id) {
            let { newIdentifier, newUrl, newTitle, newLanguage } = $event
            let refToActivate
            Object.values(this.$refs).map((ref) => {
                if (ref[0].userId !== id) ref[0].deactivate()
                else refToActivate = ref[0]
            })
            refToActivate.activate()
            setTimeout(() => {
                window.reset(newIdentifier, newUrl, newTitle, newLanguage)
                goTo('#disqus_thread')
            }, 500)
        },
        infiniteScrolling(entries, observer, isIntersecting) {
            entries
            observer
            isIntersecting
            if (!isIntersecting) return
            if (self.infiniteScroll) return
            self.infiniteScroll = true
            const exclude = this.users ? this.users.map((user) => user.id) : []
            this.loading = true
            setTimeout(() => {
                this.$backend.getUsers({ count: 10, exclude: JSON.stringify(exclude) }).then((response) => {
                    this.loading = false
                    this.users = this.users.concat(response.data.results).filter((user) => user)
                })
                .catch(error => {
                    error
                    this.loading = false
                })
            }, 500)
            setTimeout(() => {
                self.infiniteScroll = false
            }, 3000)
        },
    },
    mounted() {
        let self = this
        self.$backend.getUsers({ count: 10 }).then((response) => {
            self.users = response.data.results
        })
        postscribe(
            '#postscribe',
            `
<script>
/**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://titscore-com.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
    /* * * Disqus Reset Function * * */
    var reset = function (newIdentifier, newUrl, newTitle, newLanguage) {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = newIdentifier;
                this.page.url = newUrl;
                this.page.title = newTitle;
                this.language = newLanguage;
            }
        });
    };
<\/script>
`
        )
    },
}
</script>
