
interface PxProgressEvent {
    resource:any;

    loaded:boolean;
    error:boolean;
    timeout:boolean;

    completedCount:number;
    totalCount:number;
}

interface PxProgressListener {
    (event:PxProgressEvent):void
}
interface PxCompletionListener {
    (event:PxProgressEvent):void
}
declare enum PxResourceState {
    QUEUED, WAITING, LOADED, ERROR, TIMEOUT
}

interface PxResourceLoader {
    getName():string;
    // note: incomplete
}

declare class PxLoaderImage implements PxResourceLoader {
    constructor(url:string, tags:string[], priority:number);
    public img:HTMLImageElement;
    getName():string;
    // note: incomplete
}

declare class PxLoader {
    static ResourceState:PxResourceState;

    addCompletionListener(cb:PxCompletionListener, tags?:any):void;
    addProgressListener(cb:PxProgressListener, tags?:any):void;

    onLoad(a:PxResourceLoader):any;
    onError(a:PxResourceLoader):any;
    onTimeout(a:PxResourceLoader):any;

    addSound(name:string, tags?:any, priority?:number):any;
    addImage(name:string, tags?:any, priority?:number):any;
    addXml(name:string, tags?:any, priority?:number):any;

}
