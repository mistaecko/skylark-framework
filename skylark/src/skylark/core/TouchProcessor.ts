// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
/// <reference path="../../_dependencies.ts"/>

module skylark {

    /** @private
     *  The TouchProcessor is used internally to convert mouse and touch events of the conventional
     *  Flash stage to Skylark's TouchEvents. */
    export class TouchProcessor {
        private static MULTITAP_TIME:number = 0.3;
        private static MULTITAP_DISTANCE:number = 25;

        private _stage:Stage;
        private _elapsedTime:number;
        private _touchMarker:TouchMarker;
        private _trackMarkers:any;
        private _simulateMultitouch:boolean;
        private _trackMultitouch:boolean;

        private _currentTouches:Touch[]; //todo use Object instead - also see addTouch?
        private _queue:any[];
        private _lastTaps:Touch[];

        private _shiftDown:boolean = false;
        private _ctrlDown:boolean = false;

        /** Helper objects. */
        private static _processedTouchIDs:number[] = [];
        private static _hoveringTouchData:any[] = [];

        constructor(stage:Stage) {
            this._stage = stage;
            this._elapsedTime = 0.0;
            this._currentTouches = [];
            this._queue = [];
            this._lastTaps = [];

            this._stage.addEventListener(KeyboardEvent.KEY_DOWN, this.onKey, this);
            this._stage.addEventListener(KeyboardEvent.KEY_UP, this.onKey, this);
        }

        public dispose():void {
            this._stage.removeEventListener(KeyboardEvent.KEY_DOWN, this.onKey, this);
            this._stage.removeEventListener(KeyboardEvent.KEY_UP, this.onKey, this);
            if(this._touchMarker)
                this._touchMarker.dispose();
        }

        public advanceTime(passedTime:number):void {
            var i:number;
            var len:number;
            var touchID:number;
            var touch:Touch;
            var touchData:any;

            this._elapsedTime += passedTime;

            // remove old taps
            var taps = this._lastTaps;
            var elapsedTime = this._elapsedTime;
            len = taps.length;
            if(len > 0) {
                for(i = len - 1; i >= 0; --i)
                    if(elapsedTime - taps[i].timestamp > TouchProcessor.MULTITAP_TIME)
                        taps.splice(i, 1);
            }

            while(this._queue.length > 0) {
                TouchProcessor._processedTouchIDs.length = TouchProcessor._hoveringTouchData.length = 0;

                // set touches that were new or moving to phase 'stationary'
                var currentTouches = this._currentTouches;
                var len = currentTouches.length;
                for(i = 0, touch = currentTouches[i]; i < len; i++) {
                    if(touch.phase == TouchPhase.BEGAN || touch.phase == TouchPhase.MOVED)
                        touch.setPhase(TouchPhase.STATIONARY);
                }

                // process new touches, but each ID only once
                while(this._queue.length > 0 &&
                    TouchProcessor._processedTouchIDs.indexOf(this._queue[this._queue.length - 1][0]) == -1) {
                    var touchArgs:any[] = this._queue.pop();
                    touchID = touchArgs[0];
                    touch = this.getCurrentTouch(touchID);

                    // hovering touches need special handling (see below)
                    if(touch && touch.phase == TouchPhase.HOVER && touch.target)
                        TouchProcessor._hoveringTouchData.push({
                            touch: touch,
                            target: touch.target,
                            bubbleChain: touch.bubbleChain
                        });

                    this.processTouch.apply(this, touchArgs);
                    TouchProcessor._processedTouchIDs.push(touchID);
                }

                // the same touch event will be dispatched to all targets; 
                // the 'dispatch' method will make sure each bubble target is visited only once.
                var touchEvent:TouchEvent =
                    new TouchEvent(TouchEvent.TOUCH, this._currentTouches, this._shiftDown, this._ctrlDown);

                // if the target of a hovering touch changed, we dispatch the event to the previous
                // target to notify it that it's no longer being hovered over.
                var touchDataArr:any[] = TouchProcessor._hoveringTouchData;
                len = touchDataArr.length;
                for(i = 0, touchData = touchDataArr[i]; i < len; i++) {
                    if((</*IntelliJ*/any>touchData.touch).target != touchData.target)
                        touchEvent.dispatch(touchData.bubbleChain);
                }

                // dispatch events
                var ids:number[] = TouchProcessor._processedTouchIDs;
                for(i = 0; i < ids.length; i++) {
                    this.getCurrentTouch(ids[i]).dispatchEvent(touchEvent);
                }

                // remove ended touches
                var touches = this._currentTouches;
                for(i = touches.length - 1; i >= 0; --i)
                    if(touches[i].phase == TouchPhase.ENDED)
                        touches.splice(i, 1);
            }
        }

