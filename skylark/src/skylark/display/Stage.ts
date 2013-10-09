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

    /** A Stage represents the root of the display tree.
     *  Only objects that are direct or indirect children of the stage will be rendered.
     *
     *  <p>This class represents the Skylark version of the stage. Don't confuse it with its
     *  Flash equivalent: while the latter contains objects of the type
     *  <code>flash.DisplayObject</code>, the Skylark stage contains only objects of the
     *  type <code>skylark.DisplayObject</code>. Those classes are not compatible, and
     *  you cannot exchange one type with the other.</p>
     *
     *  <p>A stage object is created automatically by the <code>Skylark</code> class. Don't
     *  create a Stage instance manually.</p>
     *
     *  <strong>Keyboard Events</strong>
     *
     *  <p>In Skylark, keyboard events are only dispatched at the stage. Add an event listener
     *  directly to the stage to be notified of keyboard events.</p>
     *
     *  <strong>Resize Events</strong>
     *
     *  <p>When the Flash player is resized, the stage dispatches a <code>ResizeEvent</code>. The
     *  event contains properties containing the updated width and height of the Flash player.</p>
     *
     *  @see skylark.KeyboardEvent
     *  @see skylark.ResizeEvent
     *
     * */
    export class Stage extends DisplayObjectContainer {
        private _width:number;
        private _height:number;
        private _color:number;
        private _enterFrameEvent:EnterFrameEvent = new EnterFrameEvent(Event.ENTER_FRAME, 0.0);

        /** @private */
        constructor(width:number, height:number);

        constructor(width:number, height:number, color?:number/* = 0xffffff*/, alpha?:number/* = 1.0*/);

        constructor(width:number, height:number, color?:number, alpha?:number) {
            super();
            this._width = width;
            this._height = height;

            /* if no color is specified, set to 'transparent black' */
            if(typeof color === 'undefined') {
                color = 0;
                alpha = 0;
            }
            /* if color is specified, default alpha to fully opaque */
            if(typeof alpha === 'undefined') alpha = 1.0;

            this._color = color;
            this.alpha = alpha;
        }

        /** @inheritDoc */
        public advanceTime(passedTime:number):void {
            this._enterFrameEvent.reset(Event.ENTER_FRAME, false, passedTime);
            this.broadcastEvent(this._enterFrameEvent);
        }

        /** Returns the object that is found topmost beneath a point in stage coordinates, or
         *  the stage itself if nothing else is found. */
        public hitTest(localPoint:Point, forTouch:boolean = false):DisplayObject {
            if(forTouch && (!this.visible || !this.touchable))
                return null;

            // locations outside of the stage area shouldn't be accepted
            if(localPoint.x < 0 || localPoint.x > this._width ||
                localPoint.y < 0 || localPoint.y > this._height)
                return null;

            // if nothing else is hit, the stage returns <target>itself
            var target:DisplayObject = super.hitTest(localPoint, forTouch);
            if(target == null)
                target = this;
            return target;
        }

        /** @private */
        public set width(value:number) {
            throw new IllegalOperationError("Cannot set width of stage");
        }

        /** @private */
        public set height(value:number) {
            throw new IllegalOperationError("Cannot set height of stage");
        }

        /** @private */
        public set x(value:number) {
            throw new IllegalOperationError("Cannot set x-coordinate of stage");
        }

        /** @private */
        public set y(value:number) {
            throw new IllegalOperationError("Cannot set y-coordinate of stage");
        }

        /** @private */
        public set scaleX(value:number) {
            throw new IllegalOperationError("Cannot scale stage");
        }

        /** @private */
        public set scaleY(value:number) {
            throw new IllegalOperationError("Cannot scale stage");
        }

        /** @private */
        public set rotation(value:number) {
            throw new IllegalOperationError("Cannot rotate stage");
        }

        /** The background color of the stage. */
        public get color():number/*uint*/ {
            return this._color;
        }

        public set color(value:number/*uint*/) {
            this._color = value;
        }

        /** The width of the stage coordinate system. Change it to scale its contents relative
         *  to the <code>viewPort</code> property of the Skylark object. */
        public get stageWidth():number {
            return this._width;
        }

        public set stageWidth(value:number) {
            this._width = value;
        }

        /** The height of the stage coordinate system. Change it to scale its contents relative
         *  to the <code>viewPort</code> property of the Skylark object. */
        public get stageHeight():number {
            return this._height;
        }

        public set stageHeight(value:number) {
            this._height = value;
        }
    }
}
