// window.addEventListener("load", () => {
//     const canvas = document.querySelector("#canvas");
//     const ctx = canvas.getContext("2d");
//     //  ctx.strokeStyle = "green";
//     // ctx.lineWidth = 5;
//     // ctx.strokeRect(100, 50, 100, 200)

//     // ctx.beginPath();
//     // ctx.moveTo(100, 100);
//     // ctx.lineTo(200, 100);
//     // //ctx.moveTo(200, 100);
//     // ctx.lineTo(150, 150);
//     // ctx.closePath();
//     // ctx.stroke();

//     let painting = false;
//     const startPosition = (e) => {
//         painting = true;
//         draw(e); // so we can draw a point at clicking
//     };
//     const endPosition = () => {
//         painting = false;
//         ctx.beginPath(); // so the line start over when we left the mouse so lines don't connect
//     };

//     const draw = (e) => {
//         //console.log("painting");
//         if (!painting) return;
//         console.log("X=", e.clientX);
//         console.log("y=", e.clientY);
//         ctx.lineWidth = 5;
//         ctx.lineCap = "round";

//         ctx.lineTo(e.clientX- canvas.offsetLeft, e.clientY- canvas.offsetLeft );
//         ctx.stroke();
//         ctx.beginPath(); // lines 35, 36 are not necessary , bt without them the line will be pixilated
//         ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
//     };
//     canvas.addEventListener("mousedown", startPosition);
//     canvas.addEventListener("mouseup", endPosition);
//     canvas.addEventListener("mousemove", draw);
// });



let canvas,
    ctx,
    flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

let x = "black",
    y = 2;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;

    console.log(w, h);

    canvas.addEventListener(
        "mousemove",
        function (e) {
            findxy("move", e);
        },
        false
    );
    canvas.addEventListener(
        "mousedown",
        function (e) {
            findxy("down", e);
        },
        false
    );
    canvas.addEventListener(
        "mouseup",
        function (e) {
            findxy("up", e);
            saveCanvasUrl();
        },
        false
    );
    canvas.addEventListener(
        "mouseout",
        function (e) {
            findxy("out", e);
        },
        false
    );
}

init();

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

// function erase() {
//     var m = confirm("Want to clear");
//     if (m) {
//         ctx.clearRect(0, 0, w, h);
//         document.getElementById("canvasimg").style.display = "none";
//     }
// }

// function save() {
//     document.getElementById("canvasimg").style.border = "2px solid";
//     var dataURL = canvas.toDataURL();
//     document.getElementById("canvasimg").src = dataURL;
//     document.getElementById("canvasimg").style.display = "inline";
// }

function findxy(res, e) {
    if (res == "down") {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == "up" || res == "out") {
        flag = false;
    }
    if (res == "move") {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}

function saveCanvasUrl() {
    document.querySelector('[type="hidden"]').value = canvas.toDataURL();
}

function getCanvasImg() {
    return canvas.toDataURL("image/png", 1.0);
}