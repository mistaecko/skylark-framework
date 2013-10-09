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

describe('BitmapData', function() {
    var BitmapData = skylark.BitmapData;

    var bitmap:skylark.BitmapData;
    var bitmapWidth:number;
    var bitmapHeight:number;
    var bytes:ByteArray;

    var red = 0xffff0000;
    var green = 0xff00ff00;
    var blue = 0xff0000ff;

    var red64x64 = 'test/resources/64x64red.png';
    var red1x1 = 'test/resources/1x1red.png';

    beforeEach(function() {
        bitmapWidth = 2;
        bitmapHeight = 3;
        // ARGB
        bytes = <ByteArray>[
            red, green,
            blue, red,
            green, blue
        ]

        bitmap = new skylark.BitmapData(bitmapWidth, bitmapHeight, bytes);
    });

    describe('toDataURL', function() {
        var image:HTMLImageElement;

        // preload image
        beforeEach(function(done) {
            Helpers.waitForImage(red1x1).then((img)=> {
                image = img;
            }).done(()=> done());
        });

        it('should convert a HTMLImageElement to a base64-encoded dataURL', function() {
            var string = skylark.BitmapData.toDataURL(image);
            expect(string).to.eql('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8z8DwHwAFBQIAHl6u2QAAAABJRU5ErkJggg==');
        });

        it('should convert a HTMLCanvasElement', function() {
            var canvas = Helpers.createCanvas('tmp', 1, 1);
            canvas.getContext('2d').drawImage(image, 0, 0);

            var spy = sinon.spy(canvas, 'toDataURL');
            skylark.BitmapData.toDataURL(canvas);
            expect(spy).to.have.been.calledOnce;
        });
        it('should convert a CanvasRenderingContext2D', function() {
            var canvas = Helpers.createCanvas('tmp', 1, 1);
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);

            var spy = sinon.spy(canvas, 'toDataURL');
            skylark.BitmapData.toDataURL(context);
            expect(spy).to.have.been.calledOnce;
        });
    });

    it('should return the raw pixel data', function() {
        expect(bitmap.bytes).to.eql(bytes);
    });

    it('should return width and height', function() {
        var redPixel = 0xffff0000;
        var data = [ redPixel, redPixel, redPixel, redPixel, redPixel, redPixel ];
        var bitmap = new skylark.BitmapData(2, 3, data);

        expect(bitmap.width).to.eql(2);
        expect(bitmap.height).to.eql(3);
    });

    it('should return a specific pixel', function() {
        expect(bitmap.getPixel32(0, 0)).to.eql(red);
        expect(bitmap.getPixel32(1, 0)).to.eql(green);
        expect(bitmap.getPixel32(0, 1)).to.eql(blue);
        expect(bitmap.getPixel32(1, 1)).to.eql(red);
        expect(bitmap.getPixel32(0, 2)).to.eql(green);
        expect(bitmap.getPixel32(1, 2)).to.eql(blue);
    });

    it('should encode the bitmap data as base64 encoded image url', function(done) {
        var red = 0xffff0000;
        var bytes = [];
        var size = 1;
        var reference = red1x1;

        for(var i = 0; i < size*size; i++)
            bytes.push(red);

        bitmap = new BitmapData(size, size, bytes);

        var url = bitmap.asUrl();
        var image = new Image();
        image.src = url;

        Helpers.assertImage(image, this, reference, done);
    });

//    it('should', function() {
//        var bytes = skylark.MiniBitmapFont['BITMAP_DATA'];
//        var bitmap = new BitmapData(bytes);
//    });
});
