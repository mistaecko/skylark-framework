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

    /** An Image is a quad with a texture mapped onto it.
     *
     *  <p>The Image class is the Skylark equivalent of Flash's Bitmap class. Instead of
     *  BitmapData, Skylark uses textures to represent the pixels of an image. To display a
     *  texture, you have to map it onto a quad - and that's what the Image class is for.</p>
     *
     *  <p>As "Image" inherits from "Quad", you can give it a color. For each pixel, the resulting
     *  color will be the result of the multiplication of the color of the texture with the color of
     *  the quad. That way, you can easily tint textures with a certain color. Furthermore, images
     *  allow the manipulation of texture coordinates. That way, you can move a texture inside an
     *  image without changing any vertex coordinates of the quad. You can also use this feature
     *  as a very efficient way to create a rectangular mask.</p>
     *
     *  @see Texture
     *  @see Quad
     */
    export class Image extends Quad {
        private _texture:Texture;
        private _smoothing:string;

        private _vertexDataCache:VertexData;
        private _vertexDataCacheInvalid:boolean;

        /** Creates a quad with a texture mapped onto it. */
        constructor(texture:Texture);

        /** Creates a quad with a texture mapped onto it. */
        constructor(image:HTMLImageElement);

        constructor(a:any) {
            if(a == null)
                throw new ArgumentError("Image constructor requires a Texture or a HTMLImageElement/Image object");

            var texture:Texture;
            if(a instanceof HTMLImageElement)
                texture = new ConcreteTexture(<Image>a);
            else
                texture = <Texture>a;

            var frame:Rectangle = texture.frame;
            var width:number = frame ? frame.width : texture.width;
            var height:number = frame ? frame.height : texture.height;
            var pma:boolean = texture.premultipliedAlpha;

            super(width, height, 0xffffff, pma);

            this._vertexData.setTexCoords(0, 0.0, 0.0);
            this._vertexData.setTexCoords(1, 1.0, 0.0);
            this._vertexData.setTexCoords(2, 0.0, 1.0);
            this._vertexData.setTexCoords(3, 1.0, 1.0);

            this._texture = texture;
            this._smoothing = TextureSmoothing.BILINEAR;
            this._vertexDataCache = new VertexData(4, pma);
            this._vertexDataCacheInvalid = true;
        }

        /** @inheritDoc */
        onVertexDataChanged():void {
            this._vertexDataCacheInvalid = true;
        }

        /** Readjusts the dimensions of the image according to its current texture. Call this method
         *  to synchronize image and texture size after assigning a texture with a different size.*/
        public readjustSize():void {
            var texture:Texture = this.texture;
            var frame:Rectangle = texture.frame;
            var width:number = frame ? frame.width : texture.width;
            var height:number = frame ? frame.height : texture.height;

            this._vertexData.setPosition(0, 0.0, 0.0);
            this._vertexData.setPosition(1, width, 0.0);
            this._vertexData.setPosition(2, 0.0, height);
            this._vertexData.setPosition(3, width, height);

            this.onVertexDataChanged();
        }

        /** Sets the texture coordinates of a vertex. Coordinates are in the range [0, 1]. */
        public setTexCoords(vertexID:number, coords:Point):void {
            this._vertexData.setTexCoords(vertexID, coords.x, coords.y);
            this.onVertexDataChanged();
        }

        /** Gets the texture coordinates of a vertex. Coordinates are in the range [0, 1].
         *  If you pass a 'resultPoint', the result will be stored in this point instead of
         *  creating a new object.*/
        public getTexCoords(vertexID:number, resultPoint:Point = null):Point {
            if(resultPoint == null) resultPoint = new Point();
            this._vertexData.getTexCoords(vertexID, resultPoint);
            return resultPoint;
        }

        /** Copies the raw vertex data to a VertexData instance.
         *  The texture coordinates are already in the format required for rendering. */
        public copyVertexDataTo(targetData:VertexData, targetVertexID:number = 0):void {
            if(this._vertexDataCacheInvalid) {
                this._vertexDataCacheInvalid = false;
                this._vertexData.copyTo(this._vertexDataCache);
                this._texture.adjustVertexData(this._vertexDataCache, 0, 4);
            }

            this._vertexDataCache.copyTo(targetData, targetVertexID);
        }

        /** The texture that is displayed on the quad. */
        public get texture():Texture {
            return this._texture;
        }

        public set texture(value:Texture) {
            if(value == null)
                throw new ArgumentError("Texture cannot be null");

            if(value != this._texture) {
                this._texture = value;
                this._vertexData.setPremultipliedAlpha(this._texture.premultipliedAlpha);
                this.onVertexDataChanged();
            }
        }

        /** The smoothing filter that is used for the texture.
         *   @default bilinear
         *   @see TextureSmoothing */
        public get smoothing():string {
            return this._smoothing;
        }

        public set smoothing(value:string) {
            if(TextureSmoothing.isValid(value))
                this._smoothing = value;
            else
                throw new ArgumentError("Invalid smoothing mode: " + value);
        }

        public set color(value:number) {
            throw new DefaultError('Image class does not support "color" tinting (yet?)');
        }

        /** @inheritDoc */
        public renderTransformed(support:RenderSupport, context:CanvasRenderingContext2D):void {
            if(this._vertexDataCacheInvalid) {
                this._vertexDataCacheInvalid = false;
                this._vertexData.copyTo(this._vertexDataCache);
                this._texture.adjustVertexData(this._vertexDataCache, 0, 4);
            }

            var texture = this._texture;
            var base = texture.base;
            var image = base != null ? base.image : null;

            if(image == null)
                throw new DefaultError('Cannot render Texture without "base.image" property');

            var vd = this._vertexDataCache;
            var hp = Quad._helperPoint;

            var textureWidth = texture.root.width;
            var textureHeight = texture.root.height;

            vd.getTexCoords(0, hp);
            var sx = hp.x * textureWidth;
            var sy = hp.y * textureHeight;
            vd.getTexCoords(3, hp);
            var sw = hp.x * textureWidth - sx;
            var sh = hp.y * textureHeight - sy;

            vd.getPosition(0, hp);
            var dx = hp.x;
            var dy = hp.y;

            // todo - scale!
            var dw = sw;
            var dh = sh;

            // todo [ALPHA]
            //context.globalAlpha = image.alpha;

            context.drawImage(<any>image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
}
