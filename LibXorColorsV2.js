/// <reference path="src/LibXOR.ts" />

// Copyright (c) 2025 Jonathan Metzgar
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Saturates a Vector3 to the range [0, 1].
 * @param {GTE.Vector3} rgb 
 * @returns {GTE.Vector3}
 */
function saturatef(rgb) {
    return GTE.vec3(
        GTE.clamp(rgb.x, 0.0, 1.0),
        GTE.clamp(rgb.y, 0.0, 1.0),
        GTE.clamp(rgb.z, 0.0, 1.0)
    );
}

/**
 * Saturates a Vector3 to the range [0, 255].
 * @param {GTE.Vector3} rgb The Vector3 to saturate.
 * @returns {GTE.Vector3} The saturated Vector3.
 */
function saturate8(rgb) {
    return GTE.vec3(
        GTE.clamp(rgb.x, 0, 255),
        GTE.clamp(rgb.y, 0, 255),
        GTE.clamp(rgb.z, 0, 255)
    );
}

/**
 * Converts a 0-1 floating-point color to 0-255 integer sRGB color.
 * @param {number} s 
 * @returns {number}
 */
function linearToGamma(s) {
    s = GTE.clamp(s, 0.0, 1.0);
    if (s <= 0.0031308) {
        return Math.round(s * 12.92 * 255.0);
    } else {
        return Math.round((1.055 * Math.pow(s, 1.0 / 2.4) - 0.055) * 255.0);
    }
}

/**
 * Converts a 0-255 integer color to 0-1 floating-point color.
 * @param {number} s 
 * @returns {number}
 */
function gammaToLinear(s) {
    s = GTE.clamp(s, 0, 255);
    let t = s / 255.0;
    if (t <= 0.04045) {
        return t / 12.92;
    } else {
        return Math.pow((t + 0.055) / 1.055, 2.4);
    }
}

/**
 * Convert a color from R8G8B8 to RGB float
 * @param {Vector3} rgb The RGB color as integers (0-255).
 * @returns {Vector3} The RGB color as a float (0-1).
 */
function RGB8ToRGBF(rgb) {
    // Convert the color from sRGB space to linear space.
    return GTE.vec3(gammaToLinear(rgb.x), gammaToLinear(rgb.y), gammaToLinear(rgb.z));
}

/**
 * Converts a color from RGB floating-point to RGB integer.
 * @param {GTE.Vector3} rgb The RGB color as floats (0-1).
 * @returns {GTE.Vector3} The RGB color as integers (0-255).
 */
function RGBFToRGB8(rgb) {
    return GTE.vec3(linearToGamma(rgb.x), linearToGamma(rgb.y), linearToGamma(rgb.z));
}

/**
 * Converts the integer RGB color into a hex string with two digits for red, green, and blue.
 * @param {GTE.Vector3} rgb An integer RGB color (0-255).
 * @returns {string} The RGB color as a hex string.
 */
function RGB8ToHex(rgb) {
    return "#" + rgb.x.toString(16).padStart(2, '0') + rgb.y.toString(16).padStart(2, '0') + rgb.z.toString(16).padStart(2, '0');
}

/**
 * Converts a floating-point RGB color to an HSL color.
 * @param {GTE.Vector3} rgb The RGB color as floats (0-1).
 * @returns {GTE.Vector3} HSL color as floats (0-360, 0-1, 0-1)
 */
function RGBToHSL(rgb) {
    let max = Math.max(rgb.x, rgb.y, rgb.z);
    let min = Math.min(rgb.x, rgb.y, rgb.z);
    let chroma = max - min;
    let lightness = (max + min) / 2;
    let hue = 0;
    let saturation = 0;
    if (chroma > 0) {
        if (max == rgb.x) {
            hue = 60 * (((rgb.y - rgb.z) / chroma) % 6);
        } else if (max == rgb.y) {
            hue = 60 * (((rgb.z - rgb.x) / chroma) + 2);
        } else {
            hue = 60 * (((rgb.x - rgb.y) / chroma) + 4);
        }
        saturation = chroma / (1 - Math.abs(2 * lightness - 1));
    }
    return GTE.vec3(hue, saturation, lightness);
}

/**
 * Converts a floating-point HSL color to an RGB color.
 * @param {GTE.Vector3} hsl Hue, Saturation, Lightness (0-360, 0-1, 0-1)
 * @returns {GTE.Vector3} RGB color as floats (0-1)
 */
