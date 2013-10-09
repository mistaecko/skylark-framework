// =================================================================================================
//
//	Skylark Framework
//	Copyright 2012 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
/// <reference path="../../_dependencies.ts"/>

declare class Sound {
    play(startTime:number, loops:number, transform:SoundTransform);
}
interface SoundChannel {}
interface SoundTransform {}

module skylark {

    /** The AssetManager handles loading and accessing a variety of asset types. You can
     *  add assets directly (via the 'add...' methods) or asynchronously via a queue. This allows
     *  you to deal with assets in a unified way, no matter if they are loaded from a file,
     *  directory, URL, or from an embedded object.
     *
     *  <p>If you load files from disk, the following types are supported:
     *  <code>png, jpg, atf, mp3, xml, fnt</code></p>
     */
    export class AssetManager extends EventDispatcher {

        private SUPPORTED_EXTENSIONS:string[] = ["png", "jpg", "jpeg", "atf", "mp3", "xml", "fnt"];

        private _scaleFactor:number;
        private _useMipMaps:boolean;
        private _verbose:boolean;

        private _textures:Dictionary;
        private _atlases:Dictionary;
        private _sounds:Dictionary;

        private _pending:any[];

        /** helper objects */
        private static _names:string[] = [];

        /** Create a new AssetManager. The 'scaleFactor' and 'useMipmaps' parameters define
         *  how enqueued bitmaps will be converted to textures. */
        constructor(scaleFactor:number = 1.0, useMipmaps:boolean = false) {
            super();
            this._verbose = false;
            this._scaleFactor = scaleFactor;
            this._useMipMaps = useMipmaps;
            this._textures = <Dictionary>{};
            this._atlases = <Dictionary>{};
            this._sounds = <Dictionary>{};
        }

        /** Disposes all contained textures. */
        public dispose():void {
            var key:string;
            var textures = this._textures;
            var atlases = this._atlases;

            for(key in textures) {
                if(textures.hasOwnProperty(key)) {
                    textures[key].dispose();
                    delete textures[key];
                }
            }
            for(key in atlases) {
                if(atlases.hasOwnProperty(key)) {
                    atlases[key].dispose();
                    delete atlases[key];
                }
            }
        }

        // retrieving

        /** Returns a texture with a certain name. The method first looks through the directly
         *  added textures; if no texture with that name is found, it scans through all
         *  texture atlases. */
        public getTexture(name:string):Texture {
            var textures = this._textures;
            if(name in textures) {
                return textures[name];
            } else {
                var atlases = this._atlases;
                for(var key in atlases) {
                    if(atlases.hasOwnProperty(key)) {
                        var texture:Texture = atlases[key].getTexture(name);
                        if(texture)
                            return texture;
                    }
                }
                return null;
            }
        }

        /** Returns all textures that start with a certain string, sorted alphabetically
         *  (especially useful for "MovieClip"). */
        public getTextures(prefix?:string, result?:Texture[]):Texture[];

        public getTextures(prefix:string[], result?:Texture[]):Texture[];

        public getTextures(a?:any, result?:Texture[]):Texture[] {
            var names:string[];
            var prefix:string;
            if(Array.isArray(a)) {
                names = <string[]>a;
            } else {
                prefix = <string>a;
                names = this.getTextureNames(prefix, AssetManager._names);
            }

            if(result == null) result = [];

            for(var i = 0; i < names.length; i++)
                result.push(this.getTexture(names[i]));

            AssetManager._names.length = 0;
            return result;
        }

        /** Returns all texture names that start with a certain string, sorted alphabetically. */
        public getTextureNames(prefix:string = "", result:string[] = null):string[] {
            if(result == null)
                result = [];

            var key;

            var textures = this._textures;
            for(key in textures)
                if(textures.hasOwnProperty(key))
                    if(key.indexOf(prefix) == 0)
                        result.push(key);

            var atlases = this._atlases;
            for(key in atlases)
                if(atlases.hasOwnProperty(key))
                    atlases[key].getNames(prefix, result);

            StringUtil.sortArray(result);

            return result;
        }

