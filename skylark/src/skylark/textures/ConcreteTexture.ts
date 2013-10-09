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

    /** A ConcreteTexture wraps a HTMLImageElement object, storing the properties of the texture. */
    export class ConcreteTexture extends Texture {
        private _base:ImageSource;
        private _format:string;
        private _width:number;
        private _height:number;
        private _mipMapping:boolean;
        private _premultipliedAlpha:boolean;
        private _optimizedForRenderTexture:boolean;
        private _data:any;
        private _scale:number;

        /** Creates a ConcreteTexture object from an AsyncImageSource, storing information about size,
         *  mip-mapping, and if the channels contain premultiplied alpha values. */

        constructor(width:number, height:number, scale?:number/* = 1*/);

        constructor(base:ImageSource, scale?:number/* = 1*/);

        constructor(base:CanvasImageSource, scale?:number/* = 1*/);

        constructor(a:any, b?:any, c?:any) {
            super();
            var scale:number = 1;
            var base:ImageSource;

            if(typeof a === 'object') {
                if(ClassUtil.isCanvasImageSource(a)) {
                    //constructor(base:CanvasImageSource, scale:number = 1);
                    base = </*IntelliJ*/ImageSource>new DefaultImageSource(a);
                } else {
                    //constructor(base:ImageSource, scale:number = 1);
                    base = <ImageSource>a;
                }

                scale = b != null ? <number>b : scale;

                this._width = base.width;
                this._height = base.height;

            } else {
                // constructor(width:number, height:number, scale:number = 1);
                scale = c != null ? <number>c : scale;
                this._width = <number>a;
                this._height = <number>b;
                Arguments.number(a, b, scale);
            }

            this._base = base;
            this._scale = scale <= 0 ? 1.0 : scale;
        }

        /** Disposes the TextureBase object. */
        public dispose():void {
            if(this._base)
                this._base.dispose();
            super.dispose();
        }


        // properties

        /** @inheritDoc */
        public get base():ImageSource {
            return this._base;
        }

        /** @inheritDoc */
        public get root():ConcreteTexture {
            return this;
        }

        /** @inheritDoc */
        public get width():number {
            return this._width / this._scale;
        }

        /** @inheritDoc */
        public get height():number {
            return this._height / this._scale;
        }

        /** @inheritDoc */
        public get nativeWidth():number {
            return this._width;
        }

        /** @inheritDoc */
        public get nativeHeight():number {
            return this._height;
        }

        /** The scale factor, which influences width and height properties. */
        public get scale():number {
            return this._scale;
        }

        /** @inheritDoc */
        public get mipMapping():boolean {
            return this._mipMapping;
        }

        /** @inheritDoc */
        public get premultipliedAlpha():boolean {
            return this._premultipliedAlpha;
        }

        /** Clears the texture with a certain color and alpha value. The previous contents of the
         *  texture is wiped out. Beware: this method resets the render target to the back buffer;
         *  don't call it from within a render method. */
        public clear(color:number/*uint*/ = 0x0, alpha:number = 0.0):void {
            var canvas = Skylark.getHelperCanvas(this.width, this.height);
            var context = canvas.getContext('2d');

            var Color = Color;
            if(this._premultipliedAlpha && alpha < 1.0)
                color = Color.rgb(Color.getRed(color) * alpha,
                    Color.getGreen(color) * alpha,
                    Color.getBlue(color) * alpha);

            var base = this._base;

            RenderSupport.clear(context, color, alpha);
        }

        public render(support:RenderSupport, context:CanvasRenderingContext2D) {
            context.drawImage(<any>this.base.image, 0, 0);
        }
    }
}
