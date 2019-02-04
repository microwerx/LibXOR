// LibXOR Test Application
// Copyright (c) 2018-2019 Jonathan Metzgar
// All Rights Reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
let xor = new LibXOR("game");

xor.graphics.setVideoMode(640, 360);

xor.oninit = () => {
    // let player = xor.Objects.get(0);
    // player.palette = 0;
    // player.bitmap = 255;
    // let bitmap = xor.Graphics.Sprites.get(255);
    // bitmap.setPixels(0, "00111100");
    // bitmap.setPixels(1, "00111100");
    // bitmap.setPixels(2, "00011000");
    // bitmap.setPixels(3, "00111100");
    // bitmap.setPixels(4, "00111100");
    // bitmap.setPixels(5, "00111100");
    // bitmap.setPixels(6, "00100100");
    // bitmap.setPixels(7, "01100110");
    // let music = xor.Sound.Patterns.get(0);
    // music.setSteps(0, "1000100010001000");
    // music.setNotes(0, "C000E000G000E000");
    // music.setOctaves(0, "3000300030003000");
    // music.instrument = 0;
    // let instrument = xor.Sound.Instruments.get(0);
    // instrument.pitch1.octave = 8;
    // instrument.pitch1.shape = 0; // shape goes from triangle to saw to square to pwm
    // instrument.filter1.cutoff = 440;
    // instrument.filter1.resonance = 5.0;
    // instrument.filter1.cv = "envelope1";
    // instrument.envelope1.attack = 0;
    // instrument.envelope1.decay = 1;
    // instrument.envelope1.sustain = 0.5;
    // instrument.envelope1.release = 0.5;

    // music.bpm = 100;
};

xor.onupdate = () => {
    let velocity = GTE.vec3(0, 0, 0);
    let player = xor.graphics.sprites[0];

    if (xor.input.checkKeys(["ArrowLeft", "KeyA", "A", "a"])) {
        velocity.x -= 1;
    }

    if (xor.input.checkKeys(["ArrowRight", "KeyD", "D", "d"])) {
        velocity.x += 1;
    }

    if (xor.input.checkKeys(["ArrowUp", "KeyW", "W", "w"])) {
        velocity.y += 1;
    }

    if (xor.input.checkKeys(["ArrowDown", "KeyS", "S", "s"])) {
        velocity.y -= 1;
    }

    let spr = Math.floor(Math.random() * 127.99);
    let base = xor.graphics.SpriteInfoMemoryStart + spr * 16;
    xor.memory.POKE(base + 0, Math.random() * 255);
    xor.memory.POKE(base + 1, Math.random() * 255);
    base = xor.graphics.SpriteInfoMemoryStart;
    xor.memory.POKE(base + 0, player.position.x + velocity.x);
    xor.memory.POKE(base + 1, player.position.y + velocity.y);

    if (velocity.x != 0.0 || velocity != 0.0 || Math.random() < 0.1) {
        let str = '';
        str += xor.memory.PEEK(base + 0).toPrecision(3) + ' ';
        str += xor.memory.PEEK(base + 1).toPrecision(3) + ' ';
        str += xor.memory.PEEK(base + 2).toPrecision(3) + ' ';
        str += xor.memory.PEEK(base + 3).toPrecision(3) + ' ';
        memElement.innerHTML = str;
    }
};

var memElement = document.createElement("pre");
document.body.appendChild(memElement);

xor.start();

function itohex(value) {
    let str = value.toString(16);
    switch (str.length) {
        case 0:
            str = '00';
            break;
        case 1:
            str = '0' + str;
            break;
        case 2:
            break;
        case 3:
            str = '0' + str;
            break;
    }
    return str;
}

let modelLastMemoryBase = 0;

