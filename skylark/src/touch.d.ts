interface Touch {
    identifier:number;
    target:EventTarget;
    screenX:number;
    screenY:number;
    clientX:number;
    clientY:number;
    pageX:number;
    pageY:number;
}
declare var Touch: {
    prototype: Touch;
    new(): Touch;
}

interface TouchList {
    length:number;
    item (index:number):Touch;
    identifiedTouch(identifier:number):Touch;
}
declare var TouchList: {
    prototype: TouchList;
    new(): TouchList;
}

interface TouchEvent extends UIEvent {
    touches:TouchList;
    targetTouches:TouchList;
    changedTouches:TouchList;
    altKey:boolean;
    metaKey:boolean;
    ctrlKey:boolean;
    shiftKey:boolean;
    initTouchEvent (type:string, canBubble:boolean, cancelable:boolean, view:any/*AbstractView*/, detail:number, ctrlKey:boolean, altKey:boolean, shiftKey:boolean, metaKey:boolean, touches:TouchList, targetTouches:TouchList, changedTouches:TouchList);
}

declare var TouchEvent: {
    prototype: TouchEvent;
    new(): TouchEvent;
}

declare module native {
    class Touch {
        prototype: Touch;
        new(): Touch;
    }
    class TouchList {
        prototype: TouchList;
        new(): TouchList;
    }
    class TouchEvent {
        prototype: TouchEvent;
        new(): TouchEvent;
    }
}
