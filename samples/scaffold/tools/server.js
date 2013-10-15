var path = require('path');
var fs = require('fs');
var express = require('express');

var projectRootDir = path.join(__dirname, '../');

var Server = function(config, app) {
    if(app == null)
        app = express();

    this.app = app;

    for(var key in config) {
        if(config[key] != null)
            this[key] = config[key];
    }
}

Server.prototype = {
    app: null,
    delay: 0,
    rootDir: projectRootDir,
    autoInitialize: true,
    port: 3000,

    enableSkylarkHotLinking: true,
    skylarkUri: '/skylark',
    skylarkFsDir: '../skylark-framework/skylark/target',
    skylarkSrcUri: '/skylark/src',
    skylarkFsSrcDir: '../skylark-framework/skylark/src',

    start: function() {
        if(this.autoInitialize && !this.initialized)
            this.initialize();
        this.app.listen(this.port);
        console.log('Listening on port ' + this.port + '.');
    },

    initialize: function() {
        var app = this.app;
        var delay = this.delay;
        var rootDir = this.rootDir;

        app.all(/.*\.map/, function(req, res, next) {
            req.delay = delay;
            next();
        });
        app.all(/.*\.ts/, function(req, res, next) {
            req.delay = delay;
            next();
        });

        app.all('*', makeSlow);

        console.log('Serving files from ' + rootDir);

        if(this.enableSkylarkHotLinking) {

            if(this.skylarkUri && this.skylarkSrcUri) {
                var pathToSrc = path.relative(this.skylarkUri, this.skylarkSrcUri);
                app.use(this.skylarkUri, rewriteSourceMap(this.skylarkFsDir, '/skylark.js.map', pathToSrc));
            }

            if(this.skylarkUri) {
                app.use(this.skylarkUri, express.static(this.skylarkFsDir));
                console.log('Mapping: ' + this.skylarkUri + ' => ' + this.skylarkFsDir);
            }
            if(this.skylarkSrcUri) {
                app.use(this.skylarkSrcUri, express.static(this.skylarkFsSrcDir));
                console.log('Mapping: ' + this.skylarkSrcUri + ' => ' + this.skylarkFsSrcDir);
            }
        }

        app.use('/', express.static(rootDir));

        app.use(handleXhrError);
        app.use(handleError);

        this.initialized = true;
    },

    getExpressInstance: function() {
        return this.app;
    },

    makeSlow: makeSlow,
    handleXhrError: handleXhrError,
    handleError: handleError

}

function makeSlow(req, res, next) {
    var ms = req.delay;

    if(ms > 0) {
        setTimeout(function(){
            next();
        }, ms);
    } else {
        next();
    }
}

function handleXhrError(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}

function handleError(err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
}

if(require.main === module) {
    var server = new Server();
    server.start();
} else {
    exports.Server = Server;
}
