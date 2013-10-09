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

module skylark/*.text*/ {

    /** A TextField displays text, either using standard true type fonts or custom bitmap fonts.
     *
     *  <p>You can set all properties you are used to, like the font name and size, a color, the
     *  horizontal and vertical alignment, etc. The border property is helpful during development,
     *  because it lets you see the bounds of the textfield.</p>
     *
     *  <p>There are two types of fonts that can be displayed:</p>
     *
     *  <ul>
     *    <li>Standard TrueType fonts. This renders the text just like a conventional Flash
     *        TextField. It is recommended to embed the font, since you cannot be sure which fonts
     *        are available on the client system, and since this enhances rendering quality.
     *        Simply pass the font name to the corresponding property.</li>
     *    <li>Bitmap fonts. If you need speed or fancy font effects, use a bitmap font instead.
     *        That is a font that has its glyphs rendered to a texture atlas. To use it, first
     *        register the font with the method <code>registerBitmapFont</code>, and then pass
     *        the font name to the corresponding property of the text field.</li>
     *  </ul>
     *
     *  For bitmap fonts, we recommend one of the following tools:
     *
     *  <ul>
     *    <li>Windows: <a href="http://www.angelcode.com/products/bmfont">Bitmap Font Generator</a>
     *       from Angel Code (free). Export the font <an>data XML file and the <a>texture png
     *       with white characters on a transparent background (32 bit).</li>
     *    <li>Mac OS: <a href="http://glyphdesigner.71squared.com">Glyph Designer</a> from
     *        71squared or <a href="http://http://www.bmglyph.com">bmGlyph</a> (both commercial).
     *        They support Skylark natively.</li>
     *  </ul>
     *
     *  <strong>Batching of TextFields</strong>
     *
     *  <p>Normally, TextFields will require exactly one draw call. For TrueType fonts, you cannot
     *  avoid that; bitmap fonts, however, may be batched if you enable the "batchable" property.
     *  This makes sense if you have several TextFields with short texts that are rendered one
     *  after the other (e.g. subsequent children of the same sprite), or if your bitmap font
     *  texture is in your main texture atlas.</p>
     *
     *  <p>The recommendation is to activate "batchable" if it reduces your draw calls (use the
     *  StatsDisplay to check this) AND if the TextFields contain no more than about 10-15
     *  characters (per TextField). For longer texts, the batching would take up more CPU time
     *  than what is saved by avoiding the draw calls.</p>
     */
    export class TextField extends DisplayObjectContainer {
        // the name container with the registered bitmap fonts
        private static BITMAP_FONT_DATA_NAME:string = "skylark.TextField.BitmapFonts";

        private static _fonts:Dictionary;

        private _fontSize:number;
        private _color:number/*uint*/;
        private _text:string;
        private _fontName:string;
        private mHAlign:string;
        private mVAlign:string;
        private _bold:boolean;
        private _italic:boolean;
        private _underline:boolean;
        private _autoScale:boolean;
        private _autoSize:string;
        private _kerning:boolean;
        private _nativeFilters:any[];
        private _requiresRedraw:boolean;
        private _isRenderedText:boolean;
        private _textBounds:Rectangle;
        private _batchable:boolean;

        private _hitArea:DisplayObject;
        private _border:DisplayObjectContainer;

        private _image:Image;
        private _quadBatch:DisplayObject;

        // this object will be used for text rendering
        //private static _nativeTextField:flash.TextField/* = new flash.TextField()*/;

        /** Create a new text field with the given properties. */
        constructor(width:number, height:number, txt:string, fontName:string = "Verdana", fontSize:number = 12, color:number/*uint*/ = 0x0, bold:boolean = false) {
            super();
            this._text = txt ? txt : "";
            this._fontSize = fontSize;
            this._color = color;
            this.mHAlign = HAlign.CENTER;
            this.mVAlign = VAlign.CENTER;
            this._border = null;
            this._kerning = true;
            this._bold = bold;
            this._autoSize = TextFieldAutoSize.NONE;
            this.fontName = fontName;

            this._hitArea = new Quad(width, height);
            this._hitArea.alpha = 0.0;
            this.addChild(this._hitArea);

            this.addEventListener(Event.FLATTEN, this.onFlatten, this);
        }

        /** Disposes the underlying texture data. */
        public dispose():void {
            this.removeEventListener(Event.FLATTEN, this.onFlatten, this);
            if(this._image) this._image.texture.dispose();
            if(this._quadBatch) this._quadBatch.dispose();
            super.dispose();
        }

        private onFlatten():void {
            if(this._requiresRedraw)
                this.redraw();
        }

