var util = require('util'),
    path = require('path'),
    fs = require('fs');

function As2ts() {
    this.hierarchy = {
        geom: ['Rectangle', 'Point', 'Matrix'],
        animation: ['DelayedCall', 'Juggler', 'Transitions', 'Tween', 'IAnimatable'],
        core: ['RenderSupport', 'Starling', 'TouchMarker', 'TouchProcessor'],
        errors: ['AbstractClassError', 'AbstractMethodError', 'ArgumentError', 'IllegalOperationError', 'MissingContextError'],
        events: ['Event', 'EventDispatcher', 'EnterFrameEvent', 'Touch', 'TouchEvent', 'TouchPhase'],
        utils: ['VertexData', 'MatrixUtil', 'ClassUtil', 'StringUtil', 'RectangleUtil', 'ScaleMode', 'HAlign', 'VAlign', 'ColorUtil', 'MathUtil', 'AssetManager'],
        display3D: ['Context3D', 'Program3D', 'VertexBuffer3D', 'IndexBuffer3D'],
        textures: ['Texture', 'SubTexture', 'Bitmap', 'BitmapData', 'ByteArray', 'TextureBase', 'ConcreteTexture', 'TextureSmoothing'],
        text: ['BitmapChar', 'BitmapFont', 'MiniBitmapFont', 'TextField', 'TextFieldAutoSize'],
        display: ['Button', 'Sprite', 'Stage', 'Quad', 'Image', 'QuadBatch', 'DisplayObject', 'DisplayObjectContainer', 'BlendMode', 'MovieClip']
    };
}
//
//As2ts.prototype.readClassHierarchy = function(root) {
//    var result = this.readDir(root);
//    this.hierarchy = result;
//    return result;
//}
//
//As2ts.prototype.readDir = function(dir) {
//    var t = this,
//        entry;
//
//    if(fs.statSync(dir).isDirectory()) {
//        entry = fs.readdirSync(dir).map(function(name) {
//            return t.readDir(path.join(dir, name));
//        });
//    } else {
//        if(/[a-zA-Z][0-9a-zA-Z]*\.ts/.test(path.basename(dir)))
//            entry = path.basename(dir, path.extname(dir));
//    }
//
//    return entry;
//}

As2ts.prototype.convert = function(file) {
    if(fs.statSync(file).isDirectory())
        return this.convertDir(file);

    var className = path.basename(file, path.extname(file));
    //var moduleName= path.basename(path.normalize(path.join((file, '..'))));

    var content = fs.readFileSync(file, 'UTF-8');
    var match = content.match(/(module|package) ([a-zA-Z_][a-zA-Z0-9_]*)/);
    var moduleName = match && match.length > 2 ? match[2] : null;

    content = this.convertStr(content, className, moduleName);

    fs.writeFileSync(file, content, 'UTF-8');

    console.log('Result written to ' + file);
};

var re = /^[a-zA-Z][0-9a-zA-Z]*\.ts$/;

