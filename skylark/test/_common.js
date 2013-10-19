/**
 * Setup global variables for test cases. This file should be loaded by the
 * test runner (e.g. Testem, Karma, ...).
 *
 * Exposes the following 'modules' either via AMD's `define` or commonJs' `export`:
 *  - skylark
 *  - sinon
 *  - chai
 *  - expect
 *  - assert
 *
 * Other features:
 *  - registers sinon-chai with chaijs
 *  - configures chaijs to attach stacktrace to Assertions
 *  - registers 'Helpers' and 'stubs' as globals in a commonJs environment
 *
 * Test Cases should reference the file `_common.d.ts`.
 *
 * Supports nodejs and browser environment (with script files preloaded).
 */
(function(global) {
    var isCommonJs = typeof require === 'function';
    var isNode = typeof process !== 'undefined'
        && process.versions
        && process.versions.node;

    global.isCommonJs = isCommonJs;
    global.isNode = isNode;
    global.isBrowser = !isNode;

    function publish(modules) {
        for(var key in modules) {
            global[key] = modules[key];
        }
    }

    var skylark, chai, Helpers, sinon;

    if(isCommonJs) {
        skylark = require('../build/skylark');
        sinon = require('sinon');
        chai = require('chai');
        chai.use(require('sinon-chai'));
    } else {
        skylark = global.skylark;
        sinon = global.sinon;
        chai = global.chai;
        // sinon-chai auto-registers in browser environment
    }

    var expect = chai.expect;
    var assert = chai.assert;

    // attach stack trace when assertion fails
    chai.Assertion.includeStack = true;

    // todo - cleanup
    // export/publish test harness
    publish({
        skylark: skylark,
        sinon: sinon,
        assert: assert,
        expect: expect,
        Assert: assert
    });

    // note: Helpers require test harness to be present - so we handle it later
    // outside this closure

    // 'require' shim for browser environment
    if(!isCommonJs)
        global.require = function() {};

    // register 'Helpers' and 'stubs' as globals (once)
    // in a browser environment they are already registered just by loading the files
    if(isCommonJs) {
        if(global.Helpers == null)
            global.Helpers = require('./skylark/util/Helpers');
        if(global.stubs == null)
            global.stubs = require('./skylark/util/Stubs');
    }

})(typeof global !== 'undefined' ? global : this);

// provide skipIfFirefox.it()
(function(global) {
    global.skipIfFirefox = (function skipIfFirefox() {
        console.log(navigator.userAgent);
        var itFn,
            describeFn;
        if(!navigator.userAgent.match(/Gecko\//i)) {
            itFn = it;
            describeFn = describe;
        } else {
            itFn = function(descr, fn) {
                it.skip(descr + ' [NOFIREFOX]', fn);
            };
            describeFn = function(descr, fn) {
                describe.skip(descr + ' [NOFIREFOX]', fn);
            }
        }

        return { it: itFn, describe: describeFn };
    })();

})(typeof global !== 'undefined' ? global : this);

/**
 * 'Testem' patch to log the Assertion stacktrace of failed tests
 * to the console.
 * This allows for convenient source code navigation in Chrome from
 * within the web browser's developer tools.
 *
 * Also registers a log function with `sinon`.
 */
(function() {
    if(typeof Testem !== 'undefined') {
        var Runner

        try{
            Runner = mocha.Runner || Mocha.Runner
        }catch(e){
            // Testem will report anyway
        }

        if(Runner) {
            var oEmit = Runner.prototype.emit;
            if(!oEmit.$patchEmitErrorStackTrace) {
                Runner.prototype.emit = function (evt, test) {
                    if (evt === 'test end' && test.state === 'failed' && test.err && test.err.stack) {
                        console.log(test.err.stack);
                    }
                    oEmit.apply(this, arguments);
                }
            } else
                console.log('Patch "$patchEmitErrorStackTrace" already applied');

            Runner.prototype.emit.$patchEmitErrorStackTrace = true;
        }

        // implement sinon.log - simply do a console.log, Testem handles it
        if(typeof sinon !== 'undefined')
            sinon.log = function() {
                console.log.apply(this, arguments);
            }
    }
})();