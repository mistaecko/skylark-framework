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

describe('ConcreteTextureTests', function () {
    var E:number = 0.0001;

    if (isBrowser) {
        // provide an ImageSource and image that have completed loading once tests are run
        var imageSource:stubs.SimpleImageSource;
        var image:HTMLImageElement;

        beforeEach((done) => {
            imageSource = new stubs.SimpleImageSource(100, 200, 'test/resources/airborne.png');
            image = imageSource.image;
            if(!imageSource.isComplete())
                imageSource.addEventListener('complete', () => done() );
            else
                done();
        });

        afterEach(() => {
            if(imageSource)
                imageSource.dispose();
            imageSource = null;
            image = null;
        });

        describe('[browser-based]', ()=> {

            it('should determine width/height from the image source', function (done) {
                var texture = new skylark.ConcreteTexture(imageSource);
                expect(texture.width).to.eql(100);
                expect(texture.height).to.eql(200);
                done();
            });
        });

        describe('constructor', function() {
            it('should accept a loaded image', function() {
                var texture = new skylark.ConcreteTexture(image); // image is loaded in beforeEach

                expect(texture.base.image).to.eql(image);
            });

            it('should accept an image created from a bitmap dataURL', function() {
                var bitmap = Helpers.createBitmap(64, 64, 0xff);
                var image = new Image();
                image.src = bitmap;
                //note: on FF setting Image#src to a dataURL is asynchronous - width/height will not be
                // immediately available
                image.width = 64;
                image.height = 64;

                var texture = new skylark.ConcreteTexture(</*IntelliJ*/any>image);

                expect(texture.base.image).to.eql(image);
            });

            it('should fail when passed an image that has not loaded yet', function() {
                var image = new Image();
                image.src = 'CAN-NEVER-COMPLETE-BECAUSE-DOES-NOT-EXIST.png';
                expect(()=> {
                    new skylark.ConcreteTexture(</*IntelliJ*/any>image);
                }).to.throw();
            });

            it('should fail when passed something it does not understand', function() {
                expect(()=> {
                    new skylark.ConcreteTexture(<any>'test/resources/airborne.png');
                }).to.throw();
            })

        });
    }
});



