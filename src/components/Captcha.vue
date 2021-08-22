<template>
    <v-container>
        <v-row>
            <v-col id="pictures" height="171px">
                <img ref="piece" id="piece" :style="pieceStyle" src="/slider-puzzle-piece.jpg" />
                <img ref="picture" id="picture" src="/slider-puzzle-picture.jpg" />
            </v-col>
            
            <v-col>
                <canvas id="canvasOutput"></canvas>
            </v-col>

            <v-col>
                <div class="captcha_verify_container">
                    <img class="captcha_verify_img_slide" src="/slider-puzzle-piece.jpg" />
                    <img id="captcha-verify-image" src="/slider-puzzle-picture.jpg" />
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col><v-slider step="1" max="275" v-model="pieceLocation" style="max-width: 275px"></v-slider></v-col
        ></v-row>
        <script async type="application/javascript" src="/opencv.js"></script>
    </v-container>
</template>
<style>
#piece {
    position: absolute;
    top: 60px;
}
#pictures {
    height: 171px;
    flex-grow: 0 !important;
    padding: 0 !important;
}
</style>
<script>
import simpleBlobDetector from '../SimpleBlobDetector'

export default {
    name: 'Captcha',
    props: {},
    components: {},
    data: function() {
        return {
            pieceLocation: 0
        }
    },
    methods: {
        detectPieceLocation: function() {
            let src = cv.imread('picture')
            let dst = new cv.Mat()
            cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0)
            // You can try more different parameters
            cv.Canny(src, dst, 600, 1100, 3, false)

            let M = cv.Mat.ones(2, 2, cv.CV_8U)
            let anchor = new cv.Point(-1, -1)
            cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue())

            const mask = new cv.Mat(dst.rows + 2, dst.cols + 2, cv.CV_8U, [0, 0, 0, 0])
            cv.floodFill(dst, mask, new cv.Point(5, 5), [255, 255, 255, 0])

            cv.imshow('canvasOutput', dst)

            let location = simpleBlobDetector(cv.imread('canvasOutput'))[0]
            src.delete()
            dst.delete()
            this.pieceLocation = location.pt.x
            return this.pieceLocation
        },
    },
    computed: {
        pieceStyle: function() {
            return { transform: `rotateY(180deg) translateX(-${this.pieceLocationWithOffset}px)` }
        },
        pieceLocationWithOffset: function() {
            return Math.abs(this.pieceLocation - 0) // half of puzzle piece width
        }
    },
    mounted() {
        /*
        let self = this
        window.addEventListener('load', event => {
            event
            setTimeout(() => {
                self.detectPieceLocation()
            }, 3000)
        })
        */
    },
}
</script>
