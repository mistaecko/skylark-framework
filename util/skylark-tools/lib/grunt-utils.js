/**
 * Usage:
 *     var utils = require('grunt-utils')(grunt);
 *     utils.configureDir('buildDir');
 */

var path = require('path');
var grunt;
var _;

/**
 * Validate and initialize a grunt configuration property that points to a
 * directory on the filesystem.
 *
 * @param name the directory name
 * @returns {String} the normalized property value
 * @deprecated
 */
function configureDir(name) {
    grunt.config.requires(name);
    var dir = path.resolve(grunt.config.get(name));
    grunt.file.mkdir(dir);
    dir = dir + '/';
    grunt.config.set(name, dir);
    grunt.log.writeln(grunt.log.wordlist([name + ':']) + ' ' + dir);
    return dir;
}

/**
 * Validate and initialize the project's name 'symbol'. The 'symbol'
 * is a concise string identifier to be used in file names, etc, e.g.
 * `skylark` for the 'Skylark Framework' project.
 *
 * @returns {string} the name symbol
 */
function configureSymbol() {
    // symbol - the identifier/name for generated source bundles
    grunt.config.requires('symbol');
    var symbol = grunt.config.get('symbol');
    grunt.log.writeln(grunt.log.wordlist(['symbol: ']) + symbol);

    return symbol;
}

/**
 * Validate and initialize the 'minifier' Grunt configuration property.
 *
 * @returns {string} the configured 'minifier' - either 'uglifyjs' or 'closure'
 */
function configureMinifier() {
    // minifier: should we use closure or uglifyjs?
    grunt.config.requires('minifier');
    var minifier = grunt.config.get('minifier').toLowerCase();
    if(minifier !== 'closure' && minifier !== 'uglifyjs')
        grunt.fail.fatal('Unknown "minifier": ' + minifier + '. Valid options are: closure, uglifyjs.');
    grunt.config.set('minifier', minifier);
    grunt.log.writeln(grunt.log.wordlist(['minifier: ']) + minifier);

    return minifier;
}

/**
 * Execute a Grunt configuration script.
 *
 * @param filepath
 */
function userScript(filepath) {
    // load user script
    if(grunt.file.exists(filepath)) {
        require(filepath)(grunt);
    }
}

/**
 * Apply Grunt configuration options from a JSON file.
 *
 * @param filepath
 */
function overrideConfig(filepath) {
    var config = grunt.config.data;

    // load user config
    if(grunt.file.exists(filepath)) {
        grunt.log.write('Reading configuration file...');
        var json = grunt.file.readJSON('gruntfile-config.json');
        grunt.log.ok();
        _.extend(config, json);
    }
}

module.exports = function(_grunt) {
    grunt = _grunt;
    _ = grunt.util._;

    return {
        configureDir: configureDir,
        configureMinifier: configureMinifier,
        configureSymbol: configureSymbol,
        overrideConfig: overrideConfig,
        userScript: userScript
    }
}
