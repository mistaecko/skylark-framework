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

    /**
     *  The DisplayObject class is the base class for all objects that are rendered on the
     *  screen.
     *
     *  <p><strong>The Display Tree</strong></p>
     *
     *  <p>In Skylark, all displayable objects are organized in a display tree. Only objects that
     *  are part of the display tree will be displayed (rendered).</p>
     *
     *  <p>The display tree consists of leaf nodes (Image, Quad) that will be rendered directly to
     *  the screen, and of container nodes (subclasses of "DisplayObjectContainer", like "Sprite").
     *  A container is simply a display object that has child nodes - which can, again, be either
     *  leaf nodes or other containers.</p>
     *
     *  <p>At the base of the display tree, there is the Stage, which is a container, too. To create
     *  a Skylark application, you create a custom Sprite subclass, and Skylark will add an
     *  instance of this class to the stage.</p>
     *
     *  <p>A display object has properties that define its position in relation to its parent
     *  (x, y), as <its>well rotation and scaling factors (scaleX, scaleY). Use the
     *  <code>alpha</code> and <code>visible</code> properties to make an object translucent or
     *  invisible.</p>
     *
     *  <p>Every display object may be the target of touch events. If you don't want an object to be
     *  touchable, you can disable the "touchable" property. When it's disabled, neither the object
     *  nor its children will receive any more touch events.</p>
     *
     *  <strong>Transforming coordinates</strong>
     *
     *  <p>Within the display tree, each object has its own local coordinate system. If you rotate
     *  a container, you rotate that coordinate system - and thus all the children of the
     *  container.</p>
     *
     *  <p>Sometimes you need to know where a certain point lies relative to another coordinate
     *  system. That's the purpose of the method <code>getTransformationMatrix</code>. It will
     *  create a matrix that represents the transformation of a point in one coordinate system to
     *  another.</p>
     *
     *  <strong>Subclassing</strong>
     *
     *  <p>Since DisplayObject is an abstract class, you cannot instantiate it directly, but have
     *  to use one of its subclasses instead. There are already a lot of them available, and most
     *  of the time they will suffice.</p>
     *
     *  <p>However, you can create custom <well>subclasses. That way, you can create an object
     *  with a custom render function. You will need to implement the following methods when you
     *  subclass DisplayObject:</p>
     *
     *  <ul>
     *    <li><code>function render(support:RenderSupport, parentAlpha:number):void</code></li>
     *    <li><code>function getBounds(targetSpace:DisplayObject,
     *                                 resultRect:Rectangle=null):Rectangle</code></li>
     *  </ul>
     *
     *  <p>Have a look at the Quad class for a sample implementation of the 'getBounds' method.
     *  For a sample on how to write a custom render function, you can have a look at this
     *  <a href="http://wiki.skylark-framework.org/manual/custom_display_objects">article</a>
     *  in the Skylark Wiki.</p>
     *
     *  <p>When you the render method, it is important that you call the method
     *  'finishQuadBatch' of the support object. This forces Skylark to render all quads that
     *  were accumulated before by different render methods (for performance reasons). Otherwise,
     *  the z-ordering will be incorrect.</p>
     *
     *  @see DisplayObjectContainer
     *  @see Sprite
     *  @see Stage
     */
    export class DisplayObject extends EventDispatcher {
        // members

        private mX:number;
        private mY:number;
        private _pivotX:number;
        private _pivotY:number;
        private _scaleX:number;
        private _scaleY:number;
        private _skewX:number;
        private _skewY:number;
        private _rotation:number;
        private _alpha:number;
        private _visible:boolean;
        private _touchable:boolean;
        private _blendMode:string;
        private _name:string;
        private _useHandCursor:boolean;
        private _parent:DisplayObjectContainer;
        private _transformationMatrix:Matrix;
        private _orientationChanged:boolean;

        /** Helper objects. */
        private static _ancestors:DisplayObject[] = [];
        private static _helperRect:Rectangle = new Rectangle();
        private static _helperMatrix:Matrix = new skylark.Matrix();

        /** @private */
        constructor() {
            super();
//            if (Capabilities.isDebugger &&
//                getQualifiedClassName(this) === "skylark.display::DisplayObject") {
//                throw new AbstractClassError();
//            }

            this.mX = this.mY = this._pivotX = this._pivotY = this._rotation = this._skewX = this._skewY = 0.0;
            this._scaleX = this._scaleY = this._alpha = 1.0;
            this._visible = this._touchable = true;
            this._blendMode = BlendMode.AUTO;
            this._transformationMatrix = new Matrix();
            this._orientationChanged = this._useHandCursor = false;
        }

        /** Disposes all resources of the display object.
         * GPU buffers are released, event listeners are removed, filters are disposed. */
        public dispose():void {
            this.removeEventListeners(null);
        }

        /** Removes the object from its parent, if it has one. */
        public removeFromParent(dispose:boolean = false):void {
            if(this._parent)
                this._parent.removeChild(this, dispose);
        }

        /** Creates a matrix that represents the transformation from the local coordinate system
         *  to another. If you pass a 'resultMatrix', the result will be stored in this matrix
         *  instead of creating a new object. */
        public getTransformationMatrix(targetSpace:DisplayObject, resultMatrix:Matrix = null):Matrix {
            var commonParent:DisplayObject;
            var currentObject:DisplayObject;

            if(resultMatrix)
                resultMatrix.identity();
            else
                resultMatrix = new Matrix();

            if(targetSpace === this) {
                return resultMatrix;
            }
            else if(targetSpace === this._parent || (targetSpace == null && this._parent == null)) {
                resultMatrix.copyFrom(this.transformationMatrix);
                return resultMatrix;
            }
            else if(targetSpace == null || targetSpace === this.base) {
                // targetCoordinateSpace 'null' represents the target space of the base object.
                // -> move up from this to base

                currentObject = <DisplayObject>this;
                while(currentObject != targetSpace) {
                    resultMatrix.concat(currentObject.transformationMatrix);
                    currentObject = currentObject._parent;
                }

                return resultMatrix;
            }
            else if(targetSpace._parent === this) { // optimization
                targetSpace.getTransformationMatrix(this, resultMatrix);
                resultMatrix.invert();

                return resultMatrix;
            }

            // 1. find a common parent of this and the target space

            commonParent = null;
            currentObject = this;

            while(currentObject) {
                DisplayObject._ancestors.push(currentObject);
                currentObject = currentObject._parent;
            }

            currentObject = targetSpace;
            while(currentObject && DisplayObject._ancestors.indexOf(currentObject) === -1)
                currentObject = currentObject._parent;

            DisplayObject._ancestors.length = 0;

            if(currentObject) commonParent = currentObject;
            else throw new ArgumentError("Object not connected to target");

            // 2. move up from this to common parent

            //todo[PORT] cast is <hint>required for Webstorm
            currentObject = <DisplayObject>this;
            while(currentObject != commonParent) {
                resultMatrix.concat(currentObject.transformationMatrix);
                currentObject = currentObject._parent;
            }

            if(commonParent === targetSpace)
                return resultMatrix;

            // 3. now move up from target until we reach the common parent

            DisplayObject._helperMatrix.identity();
            currentObject = targetSpace;
            while(currentObject != commonParent) {
                DisplayObject._helperMatrix.concat(currentObject.transformationMatrix);
                currentObject = currentObject._parent;
            }

            // 4. now combine the two matrices

            DisplayObject._helperMatrix.invert();
            resultMatrix.concat(DisplayObject._helperMatrix);

            return resultMatrix;
        }

        /** Returns a rectangle that completely encloses the <it>object appears in another
         *  coordinate system. If you pass a 'resultRectangle', the result will be stored in this
         *  rectangle instead of creating a new object. */
        public getBounds(targetSpace:DisplayObject, resultRect:Rectangle = null):Rectangle {
            throw new AbstractMethodError("Method needs to be implemented in subclass");
            //return null;
        }

        /** Returns the object that is found topmost beneath a point in local coordinates, or nil if
         *  the test fails. If "forTouch" is true, untouchable and invisible objects will cause
         *  the test to fail. */
        public hitTest(localPoint:Point, forTouch:boolean = false):DisplayObject {
            // on a touch test, invisible or untouchable objects cause the test to fail
            if(forTouch && (!this._visible || !this._touchable))
                return null;

            // otherwise, check bounding box
            if(this.getBounds(this, DisplayObject._helperRect).containsPoint(localPoint))
                return this;
            else
                return null;
        }

        /** Transforms a point from the local coordinate system to global (stage) coordinates.
         *  If you pass a 'resultPoint', the result will be stored in this point instead of
         *  creating a new object. */
        public localToGlobal(localPoint:Point, resultPoint:Point = null):Point {
            this.getTransformationMatrix(this.base, DisplayObject._helperMatrix);
            return MatrixUtil.transformCoords(DisplayObject._helperMatrix, localPoint.x, localPoint.y, resultPoint);
        }

        /** Transforms a point from global (stage) coordinates to the local coordinate system.
         *  If you pass a 'resultPoint', the result will be stored in this point instead of
         *  creating a new object. */
        public globalToLocal(globalPoint:Point, resultPoint:Point = null):Point {
            this.getTransformationMatrix(this.base, DisplayObject._helperMatrix);
            DisplayObject._helperMatrix.invert();
            return MatrixUtil.transformCoords(DisplayObject._helperMatrix, globalPoint.x, globalPoint.y, resultPoint);
        }

        /** Renders the display object with the help of a support object. Never call this method
         *  directly, except from within another render method.
         *  @param support Provides utility functions for rendering. */
        public render(support:RenderSupport):void {
            throw new AbstractMethodError("Method needs to be implemented in subclass");
        }

        /** Indicates if an object occupies any visible area. (Which is the case when its 'alpha',
         *  'scaleX' and 'scaleY' values are not zero, and its 'visible' property is enabled.) */
        public get hasVisibleArea():boolean {
            return this._alpha != 0.0 && this._visible && this._scaleX != 0.0 && this._scaleY != 0.0;
        }

        // internal methods

        /** @private */
            setParent(value:DisplayObjectContainer):void {
            // check for a recursion
            var ancestor:DisplayObject = value;
            while(ancestor != this && ancestor != null)
                ancestor = ancestor._parent;

            if(ancestor === this)
                throw new ArgumentError("An object cannot be <a>added child to itself or one " +
                    "of its children (or children's children, etc.)");
            else
                this._parent = value;
        }

        // helpers
        //todo[PORT] made static
        private static isEquivalent(a:number, b:number, epsilon:number = 0.0001):boolean {
            return (a - epsilon < b) && (a + epsilon > b);
        }

        //todo[PORT] made static
        private static normalizeAngle(angle:number):number {
            // move into range [-180 deg, +180 deg]
            while(angle < -Math.PI)
                angle += Math.PI * 2.0;
            while(angle > Math.PI)
                angle -= Math.PI * 2.0;
            return angle;
        }

        // properties

        /** The transformation matrix of the object relative to its parent.
         *
         *  <p>If you assign a custom transformation matrix, Skylark will try to figure out
         *  suitable values for <code>x, y, scaleX, scaleY,</code> and <code>rotation</code>.
         *  However, if the matrix was created in a different way, this might not be possible.
         *  In that case, Skylark will apply the matrix, but not update the corresponding
         *  properties.</p>
         *
         *  @returns CAUTION: not a copy, but the actual object! */
        public get transformationMatrix():Matrix {
            if(this._orientationChanged) {
                this._orientationChanged = false;
                this._transformationMatrix.identity();

                if(this._scaleX != 1.0 || this._scaleY != 1.0)
                    this._transformationMatrix.scale(this._scaleX, this._scaleY);
                if(this._skewX != 0.0 || this._skewY != 0.0)
                    MatrixUtil.skew(this._transformationMatrix, this._skewX, this._skewY);
                if(this._rotation != 0.0)
                    this._transformationMatrix.rotate(this._rotation);
                if(this.mX != 0.0 || this.mY != 0.0)
                    this._transformationMatrix.translate(this.mX, this.mY);

                if(this._pivotX != 0.0 || this._pivotY != 0.0) {
                    // prepend pivot transformation
                    this._transformationMatrix.tx = this.mX - this._transformationMatrix.a * this._pivotX
                        - this._transformationMatrix.c * this._pivotY;
                    this._transformationMatrix.ty = this.mY - this._transformationMatrix.b * this._pivotX
                        - this._transformationMatrix.d * this._pivotY;
                }
            }

            return this._transformationMatrix;
        }

        public set transformationMatrix(matrix:Matrix) {
            this._orientationChanged = false;
            this._transformationMatrix.copyFrom(<Matrix>matrix);

            this.mX = matrix.tx;
            this.mY = matrix.ty;

            this._scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
            this._skewY = Math.acos(matrix.a / this._scaleX);

            if(!DisplayObject.isEquivalent(matrix.b, this._scaleX * Math.sin(this._skewY))) {
                this._scaleX *= -1;
                this._skewY = Math.acos(matrix.a / this._scaleX);
            }

            this._scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            this._skewX = Math.acos(matrix.d / this._scaleY);

            if(!DisplayObject.isEquivalent(matrix.c, -this._scaleY * Math.sin(this._skewX))) {
                this._scaleY *= -1;
                this._skewX = Math.acos(matrix.d / this._scaleY);
            }

            if(DisplayObject.isEquivalent(this._skewX, this._skewY)) {
                this._rotation = this._skewX;
                this._skewX = this._skewY = 0;
            } else {
                this._rotation = 0;
            }
        }

        /** Indicates if the mouse cursor should transform into a hand while it's over the sprite.
         *  @default false */
        public get useHandCursor():boolean {
            return this._useHandCursor;
        }

        public set useHandCursor(value:boolean) {
            if(value !== this._useHandCursor) {
                this._useHandCursor = value;

                //todo[PORT]
//            if (this._useHandCursor)
//                addEventListener(events.TouchEvent.TOUCH, this.onTouch);
//            else
//                removeEventListener(events.TouchEvent.TOUCH, this.onTouch);
            }
        }

        onTouch(event:TouchEvent):void {
            //todo[PORT]
//            Mouse.cursor = event.interactsWith(this) ? MouseCursor.BUTTON : MouseCursor.AUTO;
        }

        /** The bounds of the object relative to the local coordinates of the parent. */
        public get bounds():Rectangle {
            return this.getBounds(this._parent);
        }

        /** The width of the object in pixels. */
        public get width():number {
            return this.getBounds(this._parent, DisplayObject._helperRect).width;
        }

        public set width(value:number) {
            // this method calls 'this.scaleX' instead of changing this._scaleX directly.
            // that way, subclasses reacting on size changes need to only the scaleX method.

            this.scaleX = 1.0;
            var actualWidth:number = this.width;
            if(actualWidth != 0.0)
                this.scaleX = value / actualWidth;
        }

        /** The height of the object in pixels. */
        public get height():number {
            return this.getBounds(this._parent, DisplayObject._helperRect).height;
        }

        public set height(value:number) {
            this.scaleY = 1.0;
            var actualHeight:number = this.height;
            if(actualHeight != 0.0)
                this.scaleY = value / actualHeight;
        }

        /** The x coordinate of the object relative to the local coordinates of the parent. */
        public get x():number {
            return this.mX;
        }

        public set x(value:number) {
            if(this.mX != value) {
                this.mX = value;
                this._orientationChanged = true;
            }
        }

        /** The y coordinate of the object relative to the local coordinates of the parent. */
        public get y():number {
            return this.mY;
        }

        public set y(value:number) {
            if(this.mY != value) {
                this.mY = value;
                this._orientationChanged = true;
            }
        }

        /** The x coordinate of the object's origin in its own coordinate space (default: 0). */
        public get pivotX():number {
            return this._pivotX;
        }

        public set pivotX(value:number) {
            if(this._pivotX != value) {
                this._pivotX = value;
                this._orientationChanged = true;
            }
        }

        /** The y coordinate of the object's origin in its own coordinate space (default: 0). */
        public get pivotY():number {
            return this._pivotY;
        }

        public set pivotY(value:number) {
            if(this._pivotY != value) {
                this._pivotY = value;
                this._orientationChanged = true;
            }
        }

        /** The horizontal scale factor. '1' means no scale, negative values flip the object. */
        public get scaleX():number {
            return this._scaleX;
        }

        public set scaleX(value:number) {
            if(this._scaleX != value) {
                this._scaleX = value;
                this._orientationChanged = true;
            }
        }

        /** The vertical scale factor. '1' means no scale, negative values flip the object. */
        public get scaleY():number {
            return this._scaleY;
        }

        public set scaleY(value:number) {
            if(this._scaleY != value) {
                this._scaleY = value;
                this._orientationChanged = true;
            }
        }

        /** The horizontal skew angle in radians. */
        public get skewX():number {
            return this._skewX;
        }

        public set skewX(value:number) {
            value = DisplayObject.normalizeAngle(value);

            if(this._skewX != value) {
                this._skewX = value;
                this._orientationChanged = true;
            }
        }

        /** The vertical skew angle in radians. */
        public get skewY():number {
            return this._skewY;
        }

        public set skewY(value:number) {
            value = DisplayObject.normalizeAngle(value);

            if(this._skewY != value) {
                this._skewY = value;
                this._orientationChanged = true;
            }
        }

        /** The rotation of the object in radians. (In Skylark, all angles are measured
         *  in radians.) */
        public get rotation():number {
            return this._rotation;
        }

        public set rotation(value:number) {
            value = DisplayObject.normalizeAngle(value);

            if(this._rotation != value) {
                this._rotation = value;
                this._orientationChanged = true;
            }
        }

        /** The opacity of the object. 0 = transparent, 1 = opaque. */
        public get alpha():number {
            return this._alpha;
        }

        public set alpha(value:number) {
            this._alpha = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);
        }

        /** The visibility of the object. An invisible object will be untouchable. */
        public get visible():boolean {
            return this._visible;
        }

        public set visible(value:boolean) {
            this._visible = value;
        }

        /** Indicates if this object (and its children) will receive touch events. */
        public get touchable():boolean {
            return this._touchable;
        }

        public set touchable(value:boolean) {
            this._touchable = value;
        }

        /** The blend mode determines how the object is blended with the objects underneath.
         *   @default auto
         *   @see BlendMode */
        public get blendMode():string {
            return this._blendMode;
        }

        public set blendMode(value:string) {
            this._blendMode = value;
        }

        /** The name of the display object (default: null). Used by 'getChildByName()' of
         *  display object containers. */
        public get name():string {
            return this._name;
        }

        public set name(value:string) {
            this._name = value;
        }

        /** The display object container that contains this display object. */
        public get parent():DisplayObjectContainer {
            return this._parent;
        }

        /** The topmost object in the display tree the object is part of. */
        public get base():DisplayObject {
            var currentObject:DisplayObject = this;
            while(currentObject._parent)
                currentObject = currentObject._parent;
            return currentObject;
        }

        /** The root object the display object is connected to (i.e. an instance of the class
         *  that was passed to the Skylark constructor), or null if the object is not connected
         *  to the stage. */
        public get root():DisplayObject {
            var currentObject:DisplayObject = this;
            while(currentObject._parent) {
                if(currentObject._parent instanceof Stage)
                    return currentObject;
                else
                    currentObject = currentObject.parent;
            }

            return null;
        }

        /** The stage the display object is connected to, or null if it is not connected
         *  to the stage. */
        public get stage():Stage {
            var s = this.base;
            return s instanceof Stage ? <Stage>s : null;
        }
    }
}
