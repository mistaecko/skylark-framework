var fs = require('fs');
var path = require('path');
var skt = require('../util/skylark-tools/');

module.exports = function(grunt) {
    var _ = grunt.util._;
    var utils = skt.gruntutils(grunt);

    // Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),

        minifier: 'uglifyjs', // "closure" or "uglifyjs"
        buildDir: 'build',
        targetDir: 'target',

        closureCompilerJar: 'closureCompilerJar-is-not-defined',

        closure: {
            options: {
                // [REQUIRED] Path to closure compiler
                compilerFile: '<%= closureCompilerJar %>'
            },
            main: {
                TEMPcompilerOpts: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS', //'ADVANCED_OPTIMIZATIONS'
                    formatting: 'pretty_print',
                    summary_detail_level: 3,
                    jscomp_off: ['checkTypes', 'fileoverviewTags', 'duplicate', 'globalThis'],
                    warning_level: 'verbose',

                    create_source_map: '"<%= buildDir %>/skylark.min.js.map"'
                },
                src: '<%= buildDir %>/demo.js',
                dest: '<%= buildDir %>/skylark.min.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: false
            },
            main: {
                options: {
                    beautify: true,
                    sourceMap: '<%= buildDir %>/skylark.min.js.map',
                    sourceMapRoot: '../src/'
                },
                files: [
                    {
                        nonull: true,
                        src: ['<%= buildDir %>/skylark.js'],
                        dest: '<%= buildDir %>/skylark.min.js'
                    }
                ]
            }
        },

        // copy (and rename) files from buildDir to targetDir
        copy: {
            options: {},
            main: {
                cwd: '<%= buildDir %>',
                expand: true,
                nonull: true,
                src: [
                    'skylark.js',
                    'skylark.js.map',
                    'skylark.min.js',
                    'skylark.d.ts'
                ],
                dest: '<%= targetDir %>'
            },
            externs: {
                nonull: true,
                src: 'tools/externs.js',
                dest: '<%= targetDir %>/skylark-externs.js'
            },
            src:                     {
                cwd: 'src/skylark',
                expand: true,
                nonull: true,
                src: [
                    '**/*.ts',
                    '!types.ts',
                    // todo from past experience we think this might be slow
                    '!**/_*.ts'
                ],
                dest: '<%= targetDir %>/src/skylark/'
            }
        },

        typescript: {
            options: {
                tsc: 'node_modules/typescript/bin/tsc',
                module: 'amd', //or commonjs
                target: 'es5',
                sourcemap: true,
                declaration: false,
                verbose: true
            },
            dist: {
                src: [ 'src/_dependencies.ts' ],
                out: '<%= buildDir %>/skylark.js',
                options: {
                    sourceRoot: '../src',
                    sourcemap: true,
                    declaration: true
                }
            },
            src: {
                src: [ 'src/_dependencies.ts' ],
                outDir: 'src-compiled/'
            },
            // TS compiler giving us a hard time complaining about duplicate interface definitions
            // when we compile everything in one go - that said, we need to generate declaration files
            // for Stubs.ts anyway, so just another reason to give this its own task
            testutils_stubs: {
                src: [
                    'test/skylark/util/Stubs.ts'
                ],
                outDir: 'test/skylark-compiled/util/',
                options: {
                    sourcemap: true,
                    declaration: true
                }
            },
            testutils_helpers: {
                src: [
                    'test/skylark/util/Helpers.ts'
                ],
                outDir: 'test/skylark-compiled/util/',
                options: {
                    sourcemap: true,
                    declaration: true
                }
            },
            test: {
                src: [
                    'test/skylark/**/*.ts', // don't use globs (**/) for exclude patterns - it's horribly slow...
                    '!test/skylark/util/Stubs.ts', '!test/skylark/util/Helpers.ts'
                ],
                outDir: 'test/skylark-compiled/',
                options: {
                    sourcemap: true,
                    declaration: false
                }
            }
        },

        "watch-compile": {
            src: {
                files: ['src/skylark/**/*.ts'],
                tasks: ['compile:src', 'compile:dist']
            },
            dist: {
                files: ['src/skylark/**/*.ts'],
                tasks: ['compile:dist']
            },
            test: {
                files: ['test/skylark/**/*.ts', '_dependencies.ts'],
                tasks: ['compile:test']
            }
        },

        "watch-dist": {
            dist: {
                files: ['src/skylark/**/*.ts'],
                tasks: ['dist']
            }
        },

        clean: {
            // cleanup build directory - only remove files, don't recurse
            build: [ '<%= buildDir %>/skylark*.*'],
            target: ['<%= targetDir %>/src', '<%= targetDir %>/skylark*.*']
        }

    };

    grunt.initConfig(config);

    utils.overrideConfig('gruntfile-config.json');
    utils.userScript('gruntfile-user.js');
    utils.configureMinifier();


    grunt.loadNpmTasks('grunt-contrib-copy');


    grunt.registerTask('deploy', function() {
       var singleOutputDir = grunt.config.get('buildDir') === grunt.config.get('targetDir');

        // rewrite the "sourceRoot" in the source map to point to 'target/src' instead of '../src'
        grunt.registerTask('$sourceroot', function() {
            var filepath = grunt.config.get('targetDir') + '/skylark.js.map';
            grunt.verbose.writeln('Adjusting "sourceRoot" in source map file "' + filepath + '"');
            var content = grunt.file.read(filepath);
            content = content.replace(new RegExp(escapeRe('"sourceRoot":"../src/"')), '"sourceRoot":"src/"');
            grunt.file.write(filepath, content);
        });

        if(singleOutputDir) {
            grunt.task.run(['copy:externs', 'copy:src', '$sourceroot']);
        } else {
            grunt.task.run('copy', '$sourceroot');
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.renameTask('ts', 'typescript');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'watch-compile');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'watch-dist');

    grunt.registerTask('compile', 'Compile TypeScript sources into JS', function(target, action) {
        var cmd = target || 'all';
        switch(cmd) {
            case 'all':
                grunt.task.run(['compile']);
                break;
            case 'test':
                grunt.task.run(['typescript:testutils_helpers', 'typescript:testutils_stubs', 'typescript:test']);
                break;
            case 'dist':
                grunt.task.run([ 'typescript:dist']);
                break;
            default:
                grunt.task.run(['typescript:' + target ]);
        }
    });

    // load minify task
    grunt.loadTasks('../util/skylark-tools/tasks/');
    //grunt.loadNpmTasks('skylark-tools');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('dist', 'Create the distribution bundle', ['clean', 'compile:dist', 'minify', 'deploy']);

    grunt.registerTask('watch', 'Watch file system for changes to perform various tasks', function(target, action) {
        var cmd = target + (action ? ':' + action : '');
        switch(cmd) {
            case 'dist':
                grunt.task.run(['watch-dist']);
                break;
            case 'compile':
            case 'compile:all':
                grunt.task.run(['watch-compile']);
                break;

            case 'compile:src':
                grunt.task.run(['watch-compile:src']);
                break;
            case 'compile:dist':
                grunt.task.run(['watch-compile:dist']);
                break;
            case 'compile:test':
                grunt.task.run(['watch-compile:test']);
                break;

            default:
                grunt.log.error('"' + this.name + '" does not know the given target: ' + cmd);
        }

    });

    grunt.registerTask('help', 'Show this information', function() {
        grunt.log.writeln('Commands:');
        grunt.log.writeln('  dist');
        grunt.log.writeln('  compile:[dist|src|test|all]');
        grunt.log.writeln('  watch:compile:[dist|src|test|all]');
        grunt.log.writeln('  watch:dist');
    });

    grunt.registerTask('default', ['help']);
};

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param aArgs The object we are extracting values from
 * @param aName The name of the property we are getting.
 * @param aDefaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
    if(aName in aArgs) {
        return aArgs[aName];
    } else if(arguments.length === 3) {
        return aDefaultValue;
    } else {
        throw new Error('"' + aName + '" is a required argument.');
    }
}

function escapeRe(value) {
    return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
}
