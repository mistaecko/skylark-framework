/// <reference path="../Game.ts"/>

module demo {

    export class Scene extends skylark.Sprite {
        private mBackButton:skylark.Button;

        constructor() {
            super();
            // the main menu listens for TRIGGERED events, so we just need to add the button.
            // (the event will bubble up when it's dispatched.)

            var btn = this.mBackButton = new skylark.Button(demo.Game.assets.getTexture("button_back"), "Back");

            btn.x = demo.Constants.CenterX - btn.width / 2;
            btn.y = demo.Constants.GameHeight - btn.height + 1;
            btn.name = "backButton";
            this.addChild(btn);
        }
    }
}