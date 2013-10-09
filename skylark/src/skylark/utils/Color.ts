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

    /** A utility class containing predefined colors and methods converting between different
     *  color representations. */
    export class Color {

        public static WHITE:number = 0xffffff;
        public static SILVER:number = 0xc0c0c0;
        public static GRAY:number = 0x808080;
        public static BLACK:number = 0x000000;
        public static RED:number = 0xff0000;
        public static MAROON:number = 0x800000;
        public static YELLOW:number = 0xffff00;
        public static OLIVE:number = 0x808000;
        public static LIME:number = 0x00ff00;
        public static GREEN:number = 0x008000;
        public static AQUA:number = 0x00ffff;
        public static TEAL:number = 0x008080;
        public static BLUE:number = 0x0000ff;
        public static NAVY:number = 0x000080;
        public static FUCHSIA:number = 0xff00ff;
        public static PURPLE:number = 0x800080;

        /** Returns the alpha part of an ARGB color (0 - 255). */
        public static getAlpha(color:number):number {
            return (color >> 24) & 0xff;
        }

        /** Returns the red part of an (A)RGB color (0 - 255). */
        public static getRed(color:number):number {
            return (color >> 16) & 0xff;
        }

        /** Returns the green part of an (A)RGB color (0 - 255). */
        public static getGreen(color:number):number {
            return (color >> 8) & 0xff;
        }

        /** Returns the blue part of an (A)RGB color (0 - 255). */
        public static getBlue(color:number):number {
            return  color & 0xff;
        }

        /** Creates an RGB color, stored in an unsigned integer. Channels are expected
         *  in the range 0 - 255. */
        public static rgb(red:number, green:number, blue:number):number {
            return (red << 16) | (green << 8) | blue;
        }

        /** Creates an ARGB color, stored in an unsigned integer. Channels are expected
         *  in the range 0 - 255. */
        public static argb(alpha:number, red:number, green:number, blue:number):number {
            return (alpha << 24) | (red << 16) | (green << 8) | blue;
        }

        /**
         * Convert a CSS color string into a Hex number.
         */
        public static fromString(cssString:string):number {
            var result = TinyColor(cssString);
            if(!result.ok)
                throw new ArgumentError('Color format mismatch: ' + cssString);
            if(result.alpha === 1)
                return Color.rgb(result.red, result.green, result.blue);
            else
                return Color.argb(result.alpha, result.red, result.green, result.blue);
        }

        public static toHexString(rgb:number) {
            return TinyColor(rgb).toHexString();
            // note: toString(16) does not write leading zeros!
            //return '#' + Number(rgb).toString(16);
        }

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }
    }
}
