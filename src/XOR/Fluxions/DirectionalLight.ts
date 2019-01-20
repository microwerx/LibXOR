
class DirectionalLight {
    private _direction: Vector3 = new Vector3(0.34816, 0.87039, 0.34816);
    private _center: Vector3 = new Vector3();
    private _eye: Vector3 = new Vector3();
    private _distance: number = 5.0;
    private _zfar: number = 100.0;
    private _znear: number = 1.0;
    private _E0: Vector3 = new Vector3(100000, 100000, 100000);
    private _transform: Matrix4 = Matrix4.makeIdentity();
    private _isOrbit: boolean = false;

    private _zoom: number = 1.0;
    private _offset: Vector2 = new Vector2(0.0, 0.0);

    constructor() {
    }

    set distance(d: number) {
        this._distance = d;
        this._znear = -d + 1.0;
        this._zfar = d + 1.0;
    }

    set direction(v: Vector3) {
        this._direction = v.norm();
        this._eye = this._center.add(this._direction.mul(this._distance));
        this._isOrbit = false;
    }

    get direction(): Vector3 {
        if (this._isOrbit) {
            let v1 = new Vector4(0.0, 0.0, 0.0, 1.0);
            let v1p = this._transform.transform(v1).toVector3();
            return this._transform.asInverse().row3(3);
            let v2 = new Vector4(1.0, 0.0, 0.0, 1.0);
            let v2p = this._transform.transform(v2).toVector3();
            return v2p.sub(v1p);
        }
        return this._direction.clone();
    }

    set center(location: Vector3) {
        this._center = location.clone();
        this._eye = this._center.add(this._direction.mul(this._distance));
    }

    set E0(color: Vector3) {
        this._E0.copy(color);
    }

    get E0(): Vector3 {
        return this._E0.clone();
    }

    setOrbit(azimuthInDegrees: number, pitchInDegrees: number, distance: number): Matrix4 {
        this._transform.LoadIdentity();
        this._transform.Rotate(azimuthInDegrees, 0.0, 1.0, 0.0);
        this._transform.Rotate(pitchInDegrees, 1.0, 0.0, 0.0);
        this._transform.Translate(0.0, 0.0, -distance);
        this._isOrbit = true;
        return this._transform.clone();
    }

    get lightMatrix(): Matrix4 {
        if (this._isOrbit == true)
            return this._transform.clone();
        return Matrix4.makeLookAt2(this._direction.mul(this._distance), new Vector3(0.0), new Vector3(0.0, 1.0, 0.0));
        this._eye = this._center.add(this._direction.mul(this._distance));
        return Matrix4.makeLookAt(this._eye, this._center, new Vector3(0.0, 1.0, 0.0));
    }

    get projectionMatrix(): Matrix4 {
        let size = this._distance;
        // this._znear = -50.0;
        // this._zfar = 50.0;
        //return Matrix4.makePerspectiveX(90.0, 1.0, 0.1, 100.0);
        return Matrix4.makeOrtho(-size, size, -size, size, -size * 2, size * 2);

        // return Matrix4.makeOrtho(
        //     this._zoom * (-size + this._offset.x), this._zoom * (size + this._offset.x),
        //     this._zoom * (-size + this._offset.y), this._zoom * (size + this._offset.y),
        //     this._znear, this._zfar);
    }
}