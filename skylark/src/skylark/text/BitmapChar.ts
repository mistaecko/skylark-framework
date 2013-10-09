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

    /** A BitmapChar contains the information about one char of a bitmap font.
     *  <em>You don't have to use this class directly in most cases.
     *  The TextField class contains methods that handle bitmap fonts for you.</em>
     */
    export class BitmapChar {
        private _texture:Texture;
        private _charID:number;
        private mXOffset:number;
        private mYOffset:number;
        private mXAdvance:number;
        private _kernings:Dictionary;

        /** Creates a char with a texture and its properties. */
        constructor(id:number, texture:Texture, xOffset:number, yOffset:number, xAdvance:number) {
            this._charID = id;
            this._texture = texture;
            this.mXOffset = xOffset;
            this.mYOffset = yOffset;
            this.mXAdvance = xAdvance;
            this._kernings = null;
        }

        /** Adds kerning information relative to a specific other character ID. */
        public addKerning(charID:number, amount:number):void {
            if(this._kernings == null)
                this._kernings = <Dictionary><any>[];

            this._kernings[charID] = amount;
        }

        /** Retrieve kerning information relative to the given character ID. */
        public getKerning(charID:number):number {
            if(this._kernings == null || this._kernings[charID] == undefined)
                return 0.0;
            else
                return this._kernings[charID];
        }

        /** Creates an image of the char. */
        public createImage():Image {
            return new Image(this._texture);
        }

        /** The unicode ID of the char. */
        public get charID():number {
            return this._charID;
        }

        /** The number of points to move the char in x direction on character arrangement. */
        public get xOffset():number {
            return this.mXOffset;
        }

        /** The number of points to move the char in y direction on character arrangement. */
        public get yOffset():number {
            return this.mYOffset;
        }

        /** The number of points the cursor has to be moved to the right for the next char. */
        public get xAdvance():number {
            return this.mXAdvance;
        }

        /** The texture of the character. */
        public get texture():Texture {
            return this._texture;
        }

        /** The width of the character in points. */
        public get width():number {
            return this._texture.width;
        }

        /** The height of the character in points. */
        public get height():number {
            return this._texture.height;
        }
    }
}
