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

describe('ServiceFactory', function() {
    var factory:skylark.ServiceFactory;

    beforeEach(function() {
        factory = new skylark.ServiceFactory();
    });
    it('should support a STRING class name', function() {
        var spy = sinon.spy(skylark, 'PxLoaderAssetManager');
        var result = factory.get('assetManager');
        expect(spy).to.have.been.called;
        spy.restore();
    });

    it('should support a factory function', function() {
        var obj = {};
        var spy = sinon.stub(skylark, 'PxLoaderAssetManager').returns(obj);
        var result = factory.get('assetManager');
        expect(spy).to.have.been.called;
        expect(result).to.eql(obj);
        spy.restore();
    })
});

