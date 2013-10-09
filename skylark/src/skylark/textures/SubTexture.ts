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

module skylark/*.textures*/ {

    /** A SubTexture represents a section of another texture. This is achieved solely by
     *  manipulation of texture coordinates, making the class very efficient.
     *
     *  <p><em>Note that it is OK to create subtextures of subtextures.</em></p>
     */
    export class SubTexture extends Texture {
        private _parent:Texture;
        private _clipping:Rectangle;
        private _rootClipping:Rectangle;
        private _ownsParent:boolean;

        /** Helper object. */
        private static _texCoords:Point = new Point();

        /** Creates a new subtexture containing the specified region (in points) of a parent
         *  texture. If 'ownsParent' is true, the parent texture will be disposed automatically
         *  when the subtexture is disposed. */
        constructor(parentTexture:Texture, region:Rectangle, ownsParent:boolean = false) {
            super();
            this._parent = parentTexture;
            this._ownsParent = ownsParent;

            if(region == null) this.setClipping(new Rectangle(0, 0, 1, 1));
            else this.setClipping(new Rectangle(region.x / parentTexture.width,
                region.y / parentTexture.height,
                region.width / parentTexture.width,
                region.height / parentTexture.height));
        }

        /** Disposes the parent texture if this texture owns it. */
        public dispose():void {
            if(this._ownsParent) this._parent.dispose();
            super.dispose();
        }

        private setClipping(value:Rectangle):void {
            this._clipping = value;
            this._rootClipping = value.clone();

            var parentTexture:SubTexture = <SubTexture>this._parent;

            while(parentTexture && parentTexture instanceof SubTexture) {
                var parentClipping:Rectangle = parentTexture._clipping;
                this._rootClipping.x = parentClipping.x + this._rootClipping.x * parentClipping.width;
                this._rootClipping.y = parentClipping.y + this._rootClipping.y * parentClipping.height;
                this._rootClipping.width *= parentClipping.width;
                this._rootClipping.height *= parentClipping.height;
                parentTexture = <SubTexture>parentTexture._parent;
            }
        }

        /** @inheritDoc */
        public adjustVertexData(vertexData:VertexData, vertexID:number, count:number):void {
            super.adjustVertexData(vertexData, vertexID, count);

            var _rootClipping = this._rootClipping;
            var clipX:number = _rootClipping.x;
            var clipY:number = _rootClipping.y;
            var clipWidth:number  = _rootClipping.width;
            var clipHeight:number = _rootClipping.height;
            var endIndex:number = vertexID + count;

            for (var i:number=vertexID; i<endIndex; ++i) {
                vertexData.getTexCoords(i, SubTexture._texCoords);
                vertexData.setTexCoords(i, clipX + SubTexture._texCoords.x * clipWidth,
                    clipY + SubTexture._texCoords.y * clipHeight);
            }
        }

        /** The texture which the subtexture is based on. */
        public get parent():Texture {
            return this._parent;
        }

        /** Indicates if the parent texture is disposed when this object is disposed. */
        public get ownsParent():boolean {
            return this._ownsParent;
        }

        /** The clipping rectangle, which is the region provided on initialization
         *  scaled into [0.0, 1.0]. */
        public get clipping():Rectangle {
            return this._clipping.clone();
        }

        /** @inheritDoc */
        public get base():ImageSource {
            return this._parent.base;
        }

        /** @inheritDoc */
        public get root():ConcreteTexture {
            return this._parent.root;
        }

        /** @inheritDoc */
        public get width():number {
            return this._parent.width * this._clipping.width;
        }

        /** @inheritDoc */
        public get height():number {
            return this._parent.height * this._clipping.height;
        }

        /** @inheritDoc */
        public get nativeWidth():number {
            return this._parent.nativeWidth * this._clipping.width;
        }

        /** @inheritDoc */
        public get nativeHeight():number {
            return this._parent.nativeHeight * this._clipping.height;
        }

        /** @inheritDoc */
        public get premultipliedAlpha():boolean {
            return this._parent.premultipliedAlpha;
        }

        /** @inheritDoc */
        public get scale():number {
            return this._parent.scale;
        }

//        public render(support:RenderSupport, context:CanvasRenderingContext2D) {
//            var c = this._rootClipping;
//            var root = this.root;
//            var width = root.width;
//            var height = root.height;
//
//            var image = root.base.image;
//            var round = Math.round;
//
//            var scale = this.scale;
//
//            // todo to round or not to round?
//            var sx = c.x * width;
//            var sy = c.y * height;
//            var sw = c.width * width * scale;
//            var sh = c.height * height * scale;
//            context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
//        }

    }
}
