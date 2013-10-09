/**
 * Script that analyzes the Skylark source and collects all
 * dependencies to other Skylark classes per file and replaces
 * its usages with direct (non-prefixed) references. Also adds
 * import statements for all classes to the module scope.
 */
var path = require('path'),
    fs = require('fs'),
    walk = require('walk'),
    Hierarchy = require('./Hierarchy');

const FILE_ENCODING = 'UTF-8';
var CURRENT_PATH = path.resolve(__dirname);

function log() {
    arguments[0] = '[toflat] ' + arguments[0];
    console.log.apply(console, arguments);
}

function walkSrc(fn, targetDir) {
    if(targetDir == null) {
        targetDir = path.join(CURRENT_PATH, '..', '..', '..', 'src', 'skylark');
        log('Defaulting to Skylark source directory: ' + targetDir);
        if(!fs.existsSync(path.join(targetDir, 'core')))
            throw new Error('This is not the Skylark source directory!');
    }

    var listeners = {
        file: function(root, stat, next) {
            fn(path.join(root, stat.name));
            next();
        }
    }
    // Walker options
    var walker = walk.walkSync(targetDir, { followLinks: false, listeners: listeners });
}

function forEachLine(str, fn) {
    var arr = str.split(/\r\n|\n/);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = fn.call(this, arr[i]);
    }
    return arr.join('\n');
}

var ToFlat = (function() {
    var ToFlat = function(hierarchy) {
        this.hierarchy = hierarchy;
    };

    ToFlat.prototype = {
        processFile: function(path) {
            log('Processing ' + path);
            var content = fs.readFileSync(path, FILE_ENCODING);
            var output = this.processStr(content);
//            log(output);
            fs.writeFileSync(path, output, FILE_ENCODING);
        },
        processStr: function(str) {
            var hierarchy = this.hierarchy;

            for (var m in hierarchy) {
                str = str.replace(new RegExp('\\b' + m + '\\.([A-Z]\\w+)', 'g'), '$1');
            }

            return str;
        }

    };

    ToFlat.processFile = function(filepath) {
        var hierarchy = Hierarchy.fromSrc();
        if(!Object.keys(hierarchy).length)
            throw new Error('Class hierarchy is empty!');

        var to = new ToFlat(hierarchy);
        to.processFile(path.join(filepath));
    };
    ToFlat.processDir = function(dir) {
        var hierarchy = Hierarchy.fromSrc();
        var to = new ToFlat(hierarchy);
        walkSrc(function(path) {
            if(/\.ts$/.test(path))
                to.processFile(path);
        }, dir);
    };
    return ToFlat;
})();
var ToFlatUsage = (function() {
    var ToFlatUsage = function(hierarchy) {
        this.hierarchy = hierarchy;
    };

    ToFlatUsage.prototype = {
        processFile: function(path) {
            log('Processing ' + path);
            var content = fs.readFileSync(path, FILE_ENCODING);
            var output = this.processStr(content);
            fs.writeFileSync(path, output, FILE_ENCODING);
        },
        processStr: function(str) {
            var hierarchy = this.hierarchy;

            for (var m in hierarchy) {
                str = str.replace(new RegExp('\\b' + m + '\\.([A-Z]\\w+)', 'g'), 'skylark.$1');
            }

            return str;
        }
    };

    ToFlatUsage.processFile = function(filepath) {
        var hierarchy = Hierarchy.fromSrc();
        if(!Object.keys(hierarchy).length)
            throw new Error('Class hierarchy is empty!');

        var to = new ToFlatUsage(hierarchy);
        to.processFile(path.join(filepath));
    };

    ToFlatUsage.processDir = function(dir) {
        var hierarchy = Hierarchy.fromSrc();
        var to = new ToFlatUsage(hierarchy);
        walkSrc(function(path) {
            if(/\.ts$/.test(path))
                to.processFile(path);
        }, dir);
    };

    return ToFlatUsage;
})();

exports.ToFlat = ToFlat;
exports.ToFlatUsage = ToFlatUsage;
