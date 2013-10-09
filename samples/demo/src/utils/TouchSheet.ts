/// <reference path="../Game.ts"/>

module demo {
    
    export class TouchSheet extends skylark.Sprite {
        constructor(contents:skylark.DisplayObject = null) {
            super();
            this.addEventListener(skylark.TouchEvent.TOUCH, this.handleTouch, this);
            this.useHandCursor = true;

            if (contents) {
                contents.x = Math.abs(contents.width / -2);
                contents.y = Math.abs(contents.height / -2);
                this.addChild(contents);
            }
        }

        private handleTouch(event:skylark.TouchEvent):void {
            var touches:skylark.Touch[] = event.getTouches(this, skylark.TouchPhase.MOVED);

            if (touches.length == 1) {
                // one finger touching -> move
                var delta:skylark.Point = touches[0].getMovement(this.parent);
                this.x += delta.x;
                this.y += delta.y;
            }
            else if (touches.length == 2) {
                // two fingers touching -> rotate and scale
                var touchA:skylark.Touch = touches[0];
                var touchB:skylark.Touch = touches[1];

                var parent = this.parent;
                var currentPosA:skylark.Point = touchA.getLocation(parent);
                var previousPosA:skylark.Point = touchA.getPreviousLocation(parent);
                var currentPosB:skylark.Point = touchB.getLocation(parent);
                var previousPosB:skylark.Point = touchB.getPreviousLocation(parent);

                var currentVector:skylark.Point = currentPosA.subtract(currentPosB);
                var previousVector:skylark.Point = previousPosA.subtract(previousPosB);

                var currentAngle:number = Math.atan2(currentVector.y, currentVector.x);
                var previousAngle:number = Math.atan2(previousVector.y, previousVector.x);
                var deltaAngle:number = currentAngle - previousAngle;

                // update pivot point based on previous center
                var previousLocalA:skylark.Point = touchA.getPreviousLocation(this);
                var previousLocalB:skylark.Point = touchB.getPreviousLocation(this);
                this.pivotX = (previousLocalA.x + previousLocalB.x) * 0.5;
                this.pivotY = (previousLocalA.y + previousLocalB.y) * 0.5;

                // update location based on the current center
                this.x = (currentPosA.x + currentPosB.x) * 0.5;
                this.y = (currentPosA.y + currentPosB.y) * 0.5;

                // rotate
                this.rotation += deltaAngle;

                // scale
                var sizeDiff:number = currentVector.length / previousVector.length;
                this.scaleX *= sizeDiff;
                this.scaleY *= sizeDiff;
            }

            var touch:skylark.Touch = event.getTouch(this, skylark.TouchPhase.ENDED);

            if (touch && touch.tapCount == 2)
                this.parent.addChild(this); // bring self to front

            // enable this code to see when you're hovering over the object
            // touch = event.getTouch(this, skylark.TouchPhase.HOVER);            
            // alpha = touch ? 0.8 : 1.0;
        }

        public dispose():void {
            this.removeEventListener(skylark.TouchEvent.TOUCH, this.handleTouch, this);
            super.dispose();
        }
    }
}