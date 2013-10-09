/// <reference path="../../_dependencies.ts"/>

// based on FlxJS http://github.com/petewarden/flxjs, a JavaScript port of the Flash Rectangle class
// See http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Point.html

module skylark {

    export class Point {
        constructor(x:number = 0, y:number = 0) {
            this.x = x;
            this.y = y;
        }

        public x:number;
        public y:number;

        public add(p:Point):Point {
            return new Point((this.x + p.x), (this.y + p.y));
        }

        public subtract(p:Point):Point {
            return new Point((this.x - p.x), (this.y - p.y));
        }

        public dot(p):number {
            return ((this.x * p.x) + (this.y * p.y));
        }

        public cross(p):number {
            return ((this.x * p.y) - (this.y * p.x));
        }

        public clone():Point {
            return new Point(this.x, this.y);
        }

        public setTo(x:number, y:number):void {
            this.x = x;
            this.y = y;
        }

        public get length():number {
            var x = this.x;
            var y = this.y;
            return Math.sqrt(x * x + y * y);
        }

        public static distance(p1:Point, p2:Point):number {
            return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
        }
    }
}
