<template>
    <ts-grid :query="query" filter="imageHighlyRated"></ts-grid>
</template>
<style>
</style>
<script>
import TsGrid from '../components/TsGrid.vue'

export default {
    name: 'TheGrid',
    components: {
        TsGrid
    },
    props: {
    },
    data: function() {
        return {
            query: { count: 10, imageHighlyRated: true }
        }
    },
    methods: {
    },
    computed: {
        
    },
    mounted() {
    },
}
</script>
