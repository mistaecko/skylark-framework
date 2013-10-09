/// <reference path="../Game.ts"/>

module demo {
    
    export class BenchmarkScene extends Scene {

        private static sFps:number = 60;

        private mStartButton:skylark.Button;
        private mResultText:skylark.TextField;

        private mContainer:skylark.Sprite;
        private mFrameCount:number;
        private mElapsed:number;
        private mStarted:boolean;
        private mFailCount:number;
        private mWaitFrames:number;

        constructor() {
            super();

            // the container will hold all test objects
            this.mContainer = new skylark.Sprite();
            this.mContainer.touchable = false; // we do not need touch events on the test objects -- 
            // thus, it is more efficient to disable them.
            this.addChildAt(this.mContainer, 0);

            this.mStartButton = new skylark.Button(Game.assets.getTexture("button_normal"), "Start benchmark");
            this.mStartButton.addEventListener(skylark.Event.TRIGGERED, this.onStartButtonTriggered, this);
            this.mStartButton.x = Constants.CenterX - Math.abs(this.mStartButton.width / 2);
            this.mStartButton.y = 20;
            this.addChild(this.mStartButton);

            this.mStarted = false;
            this.mElapsed = 0.0;

            this.addEventListener(skylark.Event.ENTER_FRAME, this.onEnterFrame, this);
        }

        public dispose():void {
            this.removeEventListener(skylark.Event.ENTER_FRAME, this.onEnterFrame, this);
            this.mStartButton.removeEventListener(skylark.Event.TRIGGERED, this.onStartButtonTriggered, this);
            super.dispose();
        }

        private onEnterFrame(event:skylark.EnterFrameEvent):void {
            if (!this.mStarted) return;

            this.mElapsed += event.passedTime;
            this.mFrameCount++;

            if (this.mFrameCount % this.mWaitFrames == 0) {
                var fps:number = this.mWaitFrames / this.mElapsed;
                var targetFps:number = BenchmarkScene.sFps; //skylark.Skylark.current.nativeStage.frameRate;

                if (Math.ceil(fps) >= targetFps) {
                    this.mFailCount = 0;
                    this.addTestObjects();
                }
                else {
                    this.mFailCount++;

                    if (this.mFailCount > 20)
                        this.mWaitFrames = 5; // slow down creation process to be more exact
                    if (this.mFailCount > 30)
                        this.mWaitFrames = 10;
                    if (this.mFailCount == 40)
                        this.benchmarkComplete(); // target fps not reached for a while
                }

                this.mElapsed = this.mFrameCount = 0;
            }

            var numObjects:number = this.mContainer.numChildren;
            var passedTime:number = event.passedTime;

            for (var i:number = 0; i < numObjects; ++i)
                this.mContainer.getChildAt(i).rotation += Math.PI / 2 * passedTime;
        }

        private onStartButtonTriggered():void {
            console.log("Starting benchmark");

            this.mStartButton.visible = false;
            this.mStarted = true;
            this.mFailCount = 0;
            this.mWaitFrames = 2;
            this.mFrameCount = 0;

            if (this.mResultText) {
                this.mResultText.removeFromParent(true);
                this.mResultText = null;
            }

            this.addTestObjects();
        }

        private addTestObjects():void {
            var padding:number = 15;
            var numObjects:number = this.mFailCount > 20 ? 2 : 10;

            for (var i:number = 0; i < numObjects; ++i) {
                var egg:skylark.Image = new skylark.Image(Game.assets.getTexture("benchmark_object"));
                egg.x = padding + Math.random() * (Constants.GameWidth - 2 * padding);
                egg.y = padding + Math.random() * (Constants.GameHeight - 2 * padding);
                this.mContainer.addChild(egg);
            }
        }

        private benchmarkComplete():void {
            this.mStarted = false;
            this.mStartButton.visible = true;

            // todo [PORT]
            var fps:number = BenchmarkScene.sFps; //skylark.Skylark.current.nativeStage.frameRate;

            console.log("Benchmark complete!");
            console.log("FPS: " + fps);
            console.log("Number of objects: " + this.mContainer.numChildren);

            var resultString:string = skylark.StringUtil.format("Result:\n{0} objects\nwith {1} fps",
                this.mContainer.numChildren, fps);
            this.mResultText = new skylark.TextField(240, 200, resultString);
            this.mResultText.fontSize = 30;
            this.mResultText.x = Constants.CenterX - this.mResultText.width / 2;
            this.mResultText.y = Constants.CenterY - this.mResultText.height / 2;

            this.addChild(this.mResultText);

            this.mContainer.removeChildren();
            //System.pauseForGCIfCollectionImminent();
        }


    }
}
