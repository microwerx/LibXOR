
/**
 * A class to store metadata about an example. This includes the URL and title of the example.
 */
class Metadata {
    /**
     * 
     * @param {number} num The index of the example.
     * @param {string} title The title of the example.
     * @param {string} suffix The suffix of the example (e.g. example{index}-{suffix}.html).
     */
    constructor(index, title, suffix) {
        /**
         * The index of the example.
         * @type {number} 
         */
        this.index = index
        /**
         * The title of the example.
         * @type {string}
         */
        this.title = title    
        /**
         * The suffix of the example.
         * @type {string}
         */                       
        this.suffix = suffix ? ("-" + suffix) : ""
        /**
         * The basename of the example.
         * The format is example{index}-{suffix}.
         * @type {string}
         */
        this.basename = "example" + this.index.toString() + this.suffix
        /**
         * The URL of the example.
         * @type {string}
         */
        this.pageURL = "examples/" + this.basename + ".html"
        /**
         * The URL of the thumbnail.
         * @type {string}
         */
        this.thumbURL = "examples/" + this.basename + "-thumbnail.png"
    }
}

/**
 * A class to manage a dynamic table. Given a list of example URLs and descriptions,
 * it will generate a table of thumbnails and links to the examples. If one of the
 * URLs is empty, then it'll create an H2 with the title and start a new section of
 * examples.
 */
class DynamicTable {
    constructor() {
        /**
         * A flag that indicates if the table has started.
         * @type {boolean}
         */
        this.tableStarted = false
        /**
         * The number of entries in the current table.
         * Each row contains three cells. This is used to determine when to start a new row.
         * @type {number}
         */
        this.numEntriesInTable = 0
    }

    /**
     * Starts a new table if it's not started yet.
     */
    startTable() {
        if (this.tableStarted) {
            return
        }
        document.write("<table style='margin: auto;'>")
        this.tableStarted = true
        this.numEntriesInTable = 0
        this.numEntries = 0
    }

    /**
     * Ends the table if it's started.
     */
    endTable() {
        if (!this.tableStarted) {
            return
        }

        // If the number of entries in the table is not a multiple of 3, then fill in the rest of the row.
        while (this.numEntriesInTable % 3 != 0) {
            this.startCell()
            this.endCell()
        }

        document.writeln("</table>")
        this.tableStarted = false
    }

    /**
     * Starts a new cell in the table. If it's a multiple of 3, then it starts a new row.
     */
    startCell() {
        if (this.numEntriesInTable % 3 == 0) {
            document.write("<tr>")
        }
        document.write("<td style='width: 30%;' align='center'>")
    }

    /**
     * Ends the current cell in the table. If it's the third item in a row,
     * then it ends the row.
     */
    endCell() {
        document.write("</td>")
        if (this.numEntriesInTable % 3 == 2) {
            document.writeln("</tr>")
        }
        this.numEntriesInTable += 1
        this.numEntries += 1
    }

