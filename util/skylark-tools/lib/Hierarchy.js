var path = require('path'),
    fs = require('fs'),
    walk = require('walk');

const FILE_ENCODING = 'UTF-8';
var CURRENT_PATH = path.resolve(__dirname);

function walkSrc(fn, targetDir) {
    if(targetDir == null) {
        targetDir = path.join(CURRENT_PATH, '..', '..', '..', 'src', 'skylark');
        console.log('[HIERARCHY] Defaulting to Skylark source directory: ' + targetDir);
        if(!fs.existsSync(path.join(targetDir, 'core')))
            throw new Error('No target directory specified, but Skylark source directory could not be found: ' + targetDir);
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

var Hierarchy = (function() {
    var hierarchy = {};
    var Hierarchy = function() {
        this.modules = {};
    }
    Hierarchy.fromSrc = function() {
        var hierarchy = new Hierarchy();
//        hierarchy.logEnabled = true;
        walkSrc(function(path) {
            hierarchy.addFromFile(path);
        });
        return hierarchy.asObject();
    }
    Hierarchy.findModule = function(filepath) {
        var dirs = path.dirname(filepath);
        var dir = dirs.match(/\w+$/)[0];
        return dir;
    }
    Hierarchy.findModuleFromSrc = function(str) {
        var match = str.match(/module ([\w.]*)\/\*\.([A-Z]\w+)\*\//);
        if(match) {
            return match[2] || match[1];
        } else
            return null;
    }

    var prot = Hierarchy.prototype = {
        addFromFile: function(path) {
            var content = fs.readFileSync(path, FILE_ENCODING);

            var module = Hierarchy.findModule(path);
            this.addModule(module);

            this.addFromStr(content);
        },
        addFromStr: function(str) {
//            var module = Hierarchy.findModule(str);
//            if(!module) {
//                this.log('Found no module!');
//                return;
//            }
//            this.addModule(module);

            var re = /export (class|interface) (\w*)( (implements|extends) ([\w.]*))?\s?{/img;
            var match;
            while(match = re.exec(str)) {
                var cls = match[2];
                this.addClass(cls);
            }
        },
        addModule: function(name) {
            if(!this.modules[name])
                this.modules[name] = [];
            this.log('MODULE: ' + name);
            this.currentModule = this.modules[name];
        },
        addClass: function(name) {
            this.log('CLASS:  ' + name);
            this.currentModule.push(name);
        },
        asObject: function() {
            return this.modules;
        },
        log: function(msg) {
            if(this.logEnabled)
                console.log('[HIERARCHY] ' + msg);
        }
    };

    return Hierarchy;
})();

module.exports = Hierarchy;
