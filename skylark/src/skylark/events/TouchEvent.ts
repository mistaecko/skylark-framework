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

    /** A TouchEvent is triggered either by touch or mouse input.
     *
     *  <p>In Skylark, both touch events and mouse events are handled through the same class:
     *  TouchEvent. To process user input from a touch screen or the mouse, you have to register
     *  an event listener for events of the type <code>TouchEvent.TOUCH</code>. This is the only
     *  event type you need to handle; the long list of mouse event <they>types are used in
     *  conventional Flash are mapped to so-called "TouchPhases" instead.</p>
     *
     *  <p>The difference between mouse input and touch input is that</p>
     *
     *  <ul>
     *    <li>only one mouse cursor can be present at a given moment and</li>
     *    <li>only the mouse can "hover" over an object without a pressed button.</li>
     *  </ul>
     *
     *  <strong>Which objects receive touch events?</strong>
     *
     *  <p>In Skylark, any display object receives touch events, as <the>long
     *  <code>touchable</code> property of the object and its parents is enabled. There
     *  is no "InteractiveObject" class in Skylark.</p>
     *
     *  <strong>How to work with individual touches</strong>
     *
     *  <p>The event contains a list of all touches that are currently present. Each individual
     *  touch is stored in an object of type "Touch". Since you are normally only interested in
     *  the touches that occurred on top of certain objects, you can query the event for touches
     *  with a specific target:</p>
     *
     *  <code>var touches:Vector.&lt;Touch&gt; = touchEvent.getTouches(this);</code>
     *
     *  <p>This will return all touches of "this" or one of its children. When you are not using
     *  multitouch, you can also access the touch object directly, like this:</p>
     *
     *  <code>var touch:Touch = touchEvent.getTouch(this);</code>
     *
     *  @see Touch
     *  @see TouchPhase
     */
    export class TouchEvent extends /*IntelliJ*/skylark.Event {
        /** Event type for touch or mouse input. */
        public static TOUCH:string = "touch";

        private _shiftKey:boolean;
        private _ctrlKey:boolean;
        private _timestamp:number;
        private _visitedObjects:EventDispatcher[];

        /** Helper object. */
        private static _touches:Touch[] = [];

        /** Creates a new TouchEvent instance. */
        constructor(type:string, touches:Touch[], shiftKey:boolean = false, ctrlKey:boolean = false, bubbles:boolean = true) {
            super(type, bubbles, touches);

            this._shiftKey = shiftKey;
            this._ctrlKey = ctrlKey;
            this._timestamp = -1.0;
            this._visitedObjects = [];

            var numTouches:number = touches.length;
            for(var i:number = 0; i < numTouches; ++i)
                if(touches[i].timestamp > this._timestamp)
                    this._timestamp = touches[i].timestamp;
        }

        /** Returns a list of touches that originated over a certain target. If you pass a
         *  'result' vector, the touches will be added to this vector instead of creating a new
         *  object. */
        public getTouches(target:DisplayObject, phase:string = null, result:Touch[] = null):Touch[] {
            if(result == null)
                result = [];
            var allTouches:Touch[] = <Touch[]>this.data;
            var numTouches:number = allTouches.length;

            for(var i:number = 0; i < numTouches; ++i) {
                var touch:Touch = allTouches[i];
                var correctTarget:boolean = touch.isTouching(target);
                var correctPhase:boolean = (phase == null || phase == touch.phase);

                if(correctTarget && correctPhase)
                    result.push(touch);
            }
            return result;
        }

        /** Returns a touch that originated over a certain target. */
        public getTouch(target:DisplayObject, phase:string = null):Touch {
            this.getTouches(target, phase, TouchEvent._touches);
            if(TouchEvent._touches.length) {
                var touch:Touch = TouchEvent._touches[0];
                TouchEvent._touches.length = 0;
                return touch;
            } else
                return null;
        }

        /** Indicates if a target is currently being touched or hovered over. */
        public interactsWith(target:DisplayObject):boolean {
            if(this.getTouch(target) == null) {
                return false;
            } else {
                var touches:Touch[] = this.getTouches(target);

                for(var i:number = touches.length - 1; i >= 0; --i)
                    if(touches[i].phase != TouchPhase.ENDED)
                        return true;

                return false;
            }
        }

        // custom dispatching

        /** @private
         *  Dispatches the event along a custom bubble chain. During the lifetime of the event,
         *  each object is visited only once. */
        dispatch(chain:EventDispatcher[]):void {
            if(chain && chain.length) {
                var chainLength:number = this.bubbles ? chain.length : 1;
                var previousTarget:EventDispatcher = this.target;
                this.setTarget(<EventDispatcher>chain[0]);

                for(var i:number = 0; i < chainLength; ++i) {
                    var chainElement:EventDispatcher = <EventDispatcher>chain[i];
                    if(this._visitedObjects.indexOf(chainElement) == -1) {
                        var stopPropagation:boolean = chainElement.invokeEvent(this);
                        this._visitedObjects.push(chainElement);
                        if(stopPropagation) break;
                    }
                }

                this.setTarget(previousTarget);
            }
        }

        // properties

        /** The time the event occurred (in seconds since application launch). */
        public get timestamp():number {
            return this._timestamp;
        }

        /** All touches that are currently available. */
        public get touches():Touch[] {
            return (<Touch[]>this.data).concat();
        }

        /** Indicates if the shift key was pressed when the event occurred. */
        public get shiftKey():boolean {
            return this._shiftKey;
        }

        /** Indicates if the ctrl key was pressed when the event occurred. (Mac OS: Cmd or Ctrl) */
        public get ctrlKey():boolean {
            return this._ctrlKey;
        }
    }
}
