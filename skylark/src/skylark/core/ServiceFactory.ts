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

    export class ServiceFactory {

        //noinspection JSValidateTypes
        public services:Dictionary = <Dictionary>{
            assetManager: 'skylark.PxLoaderAssetManager',
            canvasProvider: 'skylark.HTMLCanvasProvider'
        };

        private instances:Dictionary = <Dictionary>{};

        constructor() {}

        /**
         * Configure Skylark to 'use' the given object. 'obj' might be
         * an actual object (as in instance of a 'class'), a constructor function,
         * or a 3rd party library.
         * Of course this only works for objects that we explicitely support, e.g.
         *  - the PreloadJS library
         *  - any implementation of ImageLoaderFactory
         *  - any implementation of CanvasProviderFactory
         */
        public use(obj:any):any {
            if(obj == null)
                throw new ArgumentError('Parameter "obj:0" is null or undefined!');
            return Skylark;
        }

        public get(name:string):any {
            var instance = this.instances[name];
            if(instance == null) {
                instance = this.resolve(name);
                this.instances[name] = instance;
            }
            return instance;
        }

        private resolve(name:string):any {
            var resolved = this.services[name];
            var instance;

            if(typeof resolved === 'function')
                resolved = resolved();

            if(typeof resolved === 'string')
                resolved = eval(resolved);

            if(typeof resolved === 'function') {
                instance = new resolved();
            } else if(typeof resolved === 'object') {
                instance = resolved;
            } else if(resolved != null) {
                throw new Error('We do not understand service or service factory for "' + name + '"');
            } else if(this.services[name] == null) {
                throw new Error('Could not resolve service for "' + name + '"' +
                    ' - service is not configured!');
            } else {
                throw new Error('Could not resolve service for "' + name + '"' +
                    ' - configuration resolved to NULL or UNDEFINED');
            }

            this.instances[name] = instance;
            return instance;
        }

    }
}
