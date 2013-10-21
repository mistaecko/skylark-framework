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

describe('BitmapFont', function() {

    //noinspection JSUnresolvedVariable
    var xml1:string = '<?xml version="1.0" encoding="UTF-8"?>\
<font>\
    <info face="mini" size="8" bold="0" italic="0" smooth="0" />\
    <common lineHeight="8" base="7" scaleW="128" scaleH="64" pages="1" packed="0" />\
    <chars count="191">\
        <char id="195" x="1" y="1" width="5" height="9" xoffset="0" yoffset="-2" xadvance="6" />\
        <char id="209" x="7" y="1" width="5" height="9" xoffset="0" yoffset="-2" xadvance="6" />\
    </chars>\
</font>';
    Helpers.installCleanup(this);

    describe('parseXml', function() {
        it('should add chars', function() {
            var spy = sinon.spy(skylark.BitmapFont['prototype'], 'addChar');
            var texture = new stubs.MTexture(64, 64, 0xff0000);
            var font = new skylark.BitmapFont(texture, xml1);
            expect(spy).to.have.been.calledTwice;
        });

        it.skip('should add kerning information', function() {
            var texture = new stubs.MTexture(64, 64, 0xff0000);
            var font = new skylark.BitmapFont(texture, xml1);
        });
    });

    describe('rendering', function() {
        var img1; // a possible base image for a font texture
        var font; // a font based on "mini.png"

        beforeEach(function(done) {
            // preload the bitmap font texture
            jQuery.when(
                    Helpers.load('test/resources/mini.png')
                )
                .then((img)=> {
                    img1 = img;

                    var texture = new skylark.ConcreteTexture(img);
                    font = new skylark.BitmapFont(texture, skylark.MiniBitmapFont.xml);

                    // render on red background
                    skylark.Skylark.stageDefaults.backgroundColor = 0xff0000;
                })
                .then(()=> done());
        });

        afterEach(function() {
            // cleanup
            skylark.Skylark.stageDefaults.backgroundColor = null;
        });

        skipIfFirefox.it('should create the "Mini" BitmapFont when constructor is called without args', function() {
            var font:any = new skylark.BitmapFont();
            var mini:any = new skylark.MiniBitmapFont();
            expect(font.mTexture).to.eql(mini.mTexture);
            expect(font.name).to.eql(mini.name);
        });

        it('should build the correct texture for a specific char', function(done) {
            var char = font.getChar(75); // "font" is based on "mini.png"
            var texture = char.texture;
            Helpers.assertImage(texture, this, 'test/resources/mini-K.png', done);
        });

        describe('createSprite', function() {
            // <char id="75" x="120" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />
            //
            // letter has width=5px,height=5px in the texture
            //            xOffset=0px,yOffset=2px
            // font line height is 8px
            // letter box is therefore 8x5
            // with two empty pixel rows above, and one row below the letter pixels


            skipIfFirefox.it('should center a single letter horizontally and vertically', function(done) {
                var sprite = font.createSprite(15, 18, 'K');
                Helpers.assertImage(sprite, this, 'test/resources/mini-15x18-K-centered.png', done);
            });
            it('should align horizontally left', function(done) {
                var sprite = font.createSprite(15, 18, 'K', font.size, 0xffffff, 'left', skylark.VAlign.MIDDLE);
                Helpers.assertImage(sprite, this, 'test/resources/mini-15x18-K-left-center.png', done);
            });
            it.skip('should align horizontally right', function(done) {
                var sprite = font.createSprite(15, 18, 'K', font.size, 0xffffff, 'right', skylark.VAlign.MIDDLE);
                Helpers.assertImage(sprite, this, 'test/resources/mini-15x18-K-right-center.png', done);
            });
            skipIfFirefox.it('should align vertically top', function(done) {
                var sprite = font.createSprite(15, 18, 'K', font.size, 0xffffff, skylark.HAlign.CENTER, 'top');
                Helpers.assertImage(sprite, this, 'test/resources/mini-15x18-K-center-top.png', done);
            });
            skipIfFirefox.it('should align vertically bottom', function(done) {
                var sprite = font.createSprite(15, 18, 'K', font.size, 0xffffff, skylark.HAlign.CENTER, 'bottom');
                Helpers.assertImage(sprite, this, 'test/resources/mini-15x18-K-center-bottom.png', done);
            });
            it('should create a Sprite spelling "Kaboom"', function(done) {
                var sprite = font.createSprite(40, 10, 'Kaboom', font.size, 0xffffff, 'left', 'top');
                Helpers.assertImage(sprite, this, 'test/resources/mini-kaboom.png', done);
            });
        });
    });
});
