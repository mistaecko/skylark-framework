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

    /** A class that provides constant values for vertical alignment of objects. */
    export class VAlign {

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** Top alignment. */
        public static TOP:string = "top";

        /** Centered alignment. */
        public static CENTER:string = "middle";
        public static MIDDLE:string = "middle";

        /** Bottom alignment. */
        public static BOTTOM:string = "bottom";

        /** Indicates whether the given alignment string is valid. */
        public static isValid(vAlign:string):boolean {
            return vAlign == VAlign.TOP || vAlign == VAlign.CENTER || vAlign == VAlign.BOTTOM;
        }
    }
}
