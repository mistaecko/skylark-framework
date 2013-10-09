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

    /** A Quad represents a rectangle with a uniform color or a color gradient.
     *
     *  <p>You can set one color per vertex. The colors will smoothly fade into each other over the area
     *  of the quad. To display a simple linear color gradient, assign one color to vertices 0 and 1 and
     *  another color to vertices 2 and 3. </p>
     *
     *  <p>The indices of the vertices are arranged like this:</p>
     *
     *  <pre>
     *  0 - 1
     *  | / |
     *  2 - 3
     *  </pre>
     *
     *  @see Image
     */
    export class Quad extends DisplayObject {
        private _tinted:boolean;

        /** The raw vertex data of the quad. */
        _vertexData:VertexData;

        /** Helper objects. */
        static _helperPoint:Point = new Point();
        private static _helperMatrix:Matrix = new Matrix();

        /** Creates a quad with a certain size and color. The last parameter controls if the
         *  alpha value should be premultiplied into the color values on rendering, which can
         *  influence blending output. You can use the default value in most cases.  */
        constructor(width:number, height:number, color:number = 0xffffff, premultipliedAlpha:boolean = true) {
            super();
            if(width == null || height == null)
                throw new ArgumentError('Either "width" or "height" is undefined: ' + width + ', ' + height);
            this._tinted = color != 0xffffff;

            this._vertexData = new VertexData(4, premultipliedAlpha);
            this._vertexData.setPosition(0, 0.0, 0.0);
            this._vertexData.setPosition(1, width, 0.0);
            this._vertexData.setPosition(2, 0.0, height);
            this._vertexData.setPosition(3, width, height);
            this._vertexData.setUniformColor(color);

            this.onVertexDataChanged();
        }

        /** Call this method after manually changing the contents of '_vertexData'. */
        onVertexDataChanged():void {
            // in subclasses, if necessary
        }

        /** @inheritDoc */
        public getBounds(targetSpace:DisplayObject, resultRect:Rectangle = null):Rectangle {
            if(resultRect == null) resultRect = new Rectangle();

            if(targetSpace === this) {// optimization
                this._vertexData.getPosition(3, Quad._helperPoint);
                resultRect.setTo(0.0, 0.0, Quad._helperPoint.x, Quad._helperPoint.y);
            }
            else if(targetSpace === this.parent && this.rotation === 0.0) // optimization
            {
                var scaleX:number = this.scaleX;
                var scaleY:number = this.scaleY;
                this._vertexData.getPosition(3, Quad._helperPoint);
                resultRect.setTo(this.x - this.pivotX * scaleX, this.y - this.pivotY * scaleY,
                    Quad._helperPoint.x * scaleX, Quad._helperPoint.y * scaleY);
                if(scaleX < 0) {
                    resultRect.width *= -1;
                    resultRect.x -= resultRect.width;
                }
                if(scaleY < 0) {
                    resultRect.height *= -1;
                    resultRect.y -= resultRect.height;
                }
            }
            else {
                this.getTransformationMatrix(targetSpace, Quad._helperMatrix);
                this._vertexData.getBounds(Quad._helperMatrix, 0, 4, resultRect);
            }

            return resultRect;
        }

        /** Returns the color of a vertex at a certain index. */
        public getVertexColor(vertexID:number):number/*uint*/ {
            return this._vertexData.getColor(vertexID);
        }

        /** Sets the color of a vertex at a certain index. */
        public setVertexColor(vertexID:number, color:number/*uint*/):void {
            this._vertexData.setColor(vertexID, color);
            this.onVertexDataChanged();

            if(color != 0xffffff) this._tinted = true;
            else this._tinted = this._vertexData.tinted;
        }

        /** Returns the alpha value of a vertex at a certain index. */
        public getVertexAlpha(vertexID:number):number {
            return this._vertexData.getAlpha(vertexID);
        }

        /** Sets the alpha value of a vertex at a certain index. */
        public setVertexAlpha(vertexID:number, alpha:number):void {
            this._vertexData.setAlpha(vertexID, alpha);
            this.onVertexDataChanged();

            if(alpha != 1.0)
                this._tinted = true;
            else
                this._tinted = this._vertexData.tinted;
        }

        /** Returns the color of the quad, or of vertex 0 if vertices have different colors. */
        public get color():number/*uint*/ {
            return this._vertexData.getColor(0);
        }

        /** Sets the colors of all vertices to a certain value. */
        public set color(value:number/*uint*/) {
            for(var i:number = 0; i < 4; ++i)
                this.setVertexColor(i, value);

            if(value != 0xffffff || this.alpha != 1.0)
                this._tinted = true;
            else
                this._tinted = this._vertexData.tinted;
        }

        /** @inheritDoc **/
        public set alpha(value:number) {
            // [PORT] verify if workaround is still required
//            super.alpha = value;
            Object.getOwnPropertyDescriptor(super, 'alpha').set.call(this, value);

            if(value < 1.0)
                this._tinted = true;
            else
                this._tinted = this._vertexData.tinted;
        }

        public get alpha():number {
            // [PORT] verify if workaround is still required
            return Object.getOwnPropertyDescriptor(super, 'alpha').get.call(this);
        }

        /** Copies the raw vertex data to a VertexData instance. */
        public copyVertexDataTo(targetData:VertexData, targetVertexID:number = 0):void {
            this._vertexData.copyTo(targetData, targetVertexID);
        }

        /** @inheritDoc */
        public render(support:RenderSupport):void {
            var context:CanvasRenderingContext2D = support.context;

            context.save();

            var m:Matrix = support.mvpMatrix;

            /**
             a  c  e
             b  d  f
             0  0  1
             */
            context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);

            context.globalAlpha = support.alpha;

            if(this.blendMode == null)
                throw new IllegalOperationError('a blend mode value of "null" is not supported!');

            support.applyBlendMode(false); // todo [ALPHA]

            this.renderTransformed(support, context);

            context.restore();
        }

        public renderTransformed(support:RenderSupport, context:CanvasRenderingContext2D):void {
            context.fillStyle = Color.toHexString(this.color);
            context.fillRect(0, 0, this.width, this.height);
        }

        /** Returns true if the quad (or any of its vertices) is non-white or non-opaque. */
        public get tinted():boolean {
            return this._tinted;
        }
    }
}
