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

    export interface StageConfig {
        backgroundColor?:any;
        width?:number;
        height?:number;
    }

    export class Skylark extends EventDispatcher {

        private static _current:Skylark;
        private static _count:number = 0;

        private static _serviceFactory:ServiceFactory = new ServiceFactory();

        private static _configured:boolean;
        private static _buffered:boolean = false;

        private static _multitouchEnabled:boolean = false;

        private static _helperCanvas:HTMLCanvasElement;

        private _canvas:HTMLCanvasElement;
        private _bufferCanvas:HTMLCanvasElement;

        private _context:CanvasRenderingContext2D;
        private _buffer:CanvasRenderingContext2D;

        private static _stageDefaults:StageConfig = {
            backgroundColor: null,
            width: 400,
            height: 300
        };

        private _bufferedRender:boolean = false;

        // handle returned by requestAnimationFrame
        private _afHandle:number;

        private _stage:Stage;
        private _rootClass:any;
        private _root:DisplayObject;
        private _juggler:Juggler;
        private _started:boolean;
        private _support:RenderSupport;
        private _touchProcessor:TouchProcessor;
        private _simulateMultitouch:boolean;
        private _lastFrameTimestamp:number;
        private _leftMouseDown:boolean;
        private _shareContext:boolean = false;

        private _viewPort:Rectangle;
        private _previousViewPort:Rectangle;

        private _canvasProvider:CanvasProvider;

        private $onKey:any;
        private $onResize:any;
        private $onMouseLeave:any;
        private $onTouch:any;
        private $onEnterFrame:any;

        public static get buffered():boolean {
            return Skylark._buffered;
        }

        public static set buffered(value:boolean) {
            Skylark._buffered = value;
        }

        /**
         * Default configuration for the Stage canvas. Only apply if
         * the stage is auto-created. Currently only `width` and `height`
         * are supported. In case you want more flexibility, create your
         * HTMLCanvasElement manually and pass the `id` to the Skylark
         * constructor.
         */
        public static get stageDefaults():StageConfig {
            return Skylark._stageDefaults;
        }

        public static set stageDefaults(config:StageConfig) {
            var defaults = Skylark._stageDefaults;
            if(typeof config.width !== 'undefined')
                defaults.width = config.width;
            if(typeof config.height !== 'undefined')
                defaults.height = config.height;
            if(typeof config.backgroundColor !== 'undefined')
                defaults.backgroundColor = config.backgroundColor;
        }

        public static create(root:DisplayObject, elementId?:string);

        public static create(rootClass:new() => DisplayObject, elementId?:string);

        public static create(rootClass:any, elementId?:string) {
            return new Skylark(rootClass, elementId);
        }

        public static onReady(fn:(Skylark?:typeof Skylark)=>any) {
            var readyState = document.readyState;
            if(readyState == "complete" || readyState == "interactive") {
                fn(this);
            } else {
                var onReady:()=>any = (function(){
                    return function listener() {
                        document.removeEventListener("DOMContentLoaded", listener, false);
                        fn(this);
                    }
                })();
                document.addEventListener("DOMContentLoaded", onReady, false);
            }
        }

        constructor(rootClass:DisplayObject, id?:string/* = 'stage'*/, viewPort?:Rectangle/* = null*/);

        constructor(rootClass:new() => DisplayObject, id?:string/* = 'stage'*/, viewPort?:Rectangle/* = null*/);

        constructor(rootClass:any, id:string = 'stage', viewPort:Rectangle = null) {
            super();

            if(id == null) //  note: TypeScript only checks for undefined
                id = 'stage';
            if(rootClass == null)
                throw new ArgumentError("Root class must not be null");

            this.initializeCanvasProvider();
            var canvas = this.initializeCanvas(id);
            var color = this._canvasProvider.getBackgroundColor(canvas);
            if(viewPort == null)
                viewPort = new Rectangle(0, 0, canvas.width, canvas.height);

            // enable buffered rendering via offscreen canvas
            this.buffered = Skylark._buffered;
            if(this.buffered)
                this.initializeBufferCanvas();

            this.makeCurrent();

            if(typeof rootClass === 'object') {
                this._root = rootClass;
                this._rootClass = rootClass.constructor;
            } else
                this._rootClass = rootClass;

            this._viewPort = viewPort;
            this._previousViewPort = new Rectangle();

            if(viewPort.width === 0 && viewPort.height === 0)
                throw new ArgumentError('Cannot create Skylark instance without width and height');

            this._stage = new Stage(viewPort.width, viewPort.height, color);
            this._touchProcessor = new TouchProcessor(this._stage);
            this._juggler = new Juggler();
            //this._antiAliasing = 0;
            this._simulateMultitouch = false;
            //this._enableErrorChecking = false;
            this._lastFrameTimestamp = this.getTimer() / 1000.0;
            this._support = new RenderSupport();

            this.updateViewPort();
            this.initializeRoot();

            // register touch/mouse event handlers for native events
            var eventTypes:string[] = this.touchEventTypes;
            var i = eventTypes.length;
            var touchEventType:string;
            this.$onTouch = this.onTouch.bind(this);
            while(i-- > -1)
                canvas.addEventListener(eventTypes[i], this.$onTouch, false);

            // register other event handlers
            // // note: for now we handle the enter frame event in Skylark#start
            //canvas.addEventListener(Event.ENTER_FRAME, this.onEnterFrame, false, 0, true);
            this.$onKey = this.onKey.bind(this);
            this.$onResize = this.onResize.bind(this);
            this.$onMouseLeave = this.onMouseLeave.bind(this);

            canvas.addEventListener('keydown', this.$onKey, false);
            canvas.addEventListener('keyup', this.$onKey, false);
            canvas.addEventListener('resize', this.$onResize, false);
            canvas.addEventListener('mouseleave', this.$onMouseLeave, false);

            this._touchProcessor.simulateMultitouch = this._simulateMultitouch;
            this._lastFrameTimestamp = this.getTimer() / 1000.0;

            Skylark._count++;
        }

        /**
         * Initialize the canvas element that this Skylark instance will work with. If 'id' is the id
         * of an existing CANVAS element in the DOM, this CANVAS element will be used. If 'id' is a yet
         * unassigned DOM id, a new CANVAS element with that id will be created and appended to the document BODY.
         */
        public initializeCanvas(id:string):HTMLCanvasElement {
            var canvasProvider = this._canvasProvider;
            var canvas:HTMLCanvasElement = <HTMLCanvasElement>canvasProvider.getCanvasById(id);
            if(canvas == null) {
                var defaults = Skylark._stageDefaults;
                canvas = canvasProvider.createCanvas(id, defaults.width, defaults.height);
                if(defaults.backgroundColor != null)
                    canvas.style.backgroundColor = Color.toHexString(defaults.backgroundColor);
            } else {
                // update canvas coordinate system to match configured width/height
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }

            (<any>canvas).setAttribute('tabIndex', <any>0);
            (<any>canvas).focus();

            this._canvas = canvas;
            this._context = canvas.getContext('2d');

            return canvas;
        }

        /**
         * Create the offscreen canvas that we will be drawing into before flushing the final frame out
         * to the onscreen canvas.
         */
        public initializeBufferCanvas():HTMLCanvasElement {
            var canvasProvider = this._canvasProvider;
            var canvas:HTMLCanvasElement;
            var onscreenCanvas:HTMLCanvasElement = this._canvas;

            canvas = canvasProvider.createCanvasWith((canvas)=> {
                canvas.style.cssText = 'position:absolute; top:-10000px; left:-10000px';
                canvas.id = onscreenCanvas.id + '-buffer';
                canvas.width = onscreenCanvas.width;
                canvas.height = onscreenCanvas.height;
            });

            this._bufferCanvas = canvas;
            this._buffer = canvas.getContext('2d');

            return canvas;
        }

        private initializeCanvasProvider():void {
            this._canvasProvider = Skylark._serviceFactory.get('canvasProvider');
        }

        private initializeRoot():void {
            var cls = this._rootClass;
            if(this._root == null) {
                this._root = <DisplayObject>new cls();
            }
            if(!(this._root instanceof DisplayObject))
                throw new Error('Root object is not of type "DisplayObject": ' + ClassUtil.getQualifiedClassName(this._root));

            this._stage.addChildAt(this._root, 0);

            this.dispatchEventWith(Event.ROOT_CREATED, false, this._root);
        }

        private updateViewPort(updateAliasing:boolean = false):void {
            // the last set viewport is stored in a variable; that way, people can modify the
            // viewPort directly (without a copy) and we still know if it has changed.

            var modified:boolean = false;
            if(updateAliasing || (modified = this._previousViewPort.width != this._viewPort.width ||
                this._previousViewPort.height != this._viewPort.height ||
                this._previousViewPort.x != this._viewPort.x || this._previousViewPort.y != this._viewPort.y)) {
                this._previousViewPort.setTo(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height);

                // removed backBuffer management until WebGL support is reintroduced
            }
        }

        /** Calls <code>advanceTime()</code> (with the time that has passed since the last frame)
         *  and <code>render()</code>. */
        public nextFrame():void {
            var now:number = this.getTimer() / 1000.0;
            var passedTime:number = now - this._lastFrameTimestamp;
            this._lastFrameTimestamp = now;

            this.advanceTime(passedTime);
            this.render();
        }

        /** Dispatches ENTER_FRAME events on the display list, advances the Juggler
         *  and processes touches. */
        public advanceTime(passedTime:number):void {
            this.makeCurrent();

            this._touchProcessor.advanceTime(passedTime);
            this._stage.advanceTime(passedTime);
            this._juggler.advanceTime(passedTime);
        }

        /** Renders the complete display list. Before rendering, the context is cleared; afterwards,
         *  it is presented. This can be avoided by enabling <code>shareContext</code>.*/
        public render():void {
            var support = this._support;
            var stage = this._stage;
            var viewPort = this._viewPort;

            this.makeCurrent();

            support.context = this.context;

            this.updateViewPort();
            support.nextFrame();

            if(!this._shareContext)
                support.clear(stage.color, stage.alpha);

            var scaleX:number = viewPort.width / stage.stageWidth;
            var scaleY:number = viewPort.height / stage.stageHeight;

            support.setOrthographicProjection(
                viewPort.x < 0 ? -viewPort.x / scaleX : 0.0,
                viewPort.y < 0 ? -viewPort.y / scaleY : 0.0,
                viewPort.width / scaleX,
                viewPort.height / scaleY);

            stage.render(support);

            if(this._bufferedRender)
                this.flushBuffer();
        }

        public flushBuffer():void {
            var onscreen:CanvasRenderingContext2D = this._context;
            // if we render a background color to the buffer, we could save the clear call
            onscreen.clearRect(0, 0, this._canvas.width, this._canvas.height);
            onscreen.drawImage(this._bufferCanvas, 0, 0);
        }

        /** Make this Skylark instance the <code>current</code> one. */
        public makeCurrent():Skylark {
            Skylark.current = this;
            return this;
        }

        /** As <Skylark>soon is started, it will queue input events (keyboard/mouse/touch);
         *  furthermore, the method <code>nextFrame</code> will be called once per Flash Player
         *  frame. (Except when <code>shareContext</code> is enabled: in that case, you have to
         *  call that method manually.) */
        public start():Skylark {
            this._started = true;
            this._lastFrameTimestamp = this.getTimer() / 1000.0;
            this.$onEnterFrame = this.onEnterFrame.bind(this);

            this._afHandle = window.requestAnimationFrame(this.$onEnterFrame);

            return this;
        }

        public startOnReady():Skylark {
            var document = window.document,
                _this:Skylark = this;

            if(document.readyState == "complete" || document.readyState == "interactive") {
                this.start();
            } else {
                // todo P1 wrap into self-executing fn?
                function onReady(ev:any) {
                    document.removeEventListener("DOMContentLoaded", onReady, false);
                    _this.start();
                }

                document.addEventListener("DOMContentLoaded", onReady, false);
            }
            return this;
        }

        /** Stops all logic processing and freezes the game in its current state. The content
         *  is still being rendered once per frame, though, because otherwise the conventional
         *  display list would no longer be updated. */
        public stop():void {
            this._started = false;
            if(this._afHandle != null)
                window.cancelAnimationFrame(this._afHandle);
            this._afHandle = null;
        }

        public isStarted():boolean {
            return this._started;
        }

        private onEnterFrame():void {
            var that = this;
            this._afHandle = window.requestAnimationFrame(this.$onEnterFrame);
            if(this._started)
                this.nextFrame();
            else
                this.render();
        }

        public static getHelperCanvas(width:number, height:number):HTMLCanvasElement {
            var canvas:HTMLCanvasElement = Skylark._helperCanvas;
            if(canvas == null) {
                canvas = Skylark._serviceFactory.get('canvasProvider')
                    .createCanvas('skylark-temporary-' + new Date().getTime(), width, height, /*offscreen*/true);
                Skylark._helperCanvas = canvas;
            } else {
                canvas.setAttribute('width', <any>width);
                canvas.setAttribute('height', <any>height);
            }
            return canvas;
        }

        private onKey(event:any):void {
            event.preventDefault();

            if(!this._started) return;

            this.makeCurrent();

            // note on key 'location'
            // http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
            // https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent#Key_location_constants
            // http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/events/KeyboardEvent.html#keyLocation
            this._stage.dispatchEvent(new KeyboardEvent(
                event.type, <number>(<any>event).charCode, <number>(<any>event).keyCode, <number>(<any>event).location,
                event.ctrlKey, event.altKey, event.shiftKey));
        }

        private onResize(event:UIEvent):void {
            //todo implement
        }

        private onMouseLeave(event:UIEvent):void {
            this._touchProcessor.enqueueMouseLeftStage();
        }

        private onTouch(event:UIEvent):void {
            if(!this._started) return;

            var canvas = this._canvas;
            var stage = this._stage;
            var viewPort = this._viewPort;
            var touchProcessor = this._touchProcessor;

            var globalX:number;
            var globalY:number;
            var touchID:number;
            var phase:string;
            var pressure:number = 1.0;
            var width:number = 1.0;
            var height:number = 1.0;

            var leftMouseDown = this._leftMouseDown;

            function getPhase(eventType:string):string {
                var phase;
                // figure out touch phase
                switch(event.type) {
                    case 'touchstart': //TouchEvent.TOUCH_BEGIN
                        phase = TouchPhase.BEGAN;
                        break;
                    case 'touchmove': //TouchEvent.TOUCH_MOVE
                        phase = TouchPhase.MOVED;
                        break;
                    case 'touchend': //TouchEvent.TOUCH_END
                        phase = TouchPhase.ENDED;
                        break;
                    case 'mousedown': //MouseEvent.MOUSE_DOWN
                        phase = TouchPhase.BEGAN;
                        break;
                    case 'mouseup': //MouseEvent.MOUSE_UP
                        phase = TouchPhase.ENDED;
                        break;
                    case 'mousemove': //MouseEvent.MOUSE_MOVE
                        phase = (leftMouseDown ? TouchPhase.MOVED : TouchPhase.HOVER);
                        break;
                    default:
                        throw new Error('Unknown event type: ' + event.type);
                }
                return phase;
            }

            // figure out general touch properties
            if(event instanceof MouseEvent) {
                // normalize mouse position
                // credits go to http://www.jacklmoore.com/notes/mouse-position/
                var mouseEvent:MouseEvent = <MouseEvent>event;

                globalX = mouseEvent.clientX;
                globalY = mouseEvent.clientY;

                touchID = 0;

                //todo [PORT] re-evaluate
                // MouseEvent.buttonDown returns true for both left and right button (AIR supports
                // the right mouse button). We only want to react on the left button for now,
                // so we have to save the state for the left button manually.
                if(event.type == 'mousedown')
                    leftMouseDown = true;
                else if(event.type == 'mouseup')
                    leftMouseDown = false;

                this._leftMouseDown = leftMouseDown;

                phase = getPhase(event.type);

                enqueue();
            } else {
                var touches = (<any>event).changedTouches;
                for(var i = 0; i < touches.length; i++) {
                    var touch = touches[i];

                    globalX = touch.clientX;
                    globalY = touch.clientY;
                    touchID = touch.identifier; //touchPointID;
                    // todo [PORT] evaluate webkit specific properties
                    pressure = touch.webkitForce;
                    width = touch.webkitRadiusX;
                    height = touch.webkitRadiusY;
                    phase = getPhase(event.type);

                    enqueue();
                }
            }

            function enqueue() {
                var rect = canvas.getBoundingClientRect();

                // fix padding
                var computedStyle = window.getComputedStyle(canvas, null);
                var paddingLeft:number = parseInt(computedStyle.getPropertyValue('padding-left'), 10);
                var paddingTop:number = parseInt(computedStyle.getPropertyValue('padding-top'), 10);

                globalX = globalX - rect.left - paddingLeft;
                globalY = globalY - rect.top - paddingTop;

                // move position into viewport bounds
                globalX = stage.stageWidth * (globalX - viewPort.x) / viewPort.width;
                globalY = stage.stageHeight * (globalY - viewPort.y) / viewPort.height;

                event.preventDefault();

                // enqueue touch in touch processor
                touchProcessor.enqueue(touchID, phase, globalX, globalY, pressure, width, height);
            }
        }

        private get touchEventTypes():string[] {
            return !Skylark.multitouchEnabled ?
                [ 'mousedown', 'mousemove', 'mouseup' ] :
                [ 'touchstart', 'touchmove', 'touchend' ];
        }

        /** Indicates if multitouch input should be supported. */
        public static get multitouchEnabled():boolean {
            return this._multitouchEnabled;
        }

        public static set multitouchEnabled(value:boolean) {
            if(Skylark._current != null)
                throw new IllegalOperationError("'multitouchEnabled' must be set before Skylark instance is created");
            else
                this._multitouchEnabled = value;
        }

        private getTimer():number {
            return new Date().getTime();
        }

        /** The Skylark stage object, which is the root of the display tree that is rendered. */
        public get stage():Stage {
            return this._stage;
        }

        /** The default juggler of this instance. Will be advanced once per frame. */
        public get juggler():Juggler {
            return this._juggler;
        }

        /** Indicates if multitouch simulation with "Shift" and "Ctrl"/"Cmd"-keys is enabled.
         *  @default false */
        public get simulateMultitouch():boolean {
            return this._simulateMultitouch;
        }

        public set simulateMultitouch(value:boolean) {
            this._simulateMultitouch = value;
            if(this._context)
                this._touchProcessor.simulateMultitouch = value;
        }

        /** The viewport into which Skylark contents will be rendered. */
        public get viewPort():Rectangle {
            return this._viewPort;
        }

        public set viewPort(value:Rectangle) {
            this._viewPort = value.clone();
        }

        public get contextData():any {
            return null;
        }

        public static get contentScaleFactor():number {
            if(Skylark._current == null)
                throw new Error('Cannot determine "contentScaleFactor" when no Skylark instance is active');
            return Skylark._current.contentScaleFactor;
        }

        /** The ratio between viewPort width and stage width. Useful for choosing a different
         *  set of textures depending on the display resolution. */
        public get contentScaleFactor():number {
            return this._viewPort.width / this._stage.stageWidth;
        }

        /** The instance of the root class provided in the constructor. <soon>Available as
         *  the event 'ROOT_CREATED' has been dispatched. */
        public get root():DisplayObject {
            return this._root;
        }

        public get canvas():HTMLCanvasElement {
            return this._canvas;
        }

        public get context():CanvasRenderingContext2D {
            return this._bufferedRender ? this._buffer : this._context;
        }

        /**
         * Enable/disable buffered rendering to an offscreen canvas.
         *
         * Note: currently the offscreen canvas (buffer) is not discarded if a Skylark instance
         * is switched from 'buffered' to 'non-buffered'.
         *
         * @param enabled
         */
        public set buffered(enabled:boolean) {
            this._bufferedRender = enabled;
        }

        public get buffered():boolean {
            return this._bufferedRender;
        }

        /** The currently active Skylark instance. */
        public static get current():Skylark {
            return Skylark._current;
        }

        public static set current(instance:Skylark) {
            Skylark._current = instance;
        }

        public static get context():CanvasRenderingContext2D {
            var current = Skylark.current;
            return current != null ? Skylark.current.context : null;
        }

        public dispose():void {
            if(this._started)
                this.stop();

            if(Skylark._current === this)
                Skylark._current = null;

            if(--Skylark._count === 0) {
                var canvas = Skylark._helperCanvas;
                Skylark._helperCanvas = null;
                this._canvasProvider.dispose(canvas);
            }

            if(this._canvas) {
                this._canvasProvider.dispose(this._canvas);
                this._canvas = null;
            }
            if(this._context)
                this._context = null;

            // todo - cleanup event listeners
        }
    }
}
