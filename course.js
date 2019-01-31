class CourseMetadata {
    constructor(studentName) {
        this.studentName = studentName || "";
        this.isStudentPage = (this.studentName.length > 0);
        this.studentFullnames = [
            "a. example",
        ];
        this.studentUsernames = [
            "yourusername",
        ];
        this.projectUrls = [
            "homework1.html",
            "homework2.html",
            "homework3.html",
            "homework4.html",
            "homework5.html",
            "homework6.html",
            "homework7.html",
            "homework8.html",
        ];
        this.projectDescs = [
            "Many Object Rendering",
            "Particle System",
            "Fluid Simulation",
            "Rigid Body Motion",
            "Student's Choice #1",
            "Student's Choice #2",
            "Student's Choice #3",
            "Game / Demoscene Compo"
        ];
        this.numProjects = this.projectDescs.length;
        this.courseNumber = "CS F482/F680";
        this.courseName = "Computer Graphics Animation & Simulation";
        this.courseSemester = "Spring 2019";
        this.courseDesc = `Learn the fundamentals of computer graphics simulations with applications in collision detection,
        particle systems, fluids, and rigid body dynamics.</p>

    <p>$$\\begin{align*} \\frac{\\partial \\vec{u}}{\\partial t} + \\vec{u} \\cdot \\nabla \\vec{u}
        +
        \\frac{1}{\\rho} \\nabla p &=
        \\vec{g} + \\nu \\nabla \\cdot \\nabla \\vec{u} \\\\ \\nabla \\cdot \\vec{u} &= 0 \\end{align*}$$</p>`;
        this.pageAuthor = "Jonathan Metzgar";
        this.pageTitle = this.courseName;
        this.pageSubtitle = this.courseNumber + " (" + this.courseSemester + ")";

        if (this.isStudentPage) {
            this.pageSubtitle = this.studentName;
        }

        this.isLocalHost = window.location.href.search("localhost") >= 0 ? true : false;
        let loc = window.location.pathname.search(".html");
        if (isFinite(loc)) {
            let count = 0;
            for (let i = loc-1; i >= 0; i--) {
                let c = window.location.pathname.charAt(i);
                if (c < '0' || c > '9') break;
                loc = i;
                count++;
            }
            loc = parseInt(window.location.pathname.substr(loc, count));
        }
        this.isMainIndex = window.location.pathname.search("index.html") >= 0 ? true : false;
        // perhaps we could not find index.html
        if (!this.isMainIndex && !isFinite(loc)) {
            this.isMainIndex = true;
        }
        this.projectNum = loc;
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
        if (j == 0) j = this.projectNum - 1;
        if (j >= 0 && j < this.projectDescs.length) {
            return this.projectDescs[j];
        }
        return "Unknown Project Description";
    }

    writeIndex() {
        if (this.isMainIndex && this.isStudentPage) {
            this.writeStudentProjectIndex();
        } else if (this.isMainIndex && !this.isStudentPage) {
            this.writeMainIndex();
        } else {
            this.writeProjectIndex();
        }
    }

    writeMainIndex() {
        this.write("<table style='margin: auto;'>");
        this.write("<tr><th>No.</th><th>Description</th></tr>");
        for (let i = 0; i < this.numProjects; i++) {
            this.write("<tr><td class='centered'>");
            this.write(i + 1);
            this.write("</td><td>");
            this.write("<a href='" + this.projectUrls[i] + "'>");
            this.write(this.projectDescs[i]);
            this.write("</a>");
            this.write("</td></tr>");
        }
        this.write("</table>");
    }

    writeProjectIndex() {
        let usernames = this.studentUsernames;
        let fullnames = this.studentFullnames;

        let projectName = "homework" + this.projectNum.toString();

        this.write("<table style='margin: auto;'>");
        let count = 3 * ((usernames.length / 3 | 0) + ((usernames.length % 3 != 0) ? 1 : 0));
        for (let i = 0; i < count; i++) {
            if (i % 3 == 0) {
                this.write("<tr><td style='min-width: 7em;' align='center'>");
            } else {
                this.write("<td style='min-width: 7em;' align='center'>");
            }

            if (i < usernames.length) {
                let href = "<a href='" + usernames[i] + "/" + projectName + ".html'>";
                let imgsrc = "<img style='border-radius: 4px; text-align: center; width: 6em;' src='" + usernames[i] + "/" + projectName + "-thumbnail.png' onerror=\"this.src='assets/default-thumbnail.png'\" /></a>";
                this.write("<div style='text-align: center'>");
                this.write(href);
                this.write(imgsrc);
                this.write("</div><div style='text-align: center'>");
                this.write(href + fullnames[i] + "</a>");
                this.write("</div>");
            }

            if (i % 3 == 2) {
                this.writeln("</td></tr>");
            } else {
                this.write("</td>");
            }
        }
        this.write("</table>");
    }

    writeStudentProjectIndex() {
        this.write("<table style='margin: auto;'>");
        this.write("<tr><th>No.</th><th>Preview</th><th>Description</th></tr>");
        for (let i = 0; i < this.numProjects; i++) {
            this.write("<tr><td class='centered'>");
            this.write(i + 1);
            this.write("</td><td align='center'>");
            let num = (i + 1).toString();
            let img = "<img style='text-align: center; border-radius: 4px;' src='homework" + num + "-thumbnail.png' alt='Homework" + num + " screenshot' onerror=\"this.src='../assets/default-thumbnail.png'\" />";
            this.write(img);
            this.write("</td><td>");
            this.write("<a href='" + this.projectUrls[i] + "'>");
            this.write(this.projectDescs[i]);
            this.write("</a>");
            this.write("</td></tr>");
        }
        this.write("</table>");
    }

    writeStudentIndex() {
        let usernames = this.studentUsernames;
        let fullnames = this.studentFullnames;

        this.write("<p style='text-align: center;'>");
        for (let i = 0; i < usernames.length; i++) {
            if (i != 0) this.write(" | ");
            this.write("<a href='" + usernames[i] + "/index.html'>" +
                fullnames[i] + "</a>");
        }
        this.write("</p>");
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
        if (this.projectNum > 1) {
            this.write("<< <a href=\"homework" + (this.projectNum - 1) +
                ".html\">Homework " + (this.projectNum - 1) + "</a> | ");
        }
        if (!this.isMainIndex) {
            this.writeln("<a href='index.html'>Back to Index</a>");
            if (this.isStudentPage) {
                let uplink = "<a href='../homework" + this.projectNum + ".html'>Up</a>";
                this.writeln(" | " + uplink);
            }
        } else {
            this.writeln("<a href='../index.html'>Back to Course Index</a>");
        }
        if (!this.isMainIndex && this.projectNum < this.numProjects) {
            this.write("| <a href=\"homework" + (this.projectNum + 1) +
                ".html\">Homework " + (this.projectNum + 1) + "</a> >>");
        }
        this.writeln('<hr class="bluehr" />');
        this.writeln('<p style="font-size: 0.5em;">UA is an AA/EO employer and educational institution and prohibits illegal discrimination against any individual: <a href="https://www.alaska.edu/nondiscrimination">www.alaska.edu/nondiscrimination</a>.</p>');
        this.writeln('</footer>');
    }

    writeTitle() {
        let h1 = "<h1><a href='index.html'>" + this.pageTitle + "</a></h1>";
        if (this.isStudentPage && this.isMainIndex) {
            h1 = "<h1><a href='../index.html'>" + this.pageTitle + "</a></h1>";
        } else if (this.isStudentPage) {
            h1 = "<h1><a href='index.html'>" + this.getProjectName() + "</a></h1>";
        }
        this.write(h1);
    }

    writeSubtitle() {
        let h2 = "<h2>" + this.pageSubtitle + "</h2>";
        if (!this.isMainIndex && this.isStudentPage) {
            h2 = "<h2>" + "a project by " + this.pageSubtitle + "</h2>";
        } else if (this.isMainIndex && this.isStudentPage) {
            h2 = "<h2>" + "Projects by " + this.pageSubtitle + "</h2>";
        }
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