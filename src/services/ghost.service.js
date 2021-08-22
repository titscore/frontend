import { EventEmitter } from "events"
import GhostContentAPI from '@tryghost/content-api'

class GhostService extends EventEmitter {
    constructor(Vue) {
        super()
        this.Vue = Vue
        this.api = new GhostContentAPI({
                url: process.env.VUE_APP_API_URL,
                key: process.env.VUE_APP_CONTENT_API_KEY,
                version: "v3"
            })
    }
    async getFAQsMeta() {
        let tags = await this.browseTags()
        tags = tags.filter(tag => tag.slug.match(/^faq-[a-zA-Z0-9_.]+(-[a-zA-Z0-9_.])*/))
        tags.map(tag => console.log(tag.slug))
        this.meta = {
            categories: tags.map(tag => tag.slug.match(/-([a-zA-Z0-9_]+)(-[a-zA-Z0-9_])*$/) && tag.slug.match(/-([a-zA-Z0-9_]+)(-[a-zA-Z0-9_])*$/).length > 0 ? tag.slug.match(/-([a-zA-Z0-9_]+)(-[a-zA-Z0-9_])*$/)[1] : undefined)
                .filter(tag => tag)
                .sort()
                .filter((item, pos, array) => !pos || item !== array[pos-1]),
            subcategories: tags.map(tag => tag.slug.match(/-([a-zA-Z0-9_]+(-[a-zA-Z0-9_])*$)/) && tag.slug.match(/-([a-zA-Z0-9_]+(-[a-zA-Z0-9_])*$)/).length > 0 ? tag.slug.match(/-([a-zA-Z0-9_]+(-[a-zA-Z0-9_])*$)/)[1] : undefined)
                .filter(tag => tag)
        }
        return this.meta
    }
    async getFAQs(category, subcategory) {
        try {
            let filter = category ? subcategory
            ? `tag:faq-${category}-${subcategory}`
            : `tag:faq-${category}`
            : `tag:faq`
            let posts = await this.api.posts.browse({ filter })
            return posts.map(post => ({
                q: post.title,
                a: post.html
            }))
        } catch(err) {
            console.error(err);
        }
    }
    async get(slug) {
        try {
            let post = await this.api.posts.read({ slug })
            return post
        } catch(error) {
            console.error(error)
        }
    }
    browseTags(filter) {
        try {
            let tags = this.api.tags.browse({ filter })
            return tags
        } catch (error) {
            console.error(error)
        }
    }
}

export default (Vue) => new GhostService(Vue);