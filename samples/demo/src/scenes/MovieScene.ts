/// <reference path="../Game.ts"/>

module demo {

    export class MovieScene extends Scene {
        private mMovie:skylark.MovieClip;

        constructor() {
            super();
            var frames:skylark.Texture[] = Game.assets.getTextures("flight");
            this.mMovie = new skylark.MovieClip(frames, 15);

            // add sounds
            var stepSound:Sound = Game.assets.getSound("wing_flap");
            this.mMovie.setFrameSound(2, stepSound);

            // move the clip to the center and add it to the stage
            this.mMovie.x = Constants.CenterX - Math.abs(this.mMovie.width / 2);
            this.mMovie.y = Constants.CenterY - Math.abs(this.mMovie.height / 2);
            this.addChild(this.mMovie);

            // like any animation, the movie needs to be added to the juggler!
            // this is the recommended way to do that.
            this.addEventListener(skylark.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
            this.addEventListener(skylark.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
        }

        private onAddedToStage():void {
            skylark.Skylark.current.juggler.add(this.mMovie);
        }

        private onRemovedFromStage():void {
            skylark.Skylark.current.juggler.remove(this.mMovie);
        }

        public dispose():void {
            this.removeEventListener(skylark.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
            this.removeEventListener(skylark.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
            super.dispose();
        }
    }
}
