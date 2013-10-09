// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('DelayedCall', () => {
    var E:number = 0.0001;

    it('should trigger the callback after the specified time', function() {
        var start = new Date().getTime();
        var spy = sinon.spy();
        var call = new skylark.DelayedCall(spy, 0.15);
        call.advanceTime(0.14);
        expect(spy).to.not.have.been.called;
        call.advanceTime(0.01);
        expect(spy).to.have.been.called;
    });

    it('should pass the defined arguments to the callback function', function() {
        var start = new Date().getTime();
        var spy = sinon.spy();
        var call = new skylark.DelayedCall(spy, 100, [ 1, 2, 3 ]);
        call.advanceTime(100);
        expect(spy).to.have.been.called;
        expect(spy).to.have.been.calledWith(1, 2, 3);
    });
});
