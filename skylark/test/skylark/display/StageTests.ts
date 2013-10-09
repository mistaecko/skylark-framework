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

describe('Stage', ()=> {

    it('should fire an ENTER_FRAME event and pass the correct time', ()=>{
        var stage = new skylark.Stage(100, 100);

        var spy = sinon.spy();
        stage.addEventListener(skylark.Event.ENTER_FRAME, spy);
        stage.advanceTime(999);
        expect(spy).to.have.been.calledOnce;
        expect(spy).to.have.been.calledWith(sinon.match.any, 999);
    });

});
