/// <reference path="../../_dependencies.ts"/>

interface AssetSource {
    url:string;
    type:string;
}

module skylark {

    export class PxLoaderAssetManager extends AssetManager {

        private _loader:any;

        getLoader():any {
            var loader = this._loader;
            if(loader == null)
                loader = this._loader = this.createLoader();

            return loader;
        }

        createLoader():any {
            return new PxLoader();
        }

        public enqueue(...rawAssets):void {
            var loader = this.getLoader();

            function add(url, type) {
                if(url == null)
                    throw new Error('Missing required parameter "url"');

                if(type === 'image')
                    loader.addImage(url)
                else if(type === 'sound')
                    loader.addSound(url);
                else if(type === 'xml')
                    loader.addXml(url);
                else if(type == null)
                    loader.addGeneric(url);
            }

            for(var i = 0; i < rawAssets.length; i++) {
                var rawAsset = rawAssets[i];

                if(Array.isArray(rawAsset)) {
                    this.enqueue.apply(this, rawAsset);

                } else if(typeof rawAsset === 'string') {
                    var type = this.getType(rawAsset);
                    add(rawAsset, type);

                } else if(typeof rawAsset === 'object') {
                    var type = this.getType(rawAsset);
                    if(rawAsset.url == null)
                        throw new Error('Asset definition is missing required property "url"!');
                    add(rawAsset.url, type);

                } else {
                    this.log("Ignoring unsupported asset type: " + ClassUtil.getQualifiedClassName(rawAsset));
                }
            }

        }

        public getType(url:string);

        public getType(definition:AssetSource);

        public getType(url:any) {
            if(typeof url === 'object' && url.type)
                return url.type;

            var type;
            var ext = /\.(\w{1,3})$/.exec(url);
            if(ext == null || !ext.length)
                return null;

            switch(ext[1]) {
                case 'png':
                case 'jpeg':
                    type = 'image';
                    break;
                case 'mp3':
                case 'ogg':
                    type = 'audio';
                    break;
                case 'xml':
                    type = 'xml';
                    break;
            }
            return type;
        }

        public loadQueue(onProgress:(ratio:number, complete:boolean)=>void) {
            var loader = this._loader;

            // no loader means no queue -> we are already done
            if(!this._loader) {
                onProgress(1, true);
                return;
            }

            // process PxLoader events
            loader.addProgressListener((e:PxProgressEvent) => {
                if(e.error)
                    this.onError(e);
                else if(e.loaded)
                    this.onLoaded(e);
                else if(e.timeout)
                    this.onTimeout(e);
//                else if(status === PxResourceState.WAITING)
//                    this.onWaiting(e);

                // don't fire when complete - completion listener below takes care of that
                if((e.completedCount / e.totalCount) < 1)
                    onProgress(e.completedCount / e.totalCount, false);
            });

            loader.addCompletionListener((e:PxProgressEvent) => {
                this.onComplete(e);
                onProgress(1, true);
            });

            loader.start(['image', 'textureatlas', 'xml']);
        }

        private onError(e:PxProgressEvent) {
            console.log('[ERROR] Resource failed!');
        }

        private onLoaded(e:PxProgressEvent) {
            var resource = e.resource;
            if(resource instanceof PxLoaderXml) {
                var rootNode = resource.rootNode;
                if(rootNode && rootNode.nodeName === 'TextureAtlas') {
                    this.processTextureAtlas(resource.getXml(), resource);
                } else {
                    throw new Error('Unsupported XML content - expecting a root node "TextureAtlas" but found "' + rootNode + '"');
                }
            } else if(resource instanceof PxLoaderImage) {
                var name = this.getName(resource.getName());
                var img = resource.img;
                this.addTexture(name, new ConcreteTexture(new DefaultImageSource(img)));
            }
        }

        private onTimeout(e:PxProgressEvent) {
            console.log('[ERROR] Resource timed out!');
        }

        private onComplete(e:PxProgressEvent) {
            this.processPending();
            // trigger default complete handling (fires event)
            this.onQueueComplete();
        }
}

    export class PxLoaderXml {

        private _complete:boolean = false;
        private _tags:string[] = [];
        private _data:Document;
        private _loader:PxLoader;
        private _priority:number;
        private _name:string;

        constructor(name:string, tags?:any, priority?:number) {
            this._name = name;
            this._tags = tags;
            this._priority = priority;
        }

        public start(pxLoader:PxLoader) {
            // we need the loader ref so we can notify upon completion
            var loader = this._loader = pxLoader;

            var xhr = new XMLHttpRequest();
            //http://nullprogram.com/blog/2013/02/08/
            function cleanup() {
                xhr.onload = null;
                xhr.onerror = null;
                xhr.onabort = null;
            }

            xhr.onload = (evt:ProgressEvent)=> {
                cleanup();
                this.onLoad(xhr.responseXML);
            };
            xhr.onerror = (evt:any)=> {
                cleanup();
                this.onError(xhr.statusText);
            };
            xhr.onabort = (evt:ProgressEvent)=> {
                cleanup();
                this.onAbort()
            };
            xhr.ontimeout = (evt:ProgressEvent)=> {
                cleanup();
                this.onTimeout()
            };
            ;

            //xhr.overrideMimeType('application/xml');
            //xhr.timeout = 4000;
            xhr.open("GET", this._name);
            xhr.send();
        }

        public checkStatus() {
            if(this._complete)
                this._loader.onLoad(this);
        }

        public getName():string {
            return this._name;
        }

        public getXml():Document {
            return this._data;
        }

        public onTimeout() {
            if(this._complete)
                this._loader.onLoad(this);
            else
                this._loader.onTimeout(this);
        }

        public onLoad(data) {
            this._complete = true;
            this._data = <Document>data;
            this._loader.onLoad(this);
        }

        public onError(textStatus) {
            this._loader.onError(this);
        }

        public onAbort() {
            this._loader.onError(this);
        }

        public get complete():boolean {
            return this._complete;
        }

        public get rootNode():Node {
            return AssetManager.findRootNode(this._data);
        }

    }
}

PxLoader['prototype']['addXml'] = function(name, tags, priority) {
    var loader = new skylark.PxLoaderXml(name, tags, priority);
    this.add(loader);
    return name;
};