function updateModel() {
    let palette = document.getElementById("palette").value | 0;
    let index = document.getElementById("paletteindex").value | 0;
    let color1 = document.getElementById("color1").value | 0;
    let color2 = document.getElementById("color2").value | 0;
    let colormix = document.getElementById("colormix").value | 0;
    let color1hue = document.getElementById("color1hue").value | 0;
    let color2hue = document.getElementById("color2hue").value | 0;
    let negative = document.getElementById("negative").value | 0;

    let byte1 = color1 + (color2 << 4);
    let byte2 = colormix + (color1hue << 3) + (color2hue << 5) + (negative << 7);
    let byte1str = itohex(byte1);
    let byte2str = itohex(byte2);
    let memoryBase = palette * 8 + index * 2;
    let memoryAddress = itohex(palette * 8 + index * 2);

    if (modelLastMemoryBase != memoryBase) {
        let base = modelLastMemoryBase;
        if (modelLastMemoryBase != 0) {
            // Save last palette entry
            xor.memory.POKE(base + 0, byte1);
            xor.memory.POKE(base + 1, byte2);
        }
        modelLastMemoryBase = memoryBase;
        base = memoryBase;
        // Read palette entry
        byte1 = xor.memory.PEEK(base + 0);
        byte2 = xor.memory.PEEK(base + 0);
        color1 = byte1 & 0xF;
        color2 = (byte1 >> 4) & 0xF;
        colormix = byte2 & 0xF;
        color1hue = (byte2 >> 3) & 0x3;
        color2hue = (byte2 >> 5) & 0x3;
        negative = (byte2 >> 7) & 0x1;
        document.getElementById("color1").value = color1;
        document.getElementById("color2").value = color2;
        document.getElementById("colormix").value = colormix;
        document.getElementById("color1hue").value = color1hue;
        document.getElementById("color2hue").value = color2hue;
        document.getElementById("negative").value = negative;
    }

    

    let memoryValue = document.getElementById("modelMemoryValue");
    memoryValue.textContent = memoryAddress + ": " + byte2str + byte1str;

    let palettecolor = document.getElementById("palettecolor");
    let color1color = document.getElementById("color1color");
    let color2color = document.getElementById("color2color");
    let colormixcolor = document.getElementById("colormixcolor");
    let color1huecolor = document.getElementById("color1huecolor");
    let color2huecolor = document.getElementById("color2huecolor");
    let negativecolor = document.getElementById("negativecolor");
    let indexcolor = document.getElementById("paletteindexcolor");

    let pal = xor.palette;
    let c1 = pal.getColor(color1);
    let c2 = pal.getColor(color2);
    let ch1 = pal.hueshiftColor(c1, color1hue);
    let ch2 = pal.hueshiftColor(c2, color2hue);
    let cmix = pal.mixColors(ch1, ch2, colormix);
    let cneg = pal.negativeColor(cmix);

    if (palettecolor) palettecolor.style.background = pal.getHtmlColor(pal.getColor(palette));
    if (indexcolor) indexcolor.style.background = pal.getHtmlColor(negative ? cneg : cmix);
    if (color1color) color1color.style.background = pal.getHtmlColor(c1);
    if (color2color) color2color.style.background = pal.getHtmlColor(c2);
    if (colormixcolor) colormixcolor.style.background = pal.getHtmlColor(cmix);
    if (color1huecolor) color1huecolor.style.background = pal.getHtmlColor(ch1);
    if (color2huecolor) color2huecolor.style.background = pal.getHtmlColor(ch2);
    if (negativecolor) negativecolor.style.background = pal.getHtmlColor(cneg);

    let rgbmix = [
        Math.floor(cmix.r * 255.99),
        Math.floor(cmix.g * 255.99),
        Math.floor(cmix.b * 255.99)
    ];
    let rgbneg = [
        Math.floor(cneg.r * 255.99),
        Math.floor(cneg.g * 255.99),
        Math.floor(cneg.b * 255.99)
    ];

    e = document.getElementById('actualrgbmix');
    if (e) e.innerHTML = "<div class='column left'>RGB Color: (" + rgbmix[0] + " " + rgbmix[1] + " " + rgbmix[2] + ")</div><div class='column right'>HTML Color: " + pal.getHtmlColor(cmix) + "</div></div>";
    e = document.getElementById('actualrgbneg');
    if (e) e.innerHTML = "<div class='column left'>RGB Color: (" + rgbneg[0] + " " + rgbneg[1] + " " + rgbneg[2] + ")</div><div class='column right'>HTML Color: " + pal.getHtmlColor(cneg) + "</div></div>";
}

function appendRange(parent, name, min, max, step, id) {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");
    let td4 = document.createElement("td");
    td4.id = id + "color";
    td4.style.width = "100px";
    td4.style.background = "#00ff00";
    parent.appendChild(tr);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    let label = document.createElement("label");
    label.innerText = name;
    label.id = id + "label";
    label.htmlFor = id;

    let range = document.createElement("input");
    range.id = id;
    range.type = "range";
    range.min = min;
    range.max = max;
    range.step = step;
    range.value = 0;

    let value = document.createElement("span");
    value.id = id + "value";
    value.textContent = "0";

    td1.appendChild(label);
    td2.appendChild(range);
    td3.appendChild(value);

    range.onchange = (e) => {
        let el = document.getElementById(id + "value");
        if (el) el.innerText = e.srcElement.value.toString(16);
        updateModel();
    };

    range.oninput = (e) => {
        updateModel();
    };
}

function appendDiv(parent, id, className) {
    let e = document.createElement("div");
    e.id = id;
    e.className = className;
    parent.appendChild(e);
    return e;
}

function appendElement(parent, type, id, className) {
    let e = document.createElement(type);
    e.id = id;
    e.className = className;
    parent.appendChild(e);
    return e;
}

function appendHeader(parent, level, text, className = "") {
    let h = (level < 0 || level > 6) ? "h1" : ("h" + level.toString());
    let e = document.createElement(h);
    e.className = className;
    e.textContent = text;
    parent.appendChild(e);
    return e;
}

// Palette Editor
let pe = appendElement(document.body, "div", "paletteEditor", "");
let ph1 = appendHeader(pe, 1, "Palette Editor");
let pt = document.createElement("table");
pe.appendChild(pt);
appendRange(pt, "Palette", 0, 15, 1, "palette");
appendRange(pt, "Index", 0, 3, 1, "paletteindex");
appendRange(pt, "Color 1", 0, 15, 1, "color1");
appendRange(pt, "Color 2", 0, 15, 1, "color2");
appendRange(pt, "Color Mix", 0, 7, 1, "colormix");
appendRange(pt, "Color 1 Hue", 0, 3, 1, "color1hue");
appendRange(pt, "Color 2 Hue", 0, 3, 1, "color2hue");
appendRange(pt, "Negative", 0, 1, 1, "negative");
appendElement(pe, "p", "modelColorValue", "");
appendElement(pe, "p", "modelMemoryValue", "");
appendDiv(pe, "actualrgbmix", "row monospace");
appendDiv(pe, "actualrgbneg", "row monospace");
updateModel();