        /** @inheritDoc */
        public render(support:RenderSupport):void {
            if(this._requiresRedraw)
                this.redraw();
            super.render(support);
        }

        /** Forces the text field to be constructed right away. Normally,
         *  it will only do so lazily, i.e. before being rendered. */
        public redraw():void {
            if(this._requiresRedraw) {
                if(this._isRenderedText)
                    this.createRenderedContents();
                else
                    this.createComposedContents();

                this.updateBorder();
                this._requiresRedraw = false;
            }
        }

        // TrueType font rendering

        //todo [CONTEXTLOST]
        //todo [QUADBATCH]
        private createRenderedContents():void {
            if(this._quadBatch) {
                this._quadBatch.removeFromParent(true);
                this._quadBatch = null;
            }

            if(this._textBounds == null)
                this._textBounds = new Rectangle();

            var scale:number = Skylark.contentScaleFactor;
            var width:number = this._hitArea.width * scale;
            var height:number = this._hitArea.height * scale;

            var imageSource:CanvasImageSource = this.renderText(scale, this._textBounds);

            // todo update hit area from text bounds

            var texture:Texture = new ConcreteTexture(/*IntelliJ*/<any>imageSource, scale);

            if(this._image == null) {
                this._image = new Image(texture);
                this._image.touchable = false;
                this.addChild(this._image);
            }
            else {
                this._image.texture.dispose();
                this._image.texture = texture;
                this._image.readjustSize();
            }
        }

