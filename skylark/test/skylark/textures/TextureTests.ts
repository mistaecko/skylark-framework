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

// note: file is currently excluded from compile:test

describe('TextureTests', function() {
    var E:number = 0.0001;

    var Texture = skylark.Texture;

    var red64x64 = 'test/resources/64x64red.png';

    afterEach(function() {
        if(skylark.Skylark.current)
            skylark.Skylark.current.dispose();
    });

    function initStarling() {
        var quad:skylark.DisplayObject = <skylark.DisplayObject>new skylark.Quad(10, 10);
        new skylark.Skylark(quad);
    }

    describe('empty', function() {
        skipIfFirefox.it('should create an empty texture', function(done) {
            var texture = Texture.empty(64, 64, true, true, false, 1);
            // note: the stage is cleared in transparent black, but the image obtained from
            // the canvas will be white - todo verify
            Helpers.assertImage(texture,this, 'test/resources/64x64white.png', done);
        });

        skipIfFirefox.it('should use the global "scale" factor if none is specified', function() {
            // todo remove once IntelliJ has become smarter
            var /*IntelliJ*/Object:any = (<any>window).Object;

            // stub the 'contentScaleFactor' getter
            var called = 0;
            var d = Object.getOwnPropertyDescriptor(skylark.Skylark, "contentScaleFactor");
            Object.defineProperty(skylark.Skylark, 'contentScaleFactor',
                /*IntelliJ*/<PropertyDescriptor>jQuery.extend({}, d, { get: function() { called++; return 1; }}));

            var texture = Texture.empty(64, 64);

            expect(called).to.eql(1);

            // restore
            Object.defineProperty(skylark.Skylark, 'contentScaleFactor', d);
        });
    });

    skipIfFirefox.describe('fromXxx', function() {

        it('should create a texture from a canvas', function(done) {
            var width = 64;
            var height = 64;

            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', String(width));
            canvas.setAttribute('height',String(height));

            var context:CanvasRenderingContext2D = canvas.getContext('2d');

            context.fillStyle = '#FF0000';
            context.fillRect(0, 0, 64, 64);

            var result = skylark.Texture.fromCanvas(canvas);

            expect(result.width).to.eql(64);
            expect(result.height).to.eql(64);

            Helpers.assertImage(result, this, red64x64, done);
        });

        it('should create a texture from bitmap data', function(done) {
            initStarling();
            var red = 0xffff0000;
            var bytes = [];
            for(var i = 0; i < 64*64; i++)
                bytes.push(red);

            var bitmap = new skylark.BitmapData(64, 64, bytes);
            var texture = Texture.fromBitmapData(bitmap);
            Helpers.assertImage(texture, this, red64x64, done);
        });

        it('should create a texture from a color', function(done) {
            initStarling();
            var texture:skylark.Texture = Texture.fromColor(64, 64, 0xFFFF0000);
            Helpers.assertImage(texture, this, red64x64, done);
        });

        it('should create a texture from an "embedded" image (string)', function(done) {
            var red1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8z8DwHwAFBQIAHl6u2QAAAABJRU5ErkJggg==';
            var texture = Texture.fromEmbedded(red1x1);
            Helpers.assertImage(texture, this, red1x1, done);
        });
    });


    it('GetRoot', function() {
        var texture:skylark.ConcreteTexture = new skylark.ConcreteTexture(32, 32);
        var subTexture:skylark.SubTexture = new skylark.SubTexture(texture, new skylark.Rectangle(0, 0, 16, 16));
        var subSubTexture:skylark.SubTexture = new skylark.SubTexture(texture, new skylark.Rectangle(0, 0, 8, 8));

        assert.equal(texture, texture.root);
        assert.equal(texture, subTexture.root);
        assert.equal(texture, subSubTexture.root);
        assert.equal(texture.base, subSubTexture.base);
    });

    it('GetSize', function() {
        var texture:skylark.ConcreteTexture = new skylark.ConcreteTexture(32, 16, 2);
        var subTexture:skylark.SubTexture = new skylark.SubTexture(texture, new skylark.Rectangle(0, 0, 12, 8));

        assert.closeTo(texture.width, 16, E);
        assert.closeTo(texture.height, 8, E);
        assert.closeTo(texture.nativeWidth, 32, E);
        assert.closeTo(texture.nativeHeight, 16, E);

        assert.closeTo(subTexture.width, 12, E);
        assert.closeTo(subTexture.height, 8, E);
        assert.closeTo(subTexture.nativeWidth, 24, E);
        assert.closeTo(subTexture.nativeHeight, 16, E);
    });


    it.skip('should fail if trying to instantiate the "Texture" class directly', function() {
        expect(()=> {
            new skylark.Texture();
        }).to.throw();
    });

    //[Test]
    it('TextureCoordinates', function() {
        var rootWidth:number = 256;
        var rootHeight:number = 128;
        var subTexture:skylark.SubTexture;
        var subSubTexture:skylark.SubTexture;
        var vertexData:skylark.VertexData = createStandardVertexData();
        var adjustedVertexData:skylark.VertexData;
        var texture:skylark.ConcreteTexture = new skylark.ConcreteTexture(rootWidth, rootHeight);
        var texCoords:skylark.Point = new skylark.Point();

        // test subtexture filling the whole base texture
        subTexture = new skylark.SubTexture(texture, new skylark.Rectangle(0, 0, rootWidth, rootHeight));
        adjustedVertexData = vertexData.clone();
        subTexture.adjustVertexData(adjustedVertexData, 0, 4);
        Helpers.compareVectors(vertexData.rawData, adjustedVertexData.rawData);

        // test subtexture with 50% of the size of the base texture
        subTexture = new skylark.SubTexture(texture,
            new skylark.Rectangle(rootWidth / 4, rootHeight / 4, rootWidth / 2, rootHeight / 2));
        adjustedVertexData = vertexData.clone();
        subTexture.adjustVertexData(adjustedVertexData, 0, 4);

        adjustedVertexData.getTexCoords(0, texCoords);
        Helpers.comparePoints(new skylark.Point(0.25, 0.25), texCoords);
        adjustedVertexData.getTexCoords(1, texCoords);
        Helpers.comparePoints(new skylark.Point(0.75, 0.25), texCoords);
        adjustedVertexData.getTexCoords(2, texCoords);
        Helpers.comparePoints(new skylark.Point(0.25, 0.75), texCoords);
        adjustedVertexData.getTexCoords(3, texCoords);
        Helpers.comparePoints(new skylark.Point(0.75, 0.75), texCoords);

        // test subtexture of subtexture
        subSubTexture = new skylark.SubTexture(subTexture,
            new skylark.Rectangle(subTexture.width / 4, subTexture.height / 4,
                subTexture.width / 2, subTexture.height / 2));
        adjustedVertexData = vertexData.clone();
        subSubTexture.adjustVertexData(adjustedVertexData, 0, 4);

        adjustedVertexData.getTexCoords(0, texCoords);
        Helpers.comparePoints(new skylark.Point(0.375, 0.375), texCoords);
        adjustedVertexData.getTexCoords(1, texCoords);
        Helpers.comparePoints(new skylark.Point(0.625, 0.375), texCoords);
        adjustedVertexData.getTexCoords(2, texCoords);
        Helpers.comparePoints(new skylark.Point(0.375, 0.625), texCoords);
        adjustedVertexData.getTexCoords(3, texCoords);
        Helpers.comparePoints(new skylark.Point(0.625, 0.625), texCoords);

        // test subtexture over moved texture coords (same <above>effect)
        vertexData = createVertexDataWithMovedTexCoords();
        adjustedVertexData = vertexData.clone();
        subTexture.adjustVertexData(adjustedVertexData, 0, 4);

        adjustedVertexData.getTexCoords(0, texCoords);
        Helpers.comparePoints(new skylark.Point(0.375, 0.375), texCoords);
        adjustedVertexData.getTexCoords(1, texCoords);
        Helpers.comparePoints(new skylark.Point(0.625, 0.375), texCoords);
        adjustedVertexData.getTexCoords(2, texCoords);
        Helpers.comparePoints(new skylark.Point(0.375, 0.625), texCoords);
        adjustedVertexData.getTexCoords(3, texCoords);
        Helpers.comparePoints(new skylark.Point(0.625, 0.625), texCoords);
    });

    function createStandardVertexData():skylark.VertexData {
        var vertexData:skylark.VertexData = new skylark.VertexData(4);
        vertexData.setTexCoords(0, 0.0, 0.0);
        vertexData.setTexCoords(1, 1.0, 0.0);
        vertexData.setTexCoords(2, 0.0, 1.0);
        vertexData.setTexCoords(3, 1.0, 1.0);
        return vertexData;
    }

    function createVertexDataWithMovedTexCoords():skylark.VertexData {
        var vertexData:skylark.VertexData = new skylark.VertexData(4);
        vertexData.setTexCoords(0, 0.25, 0.25);
        vertexData.setTexCoords(1, 0.75, 0.25);
        vertexData.setTexCoords(2, 0.25, 0.75);
        vertexData.setTexCoords(3, 0.75, 0.75);
        return vertexData;
    }
});
