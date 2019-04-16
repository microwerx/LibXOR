/// <reference path="LibXOR.ts" />

namespace XOR {
    export enum Color {
        BLACK = 0,
        GRAY33 = 1,
        GRAY67 = 2,
        WHITE = 3,
        RED = 4,
        ORANGE = 5,
        YELLOW = 6,
        GREEN = 7,
        CYAN = 8,
        AZURE = 9,
        BLUE = 10,
        VIOLET = 11,
        ROSE = 12,
        BROWN = 13,
        GOLD = 14,
        FORESTGREEN = 15
    }

    export enum HueShift {
        Zero = 0,
        SevenHalf = 1,
        Fifteen = 2,
        OneEighty = 3
    }

    export class PaletteSystem {
        readonly BLACK = 0;
        readonly GRAY33 = 1;
        readonly GRAY67 = 2;
        readonly WHITE = 3;
        readonly RED = 4;
        readonly ORANGE = 5;
        readonly YELLOW = 6;
        readonly GREEN = 7;
        readonly CYAN = 8;
        readonly AZURE = 9;
        readonly BLUE = 10;
        readonly VIOLET = 11;
        readonly ROSE = 12;
        readonly BROWN = 13;
        readonly GOLD = 14;
        readonly FORESTGREEN = 15;

        constructor(public xor: LibXOR) { }

        /**
         * 
         * @param index (0 = BLACK, 1 = GRAY33, 2 = GRAY67, 3 = WHITE, 4 = RED, 5 = ORANGE, 6 = YELLOW, 7 = GREEN, 8 = CYAN, 9 = AZURE, 10 = BLUE, 11 = VIOLET, 12 = ROSE, 13 = BROWN, 14 = GOLD, 15 = FORESTGREEN)
         * @returns Vector3 color with RGB values 0 to 1
         */
        getColor(index: number): Vector3 {
            if (index == 0) return GTE.vec3(0.000, 0.000, 0.000); //Black
            if (index == 1) return GTE.vec3(0.333, 0.333, 0.333); //Gray33
            if (index == 2) return GTE.vec3(0.667, 0.667, 0.667); //Gray67
            if (index == 3) return GTE.vec3(1.000, 1.000, 1.000); //White
            if (index == 4) return GTE.vec3(1.000, 0.000, 0.000); //Red
            if (index == 5) return GTE.vec3(0.894, 0.447, 0.000); //Orange
            if (index == 6) return GTE.vec3(0.894, 0.894, 0.000); //Yellow
            if (index == 7) return GTE.vec3(0.000, 1.000, 0.000); //Green
            if (index == 8) return GTE.vec3(0.000, 0.707, 0.707); //Cyan
            if (index == 9) return GTE.vec3(0.000, 0.447, 0.894); //Azure
            if (index == 10) return GTE.vec3(0.000, 0.000, 1.000); //Blue
            if (index == 11) return GTE.vec3(0.447, 0.000, 0.894); //Violet
            if (index == 12) return GTE.vec3(0.894, 0.000, 0.447); //Rose
            if (index == 13) return GTE.vec3(0.500, 0.250, 0.000); //Brown
            if (index == 14) return GTE.vec3(0.830, 0.670, 0.220); //Gold
            if (index == 15) return GTE.vec3(0.250, 0.500, 0.250); //ForestGreen
            return GTE.vec3(0.0, 0.0, 0.0); // Black
        }

        /**
         * calcColor(color1, color2, colormix, color1hue, color2hue, negative)
         * @param color1 0 to 15
         * @param color2 0 to 15
         * @param colormix 0 to 7
         * @param color1hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param color2hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param negative 0 = none, 1 = 1 - RGB
         * @returns Vector3 color with RGB values 0 to 1
         */
        calcColor(color1: number, color2: number, colormix: number, color1hue: number, color2hue: number, negative: number): Vector3 {
            let c1 = this.getColor(color1);
            let c2 = this.getColor(color2);
            let ch1 = this.hueshiftColor(c1, color1hue);
            let ch2 = this.hueshiftColor(c2, color2hue);
            let cmix = this.mixColors(ch1, ch2, colormix);
            let cneg = negative ? this.negativeColor(cmix) : cmix;
            return cneg;
        }