        /* @protected */
        renderText(scale:number, resultTextBounds:Rectangle):CanvasImageSource {
            var width:number = this._hitArea.width * scale;
            var height:number = this._hitArea.height * scale;
            var hAlign:string = this.mHAlign;
            var vAlign:string = this.mVAlign;

//            if(this.isHorizontalAutoSize) {
//                width = Number.MAX_VALUE;
//                hAlign = HAlign.LEFT;
//            }
//            if(this.isVerticalAutoSize) {
//                height = Number.MAX_VALUE;
//                vAlign = VAlign.TOP;
//            }

//            var textFormat:flash.TextFormat = new flash.TextFormat(this._fontName,
//                this._fontSize * scale, this._color, this._bold, this._italic, this._underline, null, null, HAlign);
//            textFormat.kerning = this._kerning;
//
//            TextField._nativeTextField.defaultTextFormat = textFormat;
//            TextField._nativeTextField.width = width;
//            TextField._nativeTextField.height = height;
//            TextField._nativeTextField.antiAliasType = AntiAliasType.ADVANCED;
//            TextField._nativeTextField.selectable = false;
//            TextField._nativeTextField.multiline = true;
//            TextField._nativeTextField.wordWrap = true;
//            TextField._nativeTextField.text = this._text;
//            TextField._nativeTextField.embedFonts = true;
//            TextField._nativeTextField.filters = this._nativeFilters;

            var canvas:HTMLCanvasElement = Skylark.getHelperCanvas(width, height);
            var context = canvas.getContext('2d');

            var fontStr = (()=> {
                var str:string[] = [];
                if(this._bold)
                    str.push('bold');
                if(this._italic)
                    str.push('italic');
                str.push(this._fontSize * scale + 'px');
                str.push(this._fontName);
                return str.join(' ');
            })();

            context.textAlign = hAlign;

            // always use 'top' alignment for drawing - we calculate vertical alignment ourselves
            context.textBaseline = 'top';

            context.font = fontStr;
            context.fillStyle = Color.toHexString(this._color);

            // bounds of the rendered text block
            var textHeight:number;
            var textWidth:number;
            var xOffset = 0;
            var yOffset = 0;

            // was the text clipped or did all lines fit?
            var clipped:boolean = false;

            var fontSize = this._fontSize;
            // todo what is the correct way to determine line spacing?
            // todo allow user defined line spacing (as multiples of default line spacing?)
            var lineHeight:number = fontSize * 1.3;

            // todo evaluate performance of 'measureText'
            textWidth = context.measureText(this._text).width;

            if(textWidth > width) {
                var lines:string[] = [];
                var text = this._text.split(/\s/g);

                // we will update textWidth/-Height while processing each row
                textWidth = 0;
                textHeight = 0;

                var championWidth:number = -1;
                var candidateWidth:number;
                var lineWidth:number;

                var idx = 0;
                var champion:string = '';
                var candidate:string;
                var word:string;

                do {
                    candidate = champion;
                    for(; idx < length; idx++) {
                        candidate += (candidate.length ? ' ' : '') + text[idx];
                        if(text[idx].length > 0)
                            break;
                    }
                    candidateWidth = context.measureText(candidate).width;

                    if(candidateWidth > width) {
                        if(championWidth === -1) {
                            // a single word that exceeds the TextField width
                            lines.push(candidate);
                            lineWidth = candidateWidth;
                            idx++;

                        } else {
                            // a standard line
                            lines.push(champion);
                            lineWidth = championWidth;
                        }
                        textHeight += lineHeight;
                        champion = '';
                        championWidth = -1;

                        // abort if height cannot accomodate another line
                        if(textHeight + fontSize > height)
                            break;

                    } else if(idx === length - 1) {
                        // last word of text - always add line
                        lines.push(candidate);
                        lineWidth = candidateWidth;
                        textHeight += lineHeight;
                        idx++;

                    } else {
                        // prepare for next iteration
                        champion = candidate;
                        championWidth = candidateWidth;
                        idx++;
                    }
                    // track the widest line
                    if(lineWidth > textWidth)
                        textWidth = lineWidth;

                } while(idx < length);

                // fix text height - last line only adds fontSize, no line spacing
                textHeight -= (lineHeight-fontSize);

                // did we clip the text?
                clipped = idx < length;

                // drawing position for first line (using vAlign='top', hAlign='left')
                var x:number;
                var y:number;

                if(hAlign === HAlign.CENTER)
                    x = width / 2;
                else if(hAlign === HAlign.RIGHT)
                    x = width;
                else
                    x = 0;

                if(vAlign === VAlign.TOP)
                    y = 0;
                else if(vAlign === VAlign.CENTER)
                    y = (height - textHeight) / 2;
                else if(vAlign === VAlign.BOTTOM)
                    y = height - (lines.length * lineHeight);

                for(var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    context.fillText(line, x, y);
                    y += lineHeight;
                }

            } else {
                // render a single line

                textHeight = lineHeight;

                var x:number;
                var y:number;

                context.textAlign = hAlign;
                context.textBaseline = vAlign;

                if(hAlign === HAlign.CENTER)
                    x = width / 2;
                else if(hAlign === HAlign.RIGHT)
                    x = width;
                else
                    x = 0;

                if(vAlign === VAlign.TOP)
                    y = 0;
                else if(vAlign === VAlign.CENTER)
                    y = height / 2;
                else if(vAlign === VAlign.BOTTOM)
                    y = height;

                context.fillText(this._text, x, y);
            }

            // update textBounds rectangle
            resultTextBounds.setTo(xOffset / scale, yOffset / scale,
                textWidth / scale, textHeight / scale);

            var image = new NativeImage();
            image.src = canvas.toDataURL();

            return <CanvasImageSource>image;
        }

        
//        private autoScaleNativeTextField(textField:flash.TextField):void {
//            var size:number = Number(textField.defaultTextFormat.size);
//            var maxHeight:number = textField.height - 4;
//            var maxWidth:number = textField.width - 4;
//
//            while(textField.textWidth > maxWidth || textField.textHeight > maxHeight) {
//                if(size <= 4) break;
//
//                var format:flash.TextFormat = textField.defaultTextFormat;
//                format.size = size--;
//                textField.setTextFormat(format);
//            }
//        }

        // bitmap font composition

        //todo [QUADBATCH]
        private createComposedContents():void {
            if(this._image) {
                this._image.removeFromParent(true);
                this._image = null;
            }

            var bitmapFont:BitmapFont = TextField.bitmapFonts[this._fontName];
            if(bitmapFont == null) throw new Error("Bitmap font not registered: " + this._fontName);

            var width:number = this._hitArea.width;
            var height:number = this._hitArea.height;
            var hAlign:string = this.mHAlign;
            var vAlign:string = this.mVAlign;

            if(this.isHorizontalAutoSize) {
                width = Number.MAX_VALUE;
                hAlign = HAlign.LEFT;
            }
            if(this.isVerticalAutoSize) {
                height = Number.MAX_VALUE;
                vAlign = VAlign.TOP;
            }

            if(this._quadBatch == null) {
                this._quadBatch = bitmapFont.createSprite(
                    width, height, this._text, this._fontSize, this._color, hAlign, vAlign, this._autoScale, this._kerning);

                this._quadBatch.touchable = false;
                this.addChild(this._quadBatch);
            }

            if(this._autoSize != TextFieldAutoSize.NONE) {
                this._textBounds = this._quadBatch.getBounds(this._quadBatch, this._textBounds);

                if(this.isHorizontalAutoSize)
                    this._hitArea.width = this._textBounds.x + this._textBounds.width;
                if(this.isVerticalAutoSize)
                    this._hitArea.height = this._textBounds.y + this._textBounds.height;
            }
            else {
                // hit area doesn't change, text bounds can be created on demand
                this._textBounds = null;
            }
        }

