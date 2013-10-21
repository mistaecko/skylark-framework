#!/usr/bin/env node

var program = require('commander')

program
    .version(require(__dirname + '/package').version)
    .usage('[options]')
    .option('-p, --port [num]', 'testem port - defaults to 7357', Number)
    .option('--browserNameSL [name]', 'todo - defaults to "chrome"', String)
    .option('--platformSL [name]', 'todo - defaults to "Linux"', String)
    .option('--versionSL [name]', 'todo - defaults to ""', String);
// todo document SAUCE_USERNAME and SAUCE_ACCESS_KEY env variables

program.parse(process.argv);

(function main() {
    var launcher = require('sauce-connect-launcher'),
        config = require('./sauce-conf.js'),
        integrationTest = require('./sauce-javascript-tests-integration.js');

    // todo check for SAUCE_USERNAME and SAUCE_ACCESS_KEY

    launcher(config.launcherOptions, function(err, sauceConnectProcess) {
        console.log("Started Sauce Connect Process");

        integrationTest(
            "http://localhost:" + config.launcherOptions.testemPort,
            "{failedCount: jasmine.currentEnv_.currentRunner_.results().failedCount}",

            function() {
                sauceConnectProcess.close(function() {
                    console.log("Closed Sauce Connect process");
                });
            }

        );
    })

})();
