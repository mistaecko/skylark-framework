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

    /** A Touch object contains information about the presence or movement of a finger
     *  or the mouse on the screen.
     *
     *  <p>You receive objects of this type from a TouchEvent. When such an event is triggered, you can
     *  query it for all touches that are currently present on the screen. One Touch object contains
     *  information about a single touch. A touch object always moves through a series of
     *  TouchPhases. Have a look at the TouchPhase class for more information.</p>
     *
     *  <strong>The position of a touch</strong>
     *
     *  <p>You can get the current and previous position in stage coordinates with the corresponding
     *  properties. However, you'll want to have the position in a different coordinate system
     *  most of the time. For this reason, there are methods that convert the current and previous
     *  touches into the local coordinate system of any object.</p>
     *
     *  @see TouchEvent
     *  @see TouchPhase
     */
    export class Touch {
        private mID:number;
        private _globalX:number;
        private _globalY:number;
        private _previousGlobalX:number;
        private _previousGlobalY:number;
        private _tapCount:number;
        private _phase:string;
        private _target:DisplayObject;
        private _timestamp:number;
        private _pressure:number;
        private _width:number;
        private _height:number;
        private _bubbleChain:EventDispatcher[];

        /** Helper object. */
        private static _helperMatrix:Matrix = new Matrix();

        /** Creates a new Touch object. */
        constructor(id:number, globalX:number, globalY:number, phase:string, target:DisplayObject) {
            this.mID = id;
            this._globalX = this._previousGlobalX = globalX;
            this._globalY = this._previousGlobalY = globalY;
            this._tapCount = 0;
            this._phase = phase;
            this._target = target;
            this._pressure = this._width = this._height = 1.0;
            this._bubbleChain = [/*EventDispatcher*/];
            this.updateBubbleChain();
        }

        /** Converts the current location of a touch to the local coordinate system of a display
         *  object. If you pass a 'resultPoint', the result will be stored in this point instead
         *  of creating a new object.*/
        public getLocation(space:DisplayObject, resultPoint:Point = null):Point {
            if(resultPoint == null)
                resultPoint = new Point();
            space.base.getTransformationMatrix(space, Touch._helperMatrix);

            return MatrixUtil.transformCoords(Touch._helperMatrix, this._globalX, this._globalY, resultPoint);
        }

        /** Converts the previous location of a touch to the local coordinate system of a display
         *  object. If you pass a 'resultPoint', the result will be stored in this point instead
         *  of creating a new object.*/
        public getPreviousLocation(space:DisplayObject, resultPoint:Point = null):Point {
            if(resultPoint == null)
                resultPoint = new Point();
            space.base.getTransformationMatrix(space, Touch._helperMatrix);

            return MatrixUtil.transformCoords(Touch._helperMatrix, this._previousGlobalX, this._previousGlobalY, resultPoint);
        }

        /** Returns the movement of the touch between the current and previous location.
         *  If you pass a 'resultPoint', the result will be stored in this point instead
         *  of creating a new object. */
        public getMovement(space:DisplayObject, resultPoint:Point = null):Point {
            if(resultPoint == null)
                resultPoint = new Point();
            this.getLocation(space, resultPoint);
            var x:number = resultPoint.x;
            var y:number = resultPoint.y;
            this.getPreviousLocation(space, resultPoint);
            resultPoint.setTo(x - resultPoint.x, y - resultPoint.y);

            return resultPoint;
        }

        /** Indicates if the target or one of its children is touched. */
        public isTouching(target:DisplayObject):boolean {
            return this._bubbleChain.indexOf(target) != -1;
        }

        /** Returns a description of the object. */
        public toString():string {
            return StringUtil.format("Touch {0}: globalX={1}, globalY={2}, phase={3}",
                this.mID, this._globalX, this._globalY, this._phase);
        }

        /** Creates a clone of the Touch object. */
        public clone():Touch {
            var clone:Touch = new Touch(this.mID, this._globalX, this._globalY, this._phase, this._target);
            clone._previousGlobalX = this._previousGlobalX;
            clone._previousGlobalY = this._previousGlobalY;
            clone._tapCount = this._tapCount;
            clone._timestamp = this._timestamp;
            clone._pressure = this._pressure;
            clone._width = this._width;
            clone._height = this._height;

            return clone;
        }

        // helper methods

        private updateBubbleChain():void {
            if(this._target) {
                var length:number = 1;
                var element:DisplayObject = this._target;

                this._bubbleChain.length = 1;
                this._bubbleChain[0] = element;

                while((element = element.parent) != null)
                    this._bubbleChain[length++] = element;
            }
            else {
                this._bubbleChain.length = 0;
            }
        }

        // properties

        /** The identifier of a touch. '0' for mouse events, an increasing number for touches. */
        public get id():number {
            return this.mID;
        }

        /** The x-position of the touch in stage coordinates. */
        public get globalX():number {
            return this._globalX;
        }

        /** The y-position of the touch in stage coordinates. */
        public get globalY():number {
            return this._globalY;
        }

        /** The previous x-position of the touch in stage coordinates. */
        public get previousGlobalX():number {
            return this._previousGlobalX;
        }

        /** The previous y-position of the touch in stage coordinates. */
        public get previousGlobalY():number {
            return this._previousGlobalY;
        }

        /** The number of taps the finger made in a short amount of time. Use this to detect
         *  double-taps / double-clicks, etc. */
        public get tapCount():number {
            return this._tapCount;
        }

        /** The current phase the touch is in. @see TouchPhase */
        public get phase():string {
            return this._phase;
        }

        /** The display object at which the touch occurred. */
        public get target():DisplayObject {
            return this._target;
        }

        /** The moment the touch occurred (in seconds since application start). */
        public get timestamp():number {
            return this._timestamp;
        }

        /** A value between 0.0 and 1.0 indicating force of the contact with the device.
         *  If the device does not support detecting the pressure, the value is 1.0. */
        public get pressure():number {
            return this._pressure;
        }

        /** Width of the contact area.
         *  If the device does not support detecting the pressure, the value is 1.0. */
        public get width():number {
            return this._width;
        }

        /** Height of the contact area.
         *  If the device does not support detecting the pressure, the value is 1.0. */
        public get height():number {
            return this._height;
        }

        // internal methods

        /** @private
         *  Dispatches a touch event along the current bubble chain (which is updated each time
         *  a target is set). */
        dispatchEvent(event:TouchEvent):void {
            if(this._target)
                event.dispatch(this._bubbleChain);
        }

        /** @private */
        get bubbleChain():EventDispatcher[] {
            return this._bubbleChain.concat();
        }

        /** @private */
        setTarget(value:DisplayObject):void {
            this._target = value;
            this.updateBubbleChain();
        }

        /** @private */
        setPosition(globalX:number, globalY:number):void {
            this._previousGlobalX = this._globalX;
            this._previousGlobalY = this._globalY;
            this._globalX = globalX;
            this._globalY = globalY;
        }

        /** @private */
        setSize(width:number, height:number):void {
            this._width = width;
            this._height = height;
        }

        /** @private */
        setPhase(value:string):void {
            this._phase = value;
        }

        /** @private */
        setTapCount(value:number):void {
            this._tapCount = value;
        }

        /** @private */
        setTimestamp(value:number):void {
            this._timestamp = value;
        }

        /** @private */
        setPressure(value:number):void {
            this._pressure = value;
        }
    }
}
