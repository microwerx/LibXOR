/// <reference path="XORUtils.ts" />

type XORTextFileLoaderCallback = (data: string, name: string, parameter: number) => void;

class XORTextFileLoaderSystem {
    private textfiles: XORUtils.TextFileLoader[] = [];

    constructor() {

    }

    get failed(): boolean {
        for (let t of this.textfiles) {
            if (t.failed) return true;
        }
        return false;
    }

    get loaded(): boolean {
        for (let t of this.textfiles) {
            if (!t.loaded) return false;
        }
        return true;
    }

    get percentLoaded(): number {
        let a = 0;
        for (let t of this.textfiles) {
            if (t.loaded) a++;
        }
        return a / this.textfiles.length;
    }

    wasRequested(name: string): boolean {
        for (let tf of this.textfiles) {
            if (tf.name == name) return true;
        }
        return false;
    }

    load(name: string, url: string, callbackfn: XORTextFileLoaderCallback, data: number): void {
        this.textfiles.push(new XORUtils.TextFileLoader(url, callbackfn, data));
    }
}