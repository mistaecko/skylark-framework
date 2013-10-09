// =================================================================================================
//
//	Skylark Framework
//	Copyright 2012 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
/// <reference path="../../_dependencies.ts"/>

module skylark {

    /** A class that provides constant values for visual blend mode effects.
     *
     *  <p>A blend mode is always defined by two 'Context3DBlendFactor' values. A blend factor
     *  represents a particular four-value vector that is multiplied with the source or destination
     *  color in the blending formula. The blending formula is:</p>
     *
     *  <pre>result = source × sourceFactor + destination × destinationFactor</pre>
     *
     *  <p>In the formula, the source color is the output color of the pixel shader program. The
     *  destination color is the color that currently exists in the color buffer, as set by
     *  previous clear and draw operations.</p>
     *
     *  <p>Beware that blending factors produce different output depending on the texture type.
     *  Textures may contain 'premultiplied alpha' (pma), which means that their RGB values were
     *  multiplied with their alpha value (to save processing time). Textures based on 'BitmapData'
     *  objects have premultiplied alpha values, while ATF textures haven't. For this reason,
     *  a blending mode may have different factors depending on the pma value.</p>
     *
     *  @see flash.display3D.Context3DBlendFactor
     */
    export class BlendMode {

        /*
         Canvas Blend Modes
         source: http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/

         normal | multiply | screen | overlay |
         darken | lighten | color-dodge | color-burn | hard-light |
         soft-light | difference | exclusion | hue | saturation |
         color | luminosity
         */

        /*
        Canvas Composite Modes

         clear | copy | destination | source-over |
         destination-over | source-in | destination-in |
         source-out | destination-out | source-atop |
         destination-atop | xor | lighter

         */

        // predifined modes

        /** @private */
        constructor() {
            throw new AbstractClassError();
        }

        /** Inherits the blend mode from this display object's parent. */
        public static AUTO:string = "auto";

        /** Deactivates blending, i.e. disabling any transparency. */
        public static NONE:string = "copy";

        /** The display object appears in front of the background. */
        public static NORMAL:string = "source-over";

        /** Adds the values of the colors of the display object to the colors of its background. */
        public static ADD:string = "add";

        /** Multiplies the values of the display object colors with the the background color. */
        public static MULTIPLY:string = "multiply";

        /** Multiplies the complement (inverse) of the display object color with the complement of
         * the background color, resulting in a bleaching effect. */
        public static SCREEN:string = "screen";

        /** Erases the background when drawn on a RenderTexture. */
        public static ERASE:string = "destination-out";

    }
}
