const video = document.getElementById("camera")
const canvas = document.getElementById("canvas")
const draw = canvas.getContext("2d")

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

let isDrawing = false

// previous position of the mouse

let lastX = null
let lastY = null

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