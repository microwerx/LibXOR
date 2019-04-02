/// <reference path="LibXOR.js" />

let div = document.getElementById('project');
let canvas = document.createElement("canvas");
div.appendChild(canvas);
let h = (div.clientWidth / 1.5) & 0xFFFE;
canvas.width = h * 1.5;
canvas.height = h;
canvas.style.borderRadius = "4px";
let gl = canvas.getContext("webgl");
gl.clearColor(1.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

class App {
    constructor() {
        this.t1 = 0;
        this.t0 = 0;
        this.dt = 0;
    }

    update(dtInSeconds) {

    }

    draw() {
        gl.clearColor(Math.abs(Math.sin(this.t1)) * 1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    mainloop() {
        let self = this;
        requestAnimationFrame((t) => {
            let tSeconds = t / 1000.0;
            self.t0 = self.t1;
            self.t1 = tSeconds;
            self.dt = self.t1 - self.t0;
            self.update(self.dt);
            self.draw();
            self.mainloop();
        });
    }
}

let app = new App();
app.mainloop();
