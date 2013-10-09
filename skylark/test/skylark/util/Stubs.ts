// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

// note: Helpers and Stubs are compiled seperatly *before* other test classes

/// <reference path="../../_skylark.d.ts"/>
/// <reference path="../../_common.d.ts"/>
/// <reference path="../../../lib/jquery/jquery.d.ts"/>
/// <reference path="../../skylark-compiled/util/Helpers.d.ts"/>

module stubs {

    export class MTexture extends skylark.ConcreteTexture {
        constructor(width:number, height:number, color:number) {
            super(/*IntelliJ*/<any>new MImage(width, height, color));
        }
    }

    export class MImage implements skylark.ImageSource {
        private mWidth:number;
        private mHeight:number;
        private mImage:CanvasImageSource;

        private static sDefaultColor:number = 0xff0000;

        constructor(width:number, height:number, color:number);
        constructor(width:number, height:number, image?:CanvasImageSource);

        constructor(width:number, height:number, arg?:any) {
            this.mWidth = width;
            this.mHeight = height;

            var color = MImage.sDefaultColor;
            var image:CanvasImageSource;
            if(typeof arg === 'number')
                color = arg;

            if(arg == null) {
                var img = new Image();
                img.src = util.Helpers.createBitmap(width, height, color);
                image = <CanvasImageSource>img;
                // note: in many browsers assigning a dataURL as Image#src is asynchronous
            } else
                image = arg;

            this.mImage = image;
        }

        public get width():number {
            return this.mWidth;
        }
        public get height():number {
            return this.mHeight;
        }

        public get image():CanvasImageSource {
            return this.mImage;
        }

        public dispose() {}
    }

    export class SimpleImageSource extends skylark.EventDispatcher  implements skylark.ImageSource {
        private _width:number;
        private _height:number;
        private _image:HTMLImageElement;
        private _complete:boolean;

        constructor(width:number, height:number, el:string);
        constructor(width:number, height:number, el:HTMLImageElement);
        constructor(width:number, height:number, el?:any) {
            super();
            this._width = width;
            this._height = height;
            if(typeof el === 'string') {
                var src = el;
                el = new Image();
                el.src = src;
            }
            this._image = el;
            if(el.complete)
                this.setComplete();
            else
                el.addEventListener('load', this.setComplete.bind(this)); // todo cleanup?
        }

        public get image():HTMLImageElement {
            return this._image;
        }

        public get width():number {
            return this._width;
        }
        public get height():number {
            return this._height;
        }
        public get src():string {
            return this._image.src;
        }
        public isComplete():boolean {
            return this._complete;
        }

        public setComplete() {
            if(!this._complete) {
                this._complete = true;
                this.dispatchEventWith('complete', false);
            }
        }

        public dispose():void {
            var el = this._image;
            if(el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
            this._image = null;
        }
    }

    export class MStarling {
        public static instance:MStarling;

        public static use() {
            var instance = new MStarling(null, null, null);
            MStarling.instance = instance;
            skylark.Skylark.current = <skylark.Skylark><any>instance;
        }

        public static restore() {
            skylark.Skylark.current = null;
            MStarling.instance = null;
        }

        public _context:CanvasRenderingContext2D;

        constructor(rootClass:any, id:string = 'stage', viewPort:skylark.Rectangle = null) {
        }

        public set context(context:CanvasRenderingContext2D) {
            this._context = context;
        }
        public get context():CanvasRenderingContext2D {
            return this._context;
        }

        public dispose() {}

    }

    export class MCanvasProvider extends skylark.AbstractCanvasProvider {
        private _elements:{[index:string]: HTMLElement; };

        private static _instance:MCanvasProvider;

        public static get instance():MCanvasProvider {
            return MCanvasProvider._instance;
        }

        public static use() {
            var instance = MCanvasProvider._instance = new MCanvasProvider({});
            var Skylark:any = skylark.Skylark;

            MCanvasProvider['$initializeCanvasProvider'] = Skylark['prototype'].initializeCanvasProvider;
            Skylark['prototype'].initializeCanvasProvider = function() {
                this._canvasProvider = instance;
            };
        }

