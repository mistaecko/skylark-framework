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
//var targetDir = path.join(CURRENT_PATH, '..', '..', '..', 'src', 'skylark');

function log() {
    arguments[0] = '[toimport] ' + arguments[0];
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
    var walker = walk.walkSync(targetDir, { followLinks: false, filters: [/\.js$/, /.js.map$/], listeners: listeners });
}

function forEachLine(str, fn) {
    var arr = str.split(/\r\n|\n/);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = fn.call(this, arr[i]);
    }
    return arr.join('\n');
}

var ToImport = (function() {
    var ToImport = function(hierarchy) {
        this.hierarchy = hierarchy;
    };

    ToImport.prototype = {
        processFile: function(path) {
            log('Processing ' + path);
            var content = fs.readFileSync(path, FILE_ENCODING);
            var output = this.processStr(content);
            log(output);
            //fs.writeFileSync(path, output, FILE_ENCODING);
        },
        processStr: function(str) {
            var module = Hierarchy.findModule(str);
            var classes = this.collectClasses(str);

            var importStatements = this.buildImport(module, classes);
            str = str.replace(new RegExp('(module ' + module + '\\s?{$)', 'm'), '$1\n' + importStatements);

            var hierarchy = this.hierarchy;

            str = forEachLine(str, function(line) {
                if (line.indexOf('import') === -1) {
                    for (var m in hierarchy) {
                        line = line.replace(new RegExp('\\b' + m + '\\.([A-Z]\\w+)', 'g'), '$1');
                    }
                }
                return line;
            });

            return str;
        },

        buildImport: function(module, classes) {
            var out = [];
            for (var i = 0; i < classes.length; i++) {
                var cls = classes[i];
                if(cls.module !== module) {
                    out.push('import ' + cls.name + ' = ' + cls.fqn + ';\n');
                }
            }
            return out.join('');
        },

        collectClasses: function(str) {
            var theModule = Hierarchy.findModule(str);
            var classes = {};
            var hierarchy = this.hierarchy;
            for(var module in hierarchy) {
                var length = str.length;
                var re = new RegExp('\\b' + module + '\\.(\\w+)', 'g');
                var match;
                while(match = re.exec(str)) {
                    //log('Found usage: ' + match[0]);
                    classes[match[0]] = { fqn: match[0], name: match[1], module: module };
                }
            }

            var result = [];
            for(var key in classes)
                result.push(classes[key]);
            return result;
        }
    };

    ToImport.processFile = function(filepath) {
        var hierarchy = Hierarchy.fromSrc();
        var to = new ToImport(hierarchy);
        to.processFile(path.join(filepath));
    };
    ToImport.processDir = function(dir) {
        var hierarchy = Hierarchy.fromSrc();
        var to = new ToImport(hierarchy);
        walkSrc(function(path) {
            to.processFile(path);
        });
    };
    return ToImport;
})();


if(require.main === module) {
    processSrcDir();
} else {
    module.exports = ToImport;
    ToImport.Hierarchy = Hierarchy;
}
