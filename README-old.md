# LibXOR

LibXOR is a TypeScript library for creating video games in HTML5. The main
inspiration comes from old 8-bit consoles like the Commodore VIC-20, Atari
2600, and NES. The later SNES and Sony Playstation are also inspirations. The
main goal is to enable developers to make modern 2D games with but as simply as
possible.

## Example Usage

```HTML
<html>
<head>
    <title>LibXOR example</title>
    <script src="LibXOR.js"></script>
</head>
<body>
    <script>
    class MyGame {
        constructor() {
            // parameters are width, height, and idName
            this.XOR = new LibXOR(640, 512, "libxor");
            let XOR = this.XOR;
            this.player = XOR.CreateOAM();
            this.player.position = XOR.Graphics.center;
        }

        run() {
            this.mainloop();
        }

        mainloop(t) {
            let self = this;
            this.XOR.StartFrame(t);
            this.update();
            this.display();
            this.XOR.FinishFrame();
            window.requestAnimationFrame((t) => {
                self.mainloop(t);
            });
        }

        update() {
            // do game update stuff here
            let XOR = this.XOR;

            this.player.position = Vector2.madd(XOR.dt, this.player.position, XOR.Input.xyaxis);

            if (XOR.Input.escapePressed) {
                this.player.position = XOR.Graphics.center;
            }
        }

        display() {
            let XOR = this.XOR;

            let size = 17;
            XOR.Graphics.DrawSquare(this.player.x, this.player.y, size);
        }
    }

    </script>
</body>
</html>
```

## Subsystems

{% octicon clippy %}

* GTE
  * Vector2
  * Vector3
  * Vector4
  * Matrix2
  * Matrix3
  * Matrix4
* Graphics
* Sound
* Music
* Input
