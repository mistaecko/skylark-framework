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
    export class Arguments {
        public static number(...args:any[]):void {
            for(var i = 0; i < args.length; i++) {
                var arg = args[i];
                if(typeof arg !== 'number')
                    throw new ArgumentError('Value is not a number: ' + arg);

            }
        }
    }
}
