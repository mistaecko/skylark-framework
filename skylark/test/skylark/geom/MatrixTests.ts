/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('Matrix', ()=> {
    var E:number = 0.0001;

    function match(actual:skylark.Point, expected:skylark.Point) {
        expect(actual.x).to.be.closeTo(expected.x, E);
        expect(actual.y).to.be.closeTo(expected.y, E);
    }

    it('rotate', () => {
        var m:skylark.Matrix = new skylark.Matrix();

        // 90
        m.rotate(Math.PI / 2);
        match(m.transformPoint(new skylark.Point(1, 1)), new skylark.Point(-1, 1));

        // 180
        m.rotate(Math.PI /2);
        match(m.transformPoint(new skylark.Point(1, 1)), new skylark.Point(-1, -1));

        // 270
        m.rotate(Math.PI /2);
        match(m.transformPoint(new skylark.Point(1, 1)), new skylark.Point(1, -1));

    });
});
