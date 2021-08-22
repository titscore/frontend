<template>
    <v-container>
        <v-row>
            <v-spacer cols="auto"></v-spacer>
            <v-col :cols="$vuetify.breakpoint.mobile ? 12 : 10">
                <span class="headline font-weight-thin font-italic">Frequently Asked Questions</span>
                <v-divider></v-divider>
                <v-breadcrumbs :items="categoryBreadcrumbs" ref="breadcrumbs">
                    <template v-slot:item="{ item }">
                        <v-breadcrumbs-item
                            :to="item.to"
                            :disabled="category === item.name"
                            :exact="item.exact"
                        >
                            {{ item.text[0].charAt(0).toUpperCase() + item.text[0].slice(1)}}
                            {{ $vuetify.breakpoint.mobile ? '': item.text[1] }}
                        </v-breadcrumbs-item>
                    </template>
                    <template v-slot:divider>
                        <v-icon>mdi-chevron-right</v-icon>
                    </template>
                </v-breadcrumbs>
                <v-row justify="center">
                    <v-expansion-panels :value="expanded" accordian inset>
                        <v-expansion-panel
                                v-for="(categoryFaqs, categoryName) in faqs"
                                @change="changeRoute(categoryName)"
                                :key="categoryName">
                            <v-expansion-panel-header>{{ categoryName.charAt(0).toUpperCase() + categoryName.slice(1) }}</v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-expansion-panels accordian inset>
                                    <v-expansion-panel
                                            v-for="faq in categoryFaqs" :key="faq.question">
                                        <v-expansion-panel-header><span v-bind:class="{ 'mobileFont': $vuetify.breakpoint.mobile }">{{ faq.question }}</span></v-expansion-panel-header>
                                        <v-expansion-panel-content v-bind:class="{ 'mobileFont': $vuetify.breakpoint.mobile }">
                                            <vue-markdown :source="faq.answer"></vue-markdown>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
table {
    margin: 20px auto;
}
td {
    padding: 0 20px 0 20px
}
td:nth-child(2) {
    background: #FFEBEE;
}
td:nth-child(3) {
    background: #FAFAFA;
}
</style>

<script>
import VueMarkdown from '@adapttive/vue-markdown'

export default {
    name: "ComponentName",
    props: {
        msg: String,
    },
    components: {
        VueMarkdown
    },
    computed: {
        category: function() {
            return this.$route.query.category === undefined
                ? "general"
                : this.$route.query.category
        },
        categoryBreadcrumbs: function () {
            let mapped = this.categories ? this.categories.map(category => ({
                name: category,
                text: [`${category.charAt(0).toUpperCase() + category.slice(1)}`, ' Questions'],
                to: `faq?category=${category}`,
                exact: true
            })) : []
            return mapped
        },
        expanded: function() {
            return this.categories.findIndex(name => name === this.category)
        }
    },
    watch: {
        category: function(newCategory) {
            if (Object.values(this.faqs[newCategory]).length === 0 && !this.requests[newCategory]) this.getCategoryQuestions(newCategory)
            return newCategory
        }
    },
    methods: {
        getCategoryQuestions: async function (category) {
            let self = this
            
            if (!category) category = self.category
            if (self.requests[category]) return
            self.requests[category] = true
            let faqs = await self.$ghost.getFAQs(category)
            faqs = faqs.map(faq => {
                return {
                    question: faq.q,
                    answer: faq.a
                }
            })
            this.faqs[category] = Object.assign({}, this.faqs[category], faqs)
            this.faqs = Object.assign({}, this.faqs)
        },
        changeRoute: function(category) {
            let regex = new RegExp(`\\?category=${category}`)
            if (!this.$route.fullPath.match(regex)) this.$router.replace(`faq?category=${category}`)
        }
    },
    mounted() {
        let self = this
        new Promise(resolve => {
            self.$ghost.getFAQsMeta()
            .then(meta => {
                self.$set(self, 'categories', meta.categories)
                self.categories.map(category => {
                    if (!self.faqs[category]) self.faqs[category] = []
                })
                this.getCategoryQuestions()
                resolve()
            })
        })
    },
    data() {
        return {
            faqs: {},
            categories: [],
            requests: {}
        }
    },
};
</script>
