<template>
    <v-row>
        <v-col :cols="cols"></v-col>
        <v-col :cols="cols" align-self="center">
            <v-container>
                <v-row>
                    <v-col v-if="!$vuetify.breakpoint.mobile" cols="1"></v-col>
                    <v-col cols="8">
                        <span class="font-weight-light nowrap">{{ stats.totalCreators.description }}</span>
                    </v-col>
                    <v-col cols="2">
                        <number class="text-h5 green--text text--darken-1" ref="stats-counter-totalCreators" :from="0" :to="stats.totalCreators.value" easing="Power4.easeOut" />
                    </v-col>
                    <v-spacer></v-spacer>
                </v-row>
                <v-row>
                    <v-col v-if="!$vuetify.breakpoint.mobile" cols="1"></v-col>
                    <v-col cols="8">
                        <span class="font-weight-light nowrap">{{ stats.totalRIP.description }}</span>
                    </v-col>
                    <v-col cols="2">
                        <number class="text-h5 red--text text--darken-1" ref="stats-counter-totalRIP" :from="0" :to="stats.totalRIP.value" easing="Power4.easeOut" />
                    </v-col>
                    <v-spacer></v-spacer>
                </v-row>
                <v-row>
                    <v-col v-if="!$vuetify.breakpoint.mobile" cols="1"></v-col>
                    <v-col cols="8">
                        <span class="font-weight-light nowrap">{{ stats.totalReductionRisks.description }}</span>
                    </v-col>
                    <v-col cols="2">
                        <number class="text-h5 red--text text--darken-1" ref="stats-counter-totalReductionRisks" :from="0" :to="stats.totalReductionRisks.value" easing="Power4.easeOut" />
                    </v-col>
                    <v-spacer></v-spacer>
                </v-row>
            </v-container>
        </v-col>
        <v-spacer></v-spacer>
    </v-row>
</template>
<style scoped>
.nowrap { white-space: nowrap; }
</style>
<script>
import Vue from 'vue'
import VueNumber from 'vue-number-animation'

Vue.use(VueNumber)

export default {
    name: 'TsHeader',
    props: {
        cols: Number,
    },
    data: () => {
        return {
            stats: null,
        }
    },
    methods: {
        playCountersAnimations() {
            if (this.$refs['stats-counter-totalRIP']) {
                this.$refs['stats-counter-totalRIP'].restart()
            }
            if (this.$refs['stats-counter2']) {
                this.$refs['stats-counter2'].restart()
            }
            if (this.$refs['stats-counter3']) {
                this.$refs['stats-counter3'].restart()
            }
        },
    },
    mounted() {
        let self = this
        self.$backend.getStats().then((stats) => {
            self.stats = stats.reduce((acc, cur) => {
                const { description, value } = cur
                acc[cur.name] = { description, value }
                return acc
            }, {})
            setTimeout(self.playCountersAnimations, 500)
        })
    },
}
</script>
