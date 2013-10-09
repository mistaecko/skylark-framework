/// <reference path="../Game.ts"/>

module demo {
    
    export class CustomHitTestScene extends demo.Scene {
        constructor() {
            super();
            var description:string =
                "Pushing the bird only works when the touch occurs within a circle." +
                    "This can be accomplished by overriding the method 'hitTest'.";

            var infoText:skylark.TextField = new skylark.TextField(300, 100, description);
            infoText.x = infoText.y = 10;
            infoText.vAlign = skylark.VAlign.TOP;
            infoText.hAlign = skylark.HAlign.CENTER;
            this.addChild(infoText);

            // 'RoundButton' is a helper class of the Demo, not a part of skylark!
            // Have a look at its code to understand this sample.

            var button:demo.RoundButton = new demo.RoundButton(Game.assets.getTexture("starling_round"));
            button.x = Constants.CenterX - Math.abs(button.width / 2);
            button.y = 150;
            this.addChild(button);
        }
    }
}
