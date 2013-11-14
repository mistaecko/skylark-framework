/// <reference path="_externals.d.ts"/>
/// <reference path="polyfill/requestanimationframe.ts"/>

/// <reference path="skylark/types.ts"/>
/// <reference path="skylark/canvas.ts"/>

/// <reference path="skylark/media.ts"/>
/// <reference path="skylark/geom/_geom.ts"/>
/// <reference path="skylark/events/_events.ts"/>
/// <reference path="skylark/display/_display.ts"/>
/// <reference path="skylark/utils/_utils.ts"/>
/// <reference path="skylark/core/_core.ts"/>
/// <reference path="skylark/animation/_animation.ts"/>
/// <reference path="skylark/errors/_errors.ts"/>
/// <reference path="skylark/textures/_textures.ts"/>
/// <reference path="skylark/text/_text.ts"/>

(function(root, modules) {
    if (typeof exports === 'object') {
        module.exports = modules;
    } else if (typeof define === 'function' && (<any>define).amd) {
        // AMD. Register as an anonymous module.
        define(modules);
    } else {
        // Browser globals (root is window)
        root.returnExports = modules;
    }
})(this, skylark);
