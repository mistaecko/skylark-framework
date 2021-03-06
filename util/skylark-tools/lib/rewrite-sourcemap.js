var send = require('send');
var Transform = require('stream').Transform;

var utils;

function rewriteSourceMap(root, uri, rewrite) {
    if(uri.charAt(0) !== '/')
        uri = '/' + uri;

    if(utils == null)
        utils = require('connect').utils;

    return function(req, res, next) {
        var path = utils.parse(req).pathname;

        if(path !== uri) {
            next();
            return;
        }

        var sourceRoot = rewrite;

        var pause = utils.pause(req);

        function resume() {
            next();
            pause.resume();
        }

        function adjustContentLength() {
            res.removeHeader('content-length');
        }

        function error(err) {
            console.log(err);
            if(404 == err.status) return resume();
            next(err);
        }

        var transform = new Transform();
        transform._transform = function(chunk, encoding, done) {
            var str = chunk.toString().replace(/"sourceRoot":\s?"([^,]*)"/, '"sourceRoot":"' + pathToSrc + '"');
            this.push(str);
            done();
        }
        transform.setHeader = function() {
            return res.setHeader.apply(res, arguments);
        }
        transform.getHeader = function() {
            return res.getHeader.apply(res, arguments);
        }

        send(req, path)
            .maxage(0)
            .root(root)
            .on('error', error)
            .on('stream', adjustContentLength)
            .pipe(transform)
            .pipe(res);
    }
}

rewriteSourceMap.setConnect = function(connect) {
    utils = connect.utils;
    return rewriteSourceMap;
}

module.exports = rewriteSourceMap;
