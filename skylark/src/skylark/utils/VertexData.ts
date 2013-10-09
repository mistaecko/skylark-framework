// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

/// <reference path="../../_dependencies.ts"/>

module skylark {

    /** The VertexData class manages a raw list of vertex information, allowing direct upload
     *  to Stage3D vertex buffers. <em>You only have to work with this class if you create display
     *  objects with a custom render function. If you don't plan to do that, you can safely
     *  ignore it.</em>
     *
     *  <p>To render objects with Stage3D, you have to organize vertex data in so-called
     *  vertex buffers. Those buffers reside in graphics memory and can be accessed very
     *  efficiently by the GPU. Before you can move data into vertex buffers, you have to
     *  set it up in conventional memory - that is, in a Vector object. The vector contains
     *  all vertex information (the coordinates, color, and texture coordinates) - one
     *  vertex after the other.</p>
     *
     *  <p>To simplify creating and working with such a bulky list, the VertexData class was
     *  created. It contains methods to specify and modify vertex data. The raw Vector managed
     *  by the class can then easily be uploaded to a vertex buffer.</p>
     *
     *  <strong>Premultiplied Alpha</strong>
     *
     *  <p>The color values of the "BitmapData" object contain premultiplied alpha values, which
     *  means that the <code>rgb</code> values were multiplied with the <code>alpha</code> value
     *  before saving them. Since textures are created from bitmap data, they contain the values in
     *  the same style. On rendering, it makes a difference in which way the alpha value is saved;
     *  for that reason, the VertexData class mimics this behavior. You can choose how the alpha
     *  values should be handled via the <code>premultipliedAlpha</code> property.</p>
     *
     */
    export class VertexData {

        /** The total number of elements (Numbers) stored per vertex. */
        public static ELEMENTS_PER_VERTEX:number = 8;

        /** The offset of position data (x, y) within a vertex. */
        public static POSITION_OFFSET:number = 0;

        /** The offset of color data (r, g, b, a) within a vertex. */
        public static COLOR_OFFSET:number = 2;

        /** The offset of texture coordinate (u, v) within a vertex. */
        public static TEXCOORD_OFFSET:number = 6;

        private _rawData:number[];
        private _premultipliedAlpha:boolean;
        private _numVertices:number = 0;

        /** Helper object. */
        private static _helperPoint:Point = new Point();

        /** Create a new VertexData object with a specified number of vertices. */
        constructor(numVertices:number, premultipliedAlpha:boolean = false) {
            this._rawData = [];
            this._premultipliedAlpha = premultipliedAlpha;
            this.numVertices = numVertices;
        }