        /** Returns a texture atlas with a certain name, or null if it's not found. */
        public getTextureAtlas(name:string):TextureAtlas {
            return <TextureAtlas>this._atlases[name];
        }

        /** Returns a sound with a certain name. */
        public getSound(name:string):Sound {
            return this._sounds[name];
        }

        /** Returns all sound names that start with a certain string, sorted alphabetically. */
        public getSoundNames(prefix:string = ""):string[] {
            var names:string[] = [];

            var sounds = this._sounds;
            for(var name in  sounds)
                if(sounds.hasOwnProperty(name))
                    if(name.indexOf(prefix) == 0)
                        names.push(name);

            return StringUtil.sortArray(names);
        }

        /** Generates a new SoundChannel object to play back the sound. This method returns a
         *  SoundChannel object, which you can access to stop the sound and to control volume. */
        public playSound(name:string, startTime:number = 0, loops:number = 0, transform:SoundTransform = null):SoundChannel {
            if(name in this._sounds)
                return this.getSound(name).play(startTime, loops, transform);
            else
                return null;
        }

        // direct adding

        /** Register a texture under a certain name. It will be availble right away. */
        public addTexture(name:string, texture:Texture):void {
            if(this._verbose)
                this.log("Adding texture '" + name + "'");

            var textures = this._textures;
            if(name in textures)
                throw new Error("Duplicate texture name: " + name);

            textures[name] = texture;
        }

        /** Register a texture atlas under a certain name. It will be availble right away. */
        public addTextureAtlas(name:string, atlas:TextureAtlas):void {
            if(this._verbose)
                this.log("Adding texture atlas '" + name + "'");

            var atlases = this._atlases;
            if(name in atlases)
                throw new Error("Duplicate texture atlas name: " + name);

            atlases[name] = atlas;
        }

        /** Register a sound under a certain name. It will be availble right away. */
        public addSound(name:string, sound:Sound):void {
            if(this._verbose)
                this.log("Adding sound '" + name + "'");

            var sounds = this._sounds;
            if(name in sounds)
                throw new Error("Duplicate sound name: " + name);

            sounds[name] = sound;
        }

        // removing

        /** Removes a certain texture, optionally disposing it. */
        public removeTexture(name:string, dispose:boolean = true):void {
            var textures = this._textures;
            var texture;
            if(dispose && (texture = textures[name]))
                texture.dispose();

            delete textures[name];
        }

        /** Removes a certain texture atlas, optionally disposing it. */
        public removeTextureAtlas(name:string, dispose:boolean = true):void {
            var atlases = this._atlases;
            var atlas;
            if(dispose && (atlas = atlases[name]))
                atlas.dispose();

            delete atlases[name];
        }

        /** Removes a certain sound. */
        public removeSound(name:string):void {
            delete this._sounds[name];
        }

        /** Removes assets of all types and empties the queue. */
        public purge():void {
            var textures = this._textures;
            var key;
            for(key in textures)
                if(textures.hasOwnProperty(key))
                    textures[key].dispose();

            var atlases = this._atlases;
            for(key in atlases)
                if(atlases.hasOwnProperty(key))
                    atlases[key].dispose();

            this._textures = <Dictionary>{};
            this._atlases = <Dictionary>{};
            this._sounds = <Dictionary>{};
        }

        // queued adding

        /** Enqueues one or more raw assets; they will only be available after successfully
         *  executing the "loadQueue" method. This method accepts a variety of different objects:
         *
         *  <ul>
         *    <li>Strings containing an URL to a local or remote resource. Supported types:
         *        <code>png, jpg, atf, mp3, fnt, xml</code> (texture atlas).</li>
         *    <li>Instances of the File class (AIR only) pointing to a directory or a file.
         *        Directories will be scanned recursively for all supported types.</li>
         *    <li>Classes that contain <code>static</code> embedded assets.</li>
         *  </ul>
         *
         *  Suitable object names are extracted automatically: A file named "image.png" will be
         *  accessible under the name "image". When enqueuing embedded assets via a class,
         *  the variable name of the embedded object will be <its>used name. An exception
         *  are texture atlases: they will have the same <the>name actual texture they are
         *  referencing.
         */
        public enqueue(...rawAssets):void {
            throw new AbstractMethodError();
        }