        public static restore() {
            MCanvasProvider._instance = null;

            if(MCanvasProvider['$initializeCanvasProvider'])
                skylark.Skylark['prototype']['initializeCanvasProvider'] = MCanvasProvider['$initializeCanvasProvider'];
        }

        constructor(elements:{[index:string]: HTMLElement; }) {
            super();
            this._elements = elements;
        }

        getElementById(id:string):HTMLElement {
            return this._elements[id];
        }

        createCanvasWith(cb:(canvas:HTMLCanvasElement) => void):HTMLCanvasElement {
            var canvas = <HTMLCanvasElement><any>new stubs.MHTMLCanvasElement();
            cb.call(this, canvas);
            return canvas;
        }
    }

    export class MHTMLCanvasElement {
        public id:string;
        public width:number = 100;
        public height:number = 100;
        public clientWidth:number = 100;
        public clientHeight:number = 100;
        public nodeName:string = 'canvas';
        public style:any;

        public context2d:CanvasRenderingContext2D;

        constructor() {
            this.style = {}
        }

        public getContext(name:string) {
            if(name !== '2d')
                throw new Error('HTMLCanvasElementStub#getContext only allows "2d" as argument');

            var context = this.context2d;
            if(context == null) {
                context = <CanvasRenderingContext2D>new MCanvasRenderingContext2D();
                context.canvas = <HTMLCanvasElement><any>this;
            }
            return context;
        }

        public addEventListener(type:string, listener:EventListener, useCapture?:boolean):void {
        }
        public setAttribute(name:string, value:any):void {}
        public focus() {}
    }

    export class MCanvasRenderingContext2D {
        public canvas:HTMLCanvasElement;
//        shadowOffsetX: number;
//        lineWidth: number;
//        miterLimit: number;
//        canvas: HTMLCanvasElement;
//        strokeStyle: any;
//        font: string;
//        globalAlpha: number;
//        globalCompositeOperation: string;
//        shadowOffsetY: number;
//        fillStyle: any;
//        lineCap: string;
//        shadowBlur: number;
//        textAlign: string;
//        textBaseline: string;
//        shadowColor: string;
//        lineJoin: string;
        restore(): void {}
        public setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void {}
        public save():void {}
//        arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
//        measureText(text: string): TextMetrics;
//        isPointInPath(x: number, y: number): boolean;
//        quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
//        putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void;
//        rotate(angle: number): void;
//        fillText(text: string, x: number, y: number, maxWidth?: number): void;
//        translate(x: number, y: number): void;
//        scale(x: number, y: number): void;
//        createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
//        lineTo(x: number, y: number): void;
//        fill(): void;
//        createPattern(image: HTMLElement, repetition: string): CanvasPattern;
//        closePath(): void;
//        rect(x: number, y: number, w: number, h: number): void;
//        clip(): void;
//        createImageData(imageDataOrSw: any, sh?: number): ImageData;
//        clearRect(x: number, y: number, w: number, h: number): void;
//        moveTo(x: number, y: number): void;
//        getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
//        fillRect(x: number, y: number, w: number, h: number): void;
//        bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
        public drawImage(image: HTMLElement, offsetX: number, offsetY: number, width?: number, height?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number): void {}
//        transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;
//        stroke(): void;
//        strokeRect(x: number, y: number, w: number, h: number): void;
//        strokeText(text: string, x: number, y: number, maxWidth?: number): void;
//        beginPath(): void;
//        arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
//        createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    }

    export class MDocument {
        constructor() {
        }

        public getElementById(id:string) {
            return new MHTMLCanvasElement();
        }

        public createElement(a:any) {
            if(a !== 'canvas')
                throw new Error('StarlingDocumentStub#createElement only allows "canvas" as argument');

            return new MHTMLCanvasElement();
        }
    }

    export class AssetManager extends skylark.AssetManager {
        constructor() {
            super(1.0);
        }
    }
}
(function(root, stubs) {
    if (typeof exports === 'object') {
        eval('module.exports = stubs');
    } else {
        this.stubs = stubs;
    }
})(this, stubs);
