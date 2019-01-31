

class Camera {
    _transform: Matrix4 = Matrix4.makeIdentity();
    private _center: Vector3 = new Vector3();
    private _eye: Vector3 = new Vector3(0.0, 0.0, 10.0);
    private _angleOfView: number = 45.0;
    private _aspectRatio = 1.0;
    private _znear = 1.0;
    private _zfar = 100.0;
    public projection: Matrix4 = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
    public pretransform: Matrix4 = Matrix4.makeIdentity();
    public posttransform: Matrix4 = Matrix4.makeIdentity();

    constructor() {
    }

    get transform(): Matrix4 { return Matrix4.multiply3(this.pretransform, this._transform, this.posttransform); }
    get rotatetransform(): Matrix4 {
        let M = this.transform;
        M.m14 = 0.0;
        M.m24 = 0.0;
        M.m34 = 0.0;
        return M;
    }

    set aspectRatio(ar: number) {
        this._aspectRatio = Math.max(0.001, ar);
        this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
    }

    set angleOfView(angleInDegrees: number) {
        this._angleOfView = Math.max(1.0, angleInDegrees);
        this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
    }

    set zfar(z: number) {
        this._zfar = Math.max(z, 0.001);
        let znear = Math.min(this._znear, this._zfar);
        let zfar = Math.max(this._znear, this._zfar);
        this._znear = znear;
        this._zfar = zfar;
        this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
    }

    set znear(z: number) {
        this._znear = Math.max(z, 0.001);
        let znear = Math.min(this._znear, this._zfar);
        let zfar = Math.max(this._znear, this._zfar);
        this._znear = znear;
        this._zfar = zfar;
        this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
    }

    get position(): Vector3 {
        return this._transform.col3(3);
    }

    get right(): Vector3 {
        return this._transform.col3(0);
    }

    get left(): Vector3 {
        return this._transform.col3(0).negate();
    }

    get up(): Vector3 {
        return this._transform.col3(1);
    }

    get down(): Vector3 {
        return this._transform.col3(1).negate();
    }

    get forward(): Vector3 {
        return this._transform.col3(2);
    }

    get backward(): Vector3 {
        return this._transform.col3(2).negate();
    }

    get eye(): Vector3 {
        return this._transform.asInverse().row3(3);
    }

    set eye(p: Vector3) {
        this._eye = p.clone();
        this._transform = Matrix4.makeLookAt(this._eye, this._center, this.up);
        this._eye = this._transform.col3(3);
    }

    set center(p: Vector3) {
        this._center = p;
        this._transform.lookAt(this._eye, this._center, this.up);
    }

    moveTo(position: Vector3) {
        this._transform.m14 = position.x;
        this._transform.m24 = position.y;
        this._transform.m34 = position.z;
    }

    move(delta: Vector3): Vector3 {
        let tx = this.right.mul(delta.x);
        let ty = this.up.mul(delta.y);
        let tz = this.forward.mul(delta.z);
        this._transform.translate(tx.x, tx.y, tx.z);
        this._transform.translate(ty.x, ty.y, ty.z);
        this._transform.translate(tz.x, tz.y, tz.z);
        return this.position;
    }

    turn(delta: Vector3): void {
        let m = Matrix4.makeIdentity();
        m.rotate(delta.x, 1, 0, 0);
        m.rotate(delta.y, 0, 1, 0);
        m.rotate(delta.z, 0, 0, 1);
        this._transform.multMatrix(m);
    }

    setOrbit(azimuthInDegrees: number, pitchInDegrees: number, distance: number): Matrix4 {
        this._transform.loadIdentity();
        this._transform.rotate(azimuthInDegrees, 0.0, 1.0, 0.0);
        this._transform.rotate(pitchInDegrees, 1.0, 0.0, 0.0);
        this._transform.translate(0.0, 0.0, -distance);
        return this._transform.clone();
    }
}