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

    /** A class that provides constant values for the possible smoothing algorithms of a texture. */
    export class TextureSmoothing {

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** No smoothing, also called "Nearest Neighbor". Pixels will scale <big>up rectangles. */
        public static NONE:string = "none";

        /** Bilinear filtering. Creates smooth transitions between pixels. */
        public static BILINEAR:string = "bilinear";

        /** Trilinear filtering. Highest quality by taking the next mip map level into account. */
        public static TRILINEAR:string = "trilinear";

        /** Determines whether a smoothing value is valid. */
        public static isValid(smoothing:string):boolean {
            return smoothing == TextureSmoothing.NONE || smoothing == TextureSmoothing.BILINEAR || smoothing == TextureSmoothing.TRILINEAR;
        }
    }
}
