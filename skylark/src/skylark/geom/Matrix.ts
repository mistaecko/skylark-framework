/// <reference path="../../_dependencies.ts"/>

// based on FlxJS http://github.com/petewarden/flxjs, a JavaScript port of the Flash Rectangle class
// Flash API docs: http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Matrix.html

module skylark {

    export class Matrix {

        public a:number;
        public b:number;
        public c:number;
        public d:number;
        public tx:number;
        public ty:number;

        constructor();

        constructor(a:number, b:number, c:number, d:number, tx:number, ty:number);

        constructor(a?:number, b:number = 0, c:number = 0, d:number = 0, tx:number = 0, ty:number = 0) {
            if(typeof a === 'undefined') {
                a = 1;
                b = 0;
                c = 0;
                d = 1;
                tx = 0;
                ty = 0;
            }

            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }

        public setTo(a:number, b:number, c:number, d:number, tx:number, ty:number):void {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }

        public identity():void {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.tx = 0;
            this.ty = 0;
        }

        public transformPoint(p:Point):Point {
            var result = new Point(
                (p.x * this.a) + (p.y * this.c) + this.tx,
                (p.x * this.b) + (p.y * this.d) + this.ty
            );

            return result;
        }

        public translate(x:number, y:number):void {
            this.tx += x;
            this.ty += y;
        }

        public rotate(angle:number):void {
            var cos:number = Math.cos(angle);
            var sin:number = Math.sin(angle);

            var rotateMatrix:Matrix = new Matrix(cos, sin, -sin, cos, 0, 0);
            this.concat(rotateMatrix);
        }

        public scale(x:number, y:number):void {
            var scaleMatrix = new Matrix(x, 0, 0, y, 0, 0);
            this.concat(scaleMatrix);
        }

        public concat(m:Matrix):void {
            //todo P2 optimize
            this.copyFrom(new Matrix(
                (this.a * m.a) + (this.b * m.c), (this.a * m.b) + (this.b * m.d),
                (this.c * m.a) + (this.d * m.c), (this.c * m.b) + (this.d * m.d),
                (this.tx * m.a) + (this.ty * m.c) + m.tx, (this.tx * m.b) + (this.ty * m.d) + m.ty
            ));
        }

        public invert():void {
            var adbc = ((this.a * this.d) - (this.b * this.c));

            this.copyFrom(new Matrix(
                (this.d / adbc), (-this.b / adbc),
                (-this.c / adbc), (this.a / adbc),
                (((this.c * this.ty) - (this.d * this.tx)) / adbc),
                -(((this.a * this.ty) - (this.b * this.tx)) / adbc)
            ));
        }

        public clone():Matrix {
            var result = new Matrix(
                this.a, this.b,
                this.c, this.d,
                this.tx, this.ty
            );

            return result;
        }

        public copyFrom(m:Matrix):void {
            this.a = m.a;
            this.b = m.b;
            this.c = m.c;
            this.d = m.d;
            this.tx = m.tx;
            this.ty = m.ty;
        }
    }
}
