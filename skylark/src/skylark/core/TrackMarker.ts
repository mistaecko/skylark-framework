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

    export class TrackMarker extends Sprite {

        private _texture:Texture;

        constructor() {
            super();

            var texture = this.createTexture();

            var marker:Image = new Image(texture);
            marker.pivotX = texture.width / 2;
            marker.pivotY = texture.height / 2;
            marker.touchable = false;
            this.addChild(marker);
        }

        public moveMarker(x:number, y:number):void {
            this.x = x;
            this.y = y;
        }

        private createTexture():Texture {
            // todo P2 Skylark.contentScaleFactor;
            var scale:number = 1.0;
            var radius:number = 12 * scale;
            var width:number = 32 * scale;
            var height:number = 32 * scale;
            var thickness:number = 1.5 * scale;

            var canvas:HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');
            canvas.setAttribute('width', String(width));
            canvas.setAttribute('height', String(height));

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

    }
}
