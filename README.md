# LibXOR Retro Console Library

LibXOR is a retro console. It is a game library written in TypeScript and useful for creating games in JavaScript or TypeScript. One of the key features is that it uses a memory mapped interface for using the graphics, sound, and input capabilities of the console. A second major key feature is that each memory location is actually a 4 component vector with a 32-bit floating point number. This means that rather than 64KiB of single bytes, we can store 65,536 4-Vectors.

What will happen to this is creation of a 256x256 4 component texture map that gets input into the graphics system and used as a source for a shader.

LibXOR is inspired by 6502 8-bit computers. The main idea is that we have a 64KiB memory space that is used by a number of peripherals. The main CPU interacts with these devices by use of memory mapped registers. The Microsoft 6502 BASIC language was often used and provided PEEK and POKE commands to change arbitrary memory values. For example, if you want to start a sound, you might POKE the volume and pitch values into memory. If you wanted to check the input system, you would PEEK those values.

## Developer's quick guide

* Install [Visual Studio Code](https://code.visualstudio.com/)
* Install [Node.js](https://nodejs.org/)
* Install Node packages (`npm install -g typescript eslint tslint lite-server concurrently`)
* Run Visual Studio Code and clone repository
* At the terminal run `npm start` to start the TypeScript compiler in watch mode and the HTTP server on port 3000

## Implemented Features

* Memory System with PEEK and POKE

## Example Program

```html
<html>
<head>
<title>A Simple LibXOR Game</title>
</head>
<body>
<h1>A Simple LibXOR Game</h1>
<div id="game"></div>
<script src="LibXOR.js"></script>
<script>
    let xor = new LibXOR("game");
    
    xor.graphics.setVideoMode(640, 360);
    
    xor.oninit = () => {
        let player = xor.Objects.get(0);
        player.palette = 0;
        player.bitmap = 255;
        let bitmap = xor.Graphics.Sprites.get(255);
        bitmap.setPixels(0,"00111100");
        bitmap.setPixels(1,"00111100");
        bitmap.setPixels(2,"00011000");
        bitmap.setPixels(3,"00111100");
        bitmap.setPixels(4,"00111100");
        bitmap.setPixels(5,"00111100");
        bitmap.setPixels(6,"00100100");
        bitmap.setPixels(7,"01100110");
        let music = xor.Sound.Patterns.get(0);
        music.setSteps(0, "1000100010001000");
        music.setNotes(0, "C000E000G000E000");
        music.setOctaves(0, "3000300030003000");
        music.instrument = 0;
        let instrument = xor.Sound.Instruments.get(0);
        instrument.pitch1.octave = 8;
        instrument.pitch1.shape = 0; // shape goes from triangle to saw to square to pwm
        instrument.filter1.cutoff = 440;
        instrument.filter1.resonance = 5.0;
        instrument.filter1.cv = "envelope1";
        instrument.envelope1.attack = 0;
        instrument.envelope1.decay = 1;
        instrument.envelope1.sustain = 0.5;
        instrument.envelope1.release = 0.5;

        music.bpm = 100;
    }
    
    xor.onupdate = () {
        let velocity = vec3(0, 0, 0);
        let player = xor.objects.get(0);
        
        if (xor.input.checkKeys(["ArrowLeft", "A", "a"])) {
            velocity.x -= 1;
        }

        if (xor.input.checkKeys(["ArrowRight", "D", "d"])) {
            velocity.x += 1;
        }

        if (xor.input.checkKeys(["ArrowUp", "W", "w"])) {
            velocity.y += 1;
        }

        if (xor.input.checkKeys(["ArrowDown", "S", "s"])) {
            velocity.y -= 1;
        }
        player.moveBy(velocity);
    };
    xor.start();
</script>
</body>
</html>
```

## TODOs

![] Vector/Matrix Library
![] Keyboard input with `InputSystem`
![] Mouse input with `InputSystem`
![] Gamepad input with `InputSystem`
![] Tiled Graphics with `GraphicsSystem`
![] Sprites with `GraphicsSystem`
![] PSG sound generator with `SoundSystem`

## FIXMEs

*None yet*

## Subsystems

### PSG Programmable Sound Generator

There are sixteen registers

* Register 0: Pitch for sound 1
* Register 1: Pitch for sound 2
* Register 2: Pitch for sound 3
* Register 3: Noise Period
* Register 4: Sound 1 Volume
* Register 5: Sound 2 Volume
* Register 6: Sound 3 Volume
* Register 7: Noise Volume
* Register 8: Envelope A
* Register 9: Envelope D
* Register 10: Envelope S
* Register 11: Envelope R