        /**
         * calcColorBits(bits)
         * @param bits 16 bit number (0-3: color1, 4-7: color2, 8-10: mix, 9-11: color1 hue shift, 12-14: color2 hue shift, 15: negative)
         * @returns Vector3 color with RGB values 0 to 1
         */
        calcColorBits(bits: number): Vector3 {
            let color1 = (bits | 0) & 0xF;
            let color2 = (bits >> 4) & 0xF;
            let colormix = (bits >> 8) & 0x7;
            let color1hue = (bits >> 11) & 0x3;
            let color2hue = (bits >> 14) & 0x3;
            let negative = (bits >> 15) & 0x1;

            return this.calcColor(color1, color2, colormix, color1hue, color2hue, negative);
        }

        /**
         * calcBits(color1, color2, colormix, color1hue, color2hue, negative)
         * @param color1 0 to 15
         * @param color2 0 to 15
         * @param colormix 0 to 7
         * @param color1hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param color2hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param negative 0 = none, 1 = 1 - RGB
         * @returns number representing 16-bit XOR color model
         */
        calcBits(color1: number, color2: number, colormix: number, color1hue: number, color2hue: number, negative: number): number {
            let bits = 0;
            bits |= (color1 & 0xF);
            bits |= (color2 & 0xF) << 4;
            bits |= (colormix & 0x7) << 8;
            bits |= (color1hue & 0x3) << 11;
            bits |= (color2hue & 0x3) << 14;
            bits |= (negative & 0x1) << 15;
            return bits;
        }

        /**
         * mixColors(color1, color2, mix)
         * @param color1 RGB color with values 0 to 1
         * @param color2 RGB color with values 0 to 1
         * @param mix 0 to 7 representing lerp mix
         * @returns Vector3 color with RGB values 0 to 1
         */
        mixColors(color1: Vector3, color2: Vector3, mix: number): Vector3 {
            let t = GTE.clamp(1.0 - mix / 7.0, 0.0, 1.0);
            return GTE.vec3(
                GTE.lerp(color1.x, color2.x, t),
                GTE.lerp(color1.y, color2.y, t),
                GTE.lerp(color1.z, color2.z, t)
            );
        }

        /**
         * hueshiftcolor(color, shift)
         * @param color RGB color with values 0 to 1
         * @param shift 0 = no shift, 1 = 7.5 degrees, 2 = 15 degrees, 3 = 180 degrees
         * @returns Vector3 color with RGB values 0 to 1
         */
        hueshiftColor(color: Vector3, shift: number): Vector3 {
            let hue = 0;
            if (shift == 1) hue = 7.5 / 360;
            if (shift == 2) hue = 15 / 360;
            if (shift == 3) hue = 0.5;
            let hsl = XOR.PaletteSystem.rgb2hsl(color);
            hsl.x += hue;
            return XOR.PaletteSystem.hsl2rgb(hsl);
        }

        /**
         * negativeColor(color3)
         * @param color RGB color with values 0 to 1
         * @returns Vector3 representing 1 - color
         */
        negativeColor(color: Vector3): Vector3 {
            return GTE.vec3(
                1.0 - color.x,
                1.0 - color.y,
                1.0 - color.z
            );
        }

        /**
         * getHtmlColor(color: Vector3)
         * @param color RGB color with values 0 to 1
         * @returns string valid html color
         */
        getHtmlColor(color: Vector3): string {
            let r = (GTE.clamp(color.x * 255.99, 0, 255) | 0).toString(16);
            let g = (GTE.clamp(color.y * 255.99, 0, 255) | 0).toString(16);
            let b = (GTE.clamp(color.z * 255.99, 0, 255) | 0).toString(16);
            if (r.length % 2) r = '0' + r;
            if (g.length % 2) g = '0' + g;
            if (b.length % 2) b = '0' + b;
            return '#' + r + g + b;
        }

        /**
         * setpalette(paletteIndex, colorIndex, color1, color2, colormix, color1hue, color2hue, negative)
         * @param paletteIndex 0 to 15
         * @param colorIndex 0 to 15
         * @param color1 0 to 15
         * @param color2 0 to 15
         * @param colormix 0 to 7
         * @param color1hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param color2hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param negative 0 = none, 1 = 1 - RGB
         * @returns nothing
         */
        setpalette(paletteIndex: number, colorIndex: number,
            color1: number, color2: number, colormix: number, color1hue: number, color2hue: number, negative: number) {
            let bits = this.calcBits(color1, color2, colormix, color1hue, color2hue, negative);
            this.setpalettebits(paletteIndex, colorIndex, bits);
        }

