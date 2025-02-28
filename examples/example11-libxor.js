// LibXOR Test Application
// Copyright (c) 2018-2019 Jonathan Metzgar
// All Rights Reserved.
//
// See LICENSE for details.
//
let vshader = `
uniform mat4 ProjectionMatrix;
uniform mat4 CameraMatrix;
uniform mat4 WorldMatrix;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTexcoord;
attribute vec3 aColor;

// These MUST match the fragment shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    vNormal = (WorldMatrix * vec4(aPosition, 0.0)).xyz;
    vColor = aColor;
    vTexcoord = aTexcoord;
    vec4 p = WorldMatrix * vec4(aPosition, 1.0);
    vPosition = p.xyz;
    gl_Position = ProjectionMatrix * CameraMatrix * p;
}
`;

let fshader = `
precision highp float;

uniform sampler2D MapKd;
uniform sampler2D MapKs;
uniform sampler2D MapNormal;
uniform float MapKdMix;
uniform float MapKsMix;
uniform float MapNormalMix;
uniform vec3 Kd;
uniform vec3 Ks;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    // set to white
    gl_FragColor = vec4(vColor, 1.0);
}
`;

class App {
    constructor() {
        this.xor = new LibXOR("project");
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.create('default');
        rc.compile(vshader, fshader);
        rc.useDepthTest = true;

        let rect = this.xor.meshes.create('rect');
        rect.begin(gl.TRIANGLE_FAN);
        rect.normal(0, 0, 1);
        rect.color(1, 1, 1);
        rect.texcoord(0, 0, 0);
        rect.position(-1, -1, 0);
        rect.texcoord(0, 1, 0);
        rect.position(-1, 1, 0);
        rect.texcoord(1, 1, 0);
        rect.position(1, 1, 0);
        rect.texcoord(1, 0, 0);
        rect.position(1, -1, 0);
        rect.addIndex(0);
        rect.addIndex(1);
        rect.addIndex(2);
        rect.addIndex(3);
    }

    start() {
        this.mainloop();
    }

    update(dt) {

    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(1.0, 0.0, 0.0, 1.0);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(xor.t1, 15 * Math.sin(xor.t1), 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeRotation(35 * xor.t1, 0, 1, 0));
            xor.meshes.render('rect', rc, xor.fluxions.scenegraph);
        }
        xor.renderconfigs.use(null);
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            self.update(self.xor.dt);
            self.render();
            self.mainloop();
        });
    }
}

let app = new App();
app.init();
app.start();