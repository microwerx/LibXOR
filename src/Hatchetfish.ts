

class Hatchetfish {
    private _logElementId: string = "";
    private _logElement: HTMLDivElement | null = null;
    private _numLines: number = 0;

    constructor(logElementId: string = "") {
        this.logElement = logElementId;
    }

    set logElement(id: string) {
        let el = document.getElementById(id);
        if (el instanceof HTMLDivElement) {
            this._logElement = el;
            this._logElementId = id;
            el.innerHTML = "";
        }
    }

    clear() {
        this._numLines = 0;
        if (this._logElement) {
            this._logElement.innerHTML = "";
        }
        let errorElement: HTMLElement | null = document.getElementById("errors");
        if (errorElement) {
            errorElement.remove();
            //errorElement.innerHTML = "";
        }
    }

    private writeToLog(prefix: string, message: string, ...optionalParams: any[]) {
        let text = prefix + ": " + message;
        for (let op of optionalParams) {
            if (op.toString) {
                text += " " + op.toString();
            } else {
                text += " <unknown>"
            }
        }

        if (this._logElement) {
            let newHTML = "<br/>" + text + this._logElement.innerHTML;
            this._logElement.innerHTML = newHTML;
            //this._logElement.appendChild(document.createElement("br"));
            //this._logElement.appendChild(document.createTextNode(text));
        }
    }

    log(message: string, ...optionalParams: any[]) {
        this.writeToLog("[LOG]", message, ...optionalParams);
        console.log(message, ...optionalParams);
    }

    info(message: string, ...optionalParams: any[]) {
        this.writeToLog("[INF]", message, ...optionalParams);
        console.info(message, ...optionalParams);
    }

    error(message: string, ...optionalParams: any[]) {
        this.writeToLog("[ERR]", message, ...optionalParams);
        console.error(message, ...optionalParams);
    }

    warn(message: string, ...optionalParams: any[]) {
        this.writeToLog("[WRN]", message, ...optionalParams);
        console.warn(message, optionalParams);
    }

    debug(message: string, ...optionalParams: any[]) {
        console.log(message, ...optionalParams);
    }
}


var hflog = new Hatchetfish();