        // helpers

        private updateBorder():void {
            if(this._border == null) return;

            var width:number = this._hitArea.width;
            var height:number = this._hitArea.height;

            var topLine:Quad = <Quad>this._border.getChildAt(0);
            var rightLine:Quad = <Quad>this._border.getChildAt(1);
            var bottomLine:Quad = <Quad>this._border.getChildAt(2);
            var leftLine:Quad = <Quad>this._border.getChildAt(3);

            topLine.width = width;
            topLine.height = 1;
            bottomLine.width = width;
            bottomLine.height = 1;
            leftLine.width = 1;
            leftLine.height = height;
            rightLine.width = 1;
            rightLine.height = height;
            rightLine.x = width - 1;
            bottomLine.y = height - 1;
            topLine.color = rightLine.color = bottomLine.color = leftLine.color = this._color;
        }

        // properties

        private get isHorizontalAutoSize():boolean {
            return this._autoSize == TextFieldAutoSize.HORIZONTAL ||
                this._autoSize == TextFieldAutoSize.BOTH_DIRECTIONS;
        }

        private get isVerticalAutoSize():boolean {
            return this._autoSize == TextFieldAutoSize.VERTICAL ||
                this._autoSize == TextFieldAutoSize.BOTH_DIRECTIONS;
        }

        /** Returns the bounds of the text within the text field. */
        public get textBounds():Rectangle {
            if(this._requiresRedraw) this.redraw();
            if(this._textBounds == null) this._textBounds = this._quadBatch.getBounds(this._quadBatch);
            return this._textBounds.clone();
        }

        /** @inheritDoc */
        public getBounds(targetSpace:DisplayObject, resultRect:Rectangle = null):Rectangle {
            if(this._requiresRedraw) this.redraw();
            return this._hitArea.getBounds(targetSpace, resultRect);
        }

        /** @inheritDoc */
        public set width(value:number) {
            // different to ordinary display objects, changing the size of the text field should
            // not change the scaling, but make the texture bigger/smaller, while the size 
            // of the text/font stays the same (this applies to the height, as well).

            this._hitArea.width = value;
            this._requiresRedraw = true;
        }

        /** @inheritDoc */
        public set height(value:number) {
            this._hitArea.height = value;
            this._requiresRedraw = true;
        }

        /** The displayed text. */
        public get text():string {
            return this._text;
        }

        public set text(value:string) {
            if(value == null) value = "";
            if(this._text != value) {
                this._text = value;
                this._requiresRedraw = true;
            }
        }

        /** The name of the font (true type or bitmap font). */
        public get fontName():string {
            return this._fontName;
        }

        public set fontName(value:string) {
            if(this._fontName != value) {
                if(value == BitmapFont.MINI && TextField.bitmapFonts[value] == null)
                    TextField.registerBitmapFont(new MiniBitmapFont());

                this._fontName = value;
                this._requiresRedraw = true;
                this._isRenderedText = TextField.bitmapFonts[value] == undefined;
            }
        }

        /** The size of the font. For bitmap fonts, use <code>BitmapFont.NATIVE_SIZE</code> for
         *  the original size. */
        public get fontSize():number {
            return this._fontSize;
        }

        public set fontSize(value:number) {
            if(this._fontSize != value) {
                this._fontSize = value;
                this._requiresRedraw = true;
            }
        }

        /** The color of the text. For bitmap fonts, use <code>Color.WHITE</code> to use the
         *  original, untinted color. @default black */
        public get color():number/*uint*/ {
            return this._color;
        }

        public set color(value:number/*uint*/) {
            if(this._color != value) {
                this._color = value;
                this._requiresRedraw = true;
            }
        }

        /** The horizontal alignment of the text. @default center @see HAlign */
        public get hAlign():string {
            return this.mHAlign;
        }

        public set hAlign(value:string) {
            if(!HAlign.isValid(value))
                throw new ArgumentError("Invalid horizontal align: " + value);

            if(this.mHAlign != value) {
                this.mHAlign = value;
                this._requiresRedraw = true;
            }
        }

        /** The vertical alignment of the text. @default center @see VAlign */
        public get vAlign():string {
            return this.mVAlign;
        }

        public set vAlign(value:string) {
            if(!VAlign.isValid(value))
                throw new ArgumentError("Invalid vertical align: " + value);

            if(this.mVAlign != value) {
                this.mVAlign = value;
                this._requiresRedraw = true;
            }
        }

