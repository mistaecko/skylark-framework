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

    export interface EventListenerFn {
        (event:Event, data:any): void;
    }

    export class EventListener {
        constructor(fn:EventListenerFn, context:any) {
            this.context = context;
            this.fn = fn;
        }

        public context:any;
        public fn:EventListenerFn;
    }

    /** The EventDispatcher class is the base class for all classes that dispatch events.
     *  This is the Skylark version of the Flash class with the same name.
     *
     *  <p>The event mechanism is a key feature of Skylark's architecture. Objects can communicate
     *  with each other through events. Compared the the Flash event system, Skylark's event system
     *  was simplified. The main difference is that Skylark events have no "Capture" phase.
     *  They are simply dispatched at the target and may optionally bubble up. They cannot move
     *  in the opposite direction.</p>
     *
     *  <p>As in the conventional Flash classes, display objects inherit from EventDispatcher
     *  and can thus dispatch events. Beware, though, that the Skylark event classes are
     *  <em>not compatible with Flash events:</em> Skylark display objects dispatch
     *  Skylark events, which will bubble along Skylark display objects - but they cannot
     *  dispatch Flash events or bubble along Flash display objects.</p>
     *
     *  @see Event
     *  @see skylark.DisplayObject DisplayObject
     */
    export class EventDispatcher {
        private _eventListeners:{ [index: string]: EventListener[]; };

        /** Helper object. */
        private static _bubbleChains:any[] = [];

        /** Creates an EventDispatcher. */
        constructor() {
        }

        /** Registers an event listener at a certain object. */
        public addEventListener(type:string, listener:EventListenerFn, This:any = null):void {
            if(this._eventListeners == null)
                this._eventListeners = {};

            var listeners:EventListener[] = this._eventListeners[type];

            var entry:EventListener = new EventListener(listener, This || this);
            if(listeners == null)
                this._eventListeners[type] = [ entry ];

            else if(this.findEventListener(type, listener, This || this) === -1) // check for duplicates
                listeners.push(entry);
        }

        /** Removes an event listener from the object. */
        public removeEventListener(type:string, listener:EventListenerFn, This:any = null):void {
            if(this._eventListeners) {
                var listeners:EventListener[] = this._eventListeners[type];
                if(listeners) {

                    var numListeners:number = listeners.length;
                    var remainingListeners:EventListener[] = [];

                    for(var i:number = 0; i < numListeners; ++i) {
                        var eventListener = listeners[i];
                        if(eventListener.context !== (This || this) || eventListener.fn !== listener)
                            remainingListeners.push(eventListener);
                    }
                    this._eventListeners[type] = remainingListeners;
                }
            }
        }

        public findEventListener(type:string, listener:EventListenerFn, This:any = null):number {
            var chain:EventListener[] = this._eventListeners[type];
            if(chain != null) {
                for(var i = 0; i < chain.length; i++) {
                    var l = chain[i];
                    if(l.context === This && l.fn === listener)
                        return i;
                }
            }
            return -1;
        }

        /** Removes all event listeners with a certain type, or all of them if type is null.
         *  Be careful when removing all event listeners: you never know who else was listening. */
        public removeEventListeners(type:string = null):void {
            if(type && this._eventListeners)
                delete this._eventListeners[type];
            else
                this._eventListeners = null;
        }

        /** Dispatches an event to all objects that have registered listeners for its type.
         *  If an event with enabled 'bubble' property is dispatched to a display object, it will
         *  travel up along the line of parents, until it either hits the root object or someone
         *  stops its propagation manually. */
        public dispatchEvent(event:Event):void {
            var bubbles:boolean = event.bubbles;

            if(!bubbles && (this._eventListeners == null || !(event.type in this._eventListeners)))
                return; // no need to do anything

            // we save the current target and restore it later;
            // this allows users to re-dispatch events without creating a clone.

            var previousTarget:EventDispatcher = event.target;
            event.setTarget(this);

            if(bubbles && (this instanceof DisplayObject))
                this.bubbleEvent(event);
            else
                this.invokeEvent(event);

            if(previousTarget)
                event.setTarget(previousTarget);
        }

        /** @protected
         *  Invokes an event on the current object. This method does not do any bubbling, nor
         *  does it back-up and restore the previous target on the event. The 'dispatchEvent'
         *  method uses this method internally. */
         public invokeEvent(event:Event):boolean {
            var listeners:EventListener[] = this._eventListeners ?
                this._eventListeners[event.type] : null;
            var numListeners:number = listeners == null ? 0 : listeners.length;

            if(numListeners) {
                event.setCurrentTarget(this);

                // we can enumerate directly over the vector, because:
                // when somebody modifies the list while we're looping, "addEventListener" is not
                // problematic, and "removeEventListener" will create a new Vector, anyway.

                for(var i:number = 0; i < numListeners; ++i) {
                    var eventListener = listeners[i];
                    var listener:EventListenerFn = eventListener.fn;
                    var context:any = eventListener.context;
                    // please the TS compiler and cast to Function
                    (<Function>listener).apply(context, [event, event.data]);

                    if(event.stopsImmediatePropagation)
                        return true;
                }

                return event.stopsPropagation;
            }
            else {
                return false;
            }
        }

        /** @private */
        private bubbleEvent(event:Event):void {
            // we determine the bubble chain before starting to invoke the listeners.
            // that way, changes done by the listeners won't affect the bubble chain.

            var chain:EventDispatcher[];
            var element:DisplayObject = <DisplayObject>this;
            var length:number = 1;

            if(EventDispatcher._bubbleChains.length > 0) {
                chain = <EventDispatcher[]>EventDispatcher._bubbleChains.pop();
                chain[0] = <EventDispatcher>element;
            }
            else chain = [ element ]; //new < EventDispatcher > [element];

            //todo[PORT] cast is <hint>required for Webstorm
            while((element = (<DisplayObject>element).parent) != null)
                chain[length++] = <EventDispatcher>element;

            for(var i:number = 0; i < length; ++i) {
                var stopPropagation:boolean = chain[i].invokeEvent(event);
                if(stopPropagation) break;
            }

            chain.length = 0;
            EventDispatcher._bubbleChains.push(chain);
        }

        /** Dispatches an event with the given parameters to all objects that have registered
         *  listeners for the given type. The method uses an internal pool of event objects to
         *  avoid allocations. */
        public dispatchEventWith(type:string, bubbles:boolean = false, data:Object = null):void {
            if(bubbles || this.hasEventListener(type)) {
                var event:Event = Event.fromPool(type, bubbles, data);
                this.dispatchEvent(event);
                Event.toPool(event);
            }
        }

        /** Returns if there are listeners registered for a certain event type. */
        public hasEventListener(type:string):boolean {
            var listeners:EventListener[] = this._eventListeners ?
                this._eventListeners[type] : null;
            return listeners ? listeners.length != 0 : false;
        }
    }
}
