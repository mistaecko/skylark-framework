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

describe('ImageTests', function () {
    var E:number = 0.0001;

    if (isBrowser) {
        describe('[browser-based]', function () {

                var imageSource;
                var texture:skylark.ConcreteTexture;
                var src;

                var redPx24 = 0xff0000;
                var red1x1 = 'test/resources/1x1red.png';

                /* setup a CANVAS element, SimpleImageSource, texture */
                function setup(cfg:{ src:string; canvasWidth:number; canvasHeight:number}, done:{():void} = null) {
                    src = cfg.src;
                    imageSource = new stubs.SimpleImageSource(137, 140, cfg.src);
                    jQuery('<canvas id="stage" style="background-color: #0094FF" width="' + cfg.canvasWidth + '" height="' + cfg.canvasHeight + '"></canvas>').appendTo('body');

                    var deferred = jQuery.Deferred();

                    var proceed = () => {
                        texture = new skylark.ConcreteTexture(imageSource);
                        deferred.resolve(texture);
                    };

                    if (imageSource.isComplete())
                        proceed();
                    else
                        imageSource.addEventListener('complete', proceed);

                    return deferred.promise().done(()=> {
                        if (done != null)
                            done();
                    });
                }

                Helpers.manageStarling(this);

                afterEach(()=> {
                    if (imageSource != null)
                        imageSource.dispose();
                });

                describe('An Image', ()=> {

                    var img1x1red:HTMLImageElement;

                    beforeEach((done)=> {
                        var cfg = {
                            src: 'test/resources/airborne.png',
                            canvasWidth: 140,
                            canvasHeight: 140
                        };

                        jQuery
                            .when(
                                setup(cfg),
                                Helpers.createBitmapImg(1, 1, 0xff0000)
                            ).then((result1, result2)=> {
                                img1x1red = result2;
                            })
                            .then(()=> done());
                    });

                    it('should accept a HTMLImageElement/Image object in the constructor', function () {
                        var result = new skylark.Image(</*IntelliJ*/any>img1x1red);
                        expect(result.texture.base.image).to.eql(img1x1red);
                    });

//                it('should render a ConcreteTexture onto an Image', function (done) {
//                    var image = new skylark.Image(texture);
//                    image["mTinted"] = true;
//
//                    var referenceSrc = 'test/resources/airborne-test0-reference.png';
//                    Helpers.assertImage(image, this, referenceSrc, done);
//                });
//
//                it('should render a SubTexture onto an Image', function (done) {
//                    var image = new skylark.Image(new skylark.SubTexture(texture, new skylark.Rectangle(20, 5, 110, 70)));
//                    image["mTinted"] = true;
//
//                    var referenceSrc = 'test/resources/airborne-test1-reference.png';
//                    Helpers.assertImage(image, this, referenceSrc, done);
//                });
//
//                it('should render a SubTexture based on a SubTexture onto an Image', function (done) {
//                    var subTexture = new skylark.SubTexture(texture, new skylark.Rectangle(20, 5, 110, 70));
//                    var image = new skylark.Image(new skylark.SubTexture(subTexture, new skylark.Rectangle(50, 20, 30, 35)));
//                    image["mTinted"] = true;
//
//                    var referenceSrc = 'test/resources/airborne-test2-reference.png';
//                    Helpers.assertImage(image, this, referenceSrc, done);
//                });

                });

                describe('An Image', ()=> {
                    beforeEach((done)=> {
                        setup({
                            src: 'test/resources/throw-atlas-1.png',
                            canvasWidth: 200,
                            canvasHeight: 200
                        }, done);
                    });

                    it('should render a SubTexture with frame', function (done) {
                        var frame = new skylark.Rectangle(-5, -5, 174, 176);
                        var subTexture = skylark.Texture.fromTexture(texture, new skylark.Rectangle(20, 20, 138, 166), frame);

                        var image = new skylark.Image(subTexture);
                        // color tinting not yet supported!
                        //image.color = 0xC0C0C0;

                        var referenceSrc = 'test/resources/throw-test1-ref2.png';
                        //note: canvas has been created with blue background!
                        Helpers.assertImage(image, this, referenceSrc, done);
                    });

                });

            }
        );
    }
});
