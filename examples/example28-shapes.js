/* global uiRangeRow createButtonRow createRow */
/// <reference path="../src/LibXOR.ts" />
/// <reference path="htmlutils.js" />
/// <reference path="mathutils.js" />

const M65_DOT = 0;
const M65_CIRCLE = 1;
const M65_LINE = 2;
const M65_MAX_SHAPES = 3;

const BG_SIZE = 5.0;

const M65_COMMANDS = [
    { index: M65_DOT,    name: "DOT", params: 1 },
    { index: M65_CIRCLE, name: "CIRCLE", params: 3 },
    { index: M65_LINE,   name: "LINE", params: 4 },
];

class Mega65 {
    /**
     * 
     * @param {LibXOR} xor
     */
    constructor(xor) {
        this.xor = xor
        this.rc = xor.renderconfigs.load('gpu6502', 'shaders/basic.vert', 'shaders/basic-color.frag');

        this.penColor = xor.palette.BLACK;
        this.backgroundColor = xor.palette.WHITE;
        this.borderColor = xor.palette.CYAN;

        this.resizeViewport(0, 0, 320, 200);
        // Initialize the palette colors.
        this.palette = [];
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    resizeViewport(x, y, w, h) {
        // Ensure the ranges make sense for the device.
        w = GTE.clamp(w, 1, 320);
        h = GTE.clamp(h, 1, 200);
        x = GTE.clamp(x, 0, w - 1);
        y = GTE.clamp(y, 0, h - 1);
        this.viewportOrigin = Vector2.make(x, y);
        this.viewportSize = Vector2.make(w, h);
        this.viewportExtent = Vector2.make(x + w - 1, y + h - 1);
    }

    begin() {
        this.rc.use();

        this.mesh = this.xor.meshes.create('gpu6502');
        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        this.rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
        this.rc.uniformMatrix4f('CameraMatrix', cmatrix);
        this.rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());

        let pal = this.xor.palette;
        this.mesh.color3(this.getColor(this.penColor));
        this.mesh.normal3(Vector3.make(0, 0, 1));
    }

    /**
     * Returns an RGB color from the palette.
     * @param {number} color 
     * @returns {Vector3} 
     */
    getColor(color) {
        color = GTE.clamp(color | 0, 0, 255);
        // TODO: change this to look up the palette.
        let rgb = Vector3.makeZero();
        if (color < 16)
            rgb = this.xor.palette.getColor(color);
        return rgb;
    }

    BACKGROUND(color) {
        this.backgroundColor = GTE.clamp(color | 0, 0, 255);
        this.mesh.color3(this.getColor(this.backgroundColor));
        this.mesh.rect(this.viewportOrigin.x, this.viewportOrigin.y,
            this.viewportExtent.x, this.viewportExtent.y)
    }

    BORDER(color) {
        this.borderColor = GTE.clamp(color | 0, 0, 255);
    }

    PEN(color) {
        this.penColor = GTE.clamp(color | 0, 0, 255);
        this.mesh.color3(this.getColor(this.penColor));
    }

    /**
     * Draws a box on the screen.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} solid 
     */
    BOX(x1, y1, x2, y2, solid = 0) {
        this.mesh.color3(this.getColor(this.penColor));
        if (solid) {
            this.mesh.rect(x1, y1, x2, y2);
        } else {
            this.mesh.strokeRect(x1, y1, x2, y2);
        }
    }

    // BOX(x1, y1, x2, y2, x3, y3, x4, y4, solid) {
    //     let gl = this.xor.gl;
    //     this.mesh.color3(this.getColor(this.penColor));
    //     if (solid) {
    //         this.mesh.begin(gl.TRIANGLES);
    //         this.mesh.vertex(x1, y1, 0);
    //         this.mesh.vertex(x2, y2, 0);
    //         this.mesh.vertex(x3, y3, 0);

    //         // this.mesh.vertex(x4, y4, 0);
    //         // this.mesh.vertex()
    //     } else {
    //         this.mesh.strokeRect(x1, y1, x2, y2);
    //     }
    // }

    CIRCLE(ox, oy, radius, flags, start, stop) {
        let filled = (flags & 1) || 1;
        let nolegs = (flags & 2);
        let startAtTop = (flags & 4);
        let startAngle = start || 0;
        let stopAngle = stop || 360;

        if (startAngle == 0 && stopAngle == 360) {
            // TODO: draw an arc instead.
        }

        if (filled)
            this.mesh.circle(ox, oy, radius, 16);
        else
            this.mesh.strokeCircle(ox, oy, radius, 16);
    }