function HSLToRGB(hsl) {
    // Compute lightness.
    let lightness = hsl.z;
    let chroma = (1 - Math.abs(2 * lightness - 1)) * hsl.y;
    let huePrime = hsl.x / 60;
    let x = chroma * (1 - Math.abs(huePrime % 2 - 1));
    let r1, g1, b1;
    if (huePrime >= 0 && huePrime < 1) {
        r1 = chroma;
        g1 = x;
        b1 = 0;
    } else if (huePrime >= 1 && huePrime < 2) {
        r1 = x;
        g1 = chroma;
        b1 = 0;
    } else if (huePrime >= 2 && huePrime < 3) {
        r1 = 0;
        g1 = chroma;
        b1 = x;
    } else if (huePrime >= 3 && huePrime < 4) {
        r1 = 0;
        g1 = x;
        b1 = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
        r1 = x;
        g1 = 0;
        b1 = chroma;
    } else {
        r1 = chroma;
        g1 = 0;
        b1 = x;
    }
    let m = lightness - chroma / 2;
    return saturatef(GTE.vec3(r1 + m, g1 + m, b1 + m));
}

/**
 * Converts a floating-point HSV color to a linear RGB color.
 * @param {GTE.Vector3} hsv The HSV color as floats (0-360, 0-1, 0-1).
 * @returns {GTE.Vector3} The RGB color as floats (0-1).
 */
function HSVToRGB(hsv) {
    let chroma = hsv.y * hsv.z;
    let huePrime = hsv.x / 60;
    let x = chroma * (1 - Math.abs(huePrime % 2 - 1));
    let r1, g1, b1;
    if (huePrime >= 0 && huePrime < 1) {
        r1 = chroma;
        g1 = x;
        b1 = 0;
    } else if (huePrime >= 1 && huePrime < 2) {
        r1 = x;
        g1 = chroma;
        b1 = 0;
    } else if (huePrime >= 2 && huePrime < 3) {
        r1 = 0;
        g1 = chroma;
        b1 = x;
    } else if (huePrime >= 3 && huePrime < 4) {
        r1 = 0;
        g1 = x;
        b1 = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
        r1 = x;
        g1 = 0;
        b1 = chroma;
    } else {
        r1 = chroma;
        g1 = 0;
        b1 = x;
    }
    let m = hsv.z - chroma;
    return GTE.vec3(r1 + m, g1 + m, b1 + m);
}

/**
 * 
 * @param {GTE.Vector3} color1 The first color to mix.
 * @param {GTE.Vector3} color2 The second color to mix.
 * @param {number} amount An integer 0-7 that defines the mixture.
 * @returns {GTE.Vector3} The mixed color.
 */
function mixColors(color1, color2, amount) {
    let mixAmount = Math.max(Math.min(amount, 7.0), 0.0) / 7.0;
    let r = color1.x * (1 - mixAmount) + color2.x * mixAmount;
    let g = color1.y * (1 - mixAmount) + color2.y * mixAmount;
    let b = color1.z * (1 - mixAmount) + color2.z * mixAmount;
    return saturatef(GTE.vec3(r, g, b));
}

/**
 * Mixes the colors in HSL space and returns the RGB result.
 * @param {GTE.Vector3} color1 The first color to mix.
 * @param {GTE.Vector3} color2 The second color to mix.
 * @param {number} amount An integer 0-7 that defines the mixture.
 * @returns {GTE.Vector3} The mixed color.
 */
function mixColorsWithHSL(color1, color2, amount) {
    // First mix the RGB colors. Then transform the color so the lightness and saturation is evenly split.
    let rgb2 = mixColors(color1, color2, amount);
    let hsl1 = RGBToHSL(color1);
    let hsl2 = RGBToHSL(color2);
    let mixedHSL = RGBToHSL(rgb2);
    let mixAmount = Math.max(Math.min(amount, 7.0), 0.0) / 7.0;
    // Pick the shortest distance between the two hues.
    let h1 = hsl1.x;
    let h2 = hsl2.x;
    if (Math.abs(h1 - h2) > 180) {
        if (h1 < h2) {
            h1 += 360;
        } else {
            h2 += 360;
        }
    }
    let h = h1 * (1 - mixAmount) + h2 * mixAmount;
    let s = hsl1.y * (1 - mixAmount) + hsl2.y * mixAmount;
    let l = hsl1.z * (1 - mixAmount) + hsl2.z * mixAmount;
    let rgb = HSLToRGB(GTE.vec3(h, s, l));
    return saturatef(rgb);
}


