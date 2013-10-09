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

    class State {
        matrix:Matrix;
        blendMode:string;
        parentBlendMode:string;
        alpha:number;

        constructor() {
            this.matrix = new Matrix();
            this.blendMode = null;
            this.parentBlendMode = null;
            this.alpha = 1.0;
        }
    }

    /** A class that contains helper methods simplifying Stage3D rendering.
     *
     *  A RenderSupport instance is passed to any "render" method of display objects.
     *  It allows manipulation of the current transformation matrix (similar to the matrix
     *  manipulation methods of OpenGL 1.x) and other helper methods.
     */
    export class RenderSupport {
        // members

        private _context:CanvasRenderingContext2D;
        private _canvas:HTMLCanvasElement;

        private _projectionMatrix:Matrix;
        private _modelViewMatrix:Matrix;
        private _mvpMatrix:Matrix;
        private _stateStack:State[];
        private _stateStackSize:number;
        private _drawCount:number;
        private _blendMode:string;
        private _parentBlendMode:string;
        private _alpha:number;

        /** helper objects */
        private static _point:Point = new Point();
        private static _rectangle:Rectangle = new Rectangle();

        // construction

        /** Creates a new RenderSupport object with an empty matrix stack. */
        constructor() {
            this._projectionMatrix = new Matrix();
            this._modelViewMatrix = new Matrix();
            this._mvpMatrix = new Matrix();
            this._stateStack = [];
            this._stateStackSize = 0;
            this._drawCount = 0;
            this._blendMode = BlendMode.NORMAL;
            this._parentBlendMode = null;

            this.loadIdentity();
            this.setOrthographicProjection(0, 0, 400, 300);
        }

        // matrix manipulation

        /** Sets up the projection matrix for ortographic 2D rendering. */
        public setOrthographicProjection(x:number, y:number, width:number, height:number):void {
            this._projectionMatrix.setTo(2.0 / width, 0, 0, -2.0 / height,
                -(2 * x + width) / width, (2 * y + height) / height);
        }

        /** Changes the modelview matrix to the identity matrix. */
        public loadIdentity():void {
            this._modelViewMatrix.identity();
        }

        /** Prepends a translation to the modelview matrix. */
        public translateMatrix(dx:number, dy:number):void {
            MatrixUtil.prependTranslation(this._modelViewMatrix, dx, dy);
        }

        /** Prepends a rotation (angle in radians) to the modelview matrix. */
        public rotateMatrix(angle:number):void {
            MatrixUtil.prependRotation(this._modelViewMatrix, angle);
        }

        /** Prepends an incremental scale change to the modelview matrix. */
        public scaleMatrix(sx:number, sy:number):void {
            MatrixUtil.prependScale(this._modelViewMatrix, sx, sy);
        }

        /** Prepends a matrix to the modelview matrix by multiplying it another matrix. */
        public prependMatrix(matrix:Matrix):void {
            MatrixUtil.prependMatrix(this._modelViewMatrix, matrix);
        }

        /** Prepends translation, scale and rotation of an object to the modelview matrix. */
        public transformMatrix(object:DisplayObject):void {
            MatrixUtil.prependMatrix(this._modelViewMatrix, object.transformationMatrix);
        }

        /** Pushes the current modelview matrix to a stack from which it can be restored later. */
        public pushState():void {
            var state:State;
            if(this._stateStack.length < this._stateStackSize + 1) {
                state = new State();
                this._stateStack.push(state);
                this._stateStackSize++;
            } else {
                state = this._stateStack[this._stateStackSize++];
            }

            var blendMode = this.blendMode;

            state.matrix.copyFrom(this._modelViewMatrix);
            state.alpha = this.alpha;
            state.blendMode = blendMode;
            state.parentBlendMode = this.parentBlendMode;

            this.alpha = 1.0;
            this.parentBlendMode = blendMode;
            this.blendMode = BlendMode.AUTO;
        }

        /** Restores the modelview matrix that was last pushed to the stack. */
        public popState():void {
            var state = this._stateStack[--this._stateStackSize];
            this._modelViewMatrix.copyFrom(state.matrix);
            this._alpha = state.alpha;
            this.blendMode = state.blendMode;
        }

        /** Empties the matrix stack, resets the modelview matrix to the identity matrix. */
        public resetMatrix():void {
            this._stateStackSize = 0;
            this.loadIdentity();
        }

        /** Prepends translation, scale and rotation of an object to a custom matrix. */
        public static transformMatrixForObject(matrix:Matrix, object:DisplayObject):void {
            MatrixUtil.prependMatrix(matrix, object.transformationMatrix);
        }

        /** Calculates the product of modelview and projection matrix.
         *  CAUTION: Don't save a reference to this object! Each call returns the same instance. */
        public get mvpMatrix():Matrix {
            this._mvpMatrix.copyFrom(this._modelViewMatrix);
            //this._mvpMatrix.concat(this._projectionMatrix);
            return this._mvpMatrix;
        }

        /** Returns the current modelview matrix. CAUTION: not a copy -- use with care! */
        public get modelViewMatrix():Matrix {
            return this._modelViewMatrix;
        }

        /** Returns the current projection matrix. CAUTION: not a copy -- use with care! */
        public get projectionMatrix():Matrix {
            return this._projectionMatrix;
        }

        // blending

        /** Activates the current blend mode on the active rendering context. */
        public applyBlendMode(premultipliedAlpha:boolean):void {
            var context = this.context;

            var blendMode = this.blendMode;
            if(blendMode == null)
                blendMode = this.parentBlendMode || BlendMode.NORMAL;

            context.globalCompositeOperation = blendMode;

            //this.setBlendFactors(premultipliedAlpha, this._blendMode);
        }

        /** The blend mode to be used on rendering. To apply the factor, you have to manually call
         *  'applyBlendMode' (because the actual blend factors depend on the PMA mode). */
        public get blendMode():string {
            return this._blendMode;
        }

        public set blendMode(value:string) {
            if(value != BlendMode.AUTO)
                this._blendMode = value;
        }

        private set parentBlendMode(value:string) {
            this._parentBlendMode = value;
        }

        private get parentBlendMode():string {
            return this._parentBlendMode;
        }

        public get alpha():number {
            return this._alpha;
        }

        public set alpha(alpha:number) {
            this._alpha = alpha;
        }

        public get context():CanvasRenderingContext2D {
            return this._context;
        }

        public get canvas():HTMLCanvasElement {
            return this._canvas;
        }

        public set context(context:CanvasRenderingContext2D) {
            this._context = context;
            this._canvas = context.canvas;
            if(this._canvas == null)
                throw new ArgumentError('CanvasRenderingContext2D without a HTMLCanvas reference!');
        }

        /** Resets matrix stack, blend mode, quad batch index, and draw count. */
        public nextFrame():void {
            this.resetMatrix();
            this._blendMode = BlendMode.NORMAL;
            this._drawCount = 0;
        }

        /** Clears the render context with a certain color and alpha value. */
        public static clear(context:CanvasRenderingContext2D, rgb:number = 0, alpha:number = 1.0):void {
            var canvas = context.canvas;
            if(canvas == null)
                throw new IllegalSystemStateError('CanvasRenderingContext2D without a "canvas" reference!');

            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0); // "resetTransform" not widely supported yet
            if(rgb === 0 && alpha === 0) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                // todo [ALPHA]
                //context.globalAlpha = alpha;
                context.fillStyle = Color.toHexString(rgb);
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
            context.restore();
        }

        /** Clears the render context with a certain color and alpha value. */
        public clear(rgb:number = 0, alpha:number = 1.0):void {
            var context = this.context;

            if(context == null)
                throw new MissingContextError();

            RenderSupport.clear(context, rgb, alpha);
        }

        // statistics

        /** Raises the draw count by a specific value. Call this method in custom render methods
         *  to keep the statistics display in sync. */
        public raiseDrawCount(value:number/*uint*/ = 1):void {
            this._drawCount += value;
        }

        /** Indicates the number of stage3D draw calls. */
        public get drawCount():number {
            return this._drawCount;
        }

    }
}
