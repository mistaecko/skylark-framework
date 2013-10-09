/// <reference path="../Game.ts"/>

module demo {
    
    export class RoundButton extends skylark.Button {
        constructor(upState:skylark.Texture, text:string = "", downState:skylark.Texture = null) {
            super(upState, text, downState);
        }

        public hitTest(localPoint:skylark.Point, forTouch:boolean = false):skylark.DisplayObject {
            // When the user touches the screen, this method is used to find out if an object was 
            // hit. By default, this method uses the bounding box, but by overriding it, 
            // we can change the box (rectangle) to a circle (or whatever necessary).

            // when the hit test is done to check if a touch is hitting the object, invisible or
            // untouchable objects must cause the hit test to fail.
            if (forTouch && (!this.visible || !this.touchable))
                return null;

            // get center of button
            var bounds:skylark.Rectangle = this.bounds;
            var centerX:number = bounds.width / 2;
            var centerY:number = bounds.height / 2;

            // calculate distance of localPoint to center. 
            // we keep it squared, since we want to avoid the 'sqrt()'-call.
            var sqDist:number = Math.pow(localPoint.x - centerX, 2) +
                Math.pow(localPoint.y - centerY, 2);

            // when the squared distance is smaller than the squared radius, 
            // the point is inside the circle
            var radius:number = bounds.width / 2 - 8;
            if (sqDist < Math.pow(radius, 2))
                return this;
            else
                return null;
        }
    }
}