var launcher = require('sauce-connect-launcher'),
    config   = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js');

launcher(config.launcherOptions, function (err, sauceConnectProcess) {
  console.log("Started Sauce Connect Process");

  var port = config.launcherOptions.port;
  integrationTest(
    "http://localhost:" + port,
    "{failedCount: jasmine.currentEnv_.currentRunner_.results().failedCount}",

    function() {
      sauceConnectProcess.close(function () {
        console.log("Closed Sauce Connect process");
      });
    }

  );
});