/**
 * Calculates 1 - RGB to invert the color.
 * @param {GTE.Vector3} rgb The RGB color to invert.
 * @returns {GTE.Vector3} The inverted color.
 */
function invertColor(rgb) {
    return GTE.vec3(1.0 - rgb.x, 1.0 - rgb.y, 1.0 - rgb.z);
}

/**
 * 
 * @param {number} degrees The hue in the range [0, 360].
 * @param {number} hueIndex The index of the hue in the range [0, 3].
 * @returns {number} The hue in the range [o - 360].
 */
function getHue(degrees, hueIndex) {
    let hueOffsetLookup = [0.0, -10.0, 0.0, 7.0];
    let hue = degrees + hueOffsetLookup[hueIndex];
    if (hue < 0) hue += 360;
    return hue;
}

/**
 * 
 * @param {number} hueIndex The index of the hue in the range [0, 3].
 * @returns The saturation in the range [0.0, 1.0].
 */
function getSaturation(hueIndex) {
    let saturationLookup = [0.0, 1.0, 1.0, 0.74];
    return saturationLookup[hueIndex];
}

/**
 * 
 * @param {number} hueIndex The index of the hue in the range [0, 3].
 * @returns The value in the range [0.0, 1.0].
 */
function getValue(hueIndex) {
    let valueLookup = [0.0, 0.60, 0.75, 0.93];
    return valueLookup[hueIndex];
}

/**
 * 
 * @param {number} degrees The hue in the range [0, 360].
 * @param {number} hueIndex The index of the hue in the range [0, 3].
 * @returns {GTE.Vector3} The RGB8 color.
 */
function hsl(degrees, hueIndex) {
    return HSVToRGB(GTE.vec3(getHue(degrees, hueIndex), getSaturation(hueIndex), getValue(hueIndex))).scale(255.0);
}

/**
 * These are the 4 special colors found on the right hand-side of the palette.
 * @param {number} index An integer from 0-3.
 * @param {number} hueIndex An integer from 0-3.
 * @returns {GTE.Vector3} The RGB8 color.
 */
function hsl_special(index, hueIndex) {
    let colorIndex = index + hueIndex * 4;
    let rgb = GTE.vec3(0, 0, 0);
    switch (colorIndex) {
        case 0: /* ForestGreen */ return GTE.vec3(0, 128, 0);
        case 1: /* Gold        */ return GTE.vec3(255, 215, 0);
        case 2: /* Brown       */ return GTE.vec3(165, 42, 42);
        case 3: /* Rose        */ return GTE.vec3(255, 0, 255);
        case 4: /* Silver  */ return RGBFToRGB8(GTE.vec3(0.94104, 0.92092, 0.83515));
        case 5: /* Copper  */ return RGBFToRGB8(GTE.vec3(0.87440, 0.43243, 0.29148));
        case 6: /* Gold    */ return RGBFToRGB8(GTE.vec3(0.88742, 0.67429, 0.14673));
        case 7: /* Mercury */ return RGBFToRGB8(GTE.vec3(0.18886, 0.19376, 0.23178));
        // case 4: /* Raw Sienna */ rgb = HSVToRGB(GTE.vec3(33.0, 0.78, 0.68)); break;
        // case 5: /* Burn Sienna */ rgb = HSVToRGB(GTE.vec3(22.0, 0.95, 0.41)); break;
        // case 6: /* Raw Umber */ rgb = HSVToRGB(GTE.vec3(37.0, 0.50, 0.30)); break;
        // case 7: /* Burnt Umber */ rgb = HSVToRGB(GTE.vec3(17.0, 0.67, 0.36)); break;
        case 8: /* Yellow Ochre */ rgb = HSVToRGB(GTE.vec3(40.0, 0.9, 0.9)); break;
        case 9: /* Yellow Gray */ rgb = HSVToRGB(GTE.vec3(54.0, 0.97, 0.5)); break;
        //case 10: /* Greenish Yellow */ rgb = HSVToRGB(GTE.vec3(60.0, 0.85, 0.57)); break;
        case 10: /* Burnt Umber */ rgb = HSVToRGB(GTE.vec3(17.0, 0.67, 0.36)); break;
        case 11: /* Indian Red */ rgb = HSVToRGB(GTE.vec3(6.0, 0.80, 0.55)); break;
        case 12: /* Davies Gray */ rgb = HSVToRGB(GTE.vec3(58.0, 0.38, 0.28)); break;
        case 13: /* Paynes Gray */ rgb = HSVToRGB(GTE.vec3(245.0, 0.18, 0.29)); break;
        case 14: /* Mars Violet */ rgb = HSVToRGB(GTE.vec3(335.0, 0.87, 0.52)); break;
        case 15: /* Ultramarine */ rgb = HSVToRGB(GTE.vec3(242.0, 0.84, 0.52)); break;
    }
    return RGBFToRGB8(rgb);
}

