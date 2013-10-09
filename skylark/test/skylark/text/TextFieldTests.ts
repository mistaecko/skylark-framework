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

describe('TextField', function() {
    var bitmapFont;
    var bitmapFonts;

    beforeEach(function() {
        bitmapFont = new skylark.BitmapFont(skylark.MiniBitmapFont.texture, skylark.MiniBitmapFont.xml);
        bitmapFonts = (<any>skylark.TextField).bitmapFonts;
        skylark.Skylark.stageDefaults.backgroundColor = 0xff0000;
    });

    afterEach(function() {
        (<any>skylark.TextField).bitmapFonts = null;
        skylark.Skylark.stageDefaults.backgroundColor = null;
    });

    describe('statics', function() {
        it('should register a Bitmap font', function() {
            skylark.TextField.registerBitmapFont(bitmapFont);
            expect(bitmapFonts).to.have.a.property('mini');
            expect(bitmapFonts['mini']).to.eql(bitmapFont);
        });

        it('should register a Bitmap font by name', function() {
            skylark.TextField.registerBitmapFont(bitmapFont, 'kaboom');
            expect(bitmapFonts['kaboom']).to.eql(bitmapFont);
        });

        it('should unregister a Bitmap font', function() {
            bitmapFonts['kaboom'] = bitmapFont;

            skylark.TextField.unregisterBitmapFont('kaboom');
            expect(bitmapFonts).to.not.have.a.property('kaboom');
        });
    });


    describe('Bitmap fonts', function() {
        it('should render based on a Bitmap font', function(done) {
            var textfield = new skylark.TextField(40, 10, 'Kaboom', 'mini', 8, 0xffffff);
            textfield.hAlign = skylark.HAlign.LEFT;
            textfield.vAlign = skylark.VAlign.TOP;
            Helpers.assertImage(textfield, this, 'test/resources/mini-kaboom.png', done);
        });
        it.skip('should render Bitmap font in different color', function(done) {
            var textfield = new skylark.TextField(40, 10, 'Kaboom', 'mini', 8, 0x0000ff);
            textfield.hAlign = skylark.HAlign.LEFT;
            textfield.vAlign = skylark.VAlign.TOP;
            Helpers.assertImage(textfield, this, 'test/resources/textfield/mini-kaboom-blue.png', done);
        });
    });

    // this test is currently not fully automated and therefore marker to 'skip'
    it.skip('should render to TextFields with different texts', function(done) {
        var textfield1 = new skylark.TextField(100, 50, 'Bang!', 'mini', 16, 0x000000);
        textfield1.y = 10;
        textfield1.hAlign = skylark.HAlign.CENTER;
        textfield1.vAlign = skylark.VAlign.MIDDLE;

        var textfield2 = new skylark.TextField(100, 50, 'Kaboom', 'mini', 16, 0x000000);
        textfield2.hAlign = skylark.HAlign.LEFT;
        textfield2.vAlign = skylark.VAlign.TOP;

        var root = new skylark.Sprite();
        root.addChild(textfield1);

        textfield2.y = 50;
        root.addChild(textfield2);

        Helpers.assertImage(root, this, 'test/resources/airborne.png', done);
    });

    describe('Truetype fonts', function() {
        it('should render in a single line [left,top]', function(done) {
            var textfield = new skylark.TextField(100, 50, 'Kaboom', 'Arial', 16, 0x000000);
            textfield.hAlign = skylark.HAlign.LEFT;
            textfield.vAlign = skylark.VAlign.TOP;
            // note: top-left corner of 'K' letter start at (1,3)
            Helpers.assertImage(textfield, this, 'test/resources/textfield/Kaboom-lt.png', done);
        });
//        it('should render in a single line [center,middle]', function(done) {
//            var textfield = new skylark.TextField(100, 50, 'Kaboom', 'Arial', 16, 0x000000);
//            textfield.hAlign = skylark.HAlign.CENTER;
//            textfield.vAlign = skylark.VAlign.MIDDLE;
//            Helpers.assertImage(textfield, this, 'test/resources/textfield/Kaboom-cm.png', done);
//        });
//
//        it('should render multi-line text', function(done) {
//            var textfield = new skylark.TextField(100, 50, 'Kaboom! Bang!', 'Arial', 16, 0x000000);
//            textfield.hAlign = skylark.HAlign.CENTER;
//            textfield.vAlign = skylark.VAlign.MIDDLE;
//
//            Helpers.assertImage(textfield, this, 'test/resources/textfield/Kaboom!_Bang!-cm.png', done);
//        });
//
//        it('should respect multiple spaces between words', function(done) {
//            var textfield = new skylark.TextField(100, 50, 'Ka    booom Bang!', 'Arial', 16, 0x000000);
//            textfield.hAlign = skylark.HAlign.CENTER;
//            textfield.vAlign = skylark.VAlign.MIDDLE;
//
//            Helpers.assertImage(textfield, this, 'test/resources/textfield/Ka_booom_Bang!-cm.png', done);
//        });
//        it('should ignore multiple spaces on line breaks', function(done) {
//            var textfield = new skylark.TextField(100, 50, 'Kaboom!                  Bang!', 'Arial', 16, 0x000000);
//            textfield.hAlign = skylark.HAlign.CENTER;
//            textfield.vAlign = skylark.VAlign.MIDDLE;
//
//            Helpers.assertImage(textfield, this, 'test/resources/textfield/Kaboom!_Bang!-cm.png', done);
//        });
//        it('should ignore multiple spaces at the end', function(done) {
//            var textfield = new skylark.TextField(100, 50, 'Kaboom! Bang!                     ', 'Arial', 16, 0x000000);
//            textfield.hAlign = skylark.HAlign.CENTER;
//            textfield.vAlign = skylark.VAlign.MIDDLE;
//
//            Helpers.assertImage(textfield, this, 'test/resources/textfield/Kaboom!_Bang!-cm.png', done);
//        });
    });

});
