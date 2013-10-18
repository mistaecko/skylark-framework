// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

// note: Helpers and Stubs are compiled seperatly *before* other test classes

/// <reference path="../../_skylark.d.ts"/>

/// <reference path="../../_common.d.ts"/>

/// <reference path="../../mocha/mocha.d.ts"/>
/// <reference path="../../../lib/dts/chai.d.ts"/>
/// <reference path="../../../lib/jquery/jquery.d.ts"/>
/// <reference path="../../../lib/bitmap/bitmap.d.ts"/>
/// <reference path="../../../lib/js-imagediff/1.0.3/imagediff.d.ts"/>

module util {

    import _Bitmap = skylark.Bitmap;

    export class Helpers {

        public static E:number = 0.001;

        private static _STARLING_STAGE_DEFAULTS = <skylark.StageConfig>(function() {
            var cfg = skylark.Skylark.stageDefaults;
            var copy = {};
            for(var key in cfg) {
                if(cfg.hasOwnProperty(key))
                    copy[key] = cfg[key];
            }
            return copy;
        })();

        public static compareRectangles(rect1:skylark.Rectangle, rect2:skylark.Rectangle, e:number = 0.0001):void {
            assert.closeTo(rect1.x, rect2.x, e);
            assert.closeTo(rect1.y, rect2.y, e);
            assert.closeTo(rect1.width, rect2.width, e);
            assert.closeTo(rect1.height, rect2.height, e);
        }

        public static comparePoints(point1:skylark.Point, point2:skylark.Point, e:number = 0.0001):void {
            assert.closeTo(point1.x, point2.x, e);
            assert.closeTo(point1.y, point2.y, e);
        }

//        public static compareVector3Ds(v1:Vector3D, v2:Vector3D, e:number = 0.0001):void {
//            assert.closeTo(v1.x, v2.x, e);
//            assert.closeTo(v1.y, v2.y, e);
//            assert.closeTo(v1.z, v2.z, e);
//            assert.closeTo(v1.w, v2.w, e);
//        }

        public static compareVectors(vector1:number[], vector2:number[], e:number = 0.0001):void {
            assert.equal(vector1.length, vector2.length);

            for (var i:number = 0; i < vector1.length; ++i)
                assert.closeTo(vector1[i], vector2[i], e);
        }

        public static compareMatrices(matrix1:skylark.Matrix, matrix2:skylark.Matrix, e:number = 0.0001):void {
            assert.closeTo(matrix1.a, matrix2.a, e);
            assert.closeTo(matrix1.b, matrix2.b, e);
            assert.closeTo(matrix1.c, matrix2.c, e);
            assert.closeTo(matrix1.d, matrix2.d, e);
            assert.closeTo(matrix1.tx, matrix2.tx, e);
            assert.closeTo(matrix1.ty, matrix2.ty, e);
        }


        /// DOM related Helper Functions ///

        public static getDomSandbox(autoCreate:boolean = true):HTMLElement {
            var sandbox = document.getElementById('sandbox');
            if(!sandbox && autoCreate) {
                sandbox = document.createElement('div');
                sandbox.id = 'sandbox';
                document.body.appendChild(sandbox);
            }
            return sandbox;
        }

        public static eraseDomSandbox() {
            var sandbox = Helpers.getDomSandbox(false);
            if(sandbox)
                sandbox.parentNode.removeChild(sandbox);
        }

        public static createCanvas(id:string, width:number, height:number, color:string = null) {
            var canvasEl = <HTMLCanvasElement>document.createElement('canvas');
            canvasEl.id = id;
            canvasEl.setAttribute('width', String(width));
            canvasEl.setAttribute('height',String(height));
            //canvasEl.width = width;
            //canvasEl.height = height;
            if(color != null)
                canvasEl.style.backgroundColor = color;

            //var body:HTMLElement = document.body;
            Helpers.getDomSandbox().appendChild(canvasEl);

            return canvasEl;
        }

        public static cleanupCanvas(canvas:HTMLCanvasElement) {
            if(canvas && canvas.parentNode)
                canvas.parentNode.removeChild(canvas);
        }

        public static installCleanup(suite:any) {
            suite.afterEach(function() {
                Helpers.cleanup(this.test);
                Helpers.resetStageDefaults();
            });
        }

        public static cleanup(test) {
            if(skylark.Skylark.current)
                skylark.Skylark.current.dispose();

            Helpers.eraseDomSandbox();
            if(jQuery('canvas').length)
                if(test.ok)
                    throw new Error('Possible "canvas" DOM leak in Test + "' + test.fullTitle() + '"! ' + jQuery('canvas')[0].outerHTML);
                else
                    jQuery('canvas').remove();
        }

        public static resetStageDefaults() {
            skylark.Skylark.stageDefaults = Helpers._STARLING_STAGE_DEFAULTS;
        }

        public static manageStarling(suite:MochaSuite) {
            suite.beforeEach((done)=> {
                // delay test execution until documentReady event
                jQuery(()=> { done(); });
            });

            Helpers.installCleanup(suite);
        }

