
/**
 * A class to store metadata about an example. This includes the URL and title of the example.
 */
class Metadata {
    /**
     * 
     * @param {number} num The index of the example.
     * @param {string} desc The title of the example.
     * @param {string} suffix The suffix of the example (e.g. example{index}-{suffix}.html).
     */
    constructor(index, desc, suffix) {
        this.index = index                          // {number} The index of the example.
        this.title = desc                           // {string} The title of the example.
        this.suffix = suffix ? ("-" + suffix) : ""  // {string} The suffix of the example.
        this.basename = "example" + this.index.toString() + this.suffix
        // {string} The URL of the example.
        this.pageURL = "examples/" + this.basename + ".html"
        // {string} The URL of the thumbnail.
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
         */
        this.tableStarted = false
        /**
         * The number of entries in the current table.
         * Each row contains three cells. This is used to determine when to start a new row.
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

        this.numExamples = this.examples.length;
        this.courseNumber = "Graphics Rendering, Animation, and Simulation";
        this.courseName = "LibXOR";
        this.courseSemester = "2019";
        this.pageAuthor = "Jonathan Metzgar";
        this.pageTitle = this.courseName;
        this.pageSubtitle = this.courseNumber + " Examples";
        this.backLink = "index.html";

        this.isLocalHost = window.location.href.search("localhost") >= 0 ? true : false;
        let loc = window.location.pathname.search(".html");
        loc = window.location.pathname.search("\\d+");
        if (isFinite(loc)) {
            loc = parseInt(window.location.pathname.substr(loc, 2));
        }
        // if (isFinite(loc)) {
        //     let count = 0;
        //     for (let i = loc - 1; i >= 0; i--) {
        //         let c = window.location.pathname.charAt(i);
        //         if (c < '0' || c > '9') break;
        //         loc = i;
        //         count++;
        //     }
        //     loc = parseInt(window.location.pathname.substr(loc, count));
        // }
        this.isMainIndex = window.location.pathname.search(this.backLink) >= 0 ? true : false;
        // perhaps we could not find index.html
        if (!this.isMainIndex && !isFinite(loc)) {
            this.isMainIndex = true;
        }
        this.actualIndex = this.getProjectActualIndex(loc);
        this.exampleNum = loc;
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

    getProjectActualIndex(i) {
        let j = i || 0;
        for (let k = 0; k < this.examples.length; k++) {
            if (this.examples[k].index == j) {
                return k;
            }
        }
        return 0;
    }

    getProjectName(i) {
        let j = i || 0;
        j = this.getProjectActualIndex(j);
        if (j == 0) j = this.examples.length - 1;
        if (j >= 0 && j < this.examples.length) {
            return this.examples[j].title;
        }
        return "Unknown Example";
    }

    writeIndex() {
        if (this.isMainIndex) {
            this.writeMainIndex();
        }
    }

    writeMainIndex() {
        let table = new DynamicTable();
        for (let example of this.examples) {
            table.addEntry(example);
        }
        table.endTable();

        // let tableStarted = false;
        // let numEntriesInTable = 0;
        // let exampleIndex = 0;
        // let exampleEndIndex = exampleUrls.length;
        // while exampleIndex < exampleEndIndex {
        //     this.startTable(tableStarted);
        //     this.write("<table style='margin: auto;'>");
        //     let count = 3 * ((exampleDescs.length / 3 | 0) + ((exampleDescs.length % 3 != 0) ? 1 : 0));
        //     for (let i = 0; i < count; i++) {
        //         let exampleStem = "example" + (i + 1).toString();
        //         if (i % 3 == 0) this.write("<tr>");
        //         this.write("<td style='width: 30%;' align='center'>");
        //         if (i < exampleDescs.length) {
        //             this.write("<a href='examples/" + exampleUrls[i] + "'>");
        //             this.write("<img style='border-radius: 4px; width: 90%;' src='examples/" + exampleStem + "-thumbnail.png' onerror=\"this.src='assets/default-thumbnail.png'\" />");
        //             this.write("<br />");
        //             this.write(exampleDescs[i] + "</a>");
        //         }
    
        //         this.write("</td>");
        //         if (i % 3 == 2) this.writeln("</tr>");
        //     }
        //     this.write("</table>");
    
        //     exampleIndex += 1;
        // }
        // if (tableStarted) {
        //     this.writeln("</table>");
        // }
    }

    writeArticleHeader() {
        this.writeln('<header>');
        this.writeTitle();
        this.writeSubtitle();
        this.writeln('<hr class="goldhr" />');
        this.writeln('</header>');
    }

    writeArticleFooter() {
        this.writeln('<footer>');
        this.writeln("<footer style='text-align: center;'>");

        if (this.mainIndex) {
            this.writeln("<a href='../index.html'>Back to Course Index</a>");

        }
        else {
            let indexIntoExamples = this.getProjectActualIndex(this.exampleNum);
            let prevIndex = this.getPrevProjectIndex(indexIntoExamples);
            let nextIndex = this.getNextProjectIndex(indexIntoExamples);
            if (prevIndex > 0) {
                let index = this.examples[prevIndex].index;
                this.write("<< <a href=\"" + this.examples[prevIndex].basename + ".html\">Example " + index + "</a> | ");
            }

            this.writeln("<a href='../" + this.backLink + "'>Back to Index</a>");
            if (nextIndex > 0) {
                let index = this.examples[nextIndex].index;
                this.write("| <a href=\"" + this.examples[nextIndex].basename +
                    ".html\">Example " + index + "</a> >>");
            }    
        }

        this.writeln('<hr class="bluehr" />');
        if (document.URL.search("uaf.edu") >= 0)
            this.writeln('<p style="font-size: 0.5em;">UA is an AA/EO employer and educational institution and prohibits illegal discrimination against any individual: <a href="https://www.alaska.edu/nondiscrimination">www.alaska.edu/nondiscrimination</a>.</p>');
        else
            this.writeln('<p style="font-size: 0.5em;">Copyright (C) 2017-2019 Jonathan Metzgar (aka microwerx)</p>');
        this.writeln('</footer>');
    }

    writeTitle() {
        let h1 = "<h1><a href='index.html'>" + this.pageTitle + "</a></h1>";
        if (this.isMainIndex) {
            h1 = "<h1><a href='index.html'>" + this.pageTitle + "</a></h1>";
        } else {
            h1 = "<h1><a href='../" + this.backLink + "'>" + this.exampleNum + " " + this.getProjectName(this.exampleNum) + "</a></h1>";
        }
        this.write(h1);
    }

    writeSubtitle() {
        if (!this.isMainIndex) return;
        let h2 = "<h3>" + this.pageSubtitle + "</h3>";
        this.write(h2);
    }

    writeDesc() {
        if (!this.isMainIndex) return;
        this.write("<p>" + this.courseDesc + "</p>");
    }

    writeHeadTitle() {
        let optional = (this.exampleNum) ? " (" + this.getProjectName(this.exampleNum-1) + ")" : "";
        document.title = this.pageTitle + optional;
    }
}

var coursemeta = new ExampleMetadata();
coursemeta.writeHeadTitle();
