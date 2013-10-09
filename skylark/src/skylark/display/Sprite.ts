/// <reference path="../../_dependencies.ts"/>

module skylark {

    export class Sprite extends DisplayObjectContainer {
        private _flattenedContents:any[];
        private _flattenRequested:boolean;

        constructor() {
            super();
        }

        /** @inheritDoc */
        public dispose():void {
            this.disposeFlattenedContents();
            super.dispose();
        }

        private disposeFlattenedContents():void {
            var _flattenedContents = this._flattenedContents;

            if(this._flattenedContents) {
                for(var i:number = 0, max:number = this._flattenedContents.length; i < max; ++i)
                    this._flattenedContents[i].dispose();

                this._flattenedContents = null;
            }
        }

        /** Optimizes the sprite for optimal rendering performance. Changes in the
         *  children of a flattened sprite will not be displayed any longer. For this to happen,
         *  either call <code>flatten</code> again, or <code>unflatten</code> the sprite.
         *  Beware that the actual flattening will not happen right away, but right before the
         *  next rendering. */
        public flatten():void {
            this._flattenRequested = true;
            this.broadcastEventWith(Event.FLATTEN);
        }

        /** Removes the rendering optimizations that were created when flattening the sprite.
         *  Changes to the sprite's children will immediately become visible again. */
        public unflatten():void {
            this._flattenRequested = false;
            this.disposeFlattenedContents();
        }

        /** Indicates if the sprite was flattened. */
        public get isFlattened():boolean {
            return (this._flattenedContents != null) || this._flattenRequested;
        }
    }
}
