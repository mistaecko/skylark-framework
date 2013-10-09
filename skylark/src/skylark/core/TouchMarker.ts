// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
// =================================================================================================
/// <reference path="../../_dependencies.ts"/>

module skylark {

    /** The TouchMarker is used internally to mark touches created through "simulateMultitouch". */
    export class TouchMarker extends Sprite {
        private _center:Point;
        private _texture:Texture;

        constructor() {
            super();
            this._center = new Point();
            this._texture = this.createTexture();

            for(var i:number = 0; i < 2; ++i) {
                var marker:Image = new Image(this._texture);
                marker.pivotX = this._texture.width / 2;
                marker.pivotY = this._texture.height / 2;
                marker.touchable = false;
                this.addChild(marker);
            }
        }

        public dispose():void {
            this._texture.dispose();
            super.dispose();
        }

        public moveMarker(x:number, y:number, withCenter:boolean = false):void {
            if(withCenter) {
                this._center.x += x - this.realMarker.x;
                this._center.y += y - this.realMarker.y;
            }

            this.realMarker.x = x;
            this.realMarker.y = y;
            this.mockMarker.x = 2 * this._center.x - x;
            this.mockMarker.y = 2 * this._center.y - y;
        }

        public moveCenter(x:number, y:number):void {
            this._center.x = x;
            this._center.y = y;
            this.moveMarker(this.realX, this.realY); // reset mock position
        }

        private createTexture():Texture {

            var scale:number = 1.0; // todo Skylark.contentScaleFactor;
            var radius:number = 12 * scale;
            var width:number = 32 * scale;
            var height:number = 32 * scale;
            var thickness:number = 1.5 * scale;

            var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');
            canvas.setAttribute('width', String(width));
            canvas.setAttribute('height', String(height));
//            canvas.width = width;
//            canvas.height = height;

            var context = canvas.getContext('2d');

            // draw dark outline
            context.beginPath();
            context.arc(width / 2, height / 2, radius + thickness, 0, 2 * Math.PI, false);
            context.lineWidth = thickness;
            context.strokeStyle = '#000000';
            context.globalAlpha = 0.3;
            context.stroke();

            context.beginPath();
            context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, false);
            context.fillStyle = Color.toHexString(0x000000);
            context.globalAlpha = 0.1;
            context.fill();
            context.lineWidth = thickness;
            context.strokeStyle = '#ffffff';
            context.stroke();

            return Texture.fromCanvas(canvas);
        }

        private get realMarker():Image {
            return <Image>this.getChildAt(0);
        }

        private get mockMarker():Image {
            return <Image>this.getChildAt(1);
        }

        public get realX():number {
            return this.realMarker.x;
        }

        public get realY():number {
            return this.realMarker.y;
        }

        public get mockX():number {
            return this.mockMarker.x;
        }

        public get mockY():number {
            return this.mockMarker.y;
        }
    }
}
