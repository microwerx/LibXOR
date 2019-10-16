class ExampleMetadata {
    constructor() {
        this.exampleUrls = [
            "example1.html",
            "example2.html",
            "example3.html",
            "example4.html",
            "example5.html",
            "example6.html",
            "example7.html",
            "example8.html",
            "example9.html",
            "example10.html",
            "example11.html",
            "example12.html",
            "example13.html",
            "example14.html",
            "example15.html",
            "example16.html",
            "example17.html",
            "example18.html",
            "example19.html",
            "example20.html",
            "example21.html",
            "example22.html",
        ];
        this.exampleDescs = [
            "WebGL Basic Code",
            "LibXOR Basic Code",
            "Popping Blocks",
            "Ray Tracer",
            "Windy Blocks",
            "Ray Tracing Miss Shader",
            "Windy Tumbleweeds",
            "Hello, Operators",
            "Oren-Nayer",
            "Lattice-Boltzmann",
            "Raymarching",
            "Gamepads",
            "Sampler",
            "Springs",
            "G-Buffer",
            "Broken SPH",
            "Textures",
            "SPH",
            "PBR",
            "NPR",
            "Classic Graphics",
            "LibXOR Test"
        ];
        this.numExamples = this.exampleDescs.length;
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

    getProjectName(i) {
        let j = i || 0;
        if (j == 0) j = this.exampleNum - 1;
        if (j >= 0 && j < this.exampleDescs.length) {
            return this.exampleDescs[j];
        }
        return "Unknown Example";
    }

    writeIndex() {
        if (this.isMainIndex) {
            this.writeMainIndex();
        }
    }

    writeMainIndex() {
        let exampleUrls = this.exampleUrls;
        let exampleDescs = this.exampleDescs;

        this.write("<table style='margin: auto;'>");
        let count = 3 * ((exampleDescs.length / 3 | 0) + ((exampleDescs.length % 3 != 0) ? 1 : 0));
        for (let i = 0; i < count; i++) {
            let exampleStem = "example" + (i + 1).toString();
            if (i % 3 == 0) this.write("<tr>");
            this.write("<td style='width: 30%;' align='center'>");
            if (i < exampleDescs.length) {
                this.write("<a href='examples/" + exampleUrls[i] + "'>");
                this.write("<img style='border-radius: 4px; width: 90%;' src='examples/" + exampleStem + "-thumbnail.png' onerror=\"this.src='assets/default-thumbnail.png'\" />");
                this.write("<br />");
                this.write(exampleDescs[i] + "</a>");
            }

            this.write("</td>");
            if (i % 3 == 2) this.writeln("</tr>");
        }
        this.write("</table>");
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
        if (this.exampleNum > 1) {
            this.write("<< <a href=\"example" + (this.exampleNum - 1) +
                ".html\">Example " + (this.exampleNum - 1) + "</a> | ");
        }
        if (!this.isMainIndex) {
            this.writeln("<a href='../" + this.backLink + "'>Back to Index</a>");
            if (this.isStudentPage) {
                let uplink = "<a href='../example" + this.exampleNum + ".html'>Up</a>";
                this.writeln(" | " + uplink);
            }
        } else {
            this.writeln("<a href='../index.html'>Back to Course Index</a>");
        }
        if (!this.isMainIndex && this.exampleNum < this.numExamples) {
            this.write("| <a href=\"example" + (this.exampleNum + 1) +
                ".html\">Example " + (this.exampleNum + 1) + "</a> >>");
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
            h1 = "<h1><a href='../" + this.backLink + "'>" + this.exampleNum + " " + this.getProjectName() + "</a></h1>";
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
        let optional = (this.pageAuthor.length) ? " (" + this.pageAuthor + ")" : "";
        let title = "<title>" + this.pageTitle + optional + "</title>";
        this.write(title);
    }

    writeHeader(pageTitle, pageAuthor) {
        let optional = (this.pageAuthor.length) ? " (" + this.pageAuthor + ")" : "";
        let link = (this.isMainIndex) ? "'../index.html'>" : "'index.html'>";
        let a = "<a href=" + link + this.pageTitle + optional + "</a>";
        this.write(a);
    }
}