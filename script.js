const video = document.getElementById("camera")
const canvas = document.getElementById("canvas")
const draw = canvas.getContext("2d")

// initialize different colors
const colors = ["black", "white", "red", "green", "blue"]
let colorIndex = 0
let currentColor = colors[colorIndex]

// resize canvas so that it is the same size as it appears on the screen

canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight

// start the webcam

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    })
    video.srcObject = stream
}

startCamera()

// draw a red circle on the top of web cam

/* draw.fillStyle = "red"
draw.beginPath();
draw.arc(200, 200, 20, 0, Math.PI * 2)
draw.fill() */

// draw a circle wherever the cursor moves

//let isDrawing = false

// using little finger to change the color
let previousLittleIsUp = false;

// previous position of the mouse

let lastX = null
let lastY = null

// for smoothing
let smoothX = null
let smoothY = null

/*
// mouse button is pressed
canvas.addEventListener("mousedown", function(event) {
    isDrawing = true

    const rectangle = canvas.getBoundingClientRect()
    lastX = event.clientX - rectangle.left
    lastY = event.clientY - rectangle.top
})

// mouse button is released
canvas.addEventListener("mouseup", function() {
    isDrawing = false
    lastX = null
    lastY = null
})

// mouse leaves the canvas
canvas.addEventListener("mouseleave", function() {
    isDrawing = false
    lastX = null
    lastY = null
})

canvas.addEventListener("mousemove", function(event) {

    if(!isDrawing) {
        return
    }

    // canvas position relative to the browser window

    const rectangle = canvas.getBoundingClientRect();

    const x = event.clientX - rectangle.left
    const y = event.clientY - rectangle.top

    if (lastX === null){
        lastX = x
        lastY = y
        return
    }

    // drawing settings

    draw.strokeStyle = "red"
    draw.lineWidth = 5
    draw.lineCap = "round"

    // drawing from previous position to the current position

    draw.beginPath()
    draw.moveTo(lastX, lastY)
    draw.lineTo(x, y)
    draw.stroke()

    // make the current position the previous position
    lastX = x
    lastY = y
})
*/

// MediaPipe hands

const hands = new Hands({
    locateFile: function(file) {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    }
})

// MediaPipe Settings

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})

// MediaPipe results
hands.onResults(function(results) {
    //console.log(results.multiHandLandmarks)
    // only the fingertisps
    /*if(results.multiHandLandmarks.length > 0){
        const hand = results.multiHandLandmarks[0]
        const indexFinger = hand[8]
        // MediaPipe coords. into Canvas coords
        const x = (1 - indexFinger.x) * canvas.width
        const y = indexFinger.y * canvas.height

        // draw a red dot
        draw.beginPath()
        draw.arc(x, y, 10, 0, Math.PI * 2)
        draw.fillStyle = "red"
        draw.fill()
    }*/

    if(results.multiHandLandmarks.length === 0){
        lastX = null
        lastY = null
        smoothX = null
        smoothY = null
        return
    }

    const hand = results.multiHandLandmarks[0]
    // index finger
    const fingerTip = hand[8]
    const joint = hand[6]
    const fingerIsUp = fingerTip.y < joint.y
    // middle finger
    const middleFingerTip = hand[12]
    const middleJoint = hand[10]
    const middleFingerIsUp = middleFingerTip.y < middleJoint.y
    // little Finger
    const littleTip = hand[20]
    const littleJoint = hand[18]
    const littleIsUp = littleTip.y < littleJoint.y

    // using little to change the color
    if(littleIsUp && !previouslittleIsUp){
        colorIndex++;
        if(colorIndex >= colors.length){
            colorIndex = 0
        }
        currentColor = colors[colorIndex]
    }

    previouslittleIsUp = littleIsUp

    // eraser mode
    const eraser = fingerIsUp && middleFingerIsUp

    // use middle finger to clear/reset
    if(middleFingerIsUp && !fingerIsUp){
        draw.clearRect(0, 0, canvas.width, canvas.height)
    }

    // MediaPipe coords. into Canvas coords
    const x = (1 - fingerTip.x) * canvas.width
    const y = fingerTip.y * canvas.height

    const smoothing = 0.7

    if(smoothX === null){
        smoothX = x
        smoothY = y
    }else {
        smoothX = smoothX * smoothing + x * (1 - smoothing)
        smoothY = smoothY * smoothing + y * (1 - smoothing)
    }

    if(!fingerIsUp){
        lastX = null
        lastY = null
        smoothX = null
        smoothY = null
        return
    }

    if (lastX === null){
        lastX = x
        lastY = y
        return
    }

    // drawing settings

    if(eraser) {
        draw.globalCompositeOperation = "destination-out"
        draw.lineWidth = 30
    }else {
        draw.globalCompositeOperation = "source-over"
        draw.strokeStyle = currentColor
        draw.lineWidth = 5
        draw.lineCap = "round"
    }

    // drawing from previous position to the current position

    draw.beginPath()
    draw.moveTo(lastX, lastY)
    draw.lineTo(smoothX, smoothY)
    draw.stroke()

    // make the current position the previous position
    lastX = smoothX
    lastY = smoothY
    
})

// Sending camera frames to MediaPipe

const camera = new Camera(video, {
    onFrame: async function() {

        await hands.send({
            image: video
        })
    },
    width: 640,
    height: 480
})

camera.start()