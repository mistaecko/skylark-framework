interface Dictionary {
    [s: string]: any;
}

interface FontXml {
    info:any;
    common:any;
    chars:any;
    kernings:any;
}

// Alias for HTML5 Image constructor
//  we need the alias since we currently do not know
//  any way (in TypeScript) to access 'global' types
//  from inside a TS module that overwrites/hide a
//  global type.
var NativeImage = Image;
