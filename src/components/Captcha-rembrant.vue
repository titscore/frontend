<template>
    <v-container>
        <v-row>
            <v-col id="pictures" height="171px">
                <img ref="piece" id="piece" v-bind:style="pieceStyle" src="/slider-puzzle-piece.jpg" />
                <img ref="picture" id="picture" src="/slider-puzzle-picture.jpg" />
            </v-col>
        </v-row>
        <v-row>
            <v-col><v-slider ref="slider" v-model="slider" @change="change" max="256" style="max-width: 276px"></v-slider></v-col
        ></v-row>
    </v-container>
</template>
<style>
#piece {
    z-index: 1;
    position: absolute;
    top: 60px;
}
#picture {
    z-index: -1;
}
#pictures {
    height: 171px;
    flex-grow: 0 !important;
    padding: 0 !important;
}
</style>
<script>
import Rembrandt from 'rembrandt/build/browser'
import html2canvas from 'html2canvas'

export default {
    name: 'Captcha',
    props: {},
    components: {},
    data: function() {
        return {
            slider: null,
        }
    },
    computed: {
        pieceStyle: function() {
            return { transform: `rotateY(180deg) translateX(-${this.slider}px)` }
        },
    },
    methods: {
        change: async function(file2, ticks = this.slider) {
            let log = false
            if (Number.isInteger(file2)) {
                file2 = await this.getCanvas()
                log = true
            }
            let comparison = await this.compare(file2)
            if (log) console.log({ change: comparison, ticks: ticks })
            return { change: comparison, ticks: ticks }
        }, 
        compare: function(file2) {
            const file1 = this.$refs.picture.src
            const rembrandt = new Rembrandt({
                // `imageA` and `imageB` can be either Strings (file path on node.js,
                // public url on Browsers) or Buffers
                imageA: file1,
                imageB: file2,

                // Needs to be one of Rembrandt.THRESHOLD_PERCENT or Rembrandt.THRESHOLD_PIXELS
                thresholdType: Rembrandt.THRESHOLD_PERCENT,

                // The maximum threshold (0...1 for THRESHOLD_PERCENT, pixel count for THRESHOLD_PIXELS
                maxThreshold: 0.01,

                // Maximum color delta (0...255):
                maxDelta: 1,

                // Maximum surrounding pixel offset
                maxOffset: 0,

                renderComposition: false, // Should Rembrandt render a composition image?
                compositionMaskColor: Rembrandt.Color.RED, // Color of unmatched pixels
            })

            return rembrandt.compare().then((result) => {
                return Promise.resolve(result.differences)
            })
        },
        getCanvas: function() {
            return new Promise((resolve) => {
                html2canvas(document.querySelector('#pictures')).then((canvas) => {
                    canvas.toBlob((Blob) => {
                        const reader = new FileReader()
                        reader.readAsDataURL(Blob)
                        reader.onloadend = async () => {
                            resolve(reader.result)
                        }
                    })
                })
            })
        },
    },
    mounted() {
        let self = this
        setTimeout(async () => {
            let results = []
            for (let ticks = 0; ticks < this.$refs.slider.max; ticks += 10) {
                this.slider = ticks
                let file2 = await this.getCanvas()
                results.push(this.change(file2, ticks))
            }
            results = await Promise.all(results)
            let smallestChange = results.reduce((acc, cur) => {
                if (acc.change > cur.change) acc = cur
                return acc
            })
            self.$set(self, 'slider', smallestChange.ticks)
        }, 3000)
    },
}
</script>
