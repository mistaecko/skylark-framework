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

module skylark/*.animation*/
{

    /** A Tween this.animates numeric properties of objects. It uses different transition s
     *  to give the animations various styles.
     *
     *  <p>The primary use of this class is to do standard animations like movement, fading,
     *  rotation, etc. But there are no limits on what to this.animate; as <the>long property you want
     *  to this.animate is numeric (<code>int, uint, Number</code>), the tween can handle it. For a list
     *  of available Transition types, look at the "Transitions" class.</p>
     *
     *  <p>Here is an example of a tween that moves an object to the right, rotates it, and
     *  fades it out:</p>
     *
     *  <listing>
     *  var tween:Tween = new Tween(object, 2.0, Transitions.EASE_IN_OUT);
     *  tween.animate("x", object.x + 50);
     *  tween.animate("rotation", deg2rad(45));
     *  tween.fadeTo(0);    // equivalent to 'animate("alpha", 0)'
     *  Skylark.juggler.add(tween);</listing>
     *
     *  <p>Note that the object is added to a juggler at the end of this sample. That's because a
     *  tween will only be executed if its "advanceTime" method is executed regularly - the
     *  juggler will do that for you, and will remove the tween when it is finished.</p>
     *
     *  @see Juggler
     *  @see Transitions
     */
    export class Tween extends EventDispatcher implements IAnimatable {
        private _target:Object;
        private _transitionFunc:Function;
        private _transitionName:string;

        private _properties:string[];
        private _startValues:number[];
        private _endValues:number[];

        private _onStart:Function;
        private _onUpdate:Function;
        private _onRepeat:Function;
        private _onComplete:Function;

        private _onStartArgs:any[];
        private _onUpdateArgs:any[];
        private _onRepeatArgs:any[];
        private _onCompleteArgs:any[];

        private _totalTime:number;
        private _currentTime:number;
        private _delay:number;
        private _roundToInt:boolean;
        private _nextTween:Tween;
        private _repeatCount:number;
        private _repeatDelay:number;
        private _reverse:boolean;
        private _currentCycle:number;

        /** Creates a tween with a target, duration (in seconds) and a transition .
         *  @param target the object that you want to this.animate
         *  @param time the duration of the Tween
         *  @param transition can be either a String (e.g. one of the constants defined in the
         *         Transitions class) or a  Function. Look up the 'Transitions' class for a
         *         documentation about the required signature. */
        constructor(target:Object, time:number, transition:any = "linear") {
            super();
            this.reset(target, time, transition);
        }

        /** Resets the tween to its default values. Useful for pooling tweens. */
        public reset(target:any, time:number, transition:any = "linear"):Tween {
            this._target = target;
            this._currentTime = 0;
            this._totalTime = Math.max(0.0001, time);
            this._delay = this._repeatDelay = 0.0;
            this._onStart = this._onUpdate = this._onComplete = null;
            this._onStartArgs = this._onUpdateArgs = this._onCompleteArgs = null;
            this._roundToInt = this._reverse = false;
            this._repeatCount = 1;
            this._currentCycle = -1;

            if(typeof transition === 'string')
                this.transition = <string>transition;
            else if(typeof transition === 'function')
                this.transitionFunc = <Function>transition;
            else
                throw new ArgumentError("Argument 'transition' must be either a String or a Function");

            if(this._properties)  this._properties.length = 0; else this._properties = [/*String*/];
            if(this._startValues) this._startValues.length = 0; else this._startValues = [/*Number*/];
            if(this._endValues)   this._endValues.length = 0; else this._endValues = [/*Number*/];

            return this;
        }

        /** Animates the property of an object to a target value. You can call this method multiple
         *  times on one tween. */
        public animate(property:string, targetValue:number):void {
            if(this._target == null) return; // tweening null just does nothing.

            this._properties.push(property);
            this._startValues.push(Number.NaN);
            this._endValues.push(targetValue);
        }

        /** Animates the 'scaleX' and 'scaleY' properties of an object simultaneously. */
        public scaleTo(factor:number):void {
            this.animate("scaleX", factor);
            this.animate("scaleY", factor);
        }

