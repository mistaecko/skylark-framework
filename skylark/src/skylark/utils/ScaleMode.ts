/// <reference path="../../_dependencies.ts"/>

module skylark/*.utils*/ {

    /** A class that provides constant values for the 'RectangleUtil.fit' method. */
    export class ScaleMode {

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** Specifies that the rectangle is not scaled, but simply centered within the
         *  specified area. */
        public static NONE:string = "none";

        /** Specifies that the rectangle fills the specified area without distortion
         *  but possibly with some cropping, while maintaining the original aspect ratio. */
        public static NO_BORDER:string = "noBorder";

        /** Specifies that the entire rectangle will be scaled to fit into the specified
         *  area, while maintaining the original aspect ratio. This might leave empty bars at
         *  either the top and bottom, or left and right. */
        public static SHOW_ALL:string = "showAll";

        /** Indicates whether the given scale mode string is valid. */
        public static isValid(scaleMode:string):boolean {
            return scaleMode == ScaleMode.NONE || scaleMode == ScaleMode.NO_BORDER || scaleMode == ScaleMode.SHOW_ALL;
        }
    }
}
