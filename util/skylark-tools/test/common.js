global.sinon = require("sinon");
global.chai = require("chai");
global.should = require("chai").should();
global.expect = require("chai").expect;
global.AssertionError = require("chai").AssertionError;
global.mocks = require("mocks");

global.swallow = function (thrower) {
    try {
        thrower();
    } catch (e) { }
};

var sinonChai = require("sinon-chai");
chai.use(sinonChai);