        /** Animates the 'x' and 'y' properties of an object simultaneously. */
        public moveTo(x:number, y:number):void {
            this.animate("x", x);
            this.animate("y", y);
        }

        /** Animates the 'alpha' property of an object to a certain target value. */
        public fadeTo(alpha:number):void {
            this.animate("alpha", alpha);
        }

        /** @inheritDoc */
        public advanceTime(time:number):void {
            if(time == 0 || (this._repeatCount == 1 && this._currentTime == this._totalTime))
                return;

            var i:number;
            var previousTime:number = this._currentTime;
            var restTime:number = this._totalTime - this._currentTime;
            var carryOverTime:number = time > restTime ? time - restTime : 0.0;

            this._currentTime = Math.min(this._totalTime, this._currentTime + time);

            if(this._currentTime <= 0)
                return; // the delay is not over yet

            if(this._currentCycle < 0 && previousTime <= 0 && this._currentTime > 0) {
                this._currentCycle++;
                if(this._onStart != null)
                    this._onStart.apply(null, this._onStartArgs);
            }

            var ratio:number = this._currentTime / this._totalTime;
            var reversed:boolean = this._reverse && (this._currentCycle % 2 == 1);
            var numProperties:number = this._startValues.length;

            for(i = 0; i < numProperties; ++i) {
                if(isNaN(this._startValues[i]))
                    this._startValues[i] = this._target[this._properties[i]]; // [PORT] number cast

                var startValue:number = this._startValues[i];
                var endValue:number = this._endValues[i];
                var delta:number = endValue - startValue;
                var transitionValue:number = reversed ?
                    this._transitionFunc(1.0 - ratio) : this._transitionFunc(ratio);

                var currentValue:number = startValue + transitionValue * delta;
                if(this._roundToInt)
                    currentValue = Math.round(currentValue);
                this._target[this._properties[i]] = currentValue;
            }

            if(this._onUpdate != null)
                this._onUpdate.apply(null, this._onUpdateArgs);

            if(previousTime < this._totalTime && this._currentTime >= this._totalTime) {
                if(this._repeatCount == 0 || this._repeatCount > 1) {
                    this._currentTime = -this._repeatDelay;
                    this._currentCycle++;
                    if(this._repeatCount > 1) this._repeatCount--;
                    if(this._onRepeat != null) this._onRepeat.apply(null, this._onRepeatArgs);
                }
                else {
                    // save callback & args: they might be changed through an event listener
                    var onComplete:Function = this._onComplete;
                    var onCompleteArgs:any[] = this._onCompleteArgs;

                    // in the 'onComplete' callback, people might want to call "tween.reset" and
                    // add it to another juggler; so this event has to be dispatched *before*
                    // executing 'onComplete'.
                    this.dispatchEventWith(Event.REMOVE_FROM_JUGGLER);
                    if(onComplete != null) onComplete.apply(null, onCompleteArgs);
                }
            }

            if(carryOverTime)
                this.advanceTime(carryOverTime);
        }

        /** Indicates if the tween is finished. */
        public get isComplete():boolean {
            return this._currentTime >= this._totalTime && this._repeatCount == 1;
        }

        /** The target object that is this.animated. */
        public get target():any {
            return this._target;
        }

        /** The transition method used for the animation. @see Transitions */
        public get transition():string {
            return this._transitionName;
        }

        public set transition(value:string) {
            this._transitionName = value;
            this._transitionFunc = Transitions.getTransition(value);

            if(this._transitionFunc == null)
                throw new ArgumentError("Invalid transiton: " + value);
        }

        /** The actual transition used for the animation. */
        public get transitionFunc():Function {
            return this._transitionFunc;
        }

        public set transitionFunc(value:Function) {
            this._transitionName = "custom";
            this._transitionFunc = value;
        }

        /** The total time the tween will take per repetition (in seconds). */
        public get totalTime():number {
            return this._totalTime;
        }

        /** The time that has passed since the tween was created. */
        public get currentTime():number {
            return this._currentTime;
        }