        /** Creates a duplicate of either the complete vertex data object, or of a subset.
         *  To clone all vertices, set 'numVertices' to '-1'. */
        public clone(vertexID:number = 0, numVertices:number = -1):VertexData {
            if(numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var clone:VertexData = new VertexData(0, this._premultipliedAlpha);
            clone._numVertices = numVertices;
            clone._rawData = <number[]>this._rawData.slice(vertexID * VertexData.ELEMENTS_PER_VERTEX,
                numVertices * VertexData.ELEMENTS_PER_VERTEX);
            return clone;
        }

        /** Copies the vertex data (or a range of it, defined by 'vertexID' and 'numVertices')
         *  of this instance to another vertex data object, starting at a certain index. */
        public copyTo(targetData:VertexData, targetVertexID:number = 0, vertexID:number = 0, numVertices:number = -1):void {
            if(numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            // todo [PORT] check/convert pma

            var targetRawData:number[] = targetData._rawData;
            var targetIndex:number = targetVertexID * VertexData.ELEMENTS_PER_VERTEX;
            var sourceIndex:number = vertexID * VertexData.ELEMENTS_PER_VERTEX;
            var dataLength:number = numVertices * VertexData.ELEMENTS_PER_VERTEX;

            for(var i:number = sourceIndex; i < dataLength; ++i)
                targetRawData[Number(targetIndex++)] = this._rawData[i];
        }

        /** Appends the vertices from another VertexData object. */
        public append(data:VertexData):void {
            var targetIndex:number = this._rawData.length;
            var rawData:number[] = data._rawData;
            var rawDataLength:number = rawData.length;

            for(var i:number = 0; i < rawDataLength; ++i)
                this._rawData[Number(targetIndex++)] = rawData[i];

            this._numVertices += data.numVertices;
        }

        // functions

        /** Updates the position values of a vertex. */
        public setPosition(vertexID:number, x:number, y:number):void {
            var offset:number = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            this._rawData[offset] = x;
            this._rawData[Number(offset + 1)] = y;
        }

        /** Returns the position of a vertex. */
        public getPosition(vertexID:number, position:Point):void {
            var offset:number = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            position.x = this._rawData[offset];
            position.y = this._rawData[Number(offset + 1)];
        }

        /** Updates the RGB color values of a vertex. */
        public setColor(vertexID:number, color:number/*uint*/):void {
            var offset:number = this.getOffset(vertexID) + VertexData.COLOR_OFFSET;
            var multiplier:number = this._premultipliedAlpha ? this._rawData[Number(offset + 3)] : 1.0;
            this._rawData[offset] = ((color >> 16) & 0xff) / 255.0 * multiplier;
            this._rawData[Number(offset + 1)] = ((color >> 8) & 0xff) / 255.0 * multiplier;
            this._rawData[Number(offset + 2)] = ( color & 0xff) / 255.0 * multiplier;
        }

        /** Returns the RGB color of a vertex (no alpha). */
        public getColor(vertexID:number):number/*uint*/ {
            var offset:number = this.getOffset(vertexID) + VertexData.COLOR_OFFSET;
            var divisor:number = this._premultipliedAlpha ? this._rawData[Number(offset + 3)] : 1.0;

            if(divisor == 0) {
                return 0;
            } else {
                var red:number = this._rawData[offset] / divisor;
                var green:number = this._rawData[Number(offset + 1)] / divisor;
                var blue:number = this._rawData[Number(offset + 2)] / divisor;

                return (Number(red * 255) << 16) | (Number(green * 255) << 8) | Number(blue * 255);
            }
        }

        /** Updates the alpha value of a vertex (range 0-1). */
        public setAlpha(vertexID:number, alpha:number):void {
            var offset:number = this.getOffset(vertexID) + VertexData.COLOR_OFFSET + 3;

            if(this._premultipliedAlpha) {
                if(alpha < 0.001) alpha = 0.001; // zero alpha would wipe out all color data
                var color:number = this.getColor(vertexID);
                this._rawData[offset] = alpha;
                this.setColor(vertexID, color);
            }
            else {
                this._rawData[offset] = alpha;
            }
        }

        /** Returns the alpha value of a vertex in the range 0-1. */
        public getAlpha(vertexID:number):number {
            var offset:number = this.getOffset(vertexID) + VertexData.COLOR_OFFSET + 3;
            return this._rawData[offset];
        }

        /** Updates the texture coordinates of a vertex (range 0-1). */
        public setTexCoords(vertexID:number, u:number, v:number):void {
            var offset:number = this.getOffset(vertexID) + VertexData.TEXCOORD_OFFSET;
            this._rawData[offset] = u;
            this._rawData[Number(offset + 1)] = v;
        }

        /** Returns the texture coordinates of a vertex in the range 0-1. */
        public getTexCoords(vertexID:number, texCoords:Point):void {
            var offset:number = this.getOffset(vertexID) + VertexData.TEXCOORD_OFFSET;
            texCoords.x = this._rawData[offset];
            texCoords.y = this._rawData[Number(offset + 1)];
        }

        // utility functions

        /** Translate the position of a vertex by a certain offset. */
        public translateVertex(vertexID:number, deltaX:number, deltaY:number):void {
            var offset:number = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            this._rawData[offset] += deltaX;
            this._rawData[Number(offset + 1)] += deltaY;
        }

        /** Transforms the position of subsequent vertices by multiplication with a
         *  transformation matrix. */
        public transformVertex(vertexID:number, matrix:Matrix, numVertices:number = 1):void {
            var offset:number = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;

            for(var i:number = 0; i < numVertices; ++i) {
                var x:number = this._rawData[offset];
                var y:number = this._rawData[Number(offset + 1)];

                this._rawData[offset] = matrix.a * x + matrix.c * y + matrix.tx;
                this._rawData[Number(offset + 1)] = matrix.d * y + matrix.b * x + matrix.ty;

                offset += VertexData.ELEMENTS_PER_VERTEX;
            }
        }

        /** Sets all vertices of the object to the same color values. */
        public setUniformColor(color:number/*uint*/):void {
            for(var i:number = 0; i < this._numVertices; ++i)
                this.setColor(i, color);
        }

        /** Sets all vertices of the object to the same alpha values. */
        public setUniformAlpha(alpha:number):void {
            for(var i:number = 0; i < this._numVertices; ++i)
                this.setAlpha(i, alpha);
        }

        /** Multiplies the alpha value of subsequent vertices with a certain delta. */
        public scaleAlpha(vertexID:number, alpha:number, numVertices:number = 1):void {
            if(alpha == 1.0) return;
            if(numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var i:number;

            if(this._premultipliedAlpha) {
                for(i = 0; i < numVertices; ++i)
                    this.setAlpha(vertexID + i, this.getAlpha(vertexID + i) * alpha);
            }
            else {
                var offset:number = this.getOffset(vertexID) + VertexData.COLOR_OFFSET + 3;
                for(i = 0; i < numVertices; ++i)
                    this._rawData[Number(offset + i * VertexData.ELEMENTS_PER_VERTEX)] *= alpha;
            }
        }

        private getOffset(vertexID:number):number {
            return vertexID * VertexData.ELEMENTS_PER_VERTEX;
        }

        /** Calculates the bounds of the vertices, which are optionally transformed by a matrix.
         *  If you pass a 'resultRect', the result will be stored in this rectangle
         *  instead of creating a new object. To use all vertices for the calculation, set
         *  'numVertices' to '-1'. */
        public getBounds(transformationMatrix:Matrix = null, vertexID:number = 0, numVertices:number = -1, resultRect:Rectangle = null):Rectangle {
            if(resultRect == null) resultRect = new Rectangle();
            if(numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var minX:number = Number.MAX_VALUE, maxX:number = -Number.MAX_VALUE;
            var minY:number = Number.MAX_VALUE, maxY:number = -Number.MAX_VALUE;
            var offset:number = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            var x:number, y:number, i:number;

            if(transformationMatrix == null) {
                for(i = vertexID; i < numVertices; ++i) {
                    x = this._rawData[offset];
                    y = this._rawData[Number(offset + 1)];
                    offset += VertexData.ELEMENTS_PER_VERTEX;

                    minX = minX < x ? minX : x;
                    maxX = maxX > x ? maxX : x;
                    minY = minY < y ? minY : y;
                    maxY = maxY > y ? maxY : y;
                }
            }
            else {
                for(i = vertexID; i < numVertices; ++i) {
                    x = this._rawData[offset];
                    y = this._rawData[Number(offset + 1)];
                    offset += VertexData.ELEMENTS_PER_VERTEX;

                    MatrixUtil.transformCoords(transformationMatrix, x, y, VertexData._helperPoint);
                    minX = minX < VertexData._helperPoint.x ? minX : VertexData._helperPoint.x;
                    maxX = maxX > VertexData._helperPoint.x ? maxX : VertexData._helperPoint.x;
                    minY = minY < VertexData._helperPoint.y ? minY : VertexData._helperPoint.y;
                    maxY = maxY > VertexData._helperPoint.y ? maxY : VertexData._helperPoint.y;
                }
            }

            resultRect.setTo(minX, minY, maxX - minX, maxY - minY);
            return resultRect;
        }

        // properties

        /** Indicates if any vertices have a non-white color or are not fully opaque. */
        public get tinted():boolean {
            var offset:number = VertexData.COLOR_OFFSET;

            for(var i:number = 0; i < this._numVertices; ++i) {
                for(var j:number = 0; j < 4; ++j)
                    if(this._rawData[Number(offset + j)] != 1.0) return true;

                offset += VertexData.ELEMENTS_PER_VERTEX;
            }

            return false;
        }

        /** Changes the way alpha and color values are stored. Updates all exisiting vertices. */
        public setPremultipliedAlpha(value:boolean, updateData:boolean = true):void {
            if(value == this._premultipliedAlpha) return;

            if(updateData) {
                var dataLength:number = this._numVertices * VertexData.ELEMENTS_PER_VERTEX;

                for(var i:number = VertexData.COLOR_OFFSET; i < dataLength; i += VertexData.ELEMENTS_PER_VERTEX) {
                    var alpha:number = this._rawData[Number(i + 3)];
                    var divisor:number = this._premultipliedAlpha ? alpha : 1.0;
                    var multiplier:number = value ? alpha : 1.0;

                    if(divisor != 0) {
                        this._rawData[i] = this._rawData[i] / divisor * multiplier;
                        this._rawData[Number(i + 1)] = this._rawData[Number(i + 1)] / divisor * multiplier;
                        this._rawData[Number(i + 2)] = this._rawData[Number(i + 2)] / divisor * multiplier;
                    }
                }
            }

            this._premultipliedAlpha = value;
        }

        /** Indicates if the rgb values are stored premultiplied with the alpha value. */
        public get premultipliedAlpha():boolean {
            return this._premultipliedAlpha;
        }

        /** The total number of vertices. */
        public get numVertices():number {
            return this._numVertices;
        }

        public set numVertices(value:number) {
            var i:number;
            var delta:number = value - this._numVertices;

            for(i = 0; i < delta; ++i)
                this._rawData.push(0, 0, 0, 0, 0, 1, 0, 0); // alpha should be '1' per default

            for(i = 0; i < -(delta * VertexData.ELEMENTS_PER_VERTEX); ++i)
                this._rawData.pop();

            this._numVertices = value;
        }

        /** The raw vertex data; not a copy! */
        public get rawData():number[] {
            return this._rawData;
        }
    }
}