    /**
     * 
     * @param {Metadata} metadata 
     */
    addEntry(metadata) {
        if (metadata.index > 0) {
            this.startTable()
            this.startCell()
            document.write("<a href='" + metadata.pageURL + "'>")
            document.write("<img style='border-radius: 4px; width: 90%;' src='" + metadata.thumbURL + "' onerror=\"this.src='assets/default-thumbnail.png'\" />")
            document.write("<br />")
            document.write(metadata.title + "</a>")
            this.endCell()
        } else {
            this.endTable()
            document.write("<h2>" + metadata.title + "</h2>")
        }
    }
}
class ExampleMetadata {
    constructor() {
        /**
         * A list of all the examples with the metadata to create a cell with a link and a screenshot.
         * @type {Metadata[]}
         */
        this.examples = [
            new Metadata(-1, "Basics"),
            new Metadata(10, "WebGL Basic Code", "webgl"),
            new Metadata(11, "LibXOR Basic Code", "libxor"),

            new Metadata(-1, "Physics"),
            new Metadata(20, "Popping Blocks", "popping-blocks"),
            new Metadata(21, "Windy Blocks", "windy-blocks"),
            new Metadata(22, "Windy Tumbleweeds", "tumbleweeds"),
            new Metadata(23, "Hello, Operators", "operators"),
            new Metadata(24, "Lattice-Boltzmann", "lattice-boltzmann"),
            new Metadata(25, "Springs", "springs"),
            new Metadata(26, "Broken SPH", "broken-sph"),
            new Metadata(27, "SPH", "sph"),
            new Metadata(28, "Symplectic Integrators", "symplectic"),

            new Metadata(-1, "Gamedev"),
            new Metadata(30, "Gamepads", "gamepads"),
            new Metadata(31, "Sampler", "sampler"),
            new Metadata(33, "LibXOR Test", "libxor-test"),
            new Metadata(34, "LibXOR ECS", "libxor-ecs"),
            new Metadata(35, "BASIC Shapes", "basic-shapes"),
            new Metadata(36, "Flight Simulator", "fsim"),

            new Metadata(-1, "Rendering"),
            new Metadata(40, "Ray Tracer", "rt-ray-caster"),
            new Metadata(41, "Ray Tracing Miss Shader", "rt-miss-shader"),
            new Metadata(42, "Oren-Nayer", "rt-oren-nayer"),
            new Metadata(43, "Raymarching", "rt-raymarching"),
            new Metadata(44, "G-Buffer", "gbuffer"),
            new Metadata(45, "Textures", "textures"),
            new Metadata(46, "PBR", "pbr"),
            new Metadata(47, "NPR", "npr"),
            new Metadata(48, "Specular Bumpiness", "specular-bumpiness"),

            new Metadata(-1, "Procgen & Fractals"),
            new Metadata(50, "Noise", "noise"),
            new Metadata(51, "Mandelbrot Set", "mandelbrot"),
            new Metadata(52, "Cellular Automata", "cellular-automata"),
            new Metadata(53, "SDF Collisions", "sdf-collisions"),
        ]

        /** @type{number} The number of examples or headings on the page. */
        this.numExamples = this.examples.length;
        /** @type {string} The main heading on the page. */
        this.pageTitle = "LibXOR Examples";
        /** @type {string} The sub-heading on the page. */
        this.pageSubtitle = "Graphics Rendering, Animation, and Simulation";
        /** @type {string} The name of the page author. */
        this.pageAuthor = "Jonathan Metzgar";
        /** @type {string} The page to go back to (itself). */
        this.backLinkURL = "index.html";

        /** @type {boolean} A flag if we're running locally on npm or a hosted server. */
        this.isLocalHost = window.location.href.search("localhost") >= 0 ? true : false;
        /** @type {number} */
        let loc = window.location.pathname.search(".html");
        loc = window.location.pathname.search("\\d+");
        if (isFinite(loc)) {
            loc = parseInt(window.location.pathname.substr(loc, 2));
        }
        /** @type {boolean} A flag if this page is the actual index, or one of the examples. */
        this.isMainIndex = window.location.pathname.search(this.backLinkURL) >= 0 ? true : false;
        // Assume it's the main index if we couldn't find the back link.
        if (!this.isMainIndex && !isFinite(loc)) {
            this.isMainIndex = true;
        }
        /** @type {number} The number to print on the page from the entry in `this.examples` */
        this.exampleNumber = this.getProjectActualIndex(loc);
        /** @type {number} The index into the examples array. */
        this.exampleIndex = loc;
    }

    write(text) {
        let d = document;
        d.write(text);
    }

    writeln(text) {
        let d = document;
        d.writeln(text);
    }

    getPrevProjectIndex(i) {
        let j = i || 0;
        if (j > 0) {
            if (this.examples[j - 1].index > 0) {
                return j - 1;
            }
        }
        if (j > 1) {
            if (this.examples[j - 2].index > 0) {
                return j - 2;
            }
        }
        return 0;
    }

    getNextProjectIndex(i) {
        let j = i || 0;
        if (j < this.examples.length - 1) {
            if (this.examples[j + 1].index > 0) {
                return j + 1;
            }
        }
        if (j < this.examples.length - 2) {
            if (this.examples[j + 2].index > 0) {
                return j + 2;
            }
        }
        return 0;
    }

