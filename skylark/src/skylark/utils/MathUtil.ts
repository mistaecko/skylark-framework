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

    export class MathUtil {

        /** Converts an angle from radions into degrees. */
        public static rad2deg(rad:number):number {
            return rad / Math.PI * 180.0;
        }

        /** Converts an angle from degrees into radians. */
        public static deg2rad(deg:number):number {
            return deg / 180.0 * Math.PI;
        }

        /** Returns the next power of two that is equal to or bigger than the specified number. */
        public static getNextPowerOfTwo(number:number):number {
            if(number > 0 && (number & (number - 1)) == 0) // see: http://goo.gl/D9kPj
                return number;
            else {
                var result:number = 1;
                while(result < number) result <<= 1;
                return result;
            }
        }
    }
}
