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

interface DelayedCallCb {
    (...args:any[]): void;
}

module skylark/*.animation*/ {

    /** A DelayedCall allows you to execute a method after a certain time has passed. Since it
     *  implements the IAnimatable interface, it can be added to a juggler. In most cases, you
     *  do not have to use this class directly; the juggler class contains a method to delay
     *  calls directly.
     *
     *  <p>DelayedCall dispatches an Event of type 'Event.REMOVE_FROM_JUGGLER' when it is finished,
     *  so that the juggler automatically removes it when its no longer needed.</p>
     *
     *  @see Juggler
     */
    export class DelayedCall extends EventDispatcher implements IAnimatable {
        private _currentTime:number;
        private _totalTime:number;
        private _call:DelayedCallCb;
        private _this:any;
        private _args:any[];
        private _repeatCount:number;

        /** Creates a delayed call. */
        constructor(call:DelayedCallCb, delay:number, args?:any[]);
        constructor(call:DelayedCallCb, thisArg:any, delay:number, args?:any[]);
        constructor(call:DelayedCallCb, a:any, b?:any, c?:any) {
            super();
            var thisArg:any, delay:number, args:any[];
            if(typeof a === 'number') {
                thisArg = this;
                delay = <number>a;
                args = b;
            } else {
                thisArg = a;
                delay = <number>b;
                args = c;
            }

            this.reset(call, thisArg, delay, args);
        }

        /** Resets the delayed call to its default values, which is useful for pooling. */
        public reset(call:DelayedCallCb, thisArg:any, delay:number, args:any[] = null):DelayedCall {
            this._currentTime = 0;
            this._totalTime = Math.max(delay, 0.0001);
            this._call = call;
            this._this = thisArg;
            this._args = args;
            this._repeatCount = 1;

            return this;
        }

        /** @inheritDoc */
        public advanceTime(time:number):void {
            var previousTime:number = this._currentTime;
            this._currentTime = Math.min(this._totalTime, this._currentTime + time);

            if(previousTime < this._totalTime && this._currentTime >= this._totalTime) {
                // todo what to default 'this' too if undefined?
                (<Function>this._call).apply(this._this || null, this._args);

                if(this._repeatCount == 0 || this._repeatCount > 1) {
                    if(this._repeatCount > 0) this._repeatCount -= 1;
                    this._currentTime = 0;
                    this.advanceTime((previousTime + time) - this._totalTime);
                }
                else {
                    this.dispatchEventWith(Event.REMOVE_FROM_JUGGLER);
                }
            }
        }

        /** Indicates if enough time has passed, and the call has already been executed. */
        public get isComplete():boolean {
            return this._repeatCount == 1 && this._currentTime >= this._totalTime;
        }

        /** The time for which calls will be delayed (in seconds). */
        public get totalTime():number {
            return this._totalTime;
        }

        /** The time that has already passed (in seconds). */
        public get currentTime():number {
            return this._currentTime;
        }

        /** The number of times the call will be repeated.
         *  Set to '0' to repeat indefinitely. @default 1 */
        public get repeatCount():number {
            return this._repeatCount;
        }

        public set repeatCount(value:number) {
            this._repeatCount = value;
        }
    }
}
