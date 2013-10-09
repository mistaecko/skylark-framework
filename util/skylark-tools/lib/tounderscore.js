/**
 * Script that converts class member variables to 'underscore' syntax.
 *
 * Example:
 *
 *      // before:
 *     private mWidth:number = 0;
 *
 *     // after:
 *     private _width:number = 0;
 *
 *      // before:
 *     private static sHelper:Matrix;
 *
 *     // after:
 *     private static _helper:Matrix;
 *
 */
var path = require('path'),
    fs = require('fs'),
    walk = require('walk');

const FILE_ENCODING = 'UTF-8';
var CURRENT_PATH = path.resolve(__dirname);
var targetDir = path.join(CURRENT_PATH, '..', '..', 'src', 'skylark');

function processSrcDir() {
    console.log(targetDir);

    // Walker options
    var walker = walk.walk(targetDir, { followLinks: false, filters: [".ts"] });

    walker.on('file', function(root, stat, next) {
        processFile(path.join(root, stat.name));
        next();
    });

    //walker.on('end', function() {});
}

function processContent(content) {
    return content.replace(/\bs([A-Z])([a-z]*)/g, function(a, $1, $2) {
        return '_' + $1.toLowerCase() + $2;
    });
}

function processFile(path) {
    console.log(path);
    var content = fs.readFileSync(path, FILE_ENCODING);
    var output = processContent(content);
    fs.writeFileSync(path, output, FILE_ENCODING);
}

function test() {
    var input = "private static sCount:number = 0;\nprivate static sCount:number = 0;\n";
    var reference = "private static _count:number = 0;\nprivate static _count:number = 0;\n";

    var result = processContent(input);

    var success = (result == reference);
    console.log('RESULT: ' + success);
    if (!success)
        console.log(result);
}

//test();
processSrcDir();
