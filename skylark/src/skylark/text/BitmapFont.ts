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

    /** The BitmapFont class parses bitmap font files and arranges the glyphs
     *  in the form of a text.
     *
     *  The class parses the XML <it>format is used in the
     *  <a href="http://www.angelcode.com/products/bmfont/">AngelCode Bitmap Font Generator</a> or
     *  the <a href="http://glyphdesigner.71squared.com/">Glyph Designer</a>.
     *  This is what the file format looks like:
     *
     *  <pre>
     *  &lt;font&gt;
     *    &lt;info face="BranchingMouse" size="40" /&gt;
     *    &lt;common lineHeight="40" /&gt;
     *    &lt;pages&gt;  &lt;!-- currently, only one page is supported --&gt;
     *      &lt;page id="0" file="texture.png" /&gt;
     *    &lt;/pages&gt;
     *    &lt;chars&gt;
     *      &lt;char id="32" x="60" y="29" width="1" height="1" xoffset="0" yoffset="27" xadvance="8" /&gt;
     *      &lt;char id="33" x="155" y="144" width="9" height="21" xoffset="0" yoffset="6" xadvance="9" /&gt;
     *    &lt;/chars&gt;
     *    &lt;kernings&gt; &lt;!-- Kerning is optional --&gt;
     *      &lt;kerning first="83" second="83" amount="-4"/&gt;
     *    &lt;/kernings&gt;
     *  &lt;/font&gt;
     *  </pre>
     *
     *  Pass an instance of this class to the method <code>registerBitmapFont</code> of the
     *  TextField class. Then, set the <code>fontName</code> property of the text field to the
     *  <code>name</code> value of the bitmap font. This will make the text field use the bitmap
     *  font.
     */
    export class BitmapFont {
        /** Use this constant for the <code>fontSize</code> property of the TextField class to
         *  render the bitmap font in exactly the size it was created. */
        public static NATIVE_SIZE:number = -1;

        /** The font name of the embedded minimal bitmap font. Use this e.g. for debug output. */
        public static MINI:string = "mini";

        private static CHAR_SPACE:number = 32;
        private static CHAR_TAB:number = 9;
        private static CHAR_NEWLINE:number = 10;
        private static CHAR_CARRIAGE_RETURN:number = 13;

        private _texture:Texture;
        private _chars:Dictionary;
        private _name:string;
        private _size:number;
        private _lineHeight:number;
        private _baseline:number;
        private _helperImage:Image;
        private _charLocationPool:CharLocation[];

        /** Creates a bitmap font by parsing an XML file and uses the specified texture.
         *  If you don't pass any data, the "mini" font will be created. */
        constructor(texture:Texture = null, fontXml:string = null) {
            // if no texture is passed in, we create the minimal, embedded font
            if(texture == null && fontXml == null) {
                texture = MiniBitmapFont.texture;
                fontXml = MiniBitmapFont.xml;
            }

            this._name = "unknown";
            this._lineHeight = this._size = this._baseline = 14;
            this._texture = texture;
            this._chars = <Dictionary>{};
            this._helperImage = new Image(texture);
            this._charLocationPool = [];

            if(fontXml)
                this.parseFontXml(fontXml);
        }

        /** Disposes the texture of the bitmap font! */
        public dispose():void {
            if(this._texture)
                this._texture.dispose();
        }

        private parseFontXml(fontXml:string):void;

        private parseFontXml(fontXml:Document):void;

        private parseFontXml(a:any):void {
            var fontXmlData:any;
            var fontXml:FontXml;
            if(typeof a === 'string')
                fontXmlData = StringUtil.parseXml(<string>a);
            else
                fontXmlData = a;
            fontXmlData = StringUtil.xmlToJson(fontXmlData, false);

            fontXml = fontXmlData.font;

            var scale:number = this._texture.scale;
            var frame:Rectangle = this._texture.frame;

            this._name = fontXml.info.attribute("face");
            this._size = parseFloat(fontXml.info.attribute("size")) / scale;
            this._lineHeight = parseFloat(fontXml.common.attribute("lineHeight")) / scale;
            this._baseline = parseFloat(fontXml.common.attribute("base")) / scale;

            if(fontXml.info.attribute("smooth").toString() == "0")
                this.smoothing = TextureSmoothing.NONE;

            if(this._size <= 0) {
                console.log("[Skylark] Warning: invalid font size in '" + this._name + "' font.");
                this._size = (this._size == 0.0 ? 16.0 : this._size * -1.0);
            }

            var chars = fontXml.chars.char; //todo handle a single char node!
            for(var i = 0; i < chars.length; i++) {
                var charElement:any = chars[i];
                var id:number = parseInt(charElement.attribute("id"));
                var xOffset:number = parseFloat(charElement.attribute("xoffset")) / scale;
                var yOffset:number = parseFloat(charElement.attribute("yoffset")) / scale;
                var xAdvance:number = parseFloat(charElement.attribute("xadvance")) / scale;

                var region:Rectangle = new Rectangle();
                region.x = parseFloat(charElement.attribute("x")) / scale + frame.x;
                region.y = parseFloat(charElement.attribute("y")) / scale + frame.y;
                region.width = parseFloat(charElement.attribute("width")) / scale;
                region.height = parseFloat(charElement.attribute("height")) / scale;

                var texture:Texture = Texture.fromTexture(this._texture, region);
                var bitmapChar:BitmapChar = new BitmapChar(id, texture, xOffset, yOffset, xAdvance);
                this.addChar(id, bitmapChar);
            }

            if(fontXml.kernings) {

                var kernings = fontXml.kernings.kerning;
                for(var i = 0; i < kernings.length; i++) {
                    var kerningElement:any = kernings[i];

                    var first:number = parseInt(kerningElement.attribute("first"));
                    var second:number = parseInt(kerningElement.attribute("second"));
                    var amount:number = parseFloat(kerningElement.attribute("amount")) / scale;
                    if(second in this._chars)
                        this.getChar(second).addKerning(first, amount);
                }
            }
        }

        /** Returns a single bitmap char with a certain character ID. */
        public getChar(charID:number):BitmapChar {
            return this._chars[charID];
        }

        /** Adds a bitmap char with a certain character ID. */
        public addChar(charID:number, bitmapChar:BitmapChar):void {
            this._chars[charID] = bitmapChar;
        }

        /** Creates a sprite that contains a certain text, made up by one image per char. */
        public createSprite(width:number, height:number, text:string, fontSize:number = -1, color:number = 0xffffff, hAlign:string = HAlign.CENTER, vAlign:string = VAlign.MIDDLE, autoScale:boolean = true, kerning:boolean = true):Sprite {
            // todo introduce TextFormat config object in signature
            var charLocations:CharLocation[] = this.arrangeChars(width, height, text, fontSize,
                hAlign, vAlign, autoScale, kerning);
            var numChars:number = charLocations.length;
            var sprite:Sprite = new Sprite();

            for(var i:number = 0; i < numChars; ++i) {
                var charLocation:CharLocation = charLocations[i];
                var char:Image = charLocation.char.createImage();
                char.x = charLocation.x;
                char.y = charLocation.y;
                char.scaleX = char.scaleY = charLocation.scale;
                // color tinting not supported yet!
                //char.color = color;
                sprite.addChild(char);
            }

            return sprite;
        }

        /** Draws text into a QuadBatch. */
        public fillQuadBatch(quadBatch:QuadBatch, width:number, height:number, text:string, fontSize:number = -1, color:number/*uint*/ = 0xffffff, hAlign:string = HAlign.CENTER, vAlign:string = VAlign.MIDDLE, autoScale:boolean = true, kerning:boolean = true):void {
            var charLocations:CharLocation[] = this.arrangeChars(width, height, text, fontSize,
                hAlign, vAlign, autoScale, kerning);
            var numChars:number = charLocations.length;
            this._helperImage.color = color;

            if(numChars > 8192)
                throw new ArgumentError("Bitmap Font text is limited to 8192 characters.");

            for(var i:number = 0; i < numChars; ++i) {
                var charLocation:CharLocation = charLocations[i];
                this._helperImage.texture = charLocation.char.texture;
                this._helperImage.readjustSize();
                this._helperImage.x = charLocation.x;
                this._helperImage.y = charLocation.y;
                this._helperImage.scaleX = this._helperImage.scaleY = charLocation.scale;
                quadBatch.addImage(this._helperImage);
            }
        }

        /** Arranges the characters of a text inside a rectangle, adhering to the given settings.
         *  Returns a Vector of CharLocations. */
        private arrangeChars(width:number, height:number, txt:string, fontSize:number = -1, hAlign:string = HAlign.CENTER, vAlign:string = VAlign.MIDDLE, autoScale:boolean = true, kerning:boolean = true):CharLocation[] {
            if(txt == null || txt.length == 0)
                return <CharLocation[]>[];
            if(fontSize < 0)
                fontSize *= -this._size;

            var lines:CharLocation[][];
            var finished:boolean = false;
            var charLocation:CharLocation;
            var numChars:number;
            var containerWidth:number;
            var containerHeight:number;
            var scale:number;

            while(!finished) {
                scale = fontSize / this._size;
                containerWidth = width / scale;
                containerHeight = height / scale;

                lines = <CharLocation[][]>[];

                if(this._lineHeight <= containerHeight) {
                    var lastWhiteSpace:number = -1;
                    var lastCharID:number = -1;
                    var currentX:number = 0;
                    var currentY:number = 0;
                    var currentLine:CharLocation[] = [/*CharLocation*/];

                    numChars = txt.length;
                    for(var i:number = 0; i < numChars; ++i) {
                        var lineFull:boolean = false;
                        var charID:number = txt.charCodeAt(i);
                        var char:BitmapChar = this.getChar(charID);

                        if(charID == BitmapFont.CHAR_NEWLINE || charID == BitmapFont.CHAR_CARRIAGE_RETURN) {
                            lineFull = true;
                        }
                        else if(char == null) {
                            console.log("[Skylark] Missing character: " + charID);
                        }
                        else {
                            if(charID == BitmapFont.CHAR_SPACE || charID == BitmapFont.CHAR_TAB)
                                lastWhiteSpace = i;

                            if(kerning)
                                currentX += char.getKerning(lastCharID);

                            charLocation = this._charLocationPool.length ?
                                this._charLocationPool.pop() : new CharLocation(char);

                            charLocation.char = char;
                            charLocation.x = currentX + char.xOffset;
                            charLocation.y = currentY + char.yOffset;
                            currentLine.push(charLocation);

                            currentX += char.xAdvance;
                            lastCharID = charID;

                            if(charLocation.x + char.width > containerWidth) {
                                // remove characters and add them again to next line
                                var numCharsToRemove:number = lastWhiteSpace == -1 ? 1 : i - lastWhiteSpace;
                                var removeIndex:number = currentLine.length - numCharsToRemove;

                                currentLine.splice(removeIndex, numCharsToRemove);

                                if(currentLine.length == 0)
                                    break;

                                i -= numCharsToRemove;
                                lineFull = true;
                            }
                        }

                        if(i == numChars - 1) {
                            lines.push(currentLine);
                            finished = true;
                        }
                        else if(lineFull) {
                            lines.push(currentLine);

                            if(lastWhiteSpace == i)
                                currentLine.pop();

                            if(currentY + 2 * this._lineHeight <= containerHeight) {
                                currentLine = [/*CharLocation*/];
                                currentX = 0;
                                currentY += this._lineHeight;
                                lastWhiteSpace = -1;
                                lastCharID = -1;
                            }
                            else {
                                break;
                            }
                        }
                    } // for each char
                } // if (this._lineHeight <= containerHeight)

                if(autoScale && !finished) {
                    fontSize -= 1;
                    lines.length = 0;
                }
                else {
                    finished = true;
                }
            } // while (!finished)

            var finalLocations:CharLocation[] = [];
            var numLines:number = lines.length;
            var bottom:number = currentY + this._lineHeight;
            var yOffset:number = 0;

            if(vAlign == VAlign.BOTTOM)
                yOffset = containerHeight - bottom;
            else if(vAlign == VAlign.CENTER)
                yOffset = (containerHeight - bottom) / 2;

            for(var lineID:number = 0; lineID < numLines; ++lineID) {
                var line:CharLocation[] = lines[lineID];
                numChars = line.length;

                if(numChars == 0)
                    continue;

                var xOffset:number = 0;
                var lastLocation:CharLocation = line[line.length - 1];
                var right:number = lastLocation.x - lastLocation.char.xOffset
                    + lastLocation.char.xAdvance;

                if(hAlign == HAlign.RIGHT)
                    xOffset = containerWidth - right;
                else if(hAlign == HAlign.CENTER)
                    xOffset = (containerWidth - right) / 2;

                for(var c:number = 0; c < numChars; ++c) {
                    charLocation = line[c];
                    charLocation.x = scale * (charLocation.x + xOffset);
                    charLocation.y = scale * (charLocation.y + yOffset);
                    charLocation.scale = scale;

                    if(charLocation.char.width > 0 && charLocation.char.height > 0)
                        finalLocations.push(charLocation);

                    // return to pool for next call to "arrangeChars"
                    this._charLocationPool.push(charLocation);
                }
            }

            return finalLocations;
        }

        /** The name of the <it>font was parsed from the font file. */
        public get name():string {
            return this._name;
        }

        /** The native size of the font. */
        public get size():number {
            return this._size;
        }

        /** The height of one line in pixels. */
        public get lineHeight():number {
            return this._lineHeight;
        }

        public set lineHeight(value:number) {
            this._lineHeight = value;
        }

        /** The smoothing filter that is used for the texture. */
        public get smoothing():string {
            return this._helperImage.smoothing;
        }

        public set smoothing(value:string) {
            this._helperImage.smoothing = value;
        }

        /** The baseline of the font. */
        public get baseline():number {
            return this._baseline;
        }
    }

    export class CharLocation {
        public char:BitmapChar;
        public scale:number;
        public x:number;
        public y:number;

        constructor(char:BitmapChar) {
            this.char = char;
        }
    }
}
