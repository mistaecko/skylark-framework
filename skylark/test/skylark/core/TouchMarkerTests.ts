/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('TouchMarker', function() {
    var TouchMarker = skylark.TouchMarker;

    Helpers.manageStarling(this); // make sure everything is cleaned up properly

    it('should draw the texture', function(done) {
        var tm = new TouchMarker();

        // position touch marker on the canvas
        tm.x = 16;
        tm.y = 16;
        // TouchMarker uses transparency - set stage backgound color
        skylark.Skylark.stageDefaults.backgroundColor = 0xffffff;

        util.Helpers.assertImage(tm, this, 'test/resources/touchmarker.png', done);
    });
});
