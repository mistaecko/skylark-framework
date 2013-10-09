/// <reference path="../../_dependencies.ts"/>

module skylark/*.display*/ {
    export class DisplayObjectContainer extends DisplayObject {
        // members

        private _children:DisplayObject[];

        /** Helper objects. */
        private static _helperMatrix:Matrix = new Matrix();
        private static _helperPoint:Point = new Point();
        private static _broadcastListeners:DisplayObject[] = [/*DisplayObject*/];

        // construction

        /** @private */
        constructor() {
            super();
//            throw new AbstractClassError();

            this._children = []; /*DisplayObject*/
        }

        /** Disposes the resources of all children. */
        public dispose():void {
            for (var i:number = this._children.length - 1; i >= 0; --i)
                this._children[i].dispose();

            super.dispose();
        }

        // child management

        /** Adds a child to the container. It will be at the frontmost position. */
        public addChild(child:DisplayObject):DisplayObject {
            this.addChildAt(child, this.numChildren);
            return child;
        }

        /** Adds a child to the container at a certain index. */
        public addChildAt(child:DisplayObject, index:number):DisplayObject {
            var numChildren:number = this._children.length;

            if (index >= 0 && index <= numChildren) {
                child.removeFromParent();

                // 'splice' creates a temporary object, so we avoid it if it's not necessary
                if (index == numChildren)
                    this._children.push(child);
                else
                    this._children.splice(index, 0, child);

                child.setParent(this);
                child.dispatchEventWith(Event.ADDED, true);

                if (this.stage) {
                    var container:DisplayObjectContainer = <DisplayObjectContainer>child;
                    if(child instanceof DisplayObjectContainer) {
                        (<DisplayObjectContainer>container).broadcastEventWith(Event.ADDED_TO_STAGE);
                    } else {
                        child.dispatchEventWith(Event.ADDED_TO_STAGE);
                    }
                }

                return child;
            }
            else {
                throw new RangeError("Invalid child index");
            }
        }

        /** Removes a child from the container. If the object is not a child, nothing happens.
         *  If requested, the child will be disposed right away. */
        public removeChild(child:DisplayObject, dispose:boolean = false):DisplayObject {
            var childIndex:number = this.getChildIndex(child);
            if (childIndex != -1) this.removeChildAt(childIndex, dispose);
            return child;
        }

        /** Removes a child at a certain index. Children above the child will move down. If
         *  requested, the child will be disposed right away. */
        public removeChildAt(index:number, dispose:boolean = false):DisplayObject {
            if (index >= 0 && index < this.numChildren) {
                var child:DisplayObject = this._children[index];
                child.dispatchEventWith(Event.REMOVED, true);

                if (this.stage) {
                    var container:DisplayObjectContainer = <DisplayObjectContainer>child;
                    if(child instanceof DisplayObjectContainer) {
                        (<DisplayObjectContainer>container).broadcastEventWith(Event.REMOVED_FROM_STAGE);
                    } else {
                        child.dispatchEventWith(Event.REMOVED_FROM_STAGE);
                    }
                }

                child.setParent(null);
                index = this._children.indexOf(child); // index might have changed by event handler
                if (index >= 0) this._children.splice(index, 1);
                if (dispose) child.dispose();

                return child;
            }
            else {
                throw new RangeError("Invalid child index");
            }
        }

        /** Removes a range of children from the container (endIndex included).
         *  If no arguments are given, all children will be removed. */
        public removeChildren(beginIndex:number = 0, endIndex:number = -1, dispose:boolean = false):void {
            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;

            for (var i:number = beginIndex; i <= endIndex; ++i)
                this.removeChildAt(beginIndex, dispose);
        }

        /** Returns a child object at a certain index. */
        public getChildAt(index:number):DisplayObject {
            if (index >= 0 && index < this.numChildren)
                return this._children[index];
            else
                throw new RangeError("Invalid child index");
        }

        /** Returns a child object with a certain name (non-recursively). */
        public getChildByName(name:string):DisplayObject {
            var numChildren:number = this._children.length;
            for (var i:number = 0; i < numChildren; ++i)
                if (this._children[i].name == name) return this._children[i];

            return null;
        }

        /** Returns the index of a child within the container, or "-1" if it is not found. */
        public getChildIndex(child:DisplayObject):number {
            return this._children.indexOf(child);
        }

        /** Moves a child to a certain index. Children at and after the replaced position move up.*/
        public setChildIndex(child:DisplayObject, index:number):void {
            var oldIndex:number = this.getChildIndex(child);
            if (oldIndex == -1) throw new ArgumentError("Not a child of this container");
            this._children.splice(oldIndex, 1);
            this._children.splice(index, 0, child);
        }

        /** Swaps the indexes of two children. */
        public swapChildren(child1:DisplayObject, child2:DisplayObject):void {
            var index1:number = this.getChildIndex(child1);
            var index2:number = this.getChildIndex(child2);
            if (index1 == -1 || index2 == -1) throw new ArgumentError("Not a child of this container");
            this.swapChildrenAt(index1, index2);
        }

        /** Swaps the indexes of two children. */
        public swapChildrenAt(index1:number, index2:number):void {
            var child1:DisplayObject = this.getChildAt(index1);
            var child2:DisplayObject = this.getChildAt(index2);
            this._children[index1] = child2;
            this._children[index2] = child1;
        }

