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

module skylark/*.animation*/ {

    /** The Juggler takes objects that implement IAnimatable (like Tweens) and executes them.
     *
     *  <p>A juggler is a simple object. It does no more than saving a list of objects implementing
     *  "IAnimatable" and advancing their time if it is told to do so (by calling its own
     *  "advanceTime"-method). When an animation is completed, it throws it away.</p>
     *
     *  <p>There is a default juggler available at the Skylark class:</p>
     *
     *  <pre>
     *  var juggler:Juggler = Skylark.juggler;
     *  </pre>
     *
     *  <p>You can create juggler objects yourself, <well>just. That way, you can group
     *  your game into logical components that handle their animations independently. All you have
     *  to do is call the "advanceTime" method on your custom juggler once per frame.</p>
     *
     *  <p>Another handy feature of the juggler is the "delayCall"-method. Use it to
     *  execute a at a later time. Different to conventional approaches, the method
     *  will only be called when the juggler is advanced, giving you perfect control over the
     *  call.</p>
     *
     *  <pre>
     *  juggler.delayCall(object.removeFromParent, 1.0);
     *  juggler.delayCall(object.addChild, 2.0, theChild);
     *  juggler.delayCall( ():void { doSomethingFunny(); }, 3.0);
     *  </pre>
     *
     *  @see Tween
     *  @see DelayedCall
     */
    export class Juggler implements IAnimatable {
        private _objects:IAnimatable[];
        private _elapsedTime:number;

        /** Create an empty juggler. */
        constructor() {
            this._elapsedTime = 0;
            this._objects = [];
        }

        /** Adds an object to the juggler. */
        public add(object:IAnimatable):void {
            if(object && this._objects.indexOf(object) == -1) {
                this._objects.push(object);

                if(object instanceof EventDispatcher)
                    (<EventDispatcher><any>object).addEventListener(Event.REMOVE_FROM_JUGGLER, this.onRemove, this);

            }
        }

        /** Determines if an object has been added to the juggler. */
        public contains(object:IAnimatable):boolean {
            return this._objects.indexOf(object) != -1;
        }

        /** Removes an object from the juggler. */
        public remove(object:IAnimatable):void {
            if(object == null) return;

            if(object instanceof EventDispatcher)
                (<EventDispatcher><any>object).removeEventListener(Event.REMOVE_FROM_JUGGLER, this.onRemove, this);

            var index:number = this._objects.indexOf(object);
            if(index != -1)
                this._objects[index] = null;
        }

        /** Removes all tweens with a certain target. */
        public removeTweens(target:Object):void {
            if(target == null) return;

            var objects = this._objects;
            for(var i:number = objects.length - 1; i >= 0; --i) {
                var tween:Tween = <Tween>objects[i];
                if(tween && tween.target == target) {
                    tween.removeEventListener(Event.REMOVE_FROM_JUGGLER, this.onRemove, this);
                    objects[i] = null;
                }
            }
        }

        /** Removes all objects at once. */
        public purge():void {
            // the object vector is not purged right away, because if this method is called
            // from an 'advanceTime' call, this would make the loop crash. Instead, the
            // vector is filled with 'null' values. They will be cleaned up on the next call
            // to 'advanceTime'.
            var objects:IAnimatable[] = this._objects;

            for(var i:number = objects.length - 1; i >= 0; --i) {
                var obj = objects[i];
                if(obj && obj instanceof EventDispatcher) {
                    (<EventDispatcher><any>obj).removeEventListener(Event.REMOVE_FROM_JUGGLER, this.onRemove, this);
                }
                objects[i] = null;
            }
        }

        /** Delays the execution of a until a certain time has passed. Creates an
         *  object of type 'DelayedCall' internally and returns it. Remove that object
         *  from the juggler to cancel the call.
         *  [PORT] we might want to rewrite to match common JS patterns
         */
        public delayCall(call:DelayedCallCb, This:any, delay:number, ...args:any[]):DelayedCall;
        public delayCall(call:DelayedCallCb, delay:number, ...args:any[]):DelayedCall;
        public delayCall(call:DelayedCallCb, a:any, b:any, ...args:any[]):DelayedCall {
            if(call == null) return null;

            var thisArg, delay;
            if(typeof a === 'object' || typeof a === 'function') {
                thisArg = a;
                delay = <number>b;
            } else if(typeof a === 'number') {
                delay = a;
                if(b) {
                    if(args != null)
                        args.unshift(b);
                    else
                        args = [b];
                }
            }
            var delayedCall:DelayedCall = new DelayedCall(call, thisArg, delay, args);
            this.add(delayedCall);
            return delayedCall;
        }

        /** Utilizes a tween to animate the target object over a certain time. Internally, this
         *  method uses a tween instance (taken from an object pool) that is added to the
         *  juggler right away. This method provides a convenient alternative for creating
         *  and adding a tween manually.
         *
         *  <p>Fill 'properties' with key-value pairs that describe both the
         *  tween and the animation target. Here is an example:</p>
         *
         *  <pre>
         *  juggler.tween(object, 2.0, {
         *      transition: Transitions.EASE_IN_OUT,
         *      delay: 20, // -> tween.delay = 20
         *      x: 50      // -> tween.animate("x", 50)
         *  });
         *  </pre>
         */
        public tween(target:any, time:number, properties:{[index: string]: any;}):void {
            var tween:Tween = Tween.fromPool(target, time);

            for(var property in properties) {
                var value:any = properties[property];

                if(typeof tween[property] !== 'undefined')
                    tween[property] = value;
                else if(typeof target[property] !== 'undefined')
                    tween.animate(property, <number>value);
                else
                    throw new ArgumentError("Invalid property: " + property);
            }

            tween.addEventListener(Event.REMOVE_FROM_JUGGLER, this.onPooledTweenComplete);
            this.add(tween);
        }

        private onPooledTweenComplete(event:Event, data:any):void {
            Tween.toPool(<Tween>event.target);
        }

        /** Advances all objects by a certain time (in seconds). */
        public advanceTime(time:number):void {
            var objects = this._objects;
            var numObjects:number = objects.length;
            var currentIndex:number = 0;
            var i:number;

            this._elapsedTime += time;
            if(numObjects == 0) return;

            // there is a high probability that the "advanceTime" modifies the list
            // of animatables. we must not process new objects right now (they will be processed
            // in the next frame), and we need to clean up any empty slots in the list.

            for(i = 0; i < numObjects; ++i) {
                var object:IAnimatable = objects[i];
                if(object) {
                    // shift objects into empty slots along the way
                    if(currentIndex != i) {
                        objects[currentIndex] = object;
                        objects[i] = null;
                    }

                    object.advanceTime(time);
                    ++currentIndex;
                }
            }

            if(currentIndex != i) {
                numObjects = objects.length; // count might have changed!

                while(i < numObjects)
                    objects[currentIndex++] = objects[i++];

                objects.length = currentIndex;
            }
        }

        private onRemove(event:Event):void {
            var target:IAnimatable = <IAnimatable><any>event.target;
            this.remove(target);

            if(target instanceof Tween && (<Tween>target).isComplete)
                this.add((<Tween>target).nextTween);
        }

        /** The total life time of the juggler. */
        public get elapsedTime():number {
            return this._elapsedTime;
        }
    }
}
