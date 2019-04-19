class FxTextParser {
    readonly lines: Array<string[]> = [];

    constructor(data: string) {
        // split using regex any sequence of 1 or more newlines or carriage returns
        let lines = data.split(/[\n\r]+/);
        for (let line of lines) {
            let unfilteredTokens = line.split(/\s+/);
            if (unfilteredTokens.length > 0 && unfilteredTokens[0][0] == '#') continue;
            let tokens: string[] = [];
            for (let t of unfilteredTokens) {
                if (t.length > 0) {
                    tokens.push(t);
                }
            }
            if (tokens.length == 0) {
                continue;
            }

            this.lines.push(tokens);
        }
    }

    static MakeIdentifier(token: string): string {
        if (token.length == 0)
            return "unknown";
        return token.replace(/[^\w]+/, "_");
    }

    static ParseIdentifier(tokens: string[]): string {
        if (tokens.length >= 2)
            return tokens[1].replace(/[^\w]+/, "_");
        return "unknown";
    }

    static ParseVector(tokens: string[]): Vector3 {
        let x: number = (tokens.length >= 2) ? parseFloat(tokens[1]) : 0.0;
        let y: number = (tokens.length >= 3) ? parseFloat(tokens[2]) : 0.0;
        let z: number = (tokens.length >= 4) ? parseFloat(tokens[3]) : 0.0;
        return new Vector3(x, y, z);
    }

    static ParseVector4(tokens: string[]): Vector4 {
        let x: number = (tokens.length >= 2) ? parseFloat(tokens[1]) : 0.0;
        let y: number = (tokens.length >= 3) ? parseFloat(tokens[2]) : 0.0;
        let z: number = (tokens.length >= 4) ? parseFloat(tokens[3]) : 0.0;
        let w: number = (tokens.length >= 5) ? parseFloat(tokens[4]) : 0.0;
        return new Vector4(x, y, z, w);
    }

    static ParseMatrix(tokens: string[]): Matrix4 {
        if (tokens.length > 16 && tokens[0] == "transform") {
            let m = new Matrix4(
                parseFloat(tokens[1]),
                parseFloat(tokens[2]),
                parseFloat(tokens[3]),
                parseFloat(tokens[4]),
                parseFloat(tokens[5]),
                parseFloat(tokens[6]),
                parseFloat(tokens[7]),
                parseFloat(tokens[8]),
                parseFloat(tokens[9]),
                parseFloat(tokens[10]),
                parseFloat(tokens[11]),
                parseFloat(tokens[12]),
                parseFloat(tokens[13]),
                parseFloat(tokens[14]),
                parseFloat(tokens[15]),
                parseFloat(tokens[16]),
            ).asTranspose();
            return m;
        }
        return Matrix4.makeZero();
    }

    static ParseFaceIndices(_token: string): Array<number> {
        // index 0 is position
        // index 1 is texcoord
        // index 2 is normal
        let indices: Array<number> = [-1, -1, -1];
        let token = _token.replace("//", "/0/");
        let tokens = token.split("/");
        if (tokens.length >= 1) {
            let index = parseInt(tokens[0]);
            indices[0] = index < 0 ? index : index - 1;
        }
        if (tokens.length == 2) {
            let index = parseInt(tokens[1]);
            indices[2] = index < 0 ? index : index - 1;
        } else if (tokens.length == 3) {
            let index = parseInt(tokens[1]);
            indices[1] = index < 0 ? index : index - 1;
            index = parseInt(tokens[12);
            indices[2] = index < 0 ? index : index - 1;
        }
        return indices;
    }

    static ParseFace(tokens: string[]): number[] {
        let indices: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (tokens.length < 4) {
            return indices;
        }
        let v1: Array<number> = FxTextParser.ParseFaceIndices(tokens[1]);
        let v2: Array<number> = FxTextParser.ParseFaceIndices(tokens[2]);
        let v3: Array<number> = FxTextParser.ParseFaceIndices(tokens[3]);

        if (tokens.length >= 5) {
            let v4: Array<number> = FxTextParser.ParseFaceIndices(tokens[4]);
            return [...v1, ...v2, ...v3, ...v4]
        }

        return [...v1, ...v2, ...v3];
    }
}
