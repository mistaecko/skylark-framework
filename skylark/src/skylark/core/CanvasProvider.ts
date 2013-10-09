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

    export interface CanvasProviderFactory {
        create():CanvasProvider;
        isCanvasProviderFactory:boolean;
    }

    export interface CanvasProvider {
        getCanvasById(id:string):HTMLCanvasElement;
        createCanvasWith(cb:(canvas:HTMLCanvasElement) => void, offscreen?:boolean):HTMLCanvasElement;
        createCanvas(id:string, width?:number, height?:number, offscreen?:boolean):HTMLCanvasElement;
        getBackgroundColor(canvas:HTMLCanvasElement):number;
        dispose(canvas:HTMLCanvasElement):void;
    }

    export class AbstractCanvasProvider implements CanvasProvider {
        getElementById(id:string):HTMLElement {
            throw new AbstractMethodError();
        }

        createCanvasWith(cb:(canvas:HTMLCanvasElement) => void, offscreen:boolean = false):HTMLCanvasElement {
            throw new AbstractMethodError();
        }

        getCanvasById(id:string):HTMLCanvasElement {
            var canvas = this.getElementById(id);
            if(canvas != null && !(canvas instanceof HTMLCanvasElement))
                throw new TypeError('The DOM element with id "' + id + '" is not a HTMLCanvasElement!');
            return <HTMLCanvasElement>canvas;
        }

        createCanvas(id:string, width:number = null, height:number = null, offscreen:boolean = false):HTMLCanvasElement {
            if(this.getElementById(id) != null)
                throw new Error('Cannot create canvas with id "' + id + '" - the DOM already contains an element with that id.');

            return this.createCanvasWith((canvas) => {
                canvas.id = id;
                canvas.width = width;
                canvas.height = height;
            }, offscreen);
        }

        getBackgroundColor(canvas:HTMLCanvasElement):number {
            var cssColor = canvas.style.backgroundColor;
            if(cssColor != null && cssColor != '')
                return Color.fromString(cssColor);
            //else return undefined;
        }

        dispose(canvas:HTMLCanvasElement) {
            if(canvas && canvas.parentNode != null)
                canvas.parentNode.removeChild(canvas);
        }
    }

    export interface HTMLCanvasProviderDocument {
        getElementById(id:string);
        appendChild(canvas:HTMLCanvasElement);
    }

    export class HTMLCanvasProviderFactory implements CanvasProviderFactory {
        public get isCanvasProviderFactory() {
            return true;
        }

        create():CanvasProvider {
            return new HTMLCanvasProvider(document);
        }
    }

    export class HTMLCanvasProvider extends AbstractCanvasProvider {

        private _document:any;

        constructor();

        constructor(doc:HTMLCanvasProviderDocument);

        constructor(doc:HTMLDocument);

        constructor(doc?:any) {
            super();
            this._document = doc != null ? doc : document;
        }

        getElementById(id:string):HTMLElement {
            return document.getElementById(id);
        }

        createCanvasWith(cb:(canvas:HTMLCanvasElement) => void, offscreen:boolean = false):HTMLCanvasElement {
            var canvas = <HTMLCanvasElement>document.createElement('canvas');

            cb.call(this, canvas);

            if(!offscreen) {
                var body:HTMLElement = document.body;
                body.appendChild(canvas);
            }

            return canvas;
        }
    }
}
