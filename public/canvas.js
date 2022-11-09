window.addEventListener("load", () => {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    // ctx.strokeStyle = "green";
    // ctx.lineWidth = 5;
    //ctx.strokeRect(100, 50, 100, 200)

    // ctx.beginPath();
    // ctx.moveTo(100, 100);
    // ctx.lineTo(200, 100);
    // //ctx.moveTo(200, 100);
    // ctx.lineTo(150, 150);
    // ctx.closePath();
    // ctx.stroke();

    let painting = false;
    const startPosition = (e) => {
        painting = true;
        draw(e); // so we can draw a point at clicking
    };
    const endPosition = () => {
        painting = false;
        ctx.beginPath(); // so the line start over when we left the mouse so lines don't connect
    };

    const draw = (e) => {
        //console.log("painting");
        if (!painting) return;
        console.log("painting");
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath(); // lines 35, 36 are not necessary , bt without them the line will be pixilated
        ctx.lineTo(e.clientX - this.offsetLeft, e.clientY - this.offsetTop);
    };
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", endPosition);
    canvas.addEventListener("mousemove", draw);
});