    /** */
    SCREEN(width, height) {

    }

    /**
     * Clears the viewport with the current pen color.
     */
    VIEWPORT_CLR() {

    }

    /**
     * 
     * @param {number} x Sets the left coordinate of the viewport.
     * @param {number} y Sets the right coordinate of the viewport.
     * @param {number} width Sets the width of the viewport.
     * @param {number} height Sets the height of the viewport.
     */
    VIEWPORT_DEF(x, y, width, height) {
        this.viewportOrigin = Vector2.make(x, y);
        this.viewportSize = Vector2.make(width, height);
    }
    
    end() {
        this.mesh.renderplain(this.rc);
    }

    // TODO:
    // WINDOW left, top, right, bottom, [clear]
    //   Sets the text screen window.
    // CHARDEF index, bit-matrix
    //   Change the bitmap matrix of characters
    // COLOR index
    //   Sets the foreground color of the text characters.
    // FOREGROUND index
    //   Sets the foreground color of the text characters.
    // CURSOR ON | OFF
    // CURSOR column, row, [style]
    //   Moves the text cursor to the specified position on the current text screen.

    // CUT x, y, width, height
    //   Copies the content of the specified rectangle and fills the region
    //   afterwards with the colour of the currently selected pen.
    // DOT x, y, color
    // DPAT type, [number, pattern]
    //   ”Drawing PATtern” sets the pattern of the graphics context for drawing commands.
    // ELLIPSE xc, yc, xr, yr [, flags , start, stop]
    //   Draws an ellipse.
    // GCOPY x, y, width, height
    // Copies the section into the cut/copy/paste buffer
    // GRAPHIC CLR
    //   Initialises the BASIC graphics system.
    // MOUSE ON [{, port, sprite, pos}]
    // MOUSE OFF
    //   Enables the mouse driver and connects the mouse at the specified port
    //   with the mouse pointer sprite.
    // MOVSPR number, position
    //   Moves a sprite on screen. 
    // PAINT x, y, mode [, region border colour]
    //   Performs a flood fill of an enclosed graphics area using the current pen colour.
    // PALETTE screen, colour, red, green, blue
    // PALETTE COLOR colour, red, green, blue
    // PALETTE RESTORE
    // PASTE x, y, width, height
    //   Pastes the content of the cut/copy/paste buffer into the screen.
    // PEN [pen, ] color
    // PIXEL(x, y)
    //   Gets the pixel of the coordinate.
    // POLYGON x, y, xrad, yrad, sides [{, drawsides, subtend, angle, solid}]
    //   Draws a regular n-sided polygon.
    // POS(0)
    //   Returns the cursor column relative to the currently used window.
    // SCREEN [screen,] width, height, depth
    // SCREEN CLR colour
    // SCREEN DEF width flag, height flag, depth
    // SCREEN SET drawscreen, viewscreen
    // SCREEN OPEN [screen]
q    // SCREEN CLOSE [screen]

}

class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.clearScreen = true;

        let p = document.getElementById('desc');
        p.innerHTML = `This app demonstrates the LibXOR 6502-inspired drawing primitives.`;

        let self = this;
        let controls = document.getElementById('controls');
        createButtonRow(controls, "bClearScreen", "Clear Screen", () => {
            self.clearScreen = true
        });
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic-color.frag');
        rc.useDepthTest = false;

        this.m65 = new Mega65(this.xor);

        let pal = this.xor.palette;

        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BLACK));
        bg.rect(-BG_SIZE, -BG_SIZE, BG_SIZE, BG_SIZE);
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;

        if (xor.input.checkKeys([" ", "Space"])) {
            this.clearScreen = true;
        }
    }

    render() {
        let xor = this.xor;
        let pal = this.xor.palette;

        if (this.clearScreen) {
            xor.graphics.clear(pal.YELLOW);
        }

        this.m65.begin();
        this.m65.CIRCLE(2 + Math.cos(xor.t1), 2);
        this.m65.PEN(pal.AZURE);
        this.m65.BOX(0, 0, 1, 2, 1);
        this.m65.end();
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