        //public static assertImage(src:string, title:any, referenceSrc:string, done:()=>void);
        public static assertImage(texture:skylark.Texture, title:any, referenceSrc:string, done:()=>void);
        public static assertImage(image:HTMLImageElement, title:any, referenceSrc:string, done:()=>void);
        public static assertImage(root:skylark.DisplayObject, title:any, referenceSrc:string, done:()=>void);

        public static assertImage(root:any, title:any, referenceSrc:string, done:()=>void) {
            Helpers.evaluateImage(root, title, referenceSrc)
                .fail(()=> {
                    throw new Error('Unexpected failure in Helpers.evaluateImage');
                })
                .done((result)=> {
                    if(!result)
                        assert.fail('[image]', '[image]', 'Images are not equal', 'imagediff');
//                        try { assert.fail('[image]', '[image]', 'Images are not equal', 'imagediff'); }
//                        catch(e) {
//                            done(e);
//                        }
                    else
                        done();
                });
        }

        public static evaluateImage(src:string, title:any, referenceSrc:string):JQueryPromise;
        public static evaluateImage(texture:skylark.Texture, title:any, referenceSrc:string):JQueryPromise;
        public static evaluateImage(image:HTMLImageElement, title:any, referenceSrc:string):JQueryPromise;
        public static evaluateImage(root:skylark.DisplayObject, title:any, referenceSrc:string):JQueryPromise;

        public static evaluateImage(a:any, title:any, referenceSrc:string):JQueryPromise {
            expect(a).to.exist;

            var root:skylark.DisplayObject;

            // load image before proceeding with original fn call
            if(typeof a === 'string' || a instanceof HTMLImageElement && !a.complete) {
                return Helpers.waitForImage(a).then((image)=>{
                    return Helpers.evaluateImage(image, title, referenceSrc);
                });
            }

            if(a instanceof HTMLImageElement || a instanceof skylark.Texture)
                root = new skylark.Image(a);
            else
                root = <skylark.DisplayObject>a;

            if(title && title.test)
                title = (<any>title.test).title;

            var app;

            return jQuery.when(
                    Helpers.load(referenceSrc)
                )
                .then((img)=> {
                    //var bounds = root.bounds;
                    var width = img.width;
                    var height = img.height;

                    skylark.Skylark.stageDefaults.width = width;
                    skylark.Skylark.stageDefaults.height = height;

                    skylark.Skylark.buffered = false;
                    app = skylark.Skylark.create(root);

                    return Helpers.captureFrame(app);
                })
                .then(function(image) {
                    app.stop();
                    return Helpers.compareImage(image.src, referenceSrc, title);
                })
                .always(function() {
                    app.dispose();
                });
        }

        public static captureFrame(skylark:skylark.Skylark):JQueryPromise {
            var deferred = $.Deferred();

//            if(skylark.isStarted())
//                throw new skylark.IllegalSystemStateError('Cannot capture frame from a running Skylark instance');

            // stub Skylark#render to capture rendered frame
            var originalRenderFn = skylark.render;
            skylark.render = function() {
                skylark.stop();
                delete skylark.render;
                originalRenderFn.apply(this, arguments);
                var dataUrl = skylark.canvas.toDataURL();
                deferred.resolve(dataUrl);
            }

            if(!skylark.isStarted())
                skylark.start();

            return deferred.promise().then((dataUrl)=>{
                return Helpers.waitForImage(dataUrl);
            });
        }

        public static load(src):JQueryPromise {
            return Helpers.loadAsCanvas(src)
                .then(function(canvas) {
                    return Helpers.waitForImage(canvas.toDataURL());
                });
        }

        public static waitForImage(image:HTMLImageElement):JQueryPromise;
        public static waitForImage(src:string):JQueryPromise;

        public static waitForImage(image:any):JQueryPromise {
            if(typeof image === 'string') {
                var src = image;
                image = new Image();
                image.src = src;
            }

            if(!(image instanceof HTMLImageElement))
                throw new Error('Expected a HTMLImageElement!');

            if(image.complete) {
                Helpers.verifyImage(image);
                return $.when(image);
            } else {
                var deferred = $.Deferred();
                var cb = function() {
                    image.removeEventListener('load', cb);
                    Helpers.verifyImage(image);
                    deferred.resolve(image);
                }

                image.addEventListener('load', cb);
                return deferred.promise();
            }
        }

        private static verifyImage(image:HTMLImageElement) {
            if(!(image instanceof HTMLImageElement))
                throw new Error('Image is not of type HTMLImageElement');
            if(!image.complete)
                throw new Error('Image is not in state "complete"');
            if(!(image.width > 0 && image.height > 0))
                throw new Error('Image has no dimensions');
        }


        private static loadAsCanvas(src):JQueryPromise {
            return jQuery.when(
                    Helpers.waitForImage(src)
                )
                .then(function (image) {
                    var canvas = imagediff.createCanvas();
                    var context = canvas.getContext('2d');

                    // render image to canvas, then grab image data
                    var height = image.height,
                        width = image.width;

                    canvas.width = width;
                    canvas.height = height;
                    canvas.clientWidth = width;
                    canvas.clientHeight = height;
                    context.clearRect(0, 0, width, height);
                    context.drawImage(image, 0, 0);

                    return canvas;
                }
            )
        }

