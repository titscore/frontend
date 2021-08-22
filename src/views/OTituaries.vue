<template>
    <ts-grid :query="query" filter="reduction" :columns="{ desktop: 4 }"></ts-grid>
</template>
<style>
</style>
<script>
import TsGrid from '../components/TsGrid.vue'

export default {
    name: 'Otituaries',
    components: {
        TsGrid
    },
    props: {
    },
    data: function() {
        return {
            query: { count: 10, reduction: true }
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