class LibXORColor {
    constructor() {
        /**
         * {number} The hue of the first color (0-15).
         */
        this.color1Index = 0;
        /**
         * {number} The hue shift of the first color (0-3).
         */
        this.color1HueShift = 0;
        /**
         * {number} The hue of the second color (0-15).
         */
        this.color2Index = 0;
        /**
         * {number} The hue shift of the second color (0-3).
         */
        this.color2HueShift = 0;
        /**
         * {number} The amount to blend the colors in 7 steps (0-7).
         */
        this.mixAmount = 0;
        /**
         * {number} A flag to invert the final color (0-1).
         */
        this.invertColor = 0;

        this.createColors();
    }

    createColors() {
        // These are the original 16 colors.
        this.tableSRGB = [
            GTE.vec3(0.000 * 255.0, 0.000 * 255.0, 0.000 * 255.0),
            GTE.vec3(0.333 * 255.0, 0.333 * 255.0, 0.333 * 255.0),
            GTE.vec3(0.667 * 255.0, 0.667 * 255.0, 0.667 * 255.0),
            GTE.vec3(1.000 * 255.0, 1.000 * 255.0, 1.000 * 255.0),
            GTE.vec3(1.000 * 255.0, 0.000 * 255.0, 0.000 * 255.0),
            GTE.vec3(0.894 * 255.0, 0.447 * 255.0, 0.000 * 255.0),
            GTE.vec3(0.894 * 255.0, 0.894 * 255.0, 0.000 * 255.0),
            GTE.vec3(0.000 * 255.0, 1.000 * 255.0, 0.000 * 255.0),
            GTE.vec3(0.000 * 255.0, 0.707 * 255.0, 0.707 * 255.0),
            GTE.vec3(0.000 * 255.0, 0.447 * 255.0, 0.894 * 255.0),
            GTE.vec3(0.000 * 255.0, 0.000 * 255.0, 1.000 * 255.0),
            GTE.vec3(0.447 * 255.0, 0.000 * 255.0, 0.894 * 255.0),
            GTE.vec3(0.894 * 255.0, 0.000 * 255.0, 0.447 * 255.0),
            GTE.vec3(0.500 * 255.0, 0.250 * 255.0, 0.000 * 255.0),
            GTE.vec3(0.830 * 255.0, 0.670 * 255.0, 0.220 * 255.0),
            GTE.vec3(0.250 * 255.0, 0.500 * 255.0, 0.250 * 255.0),
        ]

        for (let hueIndex = 1; hueIndex < 4; hueIndex++) {
            for (let i = 0; i < 12; i += 1) {
                this.tableSRGB.push(hsl(i * 30, hueIndex));
            }
            for (let i = 0; i < 4; i += 1) {
                this.tableSRGB.push(hsl_special(i, hueIndex));
            }
        }

        this.tableLinear = this.tableSRGB.map((color) => RGB8ToRGBF(color));

        /**
         * {Array<number>} A list of hues in integer degrees.
         */
        this.hueList = [];
        let i = 0;
        for (let color of this.tableSRGB) {
            let index = i % 16;
            let hueShift = Math.floor(i / 16);
            if (hueShift > 0 && i < 12) {
                this.hueList.push(getHue(index * 30, hueShift));
            } else {
                let hue = Math.round(RGBToHSL(color).x);
                if (hue < 0) hue += 360;
                this.hueList.push(hue);    
            }
            i += 1;
        }
    }

