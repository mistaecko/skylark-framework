/// <reference path="../../_dependencies.ts"/>

// based on FlxJS http://github.com/petewarden/flxjs, a JavaScript port of the Flash Rectangle class
// also see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/geom/Rectangle.html

module skylark {

    export class Rectangle {
        public height:number;
        public width:number;
        public x:number;
        public y:number;

        constructor(x:number = 0, y:number = 0, width:number = 0, height:number = 0) {
            this.setTo(x, y, width, height);
        }

        public setTo(x:number = 0, y:number = 0, width:number = 0, height:number = 0):void {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        public get bottom():number {
            return this.y + this.height;
        }

        public set bottom(value:number) {
            if(value != null)
                this.height = (value - this.y);
        }

        public get bottomright():Point {
            return new Point(this.right, this.bottom);
        }

        public set left(newX:number) {
            if(newX !== null && typeof newX !== 'undefined') {
                this.width += (this.x - newX);
                this.x = newX;
            }
        }

        public set right(value:number) {
            if(value != null)
                this.width = (value - this.x);
        }

        public get right():number {
            return this.x + this.width;
        }

        public get size():Point {
            return new Point(this.width, this.height);
        }

        public set size(size:Point) {
            throw new IllegalOperationError('Not yet implemented');
        }

        public set top(newY:number) {
            if(newY !== null && typeof newY !== 'undefined') {
                this.height += (this.y - newY);
                this.y = newY;
            }
        }

        public get topLeft():Point {
            return new Point(this.x, this.y);
        }

        public clone():Rectangle {
            return new Rectangle(this.x, this.y, this.width, this.height);
        }

        public contains(x:number, y:number) {
            var isInside =
                (x >= this.x) &&
                    (y >= this.y) &&
                    //[PORT] less or lessOrEqual
                    (x <= this.right) &&
                    (y <= this.bottom);
            return isInside;
        }

        public containsPoint(point:Point):boolean {
            return this.contains(point.x, point.y);
        }

        public containsRect(rect:Rectangle):boolean {
            var isInside =
                (rect.x >= this.x) &&
                    (rect.y >= this.y) &&
                    (rect.right <= this.right) &&
                    (rect.bottom <= this.bottom);
            return isInside;
        }

        public equals(toCompare:Rectangle) {
            var isIdentical =
                (toCompare.x === this.x) &&
                    (toCompare.y === this.y) &&
                    (toCompare.width === this.width) &&
                    (toCompare.height === this.height);
            return isIdentical;
        }

        public inflate(dx:number, dy:number):void {
            this.x -= dx;
            this.y -= dy;
            this.width += (2 * dx);
            this.height += (2 * dy);
        }

        public inflatePoint(point:Point):void {
            this.inflate(point.x, point.y);
        }

        public inclusiveRangeContains(value, min, max):boolean {
            var isInside =
                (value >= min) &&
                    (value <= max);

            return isInside;
        }

        public intersectRange(aMin, aMax, bMin, bMax):any {

            var maxMin = Math.max(aMin, bMin);
            if(!this.inclusiveRangeContains(maxMin, aMin, aMax) || !this.inclusiveRangeContains(maxMin, bMin, bMax))
                return null;

            var minMax = Math.min(aMax, bMax);

            if(!this.inclusiveRangeContains(minMax, aMin, aMax) || !this.inclusiveRangeContains(minMax, bMin, bMax))
                return null;

            return { min: maxMin, max: minMax };
        }

        public intersection(toIntersect):Rectangle {
            var xSpan = this.intersectRange(
                this.x, this.right,
                toIntersect.x, toIntersect.right);

            if(!xSpan)
                return null;

            var ySpan = this.intersectRange(
                this.y, this.bottom,
                toIntersect.y, toIntersect.bottom);

            if(!ySpan)
                return null;

            var result = new Rectangle(
                xSpan.min,
                ySpan.min,
                (xSpan.max - xSpan.min),
                (ySpan.max - ySpan.min));

            return result;
        }

        public intersects(toIntersect):boolean {
            var intersection = this.intersection(toIntersect);

            return (intersection !== null);
        }

        public isEmpty():boolean {
            return ((this.width <= 0) || (this.height <= 0));
        }

        public offset(dx, dy):void {
            this.x += dx;
            this.y += dy;
        }

        public offsetPoint(point):void {
            this.offset(point.x, point.y);
        }

        public setEmpty():void {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        }

        public toString():string {
            var result = '{';
            result += '"x":' + this.x + ',';
            result += '"y":' + this.y + ',';
            result += '"width":' + this.width + ',';
            result += '"height":' + this.height + '}';

            return result;
        }

        union(toUnion) {
            var minX = Math.min(toUnion.x, this.x);
            var maxX = Math.max(toUnion.right, this.right);
            var minY = Math.min(toUnion.y, this.y);
            var maxY = Math.max(toUnion.bottom, this.bottom);

            var result = new Rectangle(
                minX,
                minY,
                (maxX - minX),
                (maxY - minY));

            return result;
        }

    }
}