        /** The delay before the tween is started. @default 0 */
        public get delay():number {
            return this._delay;
        }

        public set delay(value:number) {
            this._currentTime = this._currentTime + this._delay - value;
            this._delay = value;
        }

        /** The number of times the tween will be executed.
         *  Set to '0' to tween indefinitely. @default 1 */
        public get repeatCount():number {
            return this._repeatCount;
        }

        public set repeatCount(value:number) {
            this._repeatCount = value;
        }

        /** The amount of time to wait between repeat cycles, in seconds. @default 0 */
        public get repeatDelay():number {
            return this._repeatDelay;
        }

        public set repeatDelay(value:number) {
            this._repeatDelay = value;
        }

        /** Indicates if the tween should be reversed when it is repeating. If enabled,
         *  every second repetition will be reversed. @default false */
        public get reverse():boolean {
            return this._reverse;
        }

        public set reverse(value:boolean) {
            this._reverse = value;
        }

        /** Indicates if the numeric values should be cast to Integers. @default false */
        public get roundToInt():boolean {
            return this._roundToInt;
        }

        public set roundToInt(value:boolean) {
            this._roundToInt = value;
        }

        /** A that will be called when the tween starts (after a possible delay). */
        public get onStart():Function {
            return this._onStart;
        }

        public set onStart(value:Function) {
            this._onStart = value;
        }

        /** A that will be called each time the tween is advanced. */
        public get onUpdate():Function {
            return this._onUpdate;
        }

        public set onUpdate(value:Function) {
            this._onUpdate = value;
        }

        /** A that will be called each time the tween finishes one repetition
         *  (except the last, which will trigger 'onComplete'). */
        public get onRepeat():Function {
            return this._onRepeat;
        }

        public set onRepeat(value:Function) {
            this._onRepeat = value;
        }

        /** A that will be called when the tween is complete. */
        public get onComplete():Function {
            return this._onComplete;
        }

        public set onComplete(value:Function) {
            this._onComplete = value;
        }

        /** The arguments that will be passed to the 'onStart' . */
        public get onStartArgs():any[] {
            return this._onStartArgs;
        }

        public set onStartArgs(value:any[]) {
            this._onStartArgs = value;
        }

        /** The arguments that will be passed to the 'onUpdate' . */
        public get onUpdateArgs():any[] {
            return this._onUpdateArgs;
        }

        public set onUpdateArgs(value:any[]) {
            this._onUpdateArgs = value;
        }

        /** The arguments that will be passed to the 'onRepeat' . */
        public get onRepeatArgs():any[] {
            return this._onRepeatArgs;
        }

        public set onRepeatArgs(value:any[]) {
            this._onRepeatArgs = value;
        }

        /** The arguments that will be passed to the 'onComplete' . */
        public get onCompleteArgs():any[] {
            return this._onCompleteArgs;
        }

        public set onCompleteArgs(value:any[]) {
            this._onCompleteArgs = value;
        }

        /** Another tween that will be started (i.e. added to the same juggler) as soon as
         *  this tween is completed. */
        public get nextTween():Tween {
            return this._nextTween;
        }

        public set nextTween(value:Tween) {
            this._nextTween = value;
        }

        // tween pooling

        private static _tweenPool:Tween[] = [/*Tween*/];

        /** @private */
        static fromPool(target:any, time:number, transition:any = "linear"):Tween {
            if(Tween._tweenPool.length)
                return Tween._tweenPool.pop().reset(target, time, transition);
            else
                return new Tween(target, time, transition);
        }

        /** @private */
        static toPool(tween:Tween):void {
            // reset any object-references, to make sure we don't prevent any garbage collection
            tween._onStart = tween._onUpdate = tween._onRepeat = tween._onComplete = null;
            tween._onStartArgs = tween._onUpdateArgs = tween._onRepeatArgs = tween._onCompleteArgs = null;
            tween._target = null;
            tween._transitionFunc = null;
            tween.removeEventListeners();
            Tween._tweenPool.push(tween);
        }
    }
}
