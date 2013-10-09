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

    /** A class that provides constant values for horizontal alignment of objects. */
    export class HAlign {

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** Left alignment. */
        public static LEFT:string = "left";

        /** Centered alignement. */
        public static CENTER:string = "center";

        /** Right alignment. */
        public static RIGHT:string = "right";

        /** Indicates whether the given alignment string is valid. */
        public static isValid(hAlign:string):boolean {
            return hAlign == HAlign.LEFT || hAlign == HAlign.CENTER || hAlign == HAlign.RIGHT;
        }
    }
}