        public enqueue(touchID:number, phase:string, globalX:number, globalY:number, pressure:number = 1.0, width:number = 1.0, height:number = 1.0):void {
            this._queue.unshift(arguments);

            // multitouch simulation (only with mouse)
            if(this._ctrlDown && this.simulateMultitouch && touchID == 0) {
                this._touchMarker.moveMarker(globalX, globalY, this._shiftDown);
                this._queue.unshift(<any[]>[1, phase, this._touchMarker.mockX, this._touchMarker.mockY]);
            }
        }

        public enqueueMouseLeftStage():void {
            var mouse:Touch = this.getCurrentTouch(0);
            if(mouse == null || mouse.phase != TouchPhase.HOVER)
                return;

            // On OS X, we get mouse events from outside the stage; on Windows, we do not.
            // This method enqueues an artifial hover point that is just outside the stage.
            // That way, objects listening for HOVERs over them will get notified everywhere.

            var offset:number = 1;
            var exitX:number = mouse.globalX;
            var exitY:number = mouse.globalY;
            var distLeft:number = mouse.globalX;
            var distRight:number = this._stage.stageWidth - distLeft;
            var distTop:number = mouse.globalY;
            var distBottom:number = this._stage.stageHeight - distTop;
            var minDist:number = Math.min(distLeft, distRight, distTop, distBottom);

            // the new hover point should be just outside the stage, near the point where
            // the mouse point was last to be seen.

            if(minDist == distLeft)
                exitX = -offset;
            else if(minDist == distRight)
                exitX = this._stage.stageWidth + offset;
            else if(minDist == distTop)
                exitY = -offset;
            else
                exitY = this._stage.stageHeight + offset;

            this.enqueue(0, TouchPhase.HOVER, exitX, exitY);
        }

        private processTouch(touchID:number, phase:string, globalX:number, globalY:number, pressure:number = 1.0, width:number = 1.0, height:number = 1.0):void {
            var position:Point = new Point(globalX, globalY);
            var touch:Touch = this.getCurrentTouch(touchID);

            if(touch == null) {
                touch = new Touch(touchID, globalX, globalY, phase, null);
                this.addCurrentTouch(touch);
            }

            touch.setPosition(globalX, globalY);
            touch.setPhase(phase);
            touch.setTimestamp(this._elapsedTime);
            touch.setPressure(pressure);
            touch.setSize(width, height);

            if(phase == TouchPhase.HOVER || phase == TouchPhase.BEGAN)
                touch.setTarget(this._stage.hitTest(position, true));

            if(phase == TouchPhase.BEGAN)
                this.processTap(touch);
        }

        private onKey(event:KeyboardEvent):void {
            if(event.keyCode == 17 || event.keyCode == 15) // ctrl or cmd key
            {
                var wasCtrlDown:boolean = this._ctrlDown;
                this._ctrlDown = event.type == KeyboardEvent.KEY_DOWN;

                if(this.simulateMultitouch && wasCtrlDown != this._ctrlDown) {
                    this._touchMarker.visible = this._ctrlDown;
                    this._touchMarker.moveCenter(this._stage.stageWidth / 2, this._stage.stageHeight / 2);

                    var mouseTouch:Touch = this.getCurrentTouch(0);
                    var mockedTouch:Touch = this.getCurrentTouch(1);

                    if(mouseTouch)
                        this._touchMarker.moveMarker(mouseTouch.globalX, mouseTouch.globalY);

                    // end active touch ...
                    if(wasCtrlDown && mockedTouch && mockedTouch.phase != TouchPhase.ENDED) {
                        this._queue.unshift(<any[]>[1, TouchPhase.ENDED, mockedTouch.globalX, mockedTouch.globalY]);
                    // ... or start new one
                    } else if(this._ctrlDown && mouseTouch) {
                        if(mouseTouch.phase == TouchPhase.HOVER || mouseTouch.phase == TouchPhase.ENDED)
                            this._queue.unshift(<any[]>[1, TouchPhase.HOVER, this._touchMarker.mockX, this._touchMarker.mockY]);
                        else
                            this._queue.unshift(<any[]>[1, TouchPhase.BEGAN, this._touchMarker.mockX, this._touchMarker.mockY]);
                    }
                }
            }
            else if(event.keyCode == 16) { // shift key
                this._shiftDown = event.type == KeyboardEvent.KEY_DOWN;
            }
        }

