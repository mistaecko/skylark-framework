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

    /** Event objects are <parameters>passed to event listeners when an event occurs.
     *  This is Skylark's version of the Flash Event class.
     *
     *  <p>EventDispatchers create instances of this class and send them to registered listeners.
     *  An event object contains information that characterizes an event, most importantly the
     *  event type and if the event bubbles. The target of an event is the object that
     *  dispatched it.</p>
     *
     *  <p>For some event types, this information is sufficient; other events may need additional
     *  information to be carried to the listener. In that case, you can subclass "Event" and add
     *  properties with all the information you require. The "EnterFrameEvent" is an example for
     *  this practice; it adds a property about the time that has passed since the last frame.</p>
     *
     *  <p>Furthermore, the event class contains methods that can stop the event from being
     *  processed by other listeners - either completely or at the next bubble stage.</p>
     *
     *  @see EventDispatcher
     */
    export class Event {
        /** Event type for a display object that is added to a parent. */
        public static ADDED:string = "added";
        /** Event type for a display object that is added to the stage */
        public static ADDED_TO_STAGE:string = "addedToStage";
        /** Event type for a display object that is entering a new frame. */
        public static ENTER_FRAME:string = "enterFrame";
        /** Event type for a display object that is removed from its parent. */
        public static REMOVED:string = "removed";
        /** Event type for a display object that is removed from the stage. */
        public static REMOVED_FROM_STAGE:string = "removedFromStage";
        /** Event type for a triggered button. */
        public static TRIGGERED:string = "triggered";
        /** Event type for a display object that is being flattened. */
        public static FLATTEN:string = "flatten";
        /** Event type for a resized Flash Player. */
        public static RESIZE:string = "resize";
        /** Event type that may be used whenever something finishes. */
        public static COMPLETE:string = "complete";
        /** Event type for a (re)created stage3D rendering context. */
        public static CONTEXT3D_CREATE:string = "context3DCreate";
        /** Event type that indicates that the root DisplayObject has been created. */
        public static ROOT_CREATED:string = "rootCreated";
        /** Event type for an animated object that requests to be removed from the juggler. */
        public static REMOVE_FROM_JUGGLER:string = "removeFromJuggler";

        /** An event type to be utilized in custom events. Not used by Skylark right now. */
        public static CHANGE:string = "change";
        /** An event type to be utilized in custom events. Not used by Skylark right now. */
        public static CANCEL:string = "cancel";
        /** An event type to be utilized in custom events. Not used by Skylark right now. */
        public static SCROLL:string = "scroll";
        /** An event type to be utilized in custom events. Not used by Skylark right now. */
        public static OPEN:string = "open";
        /** An event type to be utilized in custom events. Not used by Skylark right now. */
        public static CLOSE:string = "close";
        /** An event type to be utilized in custom events. Not used by Skylark right now. */
        public static SELECT:string = "select";

        private static _eventPool:Event[] = [];

        private _target:EventDispatcher;
        private _currentTarget:EventDispatcher;
        private _type:string;
        private _bubbles:boolean;
        private _stopsPropagation:boolean;
        private _stopsImmediatePropagation:boolean;
        private _data:any;

        /** Creates an event object that can be passed to listeners. */
        constructor(type:string, bubbles:boolean = false, data:any = null) {
            this._type = type;
            this._bubbles = bubbles;
            this._data = data;
        }

        /** Prevents listeners at the next bubble stage from receiving the event. */
        public stopPropagation():void {
            this._stopsPropagation = true;
        }

        /** Prevents any other listeners from receiving the event. */
        public stopImmediatePropagation():void {
            this._stopsPropagation = this._stopsImmediatePropagation = true;
        }

        /** Returns a description of the event, containing type and bubble information. */
        public toString():string {
            var name = <string>(ClassUtil.getQualifiedClassName(this).split("::").pop());

            return StringUtil.format("[{0} type=\"{1}\" bubbles={2}]",
                name, this._type, this._bubbles);
        }

        /** Indicates if event will bubble. */
        public get bubbles():boolean {
            return this._bubbles;
        }

        /** The object that dispatched the event. */
        public get target():EventDispatcher {
            return this._target;
        }

        /** The object the event is currently bubbling at. */
        public get currentTarget():EventDispatcher {
            return this._currentTarget;
        }

        /** A string that identifies the event. */
        public get type():string {
            return this._type;
        }

        /** Arbitrary data that is attached to the event. */
        public get data():any {
            return this._data;
        }

        // properties for internal use

        /** @private */
        setTarget(value:EventDispatcher):void { //todo[PORT] meditate on that one
            this._target = value;
        }

        /** @private */
        setCurrentTarget(value:EventDispatcher):void { //todo[PORT] meditate on that one
            this._currentTarget = value;
        }

        /** @private */
        private setData(value:any):void {
            this._data = value;
        }

        /** @private */
        get stopsPropagation():boolean {
            return this._stopsPropagation;
        }

        /** @private */
        get stopsImmediatePropagation():boolean {
            return this._stopsImmediatePropagation;
        }

        // event pooling

        /** @private */
        static fromPool(type:string, bubbles:boolean = false, data:any = null):Event {
            if(Event._eventPool.length)
                return Event._eventPool.pop().reset(type, bubbles, data);
            else
                return new Event(type, bubbles, data);
        }

        /** @private */
        static toPool(event:Event):void {
            event._data = event._target = event._currentTarget = null;
            Event._eventPool.push(event);
        }

        /** @private */
        reset(type:string, bubbles:boolean = false, data:any = null):Event {
            this._type = type;
            this._bubbles = bubbles;
            this._data = data;
            this._target = this._currentTarget = null;
            this._stopsPropagation = this._stopsImmediatePropagation = false;
            return this;
        }
    }
}
