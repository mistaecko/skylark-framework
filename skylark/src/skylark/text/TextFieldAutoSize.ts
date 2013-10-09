// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

module skylark {

    /** This class is an enumeration of constant values used in setting the
     *  autoSize property of the TextField class. */
    export class TextFieldAutoSize {
        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** No auto-sizing will happen. */
        public static NONE:string = "none";

        /** The text field will grow to the right; no line-breaks will be added.
         *  The height of the text field remains unchanged. */
        public static HORIZONTAL:string = "horizontal";

        /** The text field will grow to the bottom, adding line-breaks when necessary.
         * The width of the text field remains unchanged. */
        public static VERTICAL:string = "vertical";

        /** The text field will grow to the right and bottom; no line-breaks will be added. */
        public static BOTH_DIRECTIONS:string = "bothDirections";
    }
}