    /**
     * Returns the index of the project to put on the page.
     * @param {number} i
     * @returns {number} The index to print on the page.
     */
    getProjectActualIndex(i) {
        let j = i || 0;
        for (let k = 0; k < this.examples.length; k++) {
            if (this.examples[k].index == j) {
                return k;
            }
        }
        return 0;
    }

    /**
     * Returns the title of the project to put on the page.
     * @param {number} i 
     * @returns {string}
     */
    getProjectName(i) {
        let j = i || 0;
        j = this.getProjectActualIndex(j);
        if (j == 0) j = this.examples.length - 1;
        if (j >= 0 && j < this.examples.length) {
            return this.examples[j].title;
        }
        return "Unknown Example";
    }

    /**
     * Writes the examples index to the page if it's enabled.
     */
    writeIndex() {
        if (this.isMainIndex) {
            this.writeMainIndex();
        }
    }

    /**
     * Writes the main index to the page.
     */
    writeMainIndex() {
        let table = new DynamicTable();
        for (let example of this.examples) {
            table.addEntry(example);
        }
        table.endTable();
    }

    /**
     * Puts a header at the top of the page with the title and subtitle.
     */
    writeArticleHeader() {
        this.writeln('<header>');
        this.writeTitle();
        this.writeSubtitle();
        this.writeln('<hr class="goldhr" />');
        this.writeln('</header>');
    }

    /**
     * Puts a footer at the bottom of the page with links to the previous and next examples.
     */
    writeArticleFooter() {
        this.writeln('<footer>');
        this.writeln("<footer style='text-align: center;'>");

        if (this.isMainIndex) {
            this.writeln("<a href='../index.html'>Back to Index</a>");
        }
        else {
            let prevIndex = this.getPrevProjectIndex(this.exampleNumber);
            let nextIndex = this.getNextProjectIndex(this.exampleNumber);
            if (prevIndex > 0) {
                let index = this.examples[prevIndex].index;
                this.write("<< <a href=\"" + this.examples[prevIndex].basename + ".html\">Example " + index + "</a> | ");
            }

            this.writeln("<a href='../" + this.backLinkURL + "'>Back to Index</a>");
            if (nextIndex > 0) {
                let index = this.examples[nextIndex].index;
                this.write("| <a href=\"" + this.examples[nextIndex].basename +
                    ".html\">Example " + index + "</a> >>");
            }
        }

        this.writeln('<hr class="bluehr" />');
        this.writeln('<p style="font-size: 0.5em;">Copyright (C) 2017-2024 Jonathan Metzgar (aka microwerx)</p>');
        this.writeln('</footer>');
    }

    /**
     * Writes the title of the page.
     */
    writeTitle() {
        let h1 = "<h1><a href='index.html'>" + this.pageTitle + "</a></h1>";
        if (this.isMainIndex) {
            h1 = "<h1><a href='index.html'>" + this.pageTitle + "</a></h1>";
        } else {
            h1 = "<h1><a href='../" + this.backLinkURL + "'>" + this.exampleIndex + " " + this.getProjectName(this.exampleIndex) + "</a></h1>";
        }
        this.write(h1);
    }

    /**
     * Writes the subtitle to the page if this is the main index.
     */
    writeSubtitle() {
        if (!this.isMainIndex) return;
        let h2 = "<h3>" + this.pageSubtitle + "</h3>";
        this.write(h2);
    }

    /** Writes the description that the example configures to the page. */
    writeDesc() {
        if (!this.isMainIndex) return;
        this.write("<p>" + this.courseDesc + "</p>");
    }

    /** Set's the title of the page with the example project's name in parentheses. */
    writeHeadTitle() {
        let optional = (this.exampleIndex) ? " (" + this.getProjectName(this.exampleIndex - 1) + ")" : "";
        document.title = this.pageTitle + optional;
    }
}

var coursemeta = new ExampleMetadata();
coursemeta.writeHeadTitle();
