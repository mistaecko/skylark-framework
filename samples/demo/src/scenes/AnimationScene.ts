/// <reference path="../Game.ts"/>

module demo {

    export class AnimationScene extends demo.Scene {

        private mStartButton:skylark.Button;
        private mDelayButton:skylark.Button;
        private mEgg:skylark.Image;
        private mTransitionLabel:skylark.TextField;
        private mTransitions:string[];

        constructor() {
            super();

            this.mTransitions = [skylark.Transitions.LINEAR, skylark.Transitions.EASE_IN_OUT,
                skylark.Transitions.EASE_OUT_BACK, skylark.Transitions.EASE_OUT_BOUNCE,
                skylark.Transitions.EASE_OUT_ELASTIC];

            var buttonTexture:skylark.Texture = Game.assets.getTexture("button_normal");

            // create a button that starts the tween
            this.mStartButton = new skylark.Button(buttonTexture, "Start animation");
            this.mStartButton.addEventListener(skylark.Event.TRIGGERED, this.onStartButtonTriggered, this);
            this.mStartButton.x = Constants.CenterX - Math.abs(this.mStartButton.width / 2);
            this.mStartButton.y = 20;
            this.addChild(this.mStartButton);

            // this button will show you how to call a method with a delay
            this.mDelayButton = new skylark.Button(buttonTexture, "Delayed call");
            this.mDelayButton.addEventListener(skylark.Event.TRIGGERED, this.onDelayButtonTriggered, this);
            this.mDelayButton.x = this.mStartButton.x;
            this.mDelayButton.y = this.mStartButton.y + 40;
            this.addChild(this.mDelayButton);

            // the skylark will be tweened
            this.mEgg = new skylark.Image(Game.assets.getTexture("starling_front"));
            this.addChild(this.mEgg);
            this.resetEgg();

            this.mTransitionLabel = new skylark.TextField(320, 30, "", "Verdana", 20, 0, true);
            this.mTransitionLabel.y = this.mDelayButton.y + 40;
            this.mTransitionLabel.alpha = 0.0; // invisible, will be shown later
            this.addChild(this.mTransitionLabel);
        }

        private resetEgg():void {
            this.mEgg.x = 20;
            this.mEgg.y = 100;
            this.mEgg.scaleX = this.mEgg.scaleY = 1.0;
            this.mEgg.rotation = 0.0;
        }

        private onStartButtonTriggered():void {
            this.mStartButton.enabled = false;
            this.resetEgg();

            // get next transition style from array and enqueue it at the end
            var transition:string = this.mTransitions.shift();
            this.mTransitions.push(transition);

            // to animate any numeric property of an arbitrary object (not just display objects!), 
            // you can create a 'Tween'. One tween object animates one target for a certain time, 
            // a with certain transition .
            var tween:skylark.Tween = new skylark.Tween(this.mEgg, 2.0, transition);

            // you can animate any <long><it>property /* IMPORTANT: AS3 returns NULL if type is not castable! */'s numeric (int, uint, Number). 
            // it is animated from it's current value to a target value.  
            tween.animate("rotation", skylark.MathUtil.deg2rad(90)); // conventional 'animate' call
            tween.moveTo(300, 360);                 // convenience method for animating 'x' and 'y'
            tween.scaleTo(0.5);                     // convenience method for 'scaleX' and 'scaleY'
            tween.onComplete = () => {
                this.mStartButton.enabled = true;
            };

            var juggler = skylark.Skylark.current.juggler;

            // the tween alone is useless -- for an animation to be carried out, it has to be 
            // advance once in every frame.            
            // This is done by the 'Juggler'. It receives the tween and will carry it out.
            // We use the default juggler here, but you can create your own jugglers, as well.            
            // That way, you can group animations into logical parts.  
            juggler.add(tween);

            // show which tweening is used
            this.mTransitionLabel.text = transition;
            this.mTransitionLabel.alpha = 1.0;

            var hideTween:skylark.Tween = new skylark.Tween(this.mTransitionLabel, 2.0, skylark.Transitions.EASE_IN);
            hideTween.animate("alpha", 0.0);
            juggler.add(hideTween);
        }

        private onDelayButtonTriggered():void {
            this.mDelayButton.enabled = false;

            // Using the juggler, you can delay a method call. This is especially useful when
            // you use your own juggler in a component of your game, because it gives you perfect 
            // control over the flow of time and animations. 

            var juggler = skylark.Skylark.current.juggler;
            juggler.delayCall(this.colorizeEgg, this, 1.0, true);
            juggler.delayCall(this.colorizeEgg, this, 2.0, false);
            juggler.delayCall(() => {
                this.mDelayButton.enabled = true;
            }, 2.0);
        }

        private colorizeEgg(colorize:boolean):void {
            this.mEgg.color = colorize ? skylark.Color.RED : skylark.Color.WHITE;
        }

        public dispose():void {
            this.mStartButton.removeEventListener(skylark.Event.TRIGGERED, this.onStartButtonTriggered, this);
            this.mDelayButton.removeEventListener(skylark.Event.TRIGGERED, this.onDelayButtonTriggered, this);
            super.dispose();
        }
    }
}
