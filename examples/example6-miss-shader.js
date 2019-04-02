/**
 * Creates a row div with a left and right column. It expects CSS class row, column, left, and right.
 * @param {string} leftContent 
 * @param {string} rightContent 
 */
function createRow(leftContent = "", rightContent = "") {
    let row = document.createElement('div');
    row.className = 'row';
    let left = document.createElement('div');
    left.className = 'column left';
    left.innerHTML = leftContent;
    let right = document.createElement('div');
    right.className = 'column right';
    right.innerHTML = rightContent;
    row.appendChild(left);
    row.appendChild(right);
    return row;
}

/**
 * createRangeRow creates a row with a range control
 * @param {HTMLElement} parent The element that should be appended to
 * @param {string} id The name of the range variable
 * @param {number} curValue The current value of the range
 * @param {number} minValue The minimum value of the range
 * @param {number} maxValue The maximum value of the range
 * @param {number} stepValue The step of the range control (default 1)
 * @returns {HTMLElement} The created HTMLElement div
 */
function createRangeRow(parent, id, curValue, minValue, maxValue, stepValue = 1, isvector = false) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    if (!isvector) {
    rContent += "<input type='range' id='" + id + "' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
    } else {
        rContent += "<input type='range' id='" + id + "1' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<input type='range' id='" + id + "2' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<input type='range' id='" + id + "3' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
    }
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}

/**
 * getRangeValue returns the number of a range control
 * @param {number} id 
 * @returns the value of the range control or 0
 */
function getRangeValue(id) {
    let e = document.getElementById(id);
    if (!e) return 0;
    return e.value;
}

/**
 * getRangeVector3
 * @param {string} id The id of the range controls ending with 1, 2, 3. Example: id="sky", we get "sky1", "sky2", etc.
 * @returns {Vector3} A Vector3 with the values from controls id1, id2, and id3.
 */
function getRangeVector3(id) {
    return Vector3.make(
        getRangeValue(id + "1"),
        getRangeValue(id + "2"),
        getRangeValue(id + "3")
    );
}

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `This graphics demonstration of a simple ray tracer demonstrates
        a miss shader used to render the sky.`;
        
        let c = document.getElementById('controls');
        c.appendChild(createRow('iSkyMode', '<input id="iSkyMode" type="range" min="0", max="5", value="1" />'));
        createRangeRow(c, 'iTurbidity', 1, 1, 10, 1);
        createRangeRow(c, 'iAlbedo', 0, 0, 10, 1, true);
        createRangeRow(c, 'fSunInclination', 90, 0, 180, 1);
        createRangeRow(c, 'fSunAzimuth', 0, -360, 360, 1);
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'raytracer.vert', 'raytracer-miss.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let screen = this.xor.meshes.create('fullscreenquad');
        screen.color3(pal.getColor(pal.WHITE));
        screen.rect(0, 0, this.xor.graphics.width, this.xor.graphics.height);
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            resetSim = true;
        }
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.RED);

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform1f('iTime', xor.t1);
            rc.uniform1f('iTimeDelta', xor.dt);
            rc.uniform1i('iFrame', xor.frameCount);
            rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));

            let fSunInclination = getRangeValue('fSunInclination');
            let fSunAzimuth = getRangeValue('fSunAzimuth');
            let uSunDirTo = Vector3.makeFromSpherical(GTE.radians(fSunAzimuth), GTE.radians(fSunInclination));
            rc.uniform3f('uSunDirTo', uSunDirTo);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('fullscreenquad', rc);
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