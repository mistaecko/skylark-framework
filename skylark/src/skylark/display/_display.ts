/// <reference path="DisplayObject.ts"/>
/// <reference path="DisplayObjectContainer.ts"/>
/// <reference path="Quad.ts"/>
/// <reference path="Image.ts"/>
/// <reference path="MovieClip.ts"/>
/// <reference path="Sprite.ts"/>
/// <reference path="Stage.ts"/>
/// <reference path="BlendMode.ts"/>
/// <reference path="Button.ts"/>

declare module skylark/*.display*/ {
    export class QuadBatch extends Quad {
        constructor();
        touchable:boolean;
        reset():void;
        batchable:boolean;
        addImage(...args:any[]):void;
    }
}
