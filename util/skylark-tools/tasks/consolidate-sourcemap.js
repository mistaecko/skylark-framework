var path = require('path');
var sourcemap = require('source-map');
var SourceMapConsumer = sourcemap.SourceMapConsumer;
var SourceMapGenerator = sourcemap.SourceMapGenerator;

/**
 * A Grunt task that consolidates a sequence of sourcemaps that are the result
 * of multiple procesing steps, e.g TypeScript -> JavaScript -> minification -> result.
 *
 *    consolidate-sourcemaps: {
 *        options: {},
 *        files: {
 *            src: [
 *                'app.min.js.map', // source map for minified JavaScript code
 *                'app.js.map'      // source map for the plain JavaScript code (compiled from TypeScript)
 *            ],
 *            dest: 'app.min.js.map' // consolidated source map
 *        }
 *    },
 *
 * @param grunt
 */
module.exports = function(grunt) {
    grunt.registerMultiTask('consolidate-sourcemaps', function(target) {
        var options = this.options({});
        var files = this.files;

        function normalize(src, dest) {
            // we could do multiple levels here
            var jsToMinJsFilepath = src[0];
            var tsToJsFilepath = src[1];

            // backup original sourcemap
            if(grunt.file.exists(dest))
                grunt.file.copy(dest, dest + '.original');

            // Mutliple levels of SourceMaps (like ts -> js -> min)
            var sourceMapJsToMinJs = new SourceMapConsumer(grunt.file.read(jsToMinJsFilepath));
            var sourceMapTsToJs = new SourceMapConsumer(grunt.file.read(tsToJsFilepath));
            var aggregatedMap = SourceMapGenerator.fromSourceMap(sourceMapJsToMinJs);
            aggregatedMap.applySourceMap(sourceMapTsToJs);
            grunt.file.write(dest, aggregatedMap.toString());
        }

        // Iterate over all specified file groups.
        files.forEach(function (f) {
            grunt.file.mkdir(path.dirname(f.dest))
            normalize(f.src, f.dest);
        });
    });
}