    /**
     * Get one of the 64 colors in the base palette.
     * @param {number} index An integer from 0-15.
     * @param {number} hueShift An integer from 0-3.
     * @returns {GTE.Vector3} A floating-point RGB color.
     */
    getColorIndexAndHue(index, hueShift) {
        if (hueShift == 0) {
            // The colors
            // vec3(0.000, 0.000, 0.000)
            // vec3(0.333, 0.333, 0.333)
            // vec3(0.667, 0.667, 0.667)
            // vec3(1.000, 1.000, 1.000)
            // vec3(1.000, 0.000, 0.000)
            // vec3(0.894, 0.447, 0.000)
            // vec3(0.894, 0.894, 0.000)
            // vec3(0.000, 1.000, 0.000)
            // vec3(0.000, 0.707, 0.707)
            // vec3(0.000, 0.447, 0.894)
            // vec3(0.000, 0.000, 1.000)
            // vec3(0.447, 0.000, 0.894)
            // vec3(0.894, 0.000, 0.447)
            // vec3(0.500, 0.250, 0.000)
            // vec3(0.830, 0.670, 0.220)
            // vec3(0.250, 0.500, 0.250)
            return this.tableLinear[index];
        }

        if (index >= 0 && index < 16 && hueShift >= 0 && hueShift < 4) {
            return this.tableLinear[hueShift * 16 + index];
        }

        return GTE.vec3(0, 0, 0);
    }

    /**
     * Return the name of the color based on the index and hue shift.
     * @param {number} index An integer from 0-15.
     * @param {number} hueShift An integer from 0-3.
     * @returns {string} The color name.
     */
    getColorIndexAndHueName(index, hueShift) {
        if (hueShift == 0) {
            switch (index) {
                case 0: return "Black";
                case 1: return "Gray33";
                case 2: return "Gray67";
                case 3: return "White";
                case 4: return "Red";
                case 5: return "Orange";
                case 6: return "Yellow";
                case 7: return "Green";
                case 8: return "Cyan";
                case 9: return "Azure";
                case 10: return "Blue";
                case 11: return "Violet";
                case 12: return "Rose";
                case 13: return "Brown";
                case 14: return "Gold";
                case 15: return "ForestGreen";
            }
        } else if (hueShift == 1) {
            let hue = this.hueList[index + 16];
            switch (index) {
                case 12: return "RealSilver";
                case 13: return "RealCopper";
                case 14: return "RealGold";
                case 15: return "RealMercury";
                default: return "Hsl" + hue.toString().padStart(3, '0');
            }
        } else if (hueShift == 2) {
            let hue = this.hueList[index + 32];
            switch (index) {
                case 12: return "Yellow Ochre";
                case 13: return "Yellow Gray";
                case 14: return "Burnt Umber";
                case 15: return "Indian Red";
                default: return "Hsl" + hue.toString().padStart(3, '0');
            }
        } else if (hueShift == 3) {
            let hue = this.hueList[index + 48];
            switch (index) {
                case 12: return "Davies Gray";
                case 13: return "Paynes Gray";
                case 14: return "Mars Violet";
                case 15: return "Ultramarine";
                default: return "Hsl" + hue.toString().padStart(3, '0');
            }
        }
        return "Unknown Color";
    }

    /**
     * @returns{GTE.Vector3} The final color as a float (0-1).
     */
    asFloat3() {
        let color1 = this.getColorIndexAndHue(this.color1Index, this.color1HueShift);
        let color2 = this.getColorIndexAndHue(this.color2Index, this.color2HueShift);
        let mixedColor = mixColors(color1, color2, this.mixAmount);
        let finalColor = this.invertColor == 1 ? invertColor(mixedColor) : mixedColor;
        return finalColor;
    }

    /**
     * @returns{GTE.Vector3} The final color as an integer (0-255).
     */
    asUint8() {
        return RGBFToRGB8(this.asFloat3());
    }

    asHex() {
        return RGB8ToHex(this.asUint8());
    }
}

