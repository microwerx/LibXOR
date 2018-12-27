/// <reference path="LibXOR.ts" />

function randomUint8() {
    return (Math.random() * 255.99) | 0;
}

function randomUint16() {
    return (Math.random() * 65535.99) | 0;
}

class GraphicsSystem {
    gl: WebGLRenderingContext | null = null;
    private glcontextid = "GraphicsSystem" + randomUint8().toString();

    constructor(private xor: LibXOR) {
    }

    setVideoMode(width: number, height: number) {
        let p = this.xor.parentElement;
        while (p.firstChild) {
            p.removeChild(p.firstChild);
        }

        let canvas = document.createElement("canvas");
        canvas.id = this.glcontextid;
        canvas.width = width;
        canvas.height = height;
        this.gl = canvas.getContext("webgl");
        p.appendChild(canvas);
    }

    render() {
        if (!this.gl) return;
        let gl = this.gl;
        let xor = this.xor;

        let s = Math.sin(xor.t1);
        gl.clearColor(0.3 * s, 0.1 * s, 0.2 * s, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}
