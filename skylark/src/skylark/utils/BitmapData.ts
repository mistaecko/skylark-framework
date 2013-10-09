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

    export class BitmapData {

        private _bytes:ByteArray;

        private _width:number;
        private _height:number;

        /**
         * Create a base64-encoded "dataURL" for a given CanvasImageSource (e.g.
         * a HTMLImageElement).
         *
         * Draws the given image onto a {@link Skylark#getHelperCanvas helper canvas}
         * and calls {@link Canvas#toDataURL} to retrieve a String representation of the image.
         * If the given object is of type `CanvasRenderingContext2D` or `HTMLCanvasElement` that intermediary
         * step is skipped and the `dataURL` is called directly on the `canvas` object.
         *
         * @param {HTMLImageElement} image the image
         * @returns {string} the base64-encoded String representing
         */
        public static toDataURL(image:CanvasImageSource):String {
            var canvas:HTMLCanvasElement;
            if(image instanceof CanvasRenderingContext2D && (<CanvasRenderingContext2D>image).canvas != null) {
                canvas = (<CanvasRenderingContext2D>image).canvas;
            } else if(image instanceof HTMLCanvasElement) {
                canvas = (<HTMLCanvasElement>image);
            } else {
                canvas = Skylark.getHelperCanvas(image.width, image.height);
                canvas.getContext('2d').drawImage(<any>image, 0, 0);
            }
            return canvas.toDataURL();
        }

        constructor(width:number, height:number, transparent?:boolean, fillColor?:number);

        constructor(width:number, height:number, bytes:ByteArray);

        constructor(width:number, height:number, a?:any, b?:any) {
            var transparent:boolean = true;
            var bytes:ByteArray;
            var fillColor:number = 0xFFFFFFFF; //todo [ALPHA]

            if(Array.isArray(a)) {
                bytes = a;
                if(bytes.length !== width * height)
                    throw new ArgumentError('Number of pixels in ByteArray does not match width*height');
            } else {
                if(typeof a !== 'undefined')
                    transparent = !!a;
                if(typeof b !== 'undefined')
                    fillColor = b;

                var length = width * height;
                bytes = <ByteArray>[];
                for(var i = 0; i < length; i++)
                    bytes.push(fillColor);
            }

            this._width = width;
            this._height = height;
            this._bytes = bytes;
        }

        public getPixel32(x:number, y:number):number {
            return this._bytes[y * this._width + x];
        }

        public get bytes():ByteArray {
            return this._bytes;
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        public dispose() {
            this._bytes = null;
        }

        public asUrl():string {
            var rows = [];
            var height = this._height;
            var width = this._width;
            var bytes = this._bytes;

            for(var r = 0; r < height; r++) {
                var start = r * width;
                var end = /*end(exclusive)*/(r + 1) * width;
                var row:Array[] = [];
                for(var i = start; i < end; i++) {
                    var px = [ Color.getRed(bytes[i]), Color.getGreen(bytes[i]), Color.getBlue(bytes[i])];
                    row.push(px);
                }

                rows.push(row);
            }

            return Bitmap.create(rows, 1.0);
        }
    }
}
