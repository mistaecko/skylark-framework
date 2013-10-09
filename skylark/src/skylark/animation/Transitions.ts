// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
//
// easing s thankfully taken from http://dojotoolkit.org
//                                    and http://www.robertpenner.com/easing
//
/// <reference path="../../_dependencies.ts"/>

module skylark {


    /** The Transitions class contains static methods that define easing s.
     *  Those s are used by the Tween class to execute animations.
     *
     *  <p>Here is a visual representation of the available transitions:</p>
     *  <img src="http://gamua.com/img/blog/2010/sparrow-transitions.png"/>
     *
     *  <p>You can define your own transitions through the "registerTransition" . A
     *  transition must have the following signature, where <code>ratio</code> is
     *  in the range 0-1:</p>
     *
     *  <pre> myTransition(ratio:number):number</pre>
     */
    export class Transitions {

        public static LINEAR:string = "linear";
        public static EASE_IN:string = "easeIn";
        public static EASE_OUT:string = "easeOut";
        public static EASE_IN_OUT:string = "easeInOut";
        public static EASE_OUT_IN:string = "easeOutIn";
        public static EASE_IN_BACK:string = "easeInBack";
        public static EASE_OUT_BACK:string = "easeOutBack";
        public static EASE_IN_OUT_BACK:string = "easeInOutBack";
        public static EASE_OUT_IN_BACK:string = "easeOutInBack";
        public static EASE_IN_ELASTIC:string = "easeInElastic";
        public static EASE_OUT_ELASTIC:string = "easeOutElastic";
        public static EASE_IN_OUT_ELASTIC:string = "easeInOutElastic";
        public static EASE_OUT_IN_ELASTIC:string = "easeOutInElastic";
        public static EASE_IN_BOUNCE:string = "easeInBounce";
        public static EASE_OUT_BOUNCE:string = "easeOutBounce";
        public static EASE_IN_OUT_BOUNCE:string = "easeInOutBounce";
        public static EASE_OUT_IN_BOUNCE:string = "easeOutInBounce";

        private static _transitions:Object;

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** Returns the transition that was registered under a certain name. */
        public static getTransition(name:string):Function {
            if(Transitions._transitions == null)
                Transitions.registerDefaults();
            return Transitions._transitions[name];
        }

        /** Registers a new transition under a certain name. */
        public static register(name:string, func:Function):void {
            if(Transitions._transitions == null)
                Transitions.registerDefaults();
            Transitions._transitions[name] = func;
        }

        private static registerDefaults():void {
            Transitions._transitions = {};

            Transitions.register(Transitions.LINEAR, Transitions.linear);
            Transitions.register(Transitions.EASE_IN, Transitions.easeIn);
            Transitions.register(Transitions.EASE_OUT, Transitions.easeOut);
            Transitions.register(Transitions.EASE_IN_OUT, Transitions.easeInOut);
            Transitions.register(Transitions.EASE_OUT_IN, Transitions.easeOutIn);
            Transitions.register(Transitions.EASE_IN_BACK, Transitions.easeInBack);
            Transitions.register(Transitions.EASE_OUT_BACK, Transitions.easeOutBack);
            Transitions.register(Transitions.EASE_IN_OUT_BACK, Transitions.easeInOutBack);
            Transitions.register(Transitions.EASE_OUT_IN_BACK, Transitions.easeOutInBack);
            Transitions.register(Transitions.EASE_IN_ELASTIC, Transitions.easeInElastic);
            Transitions.register(Transitions.EASE_OUT_ELASTIC, Transitions.easeOutElastic);
            Transitions.register(Transitions.EASE_IN_OUT_ELASTIC, Transitions.easeInOutElastic);
            Transitions.register(Transitions.EASE_OUT_IN_ELASTIC, Transitions.easeOutInElastic);
            Transitions.register(Transitions.EASE_IN_BOUNCE, Transitions.easeInBounce);
            Transitions.register(Transitions.EASE_OUT_BOUNCE, Transitions.easeOutBounce);
            Transitions.register(Transitions.EASE_IN_OUT_BOUNCE, Transitions.easeInOutBounce);
            Transitions.register(Transitions.EASE_OUT_IN_BOUNCE, Transitions.easeOutInBounce);
        }

        // transitions

        static linear(ratio:number):number {
            return ratio;
        }

        static easeIn(ratio:number):number {
            return ratio * ratio * ratio;
        }

        static easeOut(ratio:number):number {
            var invRatio:number = ratio - 1.0;
            return invRatio * invRatio * invRatio + 1;
        }

        static easeInOut(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeIn, Transitions.easeOut, ratio);
        }

        static easeOutIn(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeOut, Transitions.easeIn, ratio);
        }

        static easeInBack(ratio:number):number {
            var s:number = 1.70158;
            return Math.pow(ratio, 2) * ((s + 1.0) * ratio - s);
        }

        static easeOutBack(ratio:number):number {
            var invRatio:number = ratio - 1.0;
            var s:number = 1.70158;
            return Math.pow(invRatio, 2) * ((s + 1.0) * invRatio + s) + 1.0;
        }

        static easeInOutBack(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeInBack, Transitions.easeOutBack, ratio);
        }

        static easeOutInBack(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeOutBack, Transitions.easeInBack, ratio);
        }

        static easeInElastic(ratio:number):number {
            if(ratio == 0 || ratio == 1) return ratio;
            else {
                var p:number = 0.3;
                var s:number = p / 4.0;
                var invRatio:number = ratio - 1;
                return -1.0 * Math.pow(2.0, 10.0 * invRatio) * Math.sin((invRatio - s) * (2.0 * Math.PI) / p);
            }
        }

        static easeOutElastic(ratio:number):number {
            if(ratio == 0 || ratio == 1)
                return ratio;
            else {
                var p:number = 0.3;
                var s:number = p / 4.0;
                return Math.pow(2.0, -10.0 * ratio) * Math.sin((ratio - s) * (2.0 * Math.PI) / p) + 1;
            }
        }

        static easeInOutElastic(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeInElastic, Transitions.easeOutElastic, ratio);
        }

        static easeOutInElastic(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeOutElastic, Transitions.easeInElastic, ratio);
        }

        static easeInBounce(ratio:number):number {
            return 1.0 - Transitions.easeOutBounce(1.0 - ratio);
        }

        static easeOutBounce(ratio:number):number {
            var s:number = 7.5625;
            var p:number = 2.75;
            var l:number;
            if(ratio < (1.0 / p)) {
                l = s * Math.pow(ratio, 2);
            } else {
                if(ratio < (2.0 / p)) {
                    ratio -= 1.5 / p;
                    l = s * Math.pow(ratio, 2) + 0.75;
                }
                else {
                    if(ratio < 2.5 / p) {
                        ratio -= 2.25 / p;
                        l = s * Math.pow(ratio, 2) + 0.9375;
                    }
                    else {
                        ratio -= 2.625 / p;
                        l = s * Math.pow(ratio, 2) + 0.984375;
                    }
                }
            }
            return l;
        }

        static easeInOutBounce(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeInBounce, Transitions.easeOutBounce, ratio);
        }

        static easeOutInBounce(ratio:number):number {
            return Transitions.easeCombined(Transitions.easeOutBounce, Transitions.easeInBounce, ratio);
        }

        static easeCombined(startFunc:Function, endFunc:Function, ratio:number):number {
            if(ratio < 0.5)
                return 0.5 * startFunc(ratio * 2.0);
            else
                return 0.5 * endFunc((ratio - 0.5) * 2.0) + 0.5;
        }
    }
}
