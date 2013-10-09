/// <reference path="../Game.ts"/>

module demo {

    export class TouchScene extends Scene {
        constructor() {
            super();
            var description:string = "[use Ctrl/Cmd & Shift to simulate multi-touch]";

            var infoText:skylark.TextField = new skylark.TextField(300, 25, description);
            infoText.x = infoText.y = 10;
            this.addChild(infoText);

            // to find out how to react to touch events have a look at the TouchSheet class! 
            // It's part of the demo.

            var sheet:demo.TouchSheet = new demo.TouchSheet(new skylark.Image(Game.assets.getTexture("starling_sheet")));
            sheet.x = Constants.CenterX;
            sheet.y = Constants.CenterY;
            sheet.rotation = skylark.MathUtil.deg2rad(10);
            this.addChild(sheet);
        }
    }
}