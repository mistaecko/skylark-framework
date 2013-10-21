
interface Dictionary {
    [s: string]: any;
}
interface FontXml {
    info: any;
    common: any;
    chars: any;
    kernings: any;
}
declare var NativeImage: new(width?: number, height?: number) => HTMLImageElement;
interface CanvasImageSource {
    width: number;
    height: number;
}
declare module media {
    interface Sound {
        play(): void;
    }
}
declare module skylark {
    class Matrix {
        public a: number;
        public b: number;
        public c: number;
        public d: number;
        public tx: number;
        public ty: number;
        constructor();
        constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
        public setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
        public identity(): void;
        public transformPoint(p: skylark.Point): skylark.Point;
        public translate(x: number, y: number): void;
        public rotate(angle: number): void;
        public scale(x: number, y: number): void;
        public concat(m: Matrix): void;
        public invert(): void;
        public clone(): Matrix;
        public copyFrom(m: Matrix): void;
    }
}
declare module skylark {
    class Point {
        constructor(x?: number, y?: number);
        public x: number;
        public y: number;
        public add(p: Point): Point;
        public subtract(p: Point): Point;
        public dot(p): number;
        public cross(p): number;
        public clone(): Point;
        public setTo(x: number, y: number): void;
        public length : number;
        static distance(p1: Point, p2: Point): number;
    }
}
declare module skylark {
    class Rectangle {
        public height: number;
        public width: number;
        public x: number;
        public y: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
        public setTo(x?: number, y?: number, width?: number, height?: number): void;
        public bottom : number;
        public bottomright : skylark.Point;
        public left : number;
        public right : number;
        public size : skylark.Point;
        public top : number;
        public topLeft : skylark.Point;
        public clone(): Rectangle;
        public contains(x: number, y: number): boolean;
        public containsPoint(point: skylark.Point): boolean;
        public containsRect(rect: Rectangle): boolean;
        public equals(toCompare: Rectangle): boolean;
        public inflate(dx: number, dy: number): void;
        public inflatePoint(point: skylark.Point): void;
        public inclusiveRangeContains(value, min, max): boolean;
        public intersectRange(aMin, aMax, bMin, bMax): any;
        public intersection(toIntersect): Rectangle;
        public intersects(toIntersect): boolean;
        public isEmpty(): boolean;
        public offset(dx, dy): void;
        public offsetPoint(point): void;
        public setEmpty(): void;
        public toString(): string;
        public union(toUnion): Rectangle;
    }
}
declare module skylark {
    class Event {
        static ADDED: string;
        static ADDED_TO_STAGE: string;
        static ENTER_FRAME: string;
        static REMOVED: string;
        static REMOVED_FROM_STAGE: string;
        static TRIGGERED: string;
        static FLATTEN: string;
        static RESIZE: string;
        static COMPLETE: string;
        static CONTEXT3D_CREATE: string;
        static ROOT_CREATED: string;
        static REMOVE_FROM_JUGGLER: string;
        static CHANGE: string;
        static CANCEL: string;
        static SCROLL: string;
        static OPEN: string;
        static CLOSE: string;
        static SELECT: string;
        private static _eventPool;
        private _target;
        private _currentTarget;
        private _type;
        private _bubbles;
        private _stopsPropagation;
        private _stopsImmediatePropagation;
        private _data;
        constructor(type: string, bubbles?: boolean, data?: any);
        public stopPropagation(): void;
        public stopImmediatePropagation(): void;
        public toString(): string;
        public bubbles : boolean;
        public target : skylark.EventDispatcher;
        public currentTarget : skylark.EventDispatcher;
        public type : string;
        public data : any;
        public setTarget(value: skylark.EventDispatcher): void;
        public setCurrentTarget(value: skylark.EventDispatcher): void;
        private setData(value);
        public stopsPropagation : boolean;
        public stopsImmediatePropagation : boolean;
        static fromPool(type: string, bubbles?: boolean, data?: any): Event;
        static toPool(event: Event): void;
        public reset(type: string, bubbles?: boolean, data?: any): Event;
    }
}
declare module skylark {
    class Touch {
        private mID;
        private _globalX;
        private _globalY;
        private _previousGlobalX;
        private _previousGlobalY;
        private _tapCount;
        private _phase;
        private _target;
        private _timestamp;
        private _pressure;
        private _width;
        private _height;
        private _bubbleChain;
        private static _helperMatrix;
        constructor(id: number, globalX: number, globalY: number, phase: string, target: skylark.DisplayObject);
        public getLocation(space: skylark.DisplayObject, resultPoint?: skylark.Point): skylark.Point;
        public getPreviousLocation(space: skylark.DisplayObject, resultPoint?: skylark.Point): skylark.Point;
        public getMovement(space: skylark.DisplayObject, resultPoint?: skylark.Point): skylark.Point;
        public isTouching(target: skylark.DisplayObject): boolean;
        public toString(): string;
        public clone(): Touch;
        private updateBubbleChain();
        public id : number;
        public globalX : number;
        public globalY : number;
        public previousGlobalX : number;
        public previousGlobalY : number;
        public tapCount : number;
        public phase : string;
        public target : skylark.DisplayObject;
        public timestamp : number;
        public pressure : number;
        public width : number;
        public height : number;
        public dispatchEvent(event: skylark.TouchEvent): void;
        public bubbleChain : skylark.EventDispatcher[];
        public setTarget(value: skylark.DisplayObject): void;
        public setPosition(globalX: number, globalY: number): void;
        public setSize(width: number, height: number): void;
        public setPhase(value: string): void;
        public setTapCount(value: number): void;
        public setTimestamp(value: number): void;
        public setPressure(value: number): void;
    }
}
declare module skylark {
    class TouchEvent extends skylark.Event {
        static TOUCH: string;
        private _shiftKey;
        private _ctrlKey;
        private _timestamp;
        private _visitedObjects;
        private static _touches;
        constructor(type: string, touches: skylark.Touch[], shiftKey?: boolean, ctrlKey?: boolean, bubbles?: boolean);
        public getTouches(target: skylark.DisplayObject, phase?: string, result?: skylark.Touch[]): skylark.Touch[];
        public getTouch(target: skylark.DisplayObject, phase?: string): skylark.Touch;
        public interactsWith(target: skylark.DisplayObject): boolean;
        public dispatch(chain: skylark.EventDispatcher[]): void;
        public timestamp : number;
        public touches : skylark.Touch[];
        public shiftKey : boolean;
        public ctrlKey : boolean;
    }
}
declare module skylark {
    class TouchPhase {
        constructor();
        static HOVER: string;
        static BEGAN: string;
        static MOVED: string;
        static STATIONARY: string;
        static ENDED: string;
    }
}
declare module skylark {
    class KeyboardEvent extends skylark.Event {
        static KEY_UP: string;
        static KEY_DOWN: string;
        private _charCode;
        private _keyCode;
        private _keyLocation;
        private _altKey;
        private _ctrlKey;
        private _shiftKey;
        constructor(type: string, charCode?: number, keyCode?: number, keyLocation?: number, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean);
        public charCode : number;
        public keyCode : number;
        public keyLocation : number;
        public altKey : boolean;
        public ctrlKey : boolean;
        public shiftKey : boolean;
    }
}
declare module skylark {
    class EnterFrameEvent extends skylark.Event {
        static ENTER_FRAME: string;
        constructor(type: string, passedTime: number, bubbles?: boolean);
        public passedTime : number;
    }
}
declare module skylark {
    interface EventListenerFn {
        (event: skylark.Event, data: any): void;
    }
    class EventListener {
        constructor(fn: EventListenerFn, context: any);
        public context: any;
        public fn: EventListenerFn;
    }
    class EventDispatcher {
        private _eventListeners;
        private static _bubbleChains;
        constructor();
        public addEventListener(type: string, listener: EventListenerFn, This?: any): void;
        public removeEventListener(type: string, listener: EventListenerFn, This?: any): void;
        public findEventListener(type: string, listener: EventListenerFn, This?: any): number;
        public removeEventListeners(type?: string): void;
        public dispatchEvent(event: skylark.Event): void;
        public invokeEvent(event: skylark.Event): boolean;
        private bubbleEvent(event);
        public dispatchEventWith(type: string, bubbles?: boolean, data?: Object): void;
        public hasEventListener(type: string): boolean;
    }
}
declare module skylark {
    class DisplayObject extends skylark.EventDispatcher {
        private mX;
        private mY;
        private _pivotX;
        private _pivotY;
        private _scaleX;
        private _scaleY;
        private _skewX;
        private _skewY;
        private _rotation;
        private _alpha;
        private _visible;
        private _touchable;
        private _blendMode;
        private _name;
        private _useHandCursor;
        private _parent;
        private _transformationMatrix;
        private _orientationChanged;
        private static _ancestors;
        private static _helperRect;
        private static _helperMatrix;
        constructor();
        public dispose(): void;
        public removeFromParent(dispose?: boolean): void;
        public getTransformationMatrix(targetSpace: DisplayObject, resultMatrix?: skylark.Matrix): skylark.Matrix;
        public getBounds(targetSpace: DisplayObject, resultRect?: skylark.Rectangle): skylark.Rectangle;
        public hitTest(localPoint: skylark.Point, forTouch?: boolean): DisplayObject;
        public localToGlobal(localPoint: skylark.Point, resultPoint?: skylark.Point): skylark.Point;
        public globalToLocal(globalPoint: skylark.Point, resultPoint?: skylark.Point): skylark.Point;
        public render(support: skylark.RenderSupport): void;
        public hasVisibleArea : boolean;
        public setParent(value: skylark.DisplayObjectContainer): void;
        private static isEquivalent(a, b, epsilon?);
        private static normalizeAngle(angle);
        public transformationMatrix : skylark.Matrix;
        public useHandCursor : boolean;
        public onTouch(event: skylark.TouchEvent): void;
        public bounds : skylark.Rectangle;
        public width : number;
        public height : number;
        public x : number;
        public y : number;
        public pivotX : number;
        public pivotY : number;
        public scaleX : number;
        public scaleY : number;
        public skewX : number;
        public skewY : number;
        public rotation : number;
        public alpha : number;
        public visible : boolean;
        public touchable : boolean;
        public blendMode : string;
        public name : string;
        public parent : skylark.DisplayObjectContainer;
        public base : DisplayObject;
        public root : DisplayObject;
        public stage : skylark.Stage;
    }
}
declare module skylark {
    class DisplayObjectContainer extends skylark.DisplayObject {
        private _children;
        private static _helperMatrix;
        private static _helperPoint;
        private static _broadcastListeners;
        constructor();
        public dispose(): void;
        public addChild(child: skylark.DisplayObject): skylark.DisplayObject;
        public addChildAt(child: skylark.DisplayObject, index: number): skylark.DisplayObject;
        public removeChild(child: skylark.DisplayObject, dispose?: boolean): skylark.DisplayObject;
        public removeChildAt(index: number, dispose?: boolean): skylark.DisplayObject;
        public removeChildren(beginIndex?: number, endIndex?: number, dispose?: boolean): void;
        public getChildAt(index: number): skylark.DisplayObject;
        public getChildByName(name: string): skylark.DisplayObject;
        public getChildIndex(child: skylark.DisplayObject): number;
        public setChildIndex(child: skylark.DisplayObject, index: number): void;
        public swapChildren(child1: skylark.DisplayObject, child2: skylark.DisplayObject): void;
        public swapChildrenAt(index1: number, index2: number): void;
        public sortChildren(compareFunction: (a: skylark.DisplayObject, b: skylark.DisplayObject) => number): void;
        public contains(child: skylark.DisplayObject): boolean;
        public getBounds(targetSpace: skylark.DisplayObject, resultRect?: skylark.Rectangle): skylark.Rectangle;
        public hitTest(localPoint: skylark.Point, forTouch?: boolean): skylark.DisplayObject;
        public render(support: skylark.RenderSupport): void;
        public broadcastEvent(event: skylark.Event): void;
        public broadcastEventWith(type: string, data?: Object): void;
        private getChildEventListeners(object, eventType, listeners);
        public numChildren : number;
    }
}
declare module skylark {
    class Quad extends skylark.DisplayObject {
        private _tinted;
        public _vertexData: skylark.VertexData;
        static _helperPoint: skylark.Point;
        private static _helperMatrix;
        constructor(width: number, height: number, color?: number, premultipliedAlpha?: boolean);
        public onVertexDataChanged(): void;
        public getBounds(targetSpace: skylark.DisplayObject, resultRect?: skylark.Rectangle): skylark.Rectangle;
        public getVertexColor(vertexID: number): number;
        public setVertexColor(vertexID: number, color: number): void;
        public getVertexAlpha(vertexID: number): number;
        public setVertexAlpha(vertexID: number, alpha: number): void;
        public color : number;
        public alpha : number;
        public copyVertexDataTo(targetData: skylark.VertexData, targetVertexID?: number): void;
        public render(support: skylark.RenderSupport): void;
        public renderTransformed(support: skylark.RenderSupport, context: CanvasRenderingContext2D): void;
        public tinted : boolean;
    }
}
declare module skylark {
    class Image extends skylark.Quad {
        private _texture;
        private _smoothing;
        private _vertexDataCache;
        private _vertexDataCacheInvalid;
        constructor(texture: skylark.Texture);
        constructor(image: HTMLImageElement);
        public onVertexDataChanged(): void;
        public readjustSize(): void;
        public setTexCoords(vertexID: number, coords: skylark.Point): void;
        public getTexCoords(vertexID: number, resultPoint?: skylark.Point): skylark.Point;
        public copyVertexDataTo(targetData: skylark.VertexData, targetVertexID?: number): void;
        public texture : skylark.Texture;
        public smoothing : string;
        public color : number;
        public renderTransformed(support: skylark.RenderSupport, context: CanvasRenderingContext2D): void;
    }
}
declare module skylark {
    class MovieClip extends skylark.Image implements skylark.IAnimatable {
        private _textures;
        private _sounds;
        private _durations;
        private _startTimes;
        private _defaultFrameDuration;
        private _totalTime;
        private _currentTime;
        private _currentFrame;
        private _loop;
        private _playing;
        constructor(textures: skylark.Texture[], fps?: number);
        private init(textures, fps);
        public addFrame(texture: skylark.Texture, sound?: any, duration?: number): void;
        public addFrameAt(frameID: number, texture: skylark.Texture, sound?: any, duration?: number): void;
        public removeFrameAt(frameID: number): void;
        public getFrameTexture(frameID: number): skylark.Texture;
        public setFrameTexture(frameID: number, texture: skylark.Texture): void;
        public getFrameSound(frameID: number): any;
        public setFrameSound(frameID: number, sound: any): void;
        public getFrameDuration(frameID: number): number;
        public setFrameDuration(frameID: number, duration: number): void;
        public play(): void;
        public pause(): void;
        public stop(): void;
        private updateStartTimes();
        public advanceTime(passedTime: number): void;
        public isComplete : boolean;
        public totalTime : number;
        public numFrames : number;
        public loop : boolean;
        public currentFrame : number;
        public fps : number;
        public isPlaying : boolean;
    }
}
declare module skylark {
    class Sprite extends skylark.DisplayObjectContainer {
        private _flattenedContents;
        private _flattenRequested;
        constructor();
        public dispose(): void;
        private disposeFlattenedContents();
        public flatten(): void;
        public unflatten(): void;
        public isFlattened : boolean;
    }
}
declare module skylark {
    class Stage extends skylark.DisplayObjectContainer {
        private _width;
        private _height;
        private _color;
        private _enterFrameEvent;
        constructor(width: number, height: number);
        constructor(width: number, height: number, color?: number, alpha?: number);
        public advanceTime(passedTime: number): void;
        public hitTest(localPoint: skylark.Point, forTouch?: boolean): skylark.DisplayObject;
        public width : number;
        public height : number;
        public x : number;
        public y : number;
        public scaleX : number;
        public scaleY : number;
        public rotation : number;
        public color : number;
        public stageWidth : number;
        public stageHeight : number;
    }
}
declare module skylark {
    class BlendMode {
        constructor();
        static AUTO: string;
        static NONE: string;
        static NORMAL: string;
        static ADD: string;
        static MULTIPLY: string;
        static SCREEN: string;
        static ERASE: string;
    }
}
declare module skylark {
    class Button extends skylark.DisplayObjectContainer {
        private static MAX_DRAG_DIST;
        private _upState;
        private _downState;
        private _contents;
        private _background;
        private _textField;
        private _textBounds;
        private _scaleWhenDown;
        private _alphaWhenDisabled;
        private _enabled;
        private _isDown;
        constructor(upState: skylark.Texture, downState?: skylark.Texture);
        constructor(upState: skylark.Texture, text?: string, downState?: skylark.Texture);
        private resetContents();
        private createTextField();
        private onTouchButton(event);
        public scaleWhenDown : number;
        public alphaWhenDisabled : number;
        public enabled : boolean;
        public text : string;
        public fontName : string;
        public fontSize : number;
        public fontColor : number;
        public fontBold : boolean;
        public upState : skylark.Texture;
        public downState : skylark.Texture;
        public textVAlign : string;
        public textHAlign : string;
        public textBounds : skylark.Rectangle;
    }
}
declare module skylark {
    class QuadBatch extends skylark.Quad {
        constructor();
        public touchable: boolean;
        public reset(): void;
        public batchable: boolean;
        public addImage(...args: any[]): void;
    }
}
declare module skylark {
    class Bitmap {
        static create(rows, scale?: number): any;
    }
}
interface PxProgressEvent {
    resource: any;
    loaded: boolean;
    error: boolean;
    timeout: boolean;
    completedCount: number;
    totalCount: number;
}
interface PxProgressListener {
    (event: PxProgressEvent): void;
}
interface PxCompletionListener {
    (event: PxProgressEvent): void;
}
declare enum PxResourceState {
    QUEUED,
    WAITING,
    LOADED,
    ERROR,
    TIMEOUT,
}
interface PxResourceLoader {
    getName(): string;
}
declare class PxLoaderImage implements PxResourceLoader {
    constructor(url: string, tags: string[], priority: number);
    public img: HTMLImageElement;
    public getName(): string;
}
declare class PxLoader {
    static ResourceState: PxResourceState;
    public addCompletionListener(cb: PxCompletionListener, tags?: any): void;
    public addProgressListener(cb: PxProgressListener, tags?: any): void;
    public onLoad(a: PxResourceLoader): any;
    public onError(a: PxResourceLoader): any;
    public onTimeout(a: PxResourceLoader): any;
    public addSound(name: string, tags?: any, priority?: number): any;
    public addImage(name: string, tags?: any, priority?: number): any;
    public addXml(name: string, tags?: any, priority?: number): any;
}
declare module skylark {
    class ClassUtil {
        static getQualifiedClassName(obj): string;
        static getDefinitionByName(name: string): any;
        static isClass(obj): boolean;
        static isCanvasImageSource(obj: any): boolean;
    }
}
declare module skylark {
    class StringUtil {
        constructor();
        static format(str: string, ...values: any[]): string;
        static parseXml(xmlStr: string): Document;
        static xmlToJson(node: Document, simple?: boolean);
        static sortArray(arr: string[]): string[];
    }
}
declare module skylark {
    class Arguments {
        static number(...args: any[]): void;
    }
}
declare module skylark {
    class MatrixUtil {
        private static _rawData;
        constructor();
        static transformCoords(matrix: skylark.Matrix, x: number, y: number, resultPoint?: skylark.Point): skylark.Point;
        static skew(matrix: skylark.Matrix, skewX: number, skewY: number): void;
        static prependMatrix(base: skylark.Matrix, prep: skylark.Matrix): void;
        static prependTranslation(matrix: skylark.Matrix, tx: number, ty: number): void;
        static prependScale(matrix: skylark.Matrix, sx: number, sy: number): void;
        static prependRotation(matrix: skylark.Matrix, angle: number): void;
        static prependSkew(matrix: skylark.Matrix, skewX: number, skewY: number): void;
    }
}
declare module skylark {
    class VertexData {
        static ELEMENTS_PER_VERTEX: number;
        static POSITION_OFFSET: number;
        static COLOR_OFFSET: number;
        static TEXCOORD_OFFSET: number;
        private _rawData;
        private _premultipliedAlpha;
        private _numVertices;
        private static _helperPoint;
        constructor(numVertices: number, premultipliedAlpha?: boolean);
        public clone(vertexID?: number, numVertices?: number): VertexData;
        public copyTo(targetData: VertexData, targetVertexID?: number, vertexID?: number, numVertices?: number): void;
        public append(data: VertexData): void;
        public setPosition(vertexID: number, x: number, y: number): void;
        public getPosition(vertexID: number, position: skylark.Point): void;
        public setColor(vertexID: number, color: number): void;
        public getColor(vertexID: number): number;
        public setAlpha(vertexID: number, alpha: number): void;
        public getAlpha(vertexID: number): number;
        public setTexCoords(vertexID: number, u: number, v: number): void;
        public getTexCoords(vertexID: number, texCoords: skylark.Point): void;
        public translateVertex(vertexID: number, deltaX: number, deltaY: number): void;
        public transformVertex(vertexID: number, matrix: skylark.Matrix, numVertices?: number): void;
        public setUniformColor(color: number): void;
        public setUniformAlpha(alpha: number): void;
        public scaleAlpha(vertexID: number, alpha: number, numVertices?: number): void;
        private getOffset(vertexID);
        public getBounds(transformationMatrix?: skylark.Matrix, vertexID?: number, numVertices?: number, resultRect?: skylark.Rectangle): skylark.Rectangle;
        public tinted : boolean;
        public setPremultipliedAlpha(value: boolean, updateData?: boolean): void;
        public premultipliedAlpha : boolean;
        public numVertices : number;
        public rawData : number[];
    }
}
declare module skylark {
    class RectangleUtil {
        constructor();
        static intersect(rect1: skylark.Rectangle, rect2: skylark.Rectangle, resultRect?: skylark.Rectangle): skylark.Rectangle;
        static fit(rectangle: skylark.Rectangle, into: skylark.Rectangle, scaleMode?: string, pixelPerfect?: boolean, resultRect?: skylark.Rectangle): skylark.Rectangle;
        private static nextSuitableScaleFactor(factor, up);
    }
}
declare module skylark {
    class ScaleMode {
        constructor();
        static NONE: string;
        static NO_BORDER: string;
        static SHOW_ALL: string;
        static isValid(scaleMode: string): boolean;
    }
}
declare module skylark {
    class MathUtil {
        static rad2deg(rad: number): number;
        static deg2rad(deg: number): number;
        static getNextPowerOfTwo(number: number): number;
    }
}
declare module skylark {
    interface HsvColor {
    }
    interface HslColor {
    }
    class ITinyColor {
        public red: number;
        public green: number;
        public blue: number;
        public alpha: number;
        public ok: boolean;
        public format: string;
        public toHsv(): HsvColor;
        public toHsvString(): string;
        public toHsl(): HslColor;
        public toHslString(): string;
        public toHex(): number;
        public toHexString(): string;
        public toString(format: string);
    }
    function TinyColor(color: number, opts?: any): ITinyColor;
    function TinyColor(color: string, opts?: any): ITinyColor;
}
declare module skylark {
    class Color {
        static WHITE: number;
        static SILVER: number;
        static GRAY: number;
        static BLACK: number;
        static RED: number;
        static MAROON: number;
        static YELLOW: number;
        static OLIVE: number;
        static LIME: number;
        static GREEN: number;
        static AQUA: number;
        static TEAL: number;
        static BLUE: number;
        static NAVY: number;
        static FUCHSIA: number;
        static PURPLE: number;
        static getAlpha(color: number): number;
        static getRed(color: number): number;
        static getGreen(color: number): number;
        static getBlue(color: number): number;
        static rgb(red: number, green: number, blue: number): number;
        static argb(alpha: number, red: number, green: number, blue: number): number;
        static fromString(cssString: string): number;
        static toHexString(rgb: number): string;
        constructor();
    }
}
declare module skylark {
    class HAlign {
        constructor();
        static LEFT: string;
        static CENTER: string;
        static RIGHT: string;
        static isValid(hAlign: string): boolean;
    }
}
declare module skylark {
    class VAlign {
        constructor();
        static TOP: string;
        static CENTER: string;
        static MIDDLE: string;
        static BOTTOM: string;
        static isValid(vAlign: string): boolean;
    }
}
declare module skylark {
    class BitmapData {
        private _bytes;
        private _width;
        private _height;
        static toDataURL(image: CanvasImageSource): String;
        constructor(width: number, height: number, transparent?: boolean, fillColor?: number);
        constructor(width: number, height: number, bytes: ByteArray);
        public getPixel32(x: number, y: number): number;
        public bytes : ByteArray;
        public width : number;
        public height : number;
        public dispose(): void;
        public asUrl(): string;
    }
}
declare class Sound {
    public play(startTime: number, loops: number, transform: SoundTransform);
}
interface SoundChannel {
}
interface SoundTransform {
}
declare module skylark {
    class AssetManager extends skylark.EventDispatcher {
        private SUPPORTED_EXTENSIONS;
        private _scaleFactor;
        private _useMipMaps;
        private _verbose;
        private _textures;
        private _atlases;
        private _sounds;
        private _pending;
        private static _names;
        constructor(scaleFactor?: number, useMipmaps?: boolean);
        public dispose(): void;
        public getTexture(name: string): skylark.Texture;
        public getTextures(prefix?: string, result?: skylark.Texture[]): skylark.Texture[];
        public getTextures(prefix: string[], result?: skylark.Texture[]): skylark.Texture[];
        public getTextureNames(prefix?: string, result?: string[]): string[];
        public getTextureAtlas(name: string): skylark.TextureAtlas;
        public getSound(name: string): Sound;
        public getSoundNames(prefix?: string): string[];
        public playSound(name: string, startTime?: number, loops?: number, transform?: SoundTransform): SoundChannel;
        public addTexture(name: string, texture: skylark.Texture): void;
        public addTextureAtlas(name: string, atlas: skylark.TextureAtlas): void;
        public addSound(name: string, sound: Sound): void;
        public removeTexture(name: string, dispose?: boolean): void;
        public removeTextureAtlas(name: string, dispose?: boolean): void;
        public removeSound(name: string): void;
        public purge(): void;
        public enqueue(...rawAssets): void;
        public loadQueue(onProgress: (ratio: number, complete: boolean) => void): void;
        public onQueueComplete(): void;
        public processTextureAtlas(xml: Document, resource, resume?: boolean): void;
        public addPending(job: any): void;
        public processPending(): void;
        private static _urlParseRE;
        public getName(name: string): string;
        public log(message: string): void;
        public verbose : boolean;
        public useMipMaps : boolean;
        public scaleFactor : number;
        static findRootNode(data: Document): Node;
    }
}
interface AssetSource {
    url: string;
    type: string;
}
declare module skylark {
    class PxLoaderAssetManager extends skylark.AssetManager {
        private _loader;
        public getLoader(): any;
        public createLoader(): any;
        public enqueue(...rawAssets): void;
        public getType(url: string);
        public getType(definition: AssetSource);
        public loadQueue(onProgress: (ratio: number, complete: boolean) => void): void;
        private onError(e);
        private onLoaded(e);
        private onTimeout(e);
        private onComplete(e);
    }
    class PxLoaderXml {
        private _complete;
        private _tags;
        private _data;
        private _loader;
        private _priority;
        private _name;
        constructor(name: string, tags?: any, priority?: number);
        public start(pxLoader: PxLoader): void;
        public checkStatus(): void;
        public getName(): string;
        public getXml(): Document;
        public onTimeout(): void;
        public onLoad(data): void;
        public onError(textStatus): void;
        public onAbort(): void;
        public complete : boolean;
        public rootNode : Node;
    }
}
interface ByteArray {
    length: number;
    [index: number]: number;
    push(...args: any[]);
}
declare module skylark {
    class RenderSupport {
        private _context;
        private _canvas;
        private _projectionMatrix;
        private _modelViewMatrix;
        private _mvpMatrix;
        private _stateStack;
        private _stateStackSize;
        private _drawCount;
        private _blendMode;
        private _parentBlendMode;
        private _alpha;
        private static _point;
        private static _rectangle;
        constructor();
        public setOrthographicProjection(x: number, y: number, width: number, height: number): void;
        public loadIdentity(): void;
        public translateMatrix(dx: number, dy: number): void;
        public rotateMatrix(angle: number): void;
        public scaleMatrix(sx: number, sy: number): void;
        public prependMatrix(matrix: skylark.Matrix): void;
        public transformMatrix(object: skylark.DisplayObject): void;
        public pushState(): void;
        public popState(): void;
        public resetMatrix(): void;
        static transformMatrixForObject(matrix: skylark.Matrix, object: skylark.DisplayObject): void;
        public mvpMatrix : skylark.Matrix;
        public modelViewMatrix : skylark.Matrix;
        public projectionMatrix : skylark.Matrix;
        public applyBlendMode(premultipliedAlpha: boolean): void;
        public blendMode : string;
        private parentBlendMode;
        public alpha : number;
        public context : CanvasRenderingContext2D;
        public canvas : HTMLCanvasElement;
        public nextFrame(): void;
        static clear(context: CanvasRenderingContext2D, rgb?: number, alpha?: number): void;
        public clear(rgb?: number, alpha?: number): void;
        public raiseDrawCount(value?: number): void;
        public drawCount : number;
    }
}
declare module skylark {
    class ServiceFactory {
        public services: Dictionary;
        private instances;
        constructor();
        public use(obj: any): any;
        public get(name: string): any;
        private resolve(name);
    }
}
declare module skylark {
    interface StageConfig {
        backgroundColor?: any;
        width?: number;
        height?: number;
    }
    class Skylark extends skylark.EventDispatcher {
        private static _current;
        private static _count;
        private static _serviceFactory;
        private static _configured;
        private static _buffered;
        private static _multitouchEnabled;
        private static _helperCanvas;
        private _canvas;
        private _bufferCanvas;
        private _context;
        private _buffer;
        private static _stageDefaults;
        private _bufferedRender;
        private _afHandle;
        private _stage;
        private _rootClass;
        private _root;
        private _juggler;
        private _started;
        private _support;
        private _touchProcessor;
        private _simulateMultitouch;
        private _lastFrameTimestamp;
        private _leftMouseDown;
        private _shareContext;
        private _viewPort;
        private _previousViewPort;
        private _canvasProvider;
        private $onKey;
        private $onResize;
        private $onMouseLeave;
        private $onTouch;
        private $onEnterFrame;
        static buffered : boolean;
        static stageDefaults : StageConfig;
        static create(root: skylark.DisplayObject, elementId?: string);
        static create(rootClass: new() => skylark.DisplayObject, elementId?: string);
        static onReady(fn: (Skylark?: any) => any): void;
        constructor(rootClass: skylark.DisplayObject, id?: string, viewPort?: skylark.Rectangle);
        constructor(rootClass: new() => skylark.DisplayObject, id?: string, viewPort?: skylark.Rectangle);
        public initializeCanvas(id: string): HTMLCanvasElement;
        public initializeBufferCanvas(): HTMLCanvasElement;
        private initializeCanvasProvider();
        private initializeRoot();
        private updateViewPort(updateAliasing?);
        public nextFrame(): void;
        public advanceTime(passedTime: number): void;
        public render(): void;
        public flushBuffer(): void;
        public makeCurrent(): Skylark;
        public start(): Skylark;
        public startOnReady(): Skylark;
        public stop(): void;
        public isStarted(): boolean;
        private onEnterFrame();
        static getHelperCanvas(width: number, height: number): HTMLCanvasElement;
        private onKey(event);
        private onResize(event);
        private onMouseLeave(event);
        private onTouch(event);
        private touchEventTypes;
        static multitouchEnabled : boolean;
        private getTimer();
        public stage : skylark.Stage;
        public juggler : skylark.Juggler;
        public simulateMultitouch : boolean;
        public viewPort : skylark.Rectangle;
        public contextData : any;
        static contentScaleFactor : number;
        public contentScaleFactor : number;
        public root : skylark.DisplayObject;
        public canvas : HTMLCanvasElement;
        public context : CanvasRenderingContext2D;
        public buffered : boolean;
        static current : Skylark;
        static context : CanvasRenderingContext2D;
        public dispose(): void;
    }
}
declare module skylark {
    interface ImageSource {
        width: number;
        height: number;
        image: CanvasImageSource;
        dispose();
    }
    class DefaultImageSource implements ImageSource {
        private _image;
        constructor(image: CanvasImageSource);
        public width : number;
        public height : number;
        public image : CanvasImageSource;
        public dispose(): void;
    }
}
declare module skylark {
    class TouchMarker extends skylark.Sprite {
        private _center;
        private _texture;
        constructor();
        public dispose(): void;
        public moveMarker(x: number, y: number, withCenter?: boolean): void;
        public moveCenter(x: number, y: number): void;
        private createTexture();
        private realMarker;
        private mockMarker;
        public realX : number;
        public realY : number;
        public mockX : number;
        public mockY : number;
    }
}
declare module skylark {
    class TrackMarker extends skylark.Sprite {
        private _texture;
        constructor();
        public moveMarker(x: number, y: number): void;
        private createTexture();
    }
}
declare module skylark {
    class TouchProcessor {
        private static MULTITAP_TIME;
        private static MULTITAP_DISTANCE;
        private _stage;
        private _elapsedTime;
        private _touchMarker;
        private _trackMarkers;
        private _simulateMultitouch;
        private _trackMultitouch;
        private _currentTouches;
        private _queue;
        private _lastTaps;
        private _shiftDown;
        private _ctrlDown;
        private static _processedTouchIDs;
        private static _hoveringTouchData;
        constructor(stage: skylark.Stage);
        public dispose(): void;
        public advanceTime(passedTime: number): void;
        public enqueue(touchID: number, phase: string, globalX: number, globalY: number, pressure?: number, width?: number, height?: number): void;
        public enqueueMouseLeftStage(): void;
        private processTouch(touchID, phase, globalX, globalY, pressure?, width?, height?);
        private onKey(event);
        private processTap(touch);
        private addCurrentTouch(touch);
        private getCurrentTouch(touchID);
        public enableTouchMarker(enable?: boolean): void;
        public enableTrackMarkers(enable?: boolean): void;
        public simulateMultitouch : boolean;
        public trackMultitouch : boolean;
        private updateTouchMarker(event);
    }
}
declare module skylark {
    interface CanvasProviderFactory {
        create(): CanvasProvider;
        isCanvasProviderFactory: boolean;
    }
    interface CanvasProvider {
        getCanvasById(id: string): HTMLCanvasElement;
        createCanvasWith(cb: (canvas: HTMLCanvasElement) => void, offscreen?: boolean): HTMLCanvasElement;
        createCanvas(id: string, width?: number, height?: number, offscreen?: boolean): HTMLCanvasElement;
        getBackgroundColor(canvas: HTMLCanvasElement): number;
        dispose(canvas: HTMLCanvasElement): void;
    }
    class AbstractCanvasProvider implements CanvasProvider {
        public getElementById(id: string): HTMLElement;
        public createCanvasWith(cb: (canvas: HTMLCanvasElement) => void, offscreen?: boolean): HTMLCanvasElement;
        public getCanvasById(id: string): HTMLCanvasElement;
        public createCanvas(id: string, width?: number, height?: number, offscreen?: boolean): HTMLCanvasElement;
        public getBackgroundColor(canvas: HTMLCanvasElement): number;
        public dispose(canvas: HTMLCanvasElement): void;
    }
    interface HTMLCanvasProviderDocument {
        getElementById(id: string);
        appendChild(canvas: HTMLCanvasElement);
    }
    class HTMLCanvasProviderFactory implements CanvasProviderFactory {
        public isCanvasProviderFactory : boolean;
        public create(): CanvasProvider;
    }
    class HTMLCanvasProvider extends AbstractCanvasProvider {
        private _document;
        constructor();
        constructor(doc: HTMLCanvasProviderDocument);
        constructor(doc: HTMLDocument);
        public getElementById(id: string): HTMLElement;
        public createCanvasWith(cb: (canvas: HTMLCanvasElement) => void, offscreen?: boolean): HTMLCanvasElement;
    }
}
interface DelayedCallCb {
    (...args: any[]): void;
}
declare module skylark {
    class DelayedCall extends skylark.EventDispatcher implements skylark.IAnimatable {
        private _currentTime;
        private _totalTime;
        private _call;
        private _this;
        private _args;
        private _repeatCount;
        constructor(call: DelayedCallCb, delay: number, args?: any[]);
        constructor(call: DelayedCallCb, thisArg: any, delay: number, args?: any[]);
        public reset(call: DelayedCallCb, thisArg: any, delay: number, args?: any[]): DelayedCall;
        public advanceTime(time: number): void;
        public isComplete : boolean;
        public totalTime : number;
        public currentTime : number;
        public repeatCount : number;
    }
}
declare module skylark {
    interface IAnimatable {
        advanceTime(time: number): void;
    }
}
declare module skylark {
    class Juggler implements skylark.IAnimatable {
        private _objects;
        private _elapsedTime;
        constructor();
        public add(object: skylark.IAnimatable): void;
        public contains(object: skylark.IAnimatable): boolean;
        public remove(object: skylark.IAnimatable): void;
        public removeTweens(target: Object): void;
        public purge(): void;
        public delayCall(call: DelayedCallCb, This: any, delay: number, ...args: any[]): skylark.DelayedCall;
        public delayCall(call: DelayedCallCb, delay: number, ...args: any[]): skylark.DelayedCall;
        public tween(target: any, time: number, properties: {
            [index: string]: any;
        }): void;
        private onPooledTweenComplete(event, data);
        public advanceTime(time: number): void;
        private onRemove(event);
        public elapsedTime : number;
    }
}
declare module skylark {
    class Transitions {
        static LINEAR: string;
        static EASE_IN: string;
        static EASE_OUT: string;
        static EASE_IN_OUT: string;
        static EASE_OUT_IN: string;
        static EASE_IN_BACK: string;
        static EASE_OUT_BACK: string;
        static EASE_IN_OUT_BACK: string;
        static EASE_OUT_IN_BACK: string;
        static EASE_IN_ELASTIC: string;
        static EASE_OUT_ELASTIC: string;
        static EASE_IN_OUT_ELASTIC: string;
        static EASE_OUT_IN_ELASTIC: string;
        static EASE_IN_BOUNCE: string;
        static EASE_OUT_BOUNCE: string;
        static EASE_IN_OUT_BOUNCE: string;
        static EASE_OUT_IN_BOUNCE: string;
        private static _transitions;
        constructor();
        static getTransition(name: string): Function;
        static register(name: string, func: Function): void;
        private static registerDefaults();
        static linear(ratio: number): number;
        static easeIn(ratio: number): number;
        static easeOut(ratio: number): number;
        static easeInOut(ratio: number): number;
        static easeOutIn(ratio: number): number;
        static easeInBack(ratio: number): number;
        static easeOutBack(ratio: number): number;
        static easeInOutBack(ratio: number): number;
        static easeOutInBack(ratio: number): number;
        static easeInElastic(ratio: number): number;
        static easeOutElastic(ratio: number): number;
        static easeInOutElastic(ratio: number): number;
        static easeOutInElastic(ratio: number): number;
        static easeInBounce(ratio: number): number;
        static easeOutBounce(ratio: number): number;
        static easeInOutBounce(ratio: number): number;
        static easeOutInBounce(ratio: number): number;
        static easeCombined(startFunc: Function, endFunc: Function, ratio: number): number;
    }
}
declare module skylark {
    class Tween extends skylark.EventDispatcher implements skylark.IAnimatable {
        private _target;
        private _transitionFunc;
        private _transitionName;
        private _properties;
        private _startValues;
        private _endValues;
        private _onStart;
        private _onUpdate;
        private _onRepeat;
        private _onComplete;
        private _onStartArgs;
        private _onUpdateArgs;
        private _onRepeatArgs;
        private _onCompleteArgs;
        private _totalTime;
        private _currentTime;
        private _delay;
        private _roundToInt;
        private _nextTween;
        private _repeatCount;
        private _repeatDelay;
        private _reverse;
        private _currentCycle;
        constructor(target: Object, time: number, transition?: any);
        public reset(target: any, time: number, transition?: any): Tween;
        public animate(property: string, targetValue: number): void;
        public scaleTo(factor: number): void;
        public moveTo(x: number, y: number): void;
        public fadeTo(alpha: number): void;
        public advanceTime(time: number): void;
        public isComplete : boolean;
        public target : any;
        public transition : string;
        public transitionFunc : Function;
        public totalTime : number;
        public currentTime : number;
        public delay : number;
        public repeatCount : number;
        public repeatDelay : number;
        public reverse : boolean;
        public roundToInt : boolean;
        public onStart : Function;
        public onUpdate : Function;
        public onRepeat : Function;
        public onComplete : Function;
        public onStartArgs : any[];
        public onUpdateArgs : any[];
        public onRepeatArgs : any[];
        public onCompleteArgs : any[];
        public nextTween : Tween;
        private static _tweenPool;
        static fromPool(target: any, time: number, transition?: any): Tween;
        static toPool(tween: Tween): void;
    }
}
declare module skylark {
    class ErrorImpl implements Error {
        public name: string;
        public message: string;
        public stack: string;
        constructor(message?: string);
    }
}
declare module skylark {
    class DefaultError extends skylark.ErrorImpl {
        constructor(msg: string);
    }
}
declare module skylark {
    class AbstractClassError extends skylark.DefaultError {
        constructor(msg?: string);
    }
}
declare module skylark {
    class AbstractMethodError extends skylark.DefaultError {
        constructor(msg?: string);
    }
}
declare module skylark {
    class ArgumentError extends skylark.DefaultError {
        constructor(msg: string);
    }
}
declare module skylark {
    class IllegalOperationError extends skylark.DefaultError {
        constructor(msg: string);
    }
}
declare module skylark {
    class IllegalSystemStateError extends skylark.DefaultError {
        constructor(msg: string);
    }
}
declare module skylark {
    class MissingContextError extends skylark.DefaultError {
        constructor(msg?: string);
    }
}
declare module skylark {
    class InvalidXmlError extends skylark.DefaultError {
        private _xml;
        private _parserErrors;
        constructor(msg?: string, xml?: string, errors?: NodeList);
        public toString(): string;
    }
}
declare module skylark {
    class Texture {
        private _frame;
        private _repeat;
        private static _origin;
        constructor();
        public dispose(): void;
        private static createBitmap(width, height, color);
        static empty(width: number, height: number, premultipliedAlpha?: boolean, mipMapping?: boolean, optimizeForRenderToTexture?: boolean, scale?: number): Texture;
        static fromTexture(texture: Texture, region?: skylark.Rectangle, frame?: skylark.Rectangle): Texture;
        static fromCanvas(canvas: HTMLCanvasElement, generateMipMaps?: boolean, scale?: number): skylark.ConcreteTexture;
        static fromColor(width: number, height: number, color?: number, optimizeForRenderToTexture?: boolean, scale?: number): Texture;
        static fromEmbedded(base64String: string): Texture;
        static fromBitmapData(data: skylark.BitmapData, generateMipMaps?: boolean, optimizeForRenderToTexture?: boolean, scale?: number): Texture;
        public adjustVertexData(vertexData: skylark.VertexData, vertexID: number, count: number): void;
        public frame : skylark.Rectangle;
        public hasFrame(): boolean;
        public repeat : boolean;
        public width : number;
        public height : number;
        public nativeWidth : number;
        public nativeHeight : number;
        public scale : number;
        public base : skylark.ImageSource;
        public root : skylark.ConcreteTexture;
        public premultipliedAlpha : boolean;
    }
}
declare module skylark {
    class ConcreteTexture extends skylark.Texture {
        private _base;
        private _format;
        private _width;
        private _height;
        private _mipMapping;
        private _premultipliedAlpha;
        private _optimizedForRenderTexture;
        private _data;
        private _scale;
        constructor(width: number, height: number, scale?: number);
        constructor(base: skylark.ImageSource, scale?: number);
        constructor(base: CanvasImageSource, scale?: number);
        public dispose(): void;
        public base : skylark.ImageSource;
        public root : ConcreteTexture;
        public width : number;
        public height : number;
        public nativeWidth : number;
        public nativeHeight : number;
        public scale : number;
        public mipMapping : boolean;
        public premultipliedAlpha : boolean;
        public clear(color?: number, alpha?: number): void;
        public render(support: skylark.RenderSupport, context: CanvasRenderingContext2D): void;
    }
}
declare module skylark {
    class SubTexture extends skylark.Texture {
        private _parent;
        private _clipping;
        private _rootClipping;
        private _ownsParent;
        private static _texCoords;
        constructor(parentTexture: skylark.Texture, region: skylark.Rectangle, ownsParent?: boolean);
        public dispose(): void;
        private setClipping(value);
        public adjustVertexData(vertexData: skylark.VertexData, vertexID: number, count: number): void;
        public parent : skylark.Texture;
        public ownsParent : boolean;
        public clipping : skylark.Rectangle;
        public base : skylark.ImageSource;
        public root : skylark.ConcreteTexture;
        public width : number;
        public height : number;
        public nativeWidth : number;
        public nativeHeight : number;
        public premultipliedAlpha : boolean;
        public scale : number;
    }
}
declare module skylark {
    class TextureSmoothing {
        constructor();
        static NONE: string;
        static BILINEAR: string;
        static TRILINEAR: string;
        static isValid(smoothing: string): boolean;
    }
}
declare module skylark {
    class TextureAtlas {
        private _atlasTexture;
        private _textureRegions;
        private _textureFrames;
        private _names;
        constructor(texture: skylark.Texture, atlasXml?: Document);
        constructor(texture: skylark.Texture, atlasXml?: string);
        public dispose(): void;
        public parseAtlasXml(xml: Document): void;
        public getTexture(name: string): skylark.Texture;
        public getTextures(prefix?: string, result?: skylark.Texture[]): skylark.Texture[];
        public getNames(prefix?: string, result?: string[]): string[];
        public getRegion(name: string): skylark.Rectangle;
        public getFrame(name: string): skylark.Rectangle;
        public addRegion(name: string, region: skylark.Rectangle, frame?: skylark.Rectangle): void;
        public removeRegion(name: string): void;
    }
}
declare module skylark {
    class TextFieldAutoSize {
        constructor();
        static NONE: string;
        static HORIZONTAL: string;
        static VERTICAL: string;
        static BOTH_DIRECTIONS: string;
    }
}
declare module skylark {
    class TextField extends skylark.DisplayObjectContainer {
        private static BITMAP_FONT_DATA_NAME;
        private static _fonts;
        private _fontSize;
        private _color;
        private _text;
        private _fontName;
        private mHAlign;
        private mVAlign;
        private _bold;
        private _italic;
        private _underline;
        private _autoScale;
        private _autoSize;
        private _kerning;
        private _nativeFilters;
        private _requiresRedraw;
        private _isRenderedText;
        private _textBounds;
        private _batchable;
        private _hitArea;
        private _border;
        private _image;
        private _quadBatch;
        constructor(width: number, height: number, txt: string, fontName?: string, fontSize?: number, color?: number, bold?: boolean);
        public dispose(): void;
        private onFlatten();
        public render(support: skylark.RenderSupport): void;
        public redraw(): void;
        private createRenderedContents();
        public renderText(scale: number, resultTextBounds: skylark.Rectangle): CanvasImageSource;
        private createComposedContents();
        private updateBorder();
        private isHorizontalAutoSize;
        private isVerticalAutoSize;
        public textBounds : skylark.Rectangle;
        public getBounds(targetSpace: skylark.DisplayObject, resultRect?: skylark.Rectangle): skylark.Rectangle;
        public width : number;
        public height : number;
        public text : string;
        public fontName : string;
        public fontSize : number;
        public color : number;
        public hAlign : string;
        public vAlign : string;
        public border : boolean;
        public bold : boolean;
        public italic : boolean;
        public underline : boolean;
        public kerning : boolean;
        public autoScale : boolean;
        public autoSize : string;
        public batchable : boolean;
        public nativeFilters : any[];
        static registerBitmapFont(bitmapFont: skylark.BitmapFont, name?: string): string;
        static unregisterBitmapFont(name: string, dispose?: boolean): void;
        static getBitmapFont(name: string): skylark.BitmapFont;
        private static bitmapFonts;
    }
}
declare module skylark {
    class BitmapChar {
        private _texture;
        private _charID;
        private mXOffset;
        private mYOffset;
        private mXAdvance;
        private _kernings;
        constructor(id: number, texture: skylark.Texture, xOffset: number, yOffset: number, xAdvance: number);
        public addKerning(charID: number, amount: number): void;
        public getKerning(charID: number): number;
        public createImage(): skylark.Image;
        public charID : number;
        public xOffset : number;
        public yOffset : number;
        public xAdvance : number;
        public texture : skylark.Texture;
        public width : number;
        public height : number;
    }
}
declare module skylark {
    class BitmapFont {
        static NATIVE_SIZE: number;
        static MINI: string;
        private static CHAR_SPACE;
        private static CHAR_TAB;
        private static CHAR_NEWLINE;
        private static CHAR_CARRIAGE_RETURN;
        private _texture;
        private _chars;
        private _name;
        private _size;
        private _lineHeight;
        private _baseline;
        private _helperImage;
        private _charLocationPool;
        constructor(texture?: skylark.Texture, fontXml?: string);
        public dispose(): void;
        private parseFontXml(fontXml);
        public getChar(charID: number): skylark.BitmapChar;
        public addChar(charID: number, bitmapChar: skylark.BitmapChar): void;
        public createSprite(width: number, height: number, text: string, fontSize?: number, color?: number, hAlign?: string, vAlign?: string, autoScale?: boolean, kerning?: boolean): skylark.Sprite;
        public fillQuadBatch(quadBatch: skylark.QuadBatch, width: number, height: number, text: string, fontSize?: number, color?: number, hAlign?: string, vAlign?: string, autoScale?: boolean, kerning?: boolean): void;
        private arrangeChars(width, height, txt, fontSize?, hAlign?, vAlign?, autoScale?, kerning?);
        public name : string;
        public size : number;
        public lineHeight : number;
        public smoothing : string;
        public baseline : number;
    }
    class CharLocation {
        public char: skylark.BitmapChar;
        public scale: number;
        public x: number;
        public y: number;
        constructor(char: skylark.BitmapChar);
    }
}
declare module skylark {
    class MiniBitmapFont extends skylark.BitmapFont {
        private static IMAGE_DATA;
        private static BITMAP_WIDTH;
        private static BITMAP_HEIGHT;
        private static XML_DATA;
        constructor();
        static texture : skylark.Texture;
        static xml : string;
    }
}
