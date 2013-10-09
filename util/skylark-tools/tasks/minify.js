var path = require('path');
var fs = require('fs');

/**
 * A Grunt task that 'minifies' JavaScript source files - either using UglifyJs2 or Google Closure Compiler.
 *
 * @param grunt
 */
module.exports = function(grunt) {
    var minifier = grunt.config.get('minifier');

    if(isDisabled()) {
        grunt.registerTask('minify', 'Minify the compiled source (DISABLED)', function(target) {
            grunt.log.writeln('Skipping "minify" task - "no-minify" is enabled.');
        });

    } else if(minifier === 'closure') {
        grunt.loadNpmTasks('grunt-closure-tools');
        grunt.renameTask('closureCompiler', 'closure');

        grunt.registerTask('minify', 'Minify the compiled source (using Google Closure Compiler)', function(target) {
            if(target == null) {
                runAllTargets('closure');
                return;
            }

            // read closure config
            var files = getClosureFiles(target);

            // create a temporary task for easier scheduling
            grunt.registerTask('_appendSourceMappingURL', 'it does things', function() {

                files.map(function(item) {
                    var filepath = item.dest;
                    var urlpath = path.basename(filepath) + '.map';
                    var sourceMapUrlFragment = '//# sourceMappingURL=' + urlpath;
                    grunt.log.write('Appending sourceMappingURL in "' + filepath + '"...');
                    fs.appendFileSync(filepath, sourceMapUrlFragment);
                    grunt.log.ok();
                });
            });
            // minify, then append url
            grunt.task.run('closure:' + target, '_appendSourceMappingURL');

        });

    } else {
        grunt.loadNpmTasks('grunt-contrib-uglify');

        grunt.registerTask('minify', 'Minify the compiled source (using UglifyJs2)', function(target) {
            if(target == null)
                runAllTargets('uglify');
            else
                grunt.task.run('uglify:' + target);
        });
    }


    // whether minification is disabled, based on the 'no-minify' cli flag resp. the grunt config option with the same name
    function isDisabled() {
        var value = grunt.option('no-minify');
        if(value == null)
            value = grunt.config.get('no-minify') === true;
        return value;
    }

    // retrieve 'files' config from closure target config
    function getClosureFiles(target) {
        var closureFilesConfig = grunt.config.get('closure.' + target);
        var files = grunt.task.normalizeMultiTaskFiles(closureFilesConfig, target);
        if(files == null || files.length === 0)
            grunt.fail.fatal('Cannot read "files" configuration from "closure:' + target + '" task - format mismatch?');
        return files;
    }

    // run all targets
    function runAllTargets(minifier) {
        var targets = grunt.config.get('closure');
        grunt.task.run(
            Object
                .keys(targets)
                .filter(function(k) {
                    // skip the reserved 'options' property
                    return k !== 'options';
                })
                .map(function(k) {
                    return 'minify:' + k;
                }
            )
        );
    }
}
