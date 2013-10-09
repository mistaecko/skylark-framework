/// <reference path="Game.ts"/>

module demo
{
    export class MainMenu extends skylark.Sprite {
        constructor() {
            super();
            this.init();
        }

        private init():void {
            var logo:skylark.Image = new skylark.Image(demo.Game.assets.getTexture("logo"));
            this.addChild(logo);

            var scenesToCreate:string[][] = [
                ["Textures", 'demo.TextureScene'],
                ["Multitouch", 'demo.TouchScene'],
                ["TextFields", 'demo.TextScene'],
                ["Animations", 'demo.AnimationScene'],
                ["Custom hit-test", 'demo.CustomHitTestScene'],
                ["Movie Clip", 'demo.MovieScene'],
//                ["Filters", FilterScene],
                ["Blend Modes", 'demo.BlendModeScene'],
//                ["Render Texture", RenderTextureScene],
                ["Benchmark", 'demo.BenchmarkScene'],
//                ["Clipping", 'demo.MaskScene']
            ];

            var buttonTexture:skylark.Texture = demo.Game.assets.getTexture("button_medium");
            var count:number = 0;

            scenesToCreate.forEach((sceneToCreate)=> {
                var sceneTitle:string = sceneToCreate[0];
                //var sceneClass:{ new() } = sceneToCreate[1];
                var sceneClass:string = sceneToCreate[1];

                var button:skylark.Button = new skylark.Button(buttonTexture, sceneTitle);
                button.x = count % 2 == 0 ? 28 : 167;
                button.y = 155 + Math.abs(count / 2) * 46;
                button.name = sceneClass; //skylark.ClassUtil.getQualifiedClassName(sceneClass);
                this.addChild(button);

                if (scenesToCreate.length % 2 != 0 && count % 2 == 1)
                    button.y += 24;

                ++count;
            });

            // show information about rendering method (hardware/software)

//            var driverInfo:string = skylark.Skylark.context.driverInfo;
//            var infoText:skylark.TextField = new skylark.TextField(310, 64, driverInfo, "Verdana", 10);
//            infoText.x = 5;
//            infoText.y = 475 - infoText.height;
//            infoText.vAlign = skylark.VAlign.BOTTOM;
//            infoText.addEventListener(skylark.TouchEvent.TOUCH, this.onInfoTextTouched, this);
//            this.addChildAt(infoText, 0);
        }

        private onInfoTextTouched(event:skylark.TouchEvent):void {
//            if (event.getTouch(this, skylark.TouchPhase.ENDED))
//                skylark.Skylark.current.showStats = !skylark.Skylark.current.showStats;
        }
    }
}