As2ts.prototype.convertDir = function(p) {
    var t = this;
    process(null, fs.readdirSync(p));

    function process(err, files) {
        if (err)
            throw err;

        for (var i = 0; i < files.length; i++) {
            var f = path.join(p, files[i]);
            if(fs.statSync(f).isDirectory())
                t.convertDir(f);
            else if(re.test(files[i])){
                console.info('Processing file: ' + f);
                t.convert(f)
            }
        }
    }
};

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
// private function overridex
As2ts.prototype.convertTestStr = function(content, className, moduleName) {
    //console.log('processing special Test Class rules..');


//    // duplicate from convertStr
//    content = content.replace(/(private|public|protected)(\s?static)?\s*var\s*/g, '$1$2 ');
//    content = content.replace(/(internal)\s*function\s*/g, 'private ');
//    content = content.replace(/(private|public|protected|)(\s?static)?\s*function\s*/g, '$1$2 ');

    // annotations
    content = content.replace(/^(\s*)(\[[^\]]*\])(\s*)$/mg, '$1//$2$3');

    // test class declaration => describe
    content = content.replace(/export class (.*)(\s?{?)/g, 'describe(\'' + className + '\', function()$2');

    content = content.replace(/(public) test(\w*)\(\):void(\s?{?)/g, 'it(\'$2\', function()$3');

    content = content.replace(/(assert\.)?assertThat\((.*),\s?closeTo\((.*)\)\)/g, 'assert.closeTo($2, $3)');

    // 2steps per mapping entry:
    //  (1) simple replace on the entire string
    //  (2) make sure each 'to' value is prefixed with 'assert'
    var methods = [
        {from: 'assertNotNull', to: 'isNotNull'},
        {from: 'assertNull', to: 'isNull'},
        {from: 'assertTrue', to: 'isTrue'},
        {from: 'assertFalse', to: 'isFalse'},
        {from: 'assertEquals', to: 'equal'},
        {from: 'assertThat', to: 'assertThat'}// we only need (2) above
    ];
    for(var i = 0; i < methods.length; i++) {
        // /assertNotNull/g
        var entry = methods[i],
            from = entry.from,
            to = entry.to;
        content = content.replace(new RegExp(from, 'g'), to);
        content = content.replace(new RegExp('\\s' + to, 'g'), ' assert.' + to);
    }

    content = content.replace(/Assert\./g, 'assert.');

    return content;
};

As2ts.prototype.convertStr = function(content, className, moduleName) {
    if(className === undefined)
        throw new Error('Method parameter "className:1" is required.');

    var isTest = /^.*Tests$/g.test(className);

    function fixBuiltInTypes() {
        // Boolean
        content = content.replace(/:Boolean/g, ':boolean');

        content = content.replace(/:int/g, ':number');
        content = content.replace(/:Number/g, ':number');
        content = content.replace(/:uint/g, ':number/*uint*/');
        content = content.replace(/:String/g, ':string');
    }

    fixBuiltInTypes();

    // override
    content = content.replace(/override\s*/g, '');

    // final
    content = content.replace(/\bfinal\s+/g, '');

    var regex = new RegExp('var|protected|private|public');

    // remove type from catch clause
    content = content.replace(/(catch\s?)\((\w+):[a-zA-Z0-9.]*\)/g, '$1($2)');

    // prefix member variable references with 'this.'
    content = this.forEachLine(content, function(line) {
        if(line.search(regex) === -1) {
            // note: (?!:)(?=.) will exclude variable definitions (identified by a trailing colon)
            return line.replace(/(^|\s|\(|\!|--|\+\+|\+|-|\[)(m[A-Z]+[0-9a-zA-Z]*)\b(?!:)(?=.)/g, '$1this.$2');
        } else
            return line;
    });


    // prefix static member variable references with 'ClassName.'
    content = this.forEachLine(content, function(line) {
        if(line.search(regex) === -1)
            return line.replace(/(^|\(|\s|\!|--|\+\+|\+|-|\[)(s[A-Z]+[0-9a-zA-Z]*)\b/g, '$1' + className + '.$2');
        else
            return line;
    });

    //content = content.replace(/private\s*var/g, 'private');
    //content = content.replace(/private\s*static\s*var/g, 'private static');

    //for each (var touch:events.Touch in touches) {
    content = content.replace(/for each \(var (\w+:[\w\.]+) in (\w+)\)\s?\{/g, 'for(var i=0; i<$2.length; i++) {\nvar $1 = $2[i];\n');

    // anonymous functions
    content = content.replace(/\(function\(\):void {/g, '(()=> {');

    if(isTest) {
        // private functions turn into inline functions (instead of private member functions
        content = content.replace(/private function/g, 'function');


        content = content.replace(/(private|public|protected)(\s?static)?\s*var\s*/g, '$1$2 ');

        content = content.replace(/(internal)\s*function\s*/g, 'private ');
        content = content.replace(/(public|protected)(\s?static)?\s*function\s*/g, '$1$2 ');

    } else {
        content = content.replace(/(private|public|protected)(\s?static)?\s*var\s*/g, '$1$2 ');

        content = content.replace(/(internal)\s*function\s*/g, 'private ');
        content = content.replace(/(private|public|protected|)(\s?static)?\s*function\s*/g, '$1$2 ');
    }

    //content = content.replace(/(\s?static)?\s*function\s*/g, '$1$2 ');
    //content = content.replace(/(private|public)(\s?static)?\s*function\s*/g, '$1$2 ');

    // protected =>
    content = content.replace(/protected\s+/g, '');


    content = content.replace(/([a-zA-Z_][a-zA-Z0-9_]*) as Vector\.<([a-zA-Z_][a-zA-Z0-9_]*)>/g, '<Array/*$2*/>$1');
    content = content.replace(/([a-zA-Z_][a-zA-Z0-9_\[\].]*) as ([a-zA-Z_][a-zA-Z0-9_]*)/g, '<$2>$1 /* IMPORTANT: AS3 returns NULL if type is not castable! */');

    content = content.replace(/= new <(\w*)>\[\]/g, '= [/*$1*/]');
    content = content.replace(/Vector.<(\w*)>/g, '$1[]');
    //mEventListeners[type] as Vector.<Function>'

    content = content.replace(/\bconst\b\s?/g, '');

    content = content.replace(/package starling.(\w*)/g, 'module $1');
    content = content.replace(/import ([\w.]*);?\s*$/mg, '');

    // event definitions
    content = content.replace(/(\[Event\(name=".*", type=".*"\)\])/g, '//$1');

    // use internal namespace
    content = content.replace(/use namespace .*;/g, '');

    // class definition
    content = content.replace(/public class/g, 'export class');

    // property setters - remove return type
    content = content.replace(/(public set .*\)):([a-zA-Z_][a-zA-Z0-9_]*)/g, '$1');

    //content = content.replace(/^((?!var).*)\s(\bm[A-Z]+[0-9a-zA-Z]*\b)/g, 'this.$2');

    // constructor
    // /(public|protected|private) DisplayObject\((.*)\)/g
    content = content.replace(new RegExp('(public|protected|private) ' + className + '\\((.*)\\)'), 'constructor($2)');

    // int casts
    content = content.replace(/\bint\(/g, 'Math.abs(');

    // call a 2nd time in case one of our rules produced an incorrectly named type - exammple: the Vector conversion
    fixBuiltInTypes();

    var hierarchy = this.hierarchy;

    for(var m in hierarchy) {
        var classes = hierarchy[m];
        if(m !== moduleName)
            for (var i = 0; i < classes.length; i++) {
                var cls = classes[i];
                if(className !== cls) {
                    content = content.replace(new RegExp('<' + cls + '>', 'g'), '<' + m + '.' + cls + '>');
                    content = content.replace(new RegExp('\:' + cls, 'g'), ':' + m + '.' + cls);
                    content = content.replace(new RegExp('new ' + cls, 'g'), 'new ' + m + '.' + cls);
                    // ?=  non-capturing
                    content = content.replace(new RegExp('(\\s|^|\\(|\\!|--|\\+\\+|\\+|-|\\[)' + cls + '(\\.[A-Z_]+)', 'g'), '$1' + m + '.' + cls + '$2');
                    // extends
                    content = content.replace(new RegExp('(class \\w+ extends )(' + cls + ')', 'g'), '$1' + m + '.' + cls);
                }
            }
    }


    /// TESTS ///

    if(isTest) {
        content = this.convertTestStr(content, className, moduleName);
    }

    return content;
};

As2ts.prototype.forEachLine = function(str, fn) {
    var arr = str.split(/\r\n|\n/);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = fn.call(this, arr[i]);
    }
    return arr.join('\n');
}

exports = module.exports = new As2ts();

