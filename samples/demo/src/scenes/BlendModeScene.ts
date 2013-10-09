/// <reference path="../Game.ts"/>

module demo {
    
    export class BlendModeScene extends demo.Scene {
        private mButton:skylark.Button;
        private mImage:skylark.Image;
        private mInfoText:skylark.TextField;

        private mBlendModes:string[] = [
            'NORMAL',
            'MULTIPLY',
            'SCREEN',
            'ADD',
            'ERASE',
            'NONE'
        ];

        constructor() {
            super();
            this.mButton = new skylark.Button(Game.assets.getTexture("button_normal"), "Switch Mode");
            this.mButton.x = Math.abs(Constants.CenterX - this.mButton.width / 2);
            this.mButton.y = 15;
            this.mButton.addEventListener(skylark.Event.TRIGGERED, this.onButtonTriggered, this);
            this.addChild(this.mButton);

            this.mImage = new skylark.Image(Game.assets.getTexture("starling_rocket"));
            this.mImage.x = Math.abs(Constants.CenterX - this.mImage.width / 2);
            this.mImage.y = 170;
            this.addChild(this.mImage);

            this.mInfoText = new skylark.TextField(300, 32, "", "Verdana", 19);
            this.mInfoText.x = 10;
            this.mInfoText.y = 330;
            this.addChild(this.mInfoText);

            this.onButtonTriggered();
        }

        private onButtonTriggered():void {
            var blendMode:string = this.mBlendModes.shift();
            this.mBlendModes.push(blendMode);

            var html5Value = skylark.BlendMode[blendMode.toUpperCase()];
            this.mInfoText.text = blendMode + ' (' + html5Value + ')';
            this.mImage.blendMode = html5Value;
        }
    }
}