        /** Sorts the children according to a given function (that works just like the sort function
         *  of the Vector class). */
        public sortChildren(compareFunction:(a: DisplayObject, b: DisplayObject) => number):void {
            this._children.sort(compareFunction);
        }

        /** Determines if a certain object is a child of the container (recursively). */
        public contains(child:DisplayObject):boolean {
            while (child) {
                if (child == this)
                    return true;
                else
                    child = child.parent;
            }
            return false;
        }

        /** @inheritDoc */
        public getBounds(targetSpace:DisplayObject, resultRect:Rectangle = null):Rectangle {
            if (resultRect == null) resultRect = new Rectangle();
            //[PORT] IMPORTANT - verify this fix
            //if (targetSpace == null) targetSpace = this;

            var numChildren:number = this._children.length;

            if (numChildren == 0) {
                this.getTransformationMatrix(targetSpace, DisplayObjectContainer._helperMatrix);
                MatrixUtil.transformCoords(DisplayObjectContainer._helperMatrix, 0.0, 0.0, DisplayObjectContainer._helperPoint);
                resultRect.setTo(DisplayObjectContainer._helperPoint.x, DisplayObjectContainer._helperPoint.y, 0, 0);
                return resultRect;
            }
            else if (numChildren == 1) {
                return this._children[0].getBounds(targetSpace, resultRect);
            }
            else {
                var minX:number = Number.MAX_VALUE, maxX:number = -Number.MAX_VALUE;
                var minY:number = Number.MAX_VALUE, maxY:number = -Number.MAX_VALUE;

                for (var i:number = 0; i < numChildren; ++i) {
                    this._children[i].getBounds(targetSpace, resultRect);
                    minX = minX < resultRect.x ? minX : resultRect.x;
                    maxX = maxX > resultRect.right ? maxX : resultRect.right;
                    minY = minY < resultRect.y ? minY : resultRect.y;
                    maxY = maxY > resultRect.bottom ? maxY : resultRect.bottom;
                }

                resultRect.setTo(minX, minY, maxX - minX, maxY - minY);
                return resultRect;
            }
        }

        /** @inheritDoc */
        public hitTest(localPoint:Point, forTouch:boolean = false):DisplayObject {
            if (forTouch && (!this.visible || !this.touchable))
                return null;

            var localX:number = localPoint.x;
            var localY:number = localPoint.y;

            var numChildren:number = this._children.length;
            for (var i:number = numChildren - 1; i >= 0; --i) { // front to back!
                var child:DisplayObject = this._children[i];
                this.getTransformationMatrix(child, DisplayObjectContainer._helperMatrix);

                MatrixUtil.transformCoords(DisplayObjectContainer._helperMatrix, localX, localY, DisplayObjectContainer._helperPoint);
                var target:DisplayObject = child.hitTest(DisplayObjectContainer._helperPoint, forTouch);

                if (target)
                    return target;
            }

            return null;
        }

        /** @inheritDoc */
        public render(support:RenderSupport):void {
            var alpha:number = this.alpha;
            var numChildren:number = this._children.length;
            var blendMode:string = support.blendMode;

            for (var i:number = 0; i < numChildren; ++i) {
                var child:DisplayObject = this._children[i];

                if (child.hasVisibleArea) {
                    support.pushState();
                    support.transformMatrix(child);
                    support.blendMode = child.blendMode;
                    support.alpha = child.alpha;

                    child.render(support);

                    // todo P2 why treat blendMode independent of state?
                    support.blendMode = blendMode;
                    support.popState();
                }
            }
        }

        /** Dispatches an event on all children (recursively). The event must not bubble. */
        public broadcastEvent(event:Event):void {
            if (event.bubbles)
                throw new ArgumentError("Broadcast of bubbling events is prohibited");

            // The event listeners might modify the display tree, which could make the loop crash.
            // Thus, we collect them in a list and iterate over that list instead.
            // And since another listener could call this method internally, we have to take
            // care that the static helper vector does not get currupted.

            var _broadcastListeners = DisplayObjectContainer._broadcastListeners;

            var fromIndex:number = DisplayObjectContainer._broadcastListeners.length;
            this.getChildEventListeners(this, event.type, DisplayObjectContainer._broadcastListeners);
            var toIndex:number = DisplayObjectContainer._broadcastListeners.length;

            for (var i:number = fromIndex; i < toIndex; ++i)
                DisplayObjectContainer._broadcastListeners[i].dispatchEvent(event);

            DisplayObjectContainer._broadcastListeners.length = fromIndex;
        }

        /** Dispatches an event with the given parameters on all children (recursively).
         *  The method uses an internal pool of event objects to avoid allocations. */
        public broadcastEventWith(type:string, data:Object = null):void {
            var event:Event = Event.fromPool(type, false, data);
            this.broadcastEvent(event);
            Event.toPool(event);
        }

        private getChildEventListeners(object:DisplayObject, eventType:string, listeners:DisplayObject[]):void {
            var container:DisplayObjectContainer = <DisplayObjectContainer>object;

            if (object.hasEventListener(eventType))
                listeners.push(object);

            if (container && container._children) {
                var children:DisplayObject[] = container._children;
                var numChildren:number = children.length;

                for (var i:number = 0; i < numChildren; ++i)
                    this.getChildEventListeners(children[i], eventType, listeners);
            }
        }

        /** The number of children of this container. */
        public get numChildren():number {
            return this._children.length;
        }
    }
}
