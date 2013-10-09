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

    import _Bitmap = skylark.Bitmap;

    /** <p>A texture stores the information that represents an image. It cannot be added to the
     *  display list directly; instead it has to be mapped onto a display object. In Skylark,
     *  that display object is the class "Image".</p>
     *
     *  <strong>Texture Formats</strong>
     *
     *  <p>Since textures can be created from a "BitmapData" object, Skylark supports any bitmap
     *  format that is supported by Flash. And since you can render any Flash display object into
     *  a BitmapData object, you can use this to display non-Skylark content in Skylark - e.g.
     *  Shape objects.</p>
     *
     *  <p>Skylark also supports ATF textures (Adobe Texture Format), which is a container for
     *  compressed texture formats that can be rendered very efficiently by the GPU. Refer to
     *  the Flash documentation for more information about this format.</p>
     *
     *  <strong>Mip Mapping</strong>
     *
     *  <p>MipMaps are scaled down versions of a texture. When an image is displayed smaller than
     *  its natural size, the GPU may display the mip maps instead of the original texture. This
     *  reduces aliasing and accelerates rendering. It does, however, also need additional memory;
     *  for that reason, you can choose if you want to create them or not.</p>
     *
     *  <strong>Texture Frame</strong>
     *
     *  <p>The frame property of a texture allows you let a texture appear inside the bounds of an
     *  image, leaving a transparent space around the texture. The frame rectangle is specified in
     *  the coordinate system of the texture (not the image):</p>
     *
     *  <listing>
     *  var frame:Rectangle = new Rectangle(-10, -10, 30, 30);
     *  var texture:Texture = Texture.fromTexture(anotherTexture, null, frame);
     *  var image:Image = new Image(texture);</listing>
     *
     *  <p>This code would create an image with a size of 30x30, with the texture placed at
     *  <code>x=10, y=10</code> within that image (assuming that 'anotherTexture' has a width and
     *  height of 10 pixels, it would appear in the middle of the image).</p>
     *
     *  <p>The texture atlas makes use of this feature, as it allows to crop transparent edges
     *  of a texture and making up for the changed size by specifying the original texture frame.
     *  Tools like <a href="http://www.texturepacker.com/">TexturePacker</a> use this to
     *  optimize the atlas.</p>
     *
     *  <strong>Texture Coordinates</strong>
     *
     * todo update docs
     *  <p>If, on the other hand, you want to show only a part of the texture in an image
     *  (i.e. to crop the the texture), you can either create a subtexture (with the method
     *  'Texture.fromTexture()' and specifying a rectangle for the region), or you can manipulate
     *  the texture coordinates of the image object. The method 'image.setTexCoords' allows you
     *  to do that.</p>
     *
     *  @see Image
     *  @see TextureAtlas
     *
     *  @abstract
     */
    export class Texture {
        private _frame:Rectangle;
        private _repeat:boolean;

        /** helper object */
        private static _origin:Point = new Point();

        /** @private */
        constructor() {
            //todo don't allow to instantiate directly
            this._repeat = false;
        }

        /** Disposes the underlying texture data. Note that not all textures need to be disposed:
         *  SubTextures (created with 'Texture.fromTexture') just reference other textures and
         *  and do not take up resources themselves; this is also true for textures from an
         *  atlas. */
        public dispose():void {
            // in subclasses
        }

        private static createBitmap(width:number, height:number, color:number):CanvasImageSource {
            var rows = [];

            var pixel = [
                Color.getRed(color),
                Color.getGreen(color),
                Color.getBlue(color)
            ];

            var row = [];
            for(var j = 0; j < width; j++)
                row.push(pixel);

            for(var i = 0; i < height; i++)
                rows.push(row);

            var image = new NativeImage();
            image.src = _Bitmap.create(rows, 1.0);
            return <CanvasImageSource>image;
        }

        /** Creates an empty texture of a certain size.
         *  Beware that the texture can only be used after you either upload some color data
         *  ("texture.root.upload...") or clear the texture ("texture.root.clear()").
         *
         *  @param width  in points; number of pixels depends on scale parameter
         *  @param height in points; number of pixels depends on scale parameter
         *  @param premultipliedAlpha the PMA format you will use the texture with. If you will
         *                 use the texture for bitmap data, use "true"; for ATF data, use "false".
         *  @param mipMapping indicates if mipmaps should be used for this texture. When you upload
         *                 bitmap data, this decides if mipmaps will be created; when you upload ATF
         *                 data, this decides if mipmaps inside the ATF file will be displayed.
         *  @param optimizeForRenderToTexture indicates if this texture will be <render>used target
         *  @param scale  if you omit this parameter, 'Skylark.contentScaleFactor' will be used.
         */
        public static empty(width:number, height:number, premultipliedAlpha:boolean = true, mipMapping:boolean = true, optimizeForRenderToTexture:boolean = false, scale:number = -1):Texture {
            if(scale <= 0) scale = Skylark.contentScaleFactor;

            var origWidth:number = width * scale;
            var origHeight:number = height * scale;
            var potWidth:number = MathUtil.getNextPowerOfTwo(origWidth);
            var potHeight:number = MathUtil.getNextPowerOfTwo(origHeight);
            var isPot:boolean = (origWidth == potWidth && origHeight == potHeight);

            // todo find solution to make this synchronous on Firefox
            var image = Texture.createBitmap(potWidth, potHeight, 0xFFFFFF); //todo [PORT][ALPHA]
            var concreteTexture:ConcreteTexture = new ConcreteTexture(<any>image);

            return new SubTexture(concreteTexture, new Rectangle(0, 0, width, height), true);
        }

        /** Creates a texture that contains a region (in pixels) of another texture. The new
         *  texture will reference the base texture; no data is duplicated. */
        public static fromTexture(texture:Texture, region:Rectangle = null, frame:Rectangle = null):Texture {
            var subTexture:Texture = new SubTexture(texture, region);
            subTexture._frame = frame;
            return subTexture;
        }

        public static fromCanvas(canvas:HTMLCanvasElement, generateMipMaps:boolean = true, scale:number = 1) {
            var image = new NativeImage();
            image.src = canvas.toDataURL();
            return new ConcreteTexture(image, scale);
        }

        /** Creates a texture with a certain size and color.
         *
         *  @param width  in points; number of pixels depends on scale parameter
         *  @param height in points; number of pixels depends on scale parameter
         *  @param color  expected in ARGB format (inlude alpha!)
         *  @param optimizeForRenderToTexture indicates if this texture will be used as render target
         *  @param scale  if you omit this parameter, 'Skylark.contentScaleFactor' will be used.
         */
        public static fromColor(width:number, height:number, color:number/*uint*/ = 0xffffffff, optimizeForRenderToTexture:boolean = false, scale:number = -1):Texture {
            //todo implement POT - note: Skylark delegates to #empty for unified POT handling

            if(scale <= 0)
                scale = Skylark.contentScaleFactor;

            var bitmapData:BitmapData = new BitmapData(width * scale, height * scale, true, color);
            var texture:Texture = Texture.fromBitmapData(bitmapData, false, optimizeForRenderToTexture, scale);

            return texture;
        }

        /**
         * Creates a texture from an "embedded" image that is a base64-encoded
         * image `src` string.
         *
         * @param base64String the "embedded" image `src` string
         * @returns {ConcreteTexture}
         */
        public static fromEmbedded(base64String:string):Texture {
            var image = new NativeImage();
            image.src = base64String;
            return new ConcreteTexture(image);
        }

        /** Creates a texture from bitmap data.
         *  Beware: you must not dispose 'data' if Skylark should handle a lost device context. */
        public static fromBitmapData(data:BitmapData, generateMipMaps:boolean = true, optimizeForRenderToTexture:boolean = false, scale:number = 1):Texture {
            var origWidth:number = data.width;
            var origHeight:number = data.height;
            var legalWidth:number = MathUtil.getNextPowerOfTwo(origWidth);
            var legalHeight:number = MathUtil.getNextPowerOfTwo(origHeight);

            var canvas = Skylark.getHelperCanvas(legalWidth, legalHeight);
            var context = canvas.getContext('2d');

            var image = new NativeImage();
            image.src = data.asUrl();
            var concreteTexture:ConcreteTexture = new ConcreteTexture(image);

            if(origWidth == legalWidth && origHeight == legalHeight)
                return concreteTexture;
            else
                return new SubTexture(concreteTexture,
                    new Rectangle(0, 0, origWidth / scale, origHeight / scale),
                    true);
        }

        /** Converts texture coordinates and vertex positions of raw vertex data into the format
         *  required for rendering. */
        public adjustVertexData(vertexData:VertexData, vertexID:number, count:number):void {
            var frame = this._frame;
            if(frame) {
                if(count != 4)
                    throw new ArgumentError("Textures with a frame can only be used on quads");

                var deltaRight:number = frame.width + frame.x - this.width;
                var deltaBottom:number = frame.height + frame.y - this.height;

                vertexData.translateVertex(vertexID, -frame.x, -frame.y);
                vertexData.translateVertex(vertexID + 1, -deltaRight, -frame.y);
                vertexData.translateVertex(vertexID + 2, -frame.x, -deltaBottom);
                vertexData.translateVertex(vertexID + 3, -deltaRight, -deltaBottom);
            }
        }

// properties

        /** The texture frame (see class description). */
        public get frame():Rectangle {
            return this._frame ? this._frame.clone() : new Rectangle(0, 0, this.width, this.height);

            // the frame property is readonly - set the frame in the 'fromTexture' method.
            // why is it readonly? To be able to efficiently cache the texture coordinates on
            // rendering, textures need to be immutable (except 'repeat', which is not cached,
            // anyway).
        }

        /** Whether this Texture has a frame or not */
        public hasFrame():boolean {
            return this._frame !== null;
        }

        /** Indicates if the texture should repeat like a wallpaper or stretch the outermost pixels.
         *  Note: this only works in textures with sidelengths that are powers of two and
         *  that are not loaded from a texture atlas (i.e. no subtextures). @default false */
        public get repeat():boolean {
            return this._repeat;
        }

        public set repeat(value:boolean) {
            this._repeat = value;
        }

        /** The width of the texture in points. */
        public get width():number {
            return 0;
        }

        /** The height of the texture in points. */
        public get height():number {
            return 0;
        }

        /** The width of the texture in pixels (without scale adjustment). */
        public get nativeWidth():number {
            return 0;
        }

        /** The height of the texture in pixels (without scale adjustment). */
        public get nativeHeight():number {
            return 0;
        }

        /** The scale factor, which influences width and height properties. */
        public get scale():number {
            return 1.0;
        }

        /** The Stage3D texture object the texture is based on.
         * todo update docs*/
        public get base():ImageSource { return null; }

        /** The concrete (power-of-two) texture the texture is based on. */
        public get root():ConcreteTexture {
            return null;
        }

        /** Indicates if the alpha values are premultiplied into the RGB values. */
        public get premultipliedAlpha():boolean {
            return false;
        }

    }
}
