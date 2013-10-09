// =================================================================================================
//
//	Skylark Framework
//	Copyright 2012 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');


describe('VertexDataTests', function() {
    var E:number = 0.001;

    it('Init', function() {
        var numVertices:number = 3;
        var vd:skylark.VertexData = new skylark.VertexData(numVertices);
        var position:skylark.Point = new skylark.Point();
        var texCoords:skylark.Point = new skylark.Point();

        for(var i:number = 0; i < numVertices; ++i) {
            vd.getPosition(i, position);
            vd.getTexCoords(i, texCoords);

            Helpers.comparePoints(position, new skylark.Point());
            Helpers.comparePoints(texCoords, new skylark.Point());
            assert.equal(0x0, vd.getColor(i));
            assert.equal(1.0, vd.getAlpha(i));
        }
    });


    it('GetNumVertices', function() {
        var vd:skylark.VertexData = new skylark.VertexData(4);
        assert.equal(4, vd.numVertices);
    });

    //todo fix/implement behavior
    //[Test(expects="RangeError")]
    it.skip('BoundsLow', function() {
        expect(()=> {
            var vd:skylark.VertexData = new skylark.VertexData(3);
            vd.getColor(-1);
        }).to.throw();
    });

    //todo fix/implement behavior
    it.skip('BoundsHigh', function() {
        expect(()=>{
            var vd:skylark.VertexData = new skylark.VertexData(3);
            vd.getColor(3);
        }).to.throw();
    });

    it('Position', function() {
        var vd:skylark.VertexData = new skylark.VertexData(4);
        vd.setPosition(0, 1, 2);
        vd.setPosition(1, 4, 5);

        var position:skylark.Point = new skylark.Point();

        vd.getPosition(0, position);
        assert.equal(1, position.x);
        assert.equal(2, position.y);

        vd.getPosition(1, position);
        assert.equal(4, position.x);
        assert.equal(5, position.y);
    });

    //[Test]
    it('Color', function() {
        var vd:skylark.VertexData = new skylark.VertexData(3, true);
        assert.equal(3, vd.numVertices);
        assert.isTrue(vd.premultipliedAlpha);

        vd.setColor(0, 0xffaabb);
        vd.setColor(1, 0x112233);

        assert.equal(0xffaabb, vd.getColor(0));
        assert.equal(0x112233, vd.getColor(1));
        assert.equal(1.0, vd.getAlpha(0));

        // check premultiplied alpha

        var alpha:number = 0.5;

        vd.setColor(2, 0x445566);
        vd.setAlpha(2, alpha);
        assert.equal(0x445566, vd.getColor(2));
        assert.equal(1.0, vd.getAlpha(1));
        assert.equal(alpha, vd.getAlpha(2));

        var data:number[] = vd.rawData;
        var red:number = 0x44 / 255.0;
        var green:number = 0x55 / 255.0;
        var blue:number = 0x66 / 255.0;
        var offset:number = skylark.VertexData.ELEMENTS_PER_VERTEX * 2 + skylark.VertexData.COLOR_OFFSET;

        assert.closeTo(data[offset  ], red * alpha, E);
        assert.closeTo(data[offset + 1], green * alpha, E);
        assert.closeTo(data[offset + 2], blue * alpha, E);

        // changing the pma setting should update contents

        vd.setPremultipliedAlpha(false, true);
        assert.isFalse(vd.premultipliedAlpha);

        assert.equal(0xffaabb, vd.getColor(0));
        assert.equal(0x112233, vd.getColor(1));
        assert.equal(1.0, vd.getAlpha(0));

        vd.setColor(2, 0x445566);
        vd.setAlpha(2, 0.5);
        assert.equal(0x445566, vd.getColor(2));
        assert.equal(0.5, vd.getAlpha(2));

        assert.closeTo(data[offset  ], red, E);
        assert.closeTo(data[offset + 1], green, E);
        assert.closeTo(data[offset + 2], blue, E);
    });

    //[Test]
    it('TexCoords', function() {
        var vd:skylark.VertexData = new skylark.VertexData(2);
        vd.setTexCoords(0, 0.25, 0.75);
        vd.setTexCoords(1, 0.33, 0.66);

        var texCoords:skylark.Point = new skylark.Point();

        vd.getTexCoords(0, texCoords);
        assert.equal(0.25, texCoords.x);
        assert.equal(0.75, texCoords.y);

        vd.getTexCoords(1, texCoords);
        assert.equal(0.33, texCoords.x);
        assert.equal(0.66, texCoords.y);
    });
});