        /**
         * setpalettebits(paletteIndex, colorIndex, bits)
         * @param paletteIndex 0 to 15
         * @param colorIndex 0 to 15
         * @param bits 16 bit number (0-3: color1, 4-7: color2, 8-10: mix, 9-11: color1 hue shift, 12-14: color2 hue shift, 15: negative)
         * @returns nothing
         */
        setpalettebits(paletteIndex: number, colorIndex: number, bits: number) {
            if (!isFinite(paletteIndex) || paletteIndex < 0 || paletteIndex > 15) return;
            if (!isFinite(colorIndex) || colorIndex < 0 || colorIndex > 15) return;

            this.xor.memory.POKE(this.xor.memory.PALETTESTART + paletteIndex * 16 + colorIndex, bits);
        }

        /**
         * getpalette(paletteIndex, colorIndex)
         * @param paletteIndex 0 - 15
         * @param colorIndex 0 - 15
         * @returns Vector3 color with RGB values 0 to 1
         */
        getpalette(paletteIndex: number, colorIndex: number): Vector3 {
            let bits = this.getpalettebits(paletteIndex, colorIndex);
            return this.calcColorBits(bits);
        }

        /**
         * getpalettebits(paletteIndex, colorIndex)
         * @param paletteIndex 0 - 15
         * @param colorIndex 0 - 15
         * @returns integer representing 16-bit LibXOR color model
         */
        getpalettebits(paletteIndex: number, colorIndex: number): number {
            if (!isFinite(paletteIndex) || paletteIndex < 0 || paletteIndex > 15) return 0;
            if (!isFinite(colorIndex) || colorIndex < 0 || colorIndex > 15) return 0;
            return this.xor.memory.PEEK(this.xor.memory.PALETTESTART + paletteIndex * 16 + colorIndex);
        }

        private static hue2rgb(f1: number, f2: number, hue: number): number {
            if (hue < 0.0)
                hue += 1.0;
            else if (hue > 1.0)
                hue -= 1.0;
            let res = 0.0;
            if ((6.0 * hue) < 1.0)
                res = f1 + (f2 - f1) * 6.0 * hue;
            else if ((2.0 * hue) < 1.0)
                res = f2;
            else if ((3.0 * hue) < 2.0)
                res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
            else
                res = f1;
            return res;
        }

        private static hsl2rgb(hsl: Vector3): Vector3 {
            if (hsl.y == 0.0) {
                return GTE.vec3(hsl.z, hsl.z, hsl.z); // Luminance
            } else {
                let f2: number;

                if (hsl.z < 0.5)
                    f2 = hsl.z * (1.0 + hsl.y);
                else
                    f2 = hsl.z + hsl.y - hsl.y * hsl.z;

                let f1 = 2.0 * hsl.z - f2;

                return GTE.vec3(
                    XOR.PaletteSystem.hue2rgb(f1, f2, hsl.x + (1.0 / 3.0)),
                    XOR.PaletteSystem.hue2rgb(f1, f2, hsl.x),
                    XOR.PaletteSystem.hue2rgb(f1, f2, hsl.x - (1.0 / 3.0))
                );
            }
        }

        private static rgb2hsl(rgb: Vector3): Vector3 {
            let cmin = Math.min(rgb.x, Math.min(rgb.y, rgb.z));
            let cmax = Math.max(rgb.x, Math.max(rgb.y, rgb.z));
            let diff = cmax - cmin;
            let l = 0.5 * (cmin + cmax);
            let s = 0.0;
            let h = 0.0;
            let r = rgb.x;
            let g = rgb.y;
            let b = rgb.z;
            if (diff < 1.0 / 255.0) {
                return GTE.vec3(h, s, l);
            } else {
                if (l < 0.5) {
                    s = diff / (cmax + cmin);
                } else {
                    s = diff / (2.0 - cmax - cmin);
                }

                let r2 = (cmax - r) / diff;
                let g2 = (cmax - g) / diff;
                let b2 = (cmax - b) / diff;

                if (r == cmax) {
                    h = (g == cmin ? 5.0 + b2 : 1.0 - g2);
                }
                else if (g == cmax) {
                    h = (b == cmin ? 1.0 + r2 : 3.0 - b2);
                }
                else {
                    h = (r == cmin ? 3.0 + g2 : 5.0 - r2);
                }
                h /= 6.0;

                if (h < 0.0) h += 1.0;
                else if (h > 1.0) h -= 1.0;
            }
            return GTE.vec3(h, s, l);
        }
    }
}