        /** Draws a border around the edges of the text field. Useful for visual debugging.
         *  @default false */
        public get border():boolean {
            return this._border != null;
        }

        public set border(value:boolean) {
            if(value && this._border == null) {
                this._border = new Sprite();
                this.addChild(this._border);

                for(var i:number = 0; i < 4; ++i)
                    this._border.addChild(new Quad(1.0, 1.0));

                this.updateBorder();
            }
            else if(!value && this._border != null) {
                this._border.removeFromParent(true);
                this._border = null;
            }
        }

        /** Indicates whether the text is bold. @default false */
        public get bold():boolean {
            return this._bold;
        }

        public set bold(value:boolean) {
            if(this._bold != value) {
                this._bold = value;
                this._requiresRedraw = true;
            }
        }

        /** Indicates whether the text is italicized. @default false */
        public get italic():boolean {
            return this._italic;
        }

        public set italic(value:boolean) {
            if(this._italic != value) {
                this._italic = value;
                this._requiresRedraw = true;
            }
        }

        /** Indicates whether the text is underlined. @default false */
        public get underline():boolean {
            return this._underline;
        }

        public set underline(value:boolean) {
            if(this._underline != value) {
                this._underline = value;
                this._requiresRedraw = true;
            }
        }

        /** Indicates whether kerning is enabled. @default true */
        public get kerning():boolean {
            return this._kerning;
        }

        public set kerning(value:boolean) {
            if(this._kerning != value) {
                this._kerning = value;
                this._requiresRedraw = true;
            }
        }

        /** Indicates whether the font size is scaled down so that the complete text fits
         *  into the text field. @default false */
        public get autoScale():boolean {
            return this._autoScale;
        }

        public set autoScale(value:boolean) {
            if(this._autoScale != value) {
                this._autoScale = value;
                this._requiresRedraw = true;
            }
        }

        /** Specifies the type of auto-sizing the TextField will do.
         *  Note that any auto-sizing will make auto-scaling useless. Furthermore, it has
         *  implications on alignment: horizontally auto-sized text will always be left-,
         *  vertically auto-sized text will always be top-aligned. @default "none" */
        public get autoSize():string {
            return this._autoSize;
        }

        public set autoSize(value:string) {
            if(this._autoSize != value) {
                this._autoSize = value;
                this._requiresRedraw = true;
            }
        }

        /** Indicates if TextField should be batched on rendering. This works only with bitmap
         *  fonts, and it makes sense only for TextFields with no more than 10-15 characters.
         *  Otherwise, the CPU costs will exceed any gains you get from avoiding the additional
         *  draw call. */
        public get batchable():boolean {
            return this._batchable;
        }

        public set batchable(value:boolean) {
            this._batchable = value;
            //if(this._quadBatch) this._quadBatch.batchable = value;
        }

        /** The native Flash BitmapFilters to apply to this TextField.
         *  Only available when using standard (TrueType) fonts! */
        public get nativeFilters():any[] {
            return this._nativeFilters;
        }

        public set nativeFilters(value:any[]) {
            if(!this._isRenderedText)
                throw(new Error("The TextField.nativeFilters property cannot be used on Bitmap fonts."));

            this._nativeFilters = value.concat();
            this._requiresRedraw = true;
        }

        /** Makes a bitmap font available at any TextField in the current stage3D context.
         *  The font is identified by its <code>name</code>.
         *  Per default, the <code>name</code> property of the bitmap font will be used, but you
         *  can pass a custom name, as well. @returns the name of the font. */
        public static registerBitmapFont(bitmapFont:BitmapFont, name:string = null):string {
            if(name == null) name = bitmapFont.name;
            TextField.bitmapFonts[name] = bitmapFont;
            return name;
        }

        /** Unregisters the bitmap font and, optionally, disposes it. */
        public static unregisterBitmapFont(name:string, dispose:boolean = true):void {
            if(dispose && TextField.bitmapFonts[name] != undefined)
                TextField.bitmapFonts[name].dispose();

            delete TextField.bitmapFonts[name];
        }

        /** Returns a registered bitmap font (or null, if the font has not been registered). */
        public static getBitmapFont(name:string):BitmapFont {
            return TextField.bitmapFonts[name];
        }

        /** Stores the currently available bitmap fonts. Since a bitmap font will only work
         *  in one Stage3D context, they are saved in Skylark's 'contextData' property. */
        private static get bitmapFonts():Dictionary {
            var fonts = TextField._fonts;

            if(fonts == null) {
                fonts = TextField._fonts = <Dictionary>{};
            }

            return fonts;
        }
    }
}