        private static  loadAsImageData(src):JQueryPromise {
            return Helpers.loadAsCanvas(src)
                .then((canvas)=> {
                    if(canvas.height === 0 || canvas.width === 0)
                        throw new Error('Canvas created without dimensions!');
                    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                });
        }

        public static createBitmap(width:number, height:number, color:number):string {
            var rows = [];

            var pixel = [
                skylark.Color.getRed(color),
                skylark.Color.getGreen(color),
                skylark.Color.getBlue(color)
            ];

            var row = [];
            for(var j = 0; j < width; j++)
                row.push(pixel);

            for(var i = 0; i < height; i++)
                rows.push(row);

            return _Bitmap.create(rows, 1.0);
        }

        public static createBitmapImg(width:number, height:number, color:number):JQueryPromise {
            return jQuery.when(
                Helpers.waitForImage(Helpers.createBitmap(width, height, color))
            );
        }

        public static compareImage(src:string, reference:string, title:string):JQueryPromise {
            return $
                .when(
                    Helpers.loadAsImageData(src),
                    Helpers.loadAsImageData(reference)
                )
                .then(function(img1, img2) {
                    var result = imagediff.equal(img1, img2, 30);

                    var data = imagediff.diff(img1, img2);

                    var canvas = imagediff.createCanvas(data.width, data.height),
                        context = canvas.getContext('2d');
                    context.putImageData(data, 0, 0);

                    var el = jQuery(
                        '<div class="image-verification">' +
                            '<div class="title" style="cursor:pointer">' + (result ? '[PASS]' : '[FAILED] ') + 'Image verification for: ' + title + '</div>' +
                            '<div class="images' + (result ? ' collapsed' : '') + '" style="">' +
                            '<img src="' + src + '" style="vertical-align: top; margin-right:5px; border: 1px solid black; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAJUlEQVQYV2Nsb2//z4AGKisrGdHFGIeCQnRHg/jY3I3hu0GoEAD36iDvDQ3uiwAAAABJRU5ErkJggg==) repeat">' +
                            '<img src="' + reference + '" style="vertical-align: top; margin-right:5px; border: 1px solid black; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAJUlEQVQYV2Nsb2//z4AGKisrGdHFGIeCQnRHg/jY3I3hu0GoEAD36iDvDQ3uiwAAAABJRU5ErkJggg==) repeat">' +
                            '<img src="' + canvas.toDataURL() + '">' +
                            '</div>'
                    ).appendTo('body');

                    el.find('.title').click(function(event) {
                        $(el).find('.images').toggleClass('collapsed');
                    });

                    return result;
                });
        }

//        public static compareImage3(src:string, reference:string, title:string, done:() => void) {
//            function load(src) {
//                var img = new Image();
//                var done = $.Deferred();
//                img.addEventListener('load', function() {
//                    done.resolve();
//                });
//                img.src = src;
//                return done;
//            }
//
//            $.when(load(src), load(reference)).done(function() {})
//            resemble(src).compareTo(reference).onComplete(function(data:any){
//                var time = Date.now();
//                var el = jQuery(
//                    '<div>' +
//                        '<div>Image verification for: ' + title + '</div>' +
//                        '<div>' +
//                        '<img src="' + reference + '" style="vertical-align: top; margin-right:5px; border: 1px solid black">' +
//                        '<img src="' + src + '" style="vertical-align: top; margin-right:5px; border: 1px solid black">' +
//                        '<img src="' + data.getImageDataUrl() + '">' +
//                        '</div>' +
//                        '<div class="result"></div>' +
//                    '</div>'
//                ).appendTo('body');
//
//                done();
//            });
//
//        }
//        public static compareImage2(src:string, reference:string, title:string, done:() => void) {
//            jQuery(
//                '<div>' +
//                    '<div>Manual verification for: ' + title + '</div>' +
//                    '<div >' +
//                    '<img src="' + reference + '" style="vertical-align: top; margin-right:5px; border: 1px solid black">' +
//                    '<img src="' + src + '" style="vertical-align: top; margin-right:5px; border: 1px solid black">' +
//                    '</div>' +
//                    '</div>').appendTo('body');
//
//            done();
//        }
    }
}




if(isBrowser) {
    $("<style type='text/css'> .collapsed{ display:none; } </style>").appendTo("head");
    $("<style type='text/css'> .images > img { vertical-align: top; margin-right:5px; border: 1px solid black } </style>").appendTo("head");
    $("<style type='text/css'> .image-verification  { margin-top: 5px; } </style>").appendTo("head");
}

var Helpers = util.Helpers;

(function(root, Helpers) {
    if(typeof exports === 'object') {
        eval('module.exports = Helpers');
    } else {
        this.Helpers = Helpers;
    }
})(this, util.Helpers);
