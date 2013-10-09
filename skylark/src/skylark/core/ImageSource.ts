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

    export interface ImageSource {
        width:number;
        height:number;
        image:CanvasImageSource;
        dispose();
    }

    export class DefaultImageSource implements ImageSource {
        private _image:CanvasImageSource;

        constructor(image:CanvasImageSource) {
            if(image instanceof HTMLImageElement && !(image.height > 0 && image.width > 0))
                throw new Error('Cannot create ConcreteTexture based on Image that has not yet completed loading or has no dimensions');

            this._image = image;
        }

        public get width():number {
            return (<any>this._image).width;
        }

        public get height():number {
            return (<any>this._image).height;
        }

        public get image():CanvasImageSource {
            return this._image;
        }

        public dispose() {
            this._image = null;
        }
    }
}