        /** Loads all enqueued assets asynchronously. The 'onProgress' will be called
         *  with a 'ratio' between '0.0' and '1.0', with '1.0' meaning that it's complete.
         *
         *  @param onProgress: <code> (ratio:number):void;</code>
         */
        public loadQueue(onProgress:(ratio:number, complete:boolean)=>void) {
            throw new AbstractMethodError();
        }

        onQueueComplete() {
            this.dispatchEventWith(Event.COMPLETE, false);
        }

        // helpers

        //@protected
        processTextureAtlas(xml:Document, resource, resume:boolean = false) {
            var root = AssetManager.findRootNode(xml);

            if(root.nodeName !== 'TextureAtlas')
                throw new ArgumentError('Provided XML document/node is not named "TextureAtlas"');

            var imagePath:string = (/*TSD bug?*/<any>root).getAttribute('imagePath');
            // todo [DISCUSS] - should we use the filename or the base texture name as name for the TextureAtlas
            var name = this.getName(imagePath);

            var atlasTexture:Texture = this.getTexture(name);
            if(atlasTexture == null) {
                if(resume)
                    throw new Error('Texture for TextureAtlas is missing: ' + name);
                else
                    this.addPending({
                        resume: ()=> {
                            this.processTextureAtlas(xml, resource, true);
                        }
                    });
            } else {
                this.addTextureAtlas(name, new TextureAtlas(atlasTexture, xml));
                this.removeTexture(name, false);
            }
        }

        //@protected
        addPending(job:any) {
            var pending = this._pending;
            if(!pending)
                this._pending = pending = [];

            pending.push(job);
        }

        processPending() {
            var pending = this._pending;
            if(pending) {
                this._pending = null;
                pending = pending.slice(0);
                for(var i = 0; i < pending.length; i++) {
                    pending[i].resume();
                }
            }
        }

        private static _urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

        // @protected
        getName(name:string):string {
            if(typeof name !== 'string')
                throw new ArgumentError('Cannot extract name from non-String: ' + name);

            var matches:any;

            matches = AssetManager._urlParseRE.exec(name);

            if(matches && matches.length >= 15) {
                name = decodeURIComponent(matches[15]);
                matches = /(.*?)(\.[\w]{1,4})?$/.exec(name);
                if(matches && matches.length)
                    return matches[1];
            }
            throw new ArgumentError("Could not extract name from String '" + name + "'");
        }

        // @protected
        public log(message:string):void {
            if(this._verbose)
                console.log("[AssetManager]", message);
        }

        // properties

        /** When activated, the class will trace information about added/enqueued assets. */
        public get verbose():boolean {
            return this._verbose;
        }

        public set verbose(value:boolean) {
            this._verbose = value;
        }

        /** For bitmap textures, this flag indicates if mip maps should be generated when they
         *  are loaded; for ATF textures, it indicates if mip maps are valid and should be
         *  used. */
        public get useMipMaps():boolean {
            return this._useMipMaps;
        }

        public set useMipMaps(value:boolean) {
            this._useMipMaps = value;
        }

        /** Textures that are created from Bitmaps or ATF files will have the scale factor
         *  assigned here. */
        public get scaleFactor():number {
            return this._scaleFactor;
        }

        public set scaleFactor(value:number) {
            this._scaleFactor = value;
        }

        public static findRootNode(data:Document):Node {
            if(!data || !data.hasChildNodes())
                return null;

            var children = data.childNodes;
            var node:Node;
            for(var i = 0; i < children.length; i++) {
                node = children[i];
                if(node.nodeType === Node.ELEMENT_NODE) {
                    break;
                }
            }
            return node;
        }
    }
}
