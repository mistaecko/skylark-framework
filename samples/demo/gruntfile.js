var skt = require('../../util/skylark-tools/');

module.exports = function(grunt) {
    // make Skylark Grunt utils available
    var utils = skt.gruntutils(grunt);
    // make underscore available
    var _ = grunt.util._;

    var FILE_ENCODING = grunt.file.defaultEncoding = 'utf-8';

    var pkg = grunt.file.readJSON('package.json');

    // Project configuration.
    var config = {
        /**
         * @property {String} skylarkDir
         * Location of the Skylark directory.
         */
        skylarkDir: 'skylark',

        skylarkLibDir: '<%= skylarkDir %>',
        skylarkSrcDir: '<%= skylarkDir %>/src',

        // these affect the built-in express server (if "hot linking" is enabled)
        "enableSkylarkHotLinking": false,
        "skylarkUri": "/<%= skylarkDir %>",
        "skylarkSrcUri": "<%= skylarkUri %>/src",
        "skylarkFsDir": "<%= skylarkRepoDir %>/target",
        "skylarkFsSrcDir": "<%= skylarkRepoDir %>/src",

        /**
         * @property {String} skylarkRepoDir
         */
        skylarkRepoDir: 'node_modules/skylark/target/',

        /**
         * @property {String} buildDir
         * Location of the build directory.
         */
        buildDir: 'build',

        /**
         * @property {String} targetDir
         * Location of the target directory where distribution bundles will be deployed to.
         */
        targetDir: 'target',

        /**
         * @property {String} minifier
         * Configure which tool to use for minification. Valid values are: `closure`, `uglifyjs`.
         */
        minifier: 'uglifyjs',

        /**
         * @property {String} symbol
         * The symbol used for generated source code bundles. Defaults to
         */
        symbol: pkg.name,

        /**
         * @property {Object} pkg
         * The NPM module configuration read from `package.json`
         */
        pkg: pkg,

        // concat with sourcemaps (for `-all` bundle)
        concat: {
            files: {
                src: [
                    '<%= skylarkLibDir %>/skylark.js',
                    '<%= buildDir %>/<%= symbol %>.js'
                ],
                dest: '<%= buildDir %>/<%= symbol %>-all.js',
                nonull: true
            }
        },

        // minification (using Google closure compiler)
        closure: {
            options: {
                compilerFile: 'C:\\code\\closure\\current\\compiler.jar' // todo
            },
            single: {
                TEMPcompilerOpts: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS', //'ADVANCED_OPTIMIZATIONS'
                    formatting: 'pretty_print',
                    summary_detail_level: 3,
                    jscomp_off: ['checkTypes', 'fileoverviewTags', 'duplicate', 'globalThis'],
                    warning_level: 'verbose',

                    // todo - check if externs file exists, otherwise we get obstruse error during closure compilation
                    externs: [ '<%= skylarkLibDir %>/skylark-externs.js'],
                    create_source_map: '"<%= buildDir %>/<%= symbol %>.min.js.map"'
                },

                src: '<%= buildDir %>/<%= symbol %>.js',
                dest: '<%= buildDir %>/<%= symbol %>.min.js'
            },
            all: {
                TEMPcompilerOpts: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS', //'ADVANCED_OPTIMIZATIONS'
                    formatting: 'pretty_print',
                    summary_detail_level: 3,
                    jscomp_off: ['checkTypes', 'fileoverviewTags', 'duplicate', 'globalThis'],
                    warning_level: 'verbose',

                    externs: ['<%= skylarkLibDir %>/skylark-externs.js'],
                    create_source_map: '<%= buildDir %>/<%= symbol %>-all.min.js.map'
                },

                dest: '<%= buildDir %>/<%= symbol %>-all.min.js',
                src: '<%= buildDir %>/<%= symbol %>.js'
            }
        },

        // minification using UglifyJs2 (deprecated)
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: false
            },
            all: {
                options: {
                    sourceMap: '<%= buildDir %>/<%= symbol %>-all.min.js.map',
                },
                src: '<%= buildDir %>/<%= symbol %>.js',
                dest: '<%= buildDir %>/<%= symbol %>.min.js'
            },
            single: {
                options: {
                    beautify: true,
                    sourceMap: '<%= buildDir %>/<%= symbol %>.min.js.map'
                },
                dest: '<%= buildDir %>/<%= symbol %>.min.js',
                src: '<%= buildDir %>/<%= symbol %>.js'
            }
        },

        // rewrite sourcemap after minifcation to resolve to original source locations (demo.min.js -> demo.js -> [.ts files])
        sourcemap: {
            options: {},
            files: {
                src: [ '<%= buildDir %>/<%= symbol %>-all.min.js.map', '<%= buildDir %>/<%= symbol %>-all.js.map' ],
                dest: '<%= buildDir %>/<%= symbol %>-all.min.js.map'
            }
        },

        // deploy files to the `targetDir`
        copy: {
            options: {},
            files: {
                cwd: '<%= buildDir %>',
                expand: true,
                src: [
                    '<%= symbol %>.d.ts' ,
                    '<%= symbol %>.js' ,
                    '<%= symbol %>.js.map' ,
                    '<%= symbol %>.min.js' ,
                    '<%= symbol %>-all.js' ,
                    '<%= symbol %>-all.min.js'
                ],
                dest: '<%= targetDir %>'
            }
        },

        // compile `.ts` to one `.js` - also see custom 'compile' task below
        typescript: {
            options: {
                tsc: 'node_modules/typescript/bin/tsc',
                module: 'amd',
                target: 'es5',
                sourcemap: true,
                declaration: false,
                failOnError: false
            },
            dist: {
                reference: 'src/_references.ts',
                src: [ 'src/**/*.ts' ],
                out: '<%= buildDir %>/<%= symbol %>.js',
                options: {
                    sourceRoot: '../src',
                    sourcemap: true,
                    declaration: true
                }
            },
            src: {
                reference: "src/_references.ts",
                src: [ 'src/**/*.ts' ],
                outDir: 'src-compiled/'
            }
        },

        "watch-compile": {
            src: {
                files: ['src/**/*.ts'],
                tasks: ['compile:src']
            },
            dist: {
                files: ['src/**/*.ts'],
                tasks: ['compile:dist']
            },
            test: {
                files: ['test/**/*.ts'],
                tasks: ['compile:test']
            }
        },

        "watch-dist": {
            dist: {
                files: ['src/**/*.ts'],
                tasks: ['dist']
            }
        },

        clean: {
            // cleanup build directory - only remove files, don't recurse
            build: [ '<%= buildDir %>/*.*'],
            target: [
                '<%= targetDir %>/<%= symbol %>.d.ts',
                '<%= targetDir %>/<%= symbol %>.js',
                '<%= targetDir %>/<%= symbol %>.js.map',
                '<%= targetDir %>/<%= symbol %>.min.js',
                '<%= targetDir %>/<%= symbol %>-all.js',
                '<%= targetDir %>/<%= symbol %>-all.min.js',
            ],
        },

        'copy-skylark': {
            main: {
                cwd: '<%= skylarkRepoDir %>/target',
                expand: true,
                nonull: true,
                src: [
                    'skylark-externs.js',
                    'skylark.d.ts',
                    'skylark.js',
                    'skylark.js.map',
                    'skylark.min.js'
                ],
                dest: '<%= skylarkDir %>'
            },
            src: {
                cwd: '<%= skylarkRepoDir %>/src',
                expand: true,
                nonull: true,
                src: [
                    '**/*'
                ],
                dest: '<%= skylarkDir %>/src'
            }
        }
    };

    grunt.initConfig(config);

    utils.overrideConfig('gruntfile-config.json');
    utils.userScript('gruntfile-user.js');

    utils.configureMinifier();
    utils.configureSymbol();

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-closure-tools');
    grunt.renameTask('closureCompiler', 'closure');

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.renameTask('copy', 'copy-skylark');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('concat-sourcemaps');
    grunt.renameTask('concat-sourcemaps', 'concat');

    grunt.loadNpmTasks('grunt-ts');
    grunt.renameTask('ts', 'typescript');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'watch-compile');

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('watch', 'watch-dist');

    grunt.registerTask('compile', 'Compile TypeScript sources to JS', function(target, action) {
        var cmd = target || 'all';
        switch(cmd) {
            case 'all':
                grunt.task.run(['typescript']);
                break;
            case 'test':
                grunt.task.run(['typescript:test']);
                break;
            case 'dist':
                grunt.task.run(['typescript:dist']);
                break;
            default:
                grunt.task.run(['typescript:' + target ]);
        }
    });


    // load minify, consolidate-sourcemaps tasks
    grunt.loadTasks('../../util/skylark-tools/tasks/');
    //grunt.loadNpmTasks('skylark-tools');
    //grunt.renameTask('consolidate-sourcemaps', 'sourcemap');

    //grunt.registerTask('deploy', 'Deploys build to "target" directory', ['concat', 'minify', 'copy']);

    grunt.registerTask('dist', 'Create the distribution bundle', ['compile:dist', 'concat', 'minify', 'copy']);

    grunt.registerTask('watch', 'Watch file system for changes to perform various tasks', function(target, action) {
        if(target == null)
            grunt.log.error('"watch" requires a target, e.g. `watch:dist`');
        else
            grunt.task.run('watch-' + target + (action != null ? ':' + action : ''));
    });

    grunt.registerTask('server', 'Start a minimal web server', function() {
        var Server = require('./tools/server.js').Server;

        function applyConfig(config, properties) {
            for(var i = 0; i < properties.length; i++) {
                var key = properties[i];
                config[key] = grunt.config.get(key);
            }
        }
        var config = grunt.config;
        var server = new Server({
            port: config.get('serverPort'),
            enableSkylarkHotLinking: config.get('enableSkylarkHotLinking'),
            skylarkUri: config.get('skylarkUri'),
            skylarkFsDir: config.get('skylarkFsDir'),
            skylarkSrcUri: config.get('skylarkSrcUri'),
            skylarkFsSrcDir: config.get('skylarkFsSrcDir')
        });

        //var app = server.getExpressInstance();
        //app.post();

        // prevent grunt process from exiting
        var done = this.async();

        server.start();
    });

    grunt.registerTask('setup', 'Setup Skylark library and source', ['copy-skylark']);

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('help', 'Show this information', function() {
        grunt.log.writeln('Commands:');
        grunt.log.writeln('  compile[src|test|dist]');
        grunt.log.writeln('  watch:compile[:all|src]');
    });

    grunt.registerTask('default', ['help']);
};
