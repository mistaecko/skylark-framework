/// <reference path="../Game.ts"/>

module demo {

    export class ProgressBar extends skylark.Sprite {
        private mBar:skylark.Quad;
        private mBackground:skylark.Image;

        constructor(width:number, height:number) {
            super();
            this.init(width, height);
        }

        private init(width:number, height:number):void {
            var scale:number = skylark.Skylark.contentScaleFactor;
            var padding:number = height * 0.2;
            var cornerRadius:number = padding * scale * 2;

            // create black rounded box for background

//            var bgShape:Shape = new Shape();
//            bgShape.graphics.beginFill(0x0, 0.5);
//            bgShape.graphics.drawRoundRect(0, 0, width * scale, height * scale, cornerRadius, cornerRadius);
//            bgShape.graphics.endFill();
//
//            var bgBitmapData:skylark.BitmapData = new skylark.BitmapData(width * scale, height * scale, true, 0x0);
//            bgBitmapData.draw(bgShape);
//            var bgTexture:skylark.Texture = Texture.fromBitmapData(bgBitmapData, false, false, scale);
            var bgTexture = skylark.Texture.fromColor(width * scale, height * scale, 0xff0000, false, scale);

            this.mBackground = new skylark.Image(bgTexture);
            this.addChild(this.mBackground);

            // create progress bar quad

            this.mBar = new skylark.Quad(width - 2 * padding, height - 2 * padding, 0xeeeeee);
            this.mBar.setVertexColor(2, 0xaaaaaa);
            this.mBar.setVertexColor(3, 0xaaaaaa);
            this.mBar.x = padding;
            this.mBar.y = padding;
            this.mBar.scaleX = 0;
            this.addChild(this.mBar);
        }

        public get ratio():number {
            return this.mBar.scaleX;
        }

        public set ratio(value:number) {
            this.mBar.scaleX = Math.max(0.0, Math.min(1.0, <number>value));
        }
    }
}
