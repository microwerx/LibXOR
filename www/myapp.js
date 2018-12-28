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

    if (velocity.x != 0.0 || velocity!= 0.0 || Math.random() < 0.1) {
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
