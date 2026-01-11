// from westures-core
/**
 * The Point2D class stores and operates on 2-dimensional points, represented as
 * x and y coordinates.
 *
 * @memberof westures-core
 *
 * @param {number} [ x=0 ] - The x coordinate of the point.
 * @param {number} [ y=0 ] - The y coordinate of the point.
 */
export class Point2D {
    /**
     * The x coordinate of the point.
     *
     * @type {number}
     */
    x: number;
    /**
     * The y coordinate of the point.
     *
     * @type {number}
     */
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Calculates the angle between this point and the given point.
     *
     * @param {!Point2D} point - Projected point for calculating the angle.
     *
     * @return {number} Radians along the unit circle where the projected point lies.
     */
    angleTo(point: Point2D) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }

    /**
     * Determine the angle from the centroid to each of the points.
     *
     * @param {!Point2D[]} points - the Point2D objects to calculate the angles to.
     *
     * @returns {number[]}
     */
    anglesTo(points: Point2D[]) {
        return points.map(point => this.angleTo(point));
    }

    /**
     * Determine the average distance from this point to the provided array of points.
     *
     * @param {!Point2D[]} points - the Point2D objects to calculate the average distance to.
     *
     * @return {number} The average distance from this point to the provided points.
     */
    averageDistanceTo(points: Point2D[]) {
        return this.totalDistanceTo(points) / points.length;
    }

    /**
     * Clone this point.
     *
     * @return {Point2D} A new Point2D, identical to this point.
     */
    clone() {
        return new Point2D(this.x, this.y);
    }

    /**
     * Calculates the distance between two points.
     *
     * @param {!Point2D} point - Point to which the distance is
     * calculated.
     *
     * @return {number} The distance between the two points, a.k.a. the hypoteneuse.
     */
    distanceTo(point: Point2D): number {
        return Math.hypot(point.x - this.x, point.y - this.y);
    }

    /**
     * Subtract the given point from this point.
     *
     * @param {!Point2D} point - Point to subtract from this point.
     *
     * @return {Point2D} A new Point2D, which is the result of (this - point).
     */
    minus(point: Point2D): Point2D {
        return new Point2D(
            this.x - point.x,
            this.y - point.y,
        );
    }

    /**
     * Return the summation of this point to the given point.
     *
     * @param {!Point2D} point - Point to add to this point.
     *
     * @return {Point2D} A new Point2D, which is the addition of the two points.
     */
    plus(point: Point2D): Point2D {
        return new Point2D(
            this.x + point.x,
            this.y + point.y,
        );
    }

    /**
     * Calculates the total distance from this point to an array of points.
     *
     * @param {!Point2D[]} points - The array of Point2D objects to
     *    calculate the total distance to.
     *
     * @return {number} The total distance from this point to the provided points.
     */
    totalDistanceTo(points: Point2D[]): number {
        return points.reduce((d, p) => d + this.distanceTo(p), 0);
    }

    /**
     * Calculates the centroid of a list of points.
     *
     * @param {Point2D[]} points - The array of Point2D objects for
     * which to calculate the centroid.
     *
     * @return {Point2D} The centroid of the provided points.
     */
    static centroid(points: Point2D[] = []): (Point2D | null) {
        let x = 0, y = 0, cnt = points.length;
        if (cnt === 0) { return null; }
        for (const point of points) {
            x += point.x;
            y += point.y;
        }
        return new Point2D(x / cnt, y / cnt);
    }

    /**
     * Calculates the sum of the given points.
     *
     * @param {Point2D[]} points - The Point2D objects to sum up.
     *
     * @return {Point2D} A new Point2D representing the sum of the
     * given points.
     */
    static sum(points: Point2D[] = []) {
        let x = 0, y = 0;
        for (const point of points) {
            x += point.x;
            y += point.y;
        }
        return new Point2D(x, y);
    }
}

const TwoPI = 2 * Math.PI;
const NegativePI = -Math.PI;

/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2 * PI or vice versa.
 *
 * @memberof westures-core
 *
 * @param {number} a - Angle in radians.
 * @param {number} b - Angle in radians.

 * @return {number} c, given by: c = a - b such that |c| < PI
 */
export function angularDifference(a: number, b: number): number {
    let diff = a - b;
    if (diff < NegativePI) { diff += TwoPI; }
    if (diff > Math.PI) { diff -= TwoPI; }
    return diff;
}