class LibXORColorsV2 {
    constructor() {
        // Get the controls from the HTML page in LibXORColors.html.
        this.color1Box = document.getElementById("color1-box");
        this.color2Box = document.getElementById("color2-box");
        this.color3Box = document.getElementById("color3-box");
        this.interboxes = [
            document.getElementById("interbox1"),
            document.getElementById("interbox2"),
            document.getElementById("interbox3"),
            document.getElementById("interbox4"),
            document.getElementById("interbox5"),
            document.getElementById("interbox6")
        ]

        this.color1 = new LibXORColor();
        this.color2 = new LibXORColor();
        this.color3 = new LibXORColor();

        this.color1.mixAmount = 0;
        this.color2.mixAmount = 7;

        // Add a value changed event to the color 1 slider from id "color1-index".
        document.getElementById("color1-index").addEventListener("input", (e) => {
            this.color1.color1Index = parseInt(e.target.value);
            this.updateColorsInBoxes();
        });
        // Add a value changed event to the color 1 hue slider from id "color1-hue".
        document.getElementById("color1-hue").addEventListener("input", (e) => {
            this.color1.color1HueShift = parseInt(e.target.value);
            this.updateColorsInBoxes();
        });
        // Add a value changed event to the color 2 slider from id "color2-index".
        document.getElementById("color2-index").addEventListener("input", (e) => {
            this.color2.color2Index = parseInt(e.target.value);
            this.updateColorsInBoxes();
        });
        // Add a value changed event to the color 2 hue slider from id "color2-hue".
        document.getElementById("color2-hue").addEventListener("input", (e) => {
            this.color2.color2HueShift = parseInt(e.target.value);
            this.updateColorsInBoxes();
        });
        // Add a value changed event to the mix amount slider from id "color3-mix-amount".
        document.getElementById("color3-mix-amount").addEventListener("input", (e) => {
            this.color3.mixAmount = parseInt(e.target.value);
            this.updateColorsInBoxes();
        });
        // Add a value changed event to the invert color checkbox from id "color3-invert-color".
        document.getElementById("color3-invert-color").addEventListener("change", (e) => {
            this.color3.invertColor = e.target.checked ? 1 : 0;
            this.updateColorsInBoxes();
        });
    }

    createPaletteBoxes() {
        let palette = document.getElementById("palette");
        // Add 16 divs wide and 4 divs high with the colors set to a background.
        for (let inverse = 0; inverse < 2; inverse++) {
            for (let h = 0; h < 4; h++) {
                let rowDiv = document.createElement("div");
                rowDiv.style.display = "flex";
                rowDiv.style.flexDirection = "row";
                rowDiv.style.justifyContent = "center";
                rowDiv.style.alignItems = "center";
                rowDiv.style.margin = "0px";
                rowDiv.style.padding = "0px";
                for (let i = 0; i < 16; i++) {
                    let color = new LibXORColor();
                    color.color1Index = i;
                    color.color1HueShift = h;
                    color.invertColor = inverse;
                    let colorDiv = document.createElement("div");
                    colorDiv.style.backgroundColor = color.asHex();
                    colorDiv.className = "new-palette-box";
                    // colorDiv.style.width = "50px";
                    // colorDiv.style.height = "50px";
                    // colorDiv.style.display = "flex";
                    // colorDiv.style.border = "1px solid black";
                    // colorDiv.style.margin = "1px";
                    // colorDiv.style.padding = "1px";
                    // colorDiv.style.boxSizing = "border-box";
                    // colorDiv.style.textAnchor = "middle";
                    colorDiv.innerHTML = color.getColorIndexAndHueName(i, h) + (inverse ? "<sup>-1</sup>" : "");
                    rowDiv.appendChild(colorDiv);
                }
                palette.appendChild(rowDiv);
            }
        }
    }

    updateColorsInBoxes() {
        // The three boxes are color1-box, color2-box, color3-box.
        // Update the background color to the hex color for the three colors.
        this.color1.invertColor = this.color3.invertColor;
        this.color2.invertColor = this.color3.invertColor;

        // First merge the first and second colors.
        this.color3.color1Index = this.color1.color1Index;
        this.color3.color1HueShift = this.color1.color1HueShift;
        this.color3.color2Index = this.color2.color2Index;
        this.color3.color2HueShift = this.color2.color2HueShift;

        let saveMix = this.color3.mixAmount;
        for (let i = 1; i < 7; i++) {
            this.color3.mixAmount = i;
            this.interboxes[i - 1].style.backgroundColor = this.color3.asHex();
        }
        this.color3.mixAmount = saveMix;

        // Update the first color background.
        this.color1Box.style.backgroundColor = this.color1.asHex();
        // Update the second color background.
        this.color2Box.style.backgroundColor = this.color2.asHex();
        // Update the third color background.
        this.color3Box.style.backgroundColor = this.color3.asHex();
    }
}

let app = new LibXORColorsV2();
app.createPaletteBoxes();
app.updateColorsInBoxes();