        private processTap(touch:Touch):void {
            var nearbyTap:Touch = null;
            var minSqDist:number = TouchProcessor.MULTITAP_DISTANCE * TouchProcessor.MULTITAP_DISTANCE;

            var taps = this._lastTaps;
            var len = taps.length;
            var i:number;
            var tap:Touch;
            for(i = 0, tap = taps[i]; i < len; i++) {
                var sqDist:number = Math.pow(tap.globalX - touch.globalX, 2) +
                    Math.pow(tap.globalY - touch.globalY, 2);
                if(sqDist <= minSqDist) {
                    nearbyTap = tap;
                    break;
                }
            }

            if(nearbyTap) {
                touch.setTapCount(nearbyTap.tapCount + 1);
                this._lastTaps.splice(this._lastTaps.indexOf(nearbyTap), 1);
            }
            else {
                touch.setTapCount(1);
            }

            this._lastTaps.push(touch.clone());
        }

        private addCurrentTouch(touch:Touch):void {
            var currentTouches = this._currentTouches;

            for(var i:number = currentTouches.length - 1; i >= 0; --i) {
                if(currentTouches[i].id == touch.id)
                    currentTouches.splice(i, 1);
            }
            currentTouches.push(touch);
        }

        private getCurrentTouch(touchID:number):Touch {
            var touches = this._currentTouches;
            var len = touches.length;
            for(var i = 0, touch; i < len; i++) {
                touch = touches[i];
                if(touch.id == touchID)
                    return touch;
            }
            return null;
        }

        public enableTouchMarker(enable:boolean = true) {
            var touchMarker = this._touchMarker;
            if(enable && touchMarker == null) {
                touchMarker = new TouchMarker();
                this._touchMarker = touchMarker;
                touchMarker.visible = false;
                this._stage.addChild(<DisplayObject>touchMarker);

            } else if(!enable && touchMarker != null) {
                touchMarker.removeFromParent(true);
                this._touchMarker = null;
            }
        }

        public enableTrackMarkers(enable:boolean = true) {
            var stage = this._stage;
            if(enable) {
                this._trackMarkers = {
                    pool: [],
                    active: {},
                    createMarker: function() {
                        return new TrackMarker();
                    },
                    fromPool: function() {
                        var pool = this.pool;
                        var marker:TrackMarker;
                        if(pool.length > 0) {
                            marker = <TrackMarker>pool.pop();
                        } else {
                            marker = this.createMarker();
                            marker.visible = false;
                            stage.addChild(marker);
                        }
                        return marker;
                    },
                    toPool: function(marker:TrackMarker) {
                        var pool = this.pool;
                        marker.visible = false;
                        pool.push(marker);
                    },
                    update: function(touch:Touch) {
                        var touchId = touch.id;
                        var phase = touch.phase;
                        var marker = this.active[touchId];
                        if(marker == null) {
                            marker = this.fromPool();
                            this.active[touchId] = marker;
                        }

                        marker.moveMarker(touch.globalX, touch.globalY);

                        if(phase === TouchPhase.BEGAN) {
                            marker.visible = true;
                        } else if(phase === TouchPhase.ENDED) {
                            this.active[touchId] = null;
                            this.toPool(marker);
                        }
                    },
                    dispose: function() {
                        var active = this.active;
                        for(var key in active) {
                            active[key].dispose();
                            active[key] = null;
                        }
                        var pool = this.pool;
                        for(var i = 0; i < pool.length; i++) {
                            var marker = pool[i];
                            marker.dispose;
                        }
                        pool.length = 0
                    }
                };
            } else if(this._trackMarkers != null) {
                this._trackMarkers.dispose();
                this._trackMarkers = null;
            }
        }

        public get simulateMultitouch():boolean {
            return this._simulateMultitouch;
        }

        public set simulateMultitouch(enable:boolean) {
            if(this.simulateMultitouch !== enable) {
                this.enableTouchMarker(enable);
                this._simulateMultitouch = enable;
            }
        }

        public get trackMultitouch():boolean {
            return this._trackMultitouch;
        }

        public set trackMultitouch(enable:boolean) {
            if(this.trackMultitouch !== enable) {
                this.enableTrackMarkers(enable);
                var stage = this._stage;
                if(enable)
                    stage.addEventListener(TouchEvent.TOUCH, this.updateTouchMarker, this);
                else
                    stage.removeEventListener(TouchEvent.TOUCH, this.updateTouchMarker, this);

                this._trackMultitouch = enable;
            }
        }

        private updateTouchMarker(event:TouchEvent) {
            var touches = event.data;
            for(var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                this._trackMarkers.update(touch);
            }
        }
    }
}
