import Vue from 'vue'
import Router from 'vue-router'
import { authGuard } from "./auth/authGuard";

Vue.use(Router)

let router = new Router({
    mode: 'history',
    routes: [
        {
            meta: {
                title: 'TitScore Profile',
                metaTags: [
                    {
                        name: 'description',
                        content: 'A Detailed Profile including Stats, Photos, Comments, Awards, Direct Links to Social Videos, and More...',
                    },
                ],
            },
            path: '/profile/:userId?',
            name: 'profile',
            component: () => import('./components/Profile.vue'),
        },
        {
            meta: {
                title: 'List of TitScore Profiles',
                metaTags: [
                    {
                        name: 'description',
                        content: 'An Infinitely Scrollable List of Profiles Listed by Social Media Avatar',
                    },
                ],
            },
            path: '/profiles',
            name: 'profiles',
            component: () => import('./views/Profiles.vue'),
        },
        {
            meta: {
                title: 'FAQ (Frequently Asked Questions)',
                metaTags: [
                    {
                        name: 'description',
                        content: 'TitScore Frequently Asked Questions',
                    },
                ],
            },
            path: '/faq',
            name: 'faq',
            component: () => import('./components/FAQ.vue'),
        },
        {
            meta: {
                title: 'The Grid',
                metaTags: [
                    {
                        name: 'description',
                        content: 'The Grid Lists Profiles by the Highest User Rated Photos',
                    },
                ],
            },
            path: '/grid',
            name: 'thegrid',
            component: () => import('./views/TheGrid.vue'),
        },
        {
            meta: {
                title: 'OTituaries (Tits Obituaries)',
                metaTags: [
                    {
                        name: 'description',
                        content: 'The List of Sad Breast Reductions',
                    },
                ],
            },
            path: '/otituaries',
            name: 'otituaries',
            component: () => import('./views/OTituaries.vue'),
        },
        {
            meta: {
                title: 'Breast Reduction',
                metaTags: [
                    {
                        name: 'description',
                        content: 'Breast Reduction Profile',
                    },
                ],
            },
            path: '/reduction/:userId?',
            name: 'reduction',
            component: () => import('./views/Reduction.vue'),
        },
        {
            meta: {
                title: 'TitScore Member Account',
                metaTags: [
                    {
                        name: 'description',
                        content: 'Your TitScore Member Account ',
                    },
                ],
            },
            path: '/member',
            name: 'member',
            component: () => import('./views/User.vue'),
            beforeEnter: authGuard
        },
        /*{
            path: '/captcha',
            name: 'captcha',
            component: () => import('./components/Captcha.vue'),
        },*/
        {
            meta: {
                title: 'TitScore Home Page',
                metaTags: [
                    {
                        name: 'description',
                        content: `https://titscore.com is where you'll find social media's best breasts.`,
                    },
                ],
            },
            path: '*',
            name: 'catchall',
            component: () => import('./views/TheGrid.vue'),
            beforeEnter(to, from, next) {
                if(to.query.bypass) {
                  next(to.query.bypass);
                } else {
                    next()
                }
              }
        },
    ],
})
router.beforeEach((to, from, next) => {
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    const nearestWithTitle = to.matched
        .slice()
        .reverse()
        .find((r) => r.meta && r.meta.title)

    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched
        .slice()
        .reverse()
        .find((r) => r.meta && r.meta.metaTags)

    const previousNearestWithMeta = from.matched
        .slice()
        .reverse()
        .find((r) => r.meta && r.meta.metaTags)

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) {
        document.title = nearestWithTitle.meta.title
    } else if (previousNearestWithMeta) {
        document.title = previousNearestWithMeta.meta.title
    }

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map((el) => el.parentNode.removeChild(el))

    // Skip rendering meta tags if there are none.
    if (!nearestWithMeta) return next()

    // Turn the meta tag definitions into actual elements in the head.
    nearestWithMeta.meta.metaTags
        .map((tagDef) => {
            const tag = document.createElement('meta')

            Object.keys(tagDef).forEach((key) => {
                tag.setAttribute(key, tagDef[key])
            })

            // We use this to track which meta tags we create so we don't interfere with other ones.
            tag.setAttribute('data-vue-router-controlled', '')

            return tag
        })
        // Add the meta tags to the document head.
        .forEach((tag) => document.head.appendChild(tag))

    next()
})

export default router
