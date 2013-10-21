// TypeScript definitions for the `_common.js` file


/// <reference path="../src/module.d.ts"/>
/// <reference path="mocha/mocha.d.ts"/>

declare var sinon;

declare var isBrowser;
declare var isNode;
declare var isCommonJs;

declare var skipIfFirefox:{ it:itDef; describe:describeDef };