/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

/**
 * Small wrapper around BDD-style "it" function that waits with execution
 * of test until jQueries "ready" event fires (aka the DOM is fully loaded).
 *
 * @param msg
 * @param cb
 */
//function domIt(msg:string, cb) {
//    it(msg, (done) => {
//        jQuery().ready(function() {
//            cb.apply(this, [done]); // have to pass 'done' callback
//        });
//    });
//}

class RootObject extends skylark.Quad {
    constructor() {
        super(100, 100);
    }
}

describe('Skylark', () => {
    describe('[no-browser]', ()=> {
        beforeEach(()=> {
            stubs.MCanvasProvider.use();
            skylark.Skylark.buffered = false;
        });
        afterEach(()=> {
            stubs.MCanvasProvider.restore();
            skylark.Skylark.buffered = true;

            if(skylark.Skylark.current != null) {
                skylark.Skylark.current.dispose();
                skylark.Skylark.current = null;
            }
        });

        describe('when initialized', () => {

            it('should default to id "stage" if none is specified', () => {
                var mock = sinon.mock(stubs.MCanvasProvider.instance);
                mock
                    .expects('getCanvasById')
                    .once()
                    .withArgs('stage')
                    .returns(new stubs.MHTMLCanvasElement());

                new skylark.Skylark(RootObject, null, null);

                mock.verify();
                mock.restore();
            });

            it('should fail if no root class is given', () => {
                expect(() => {
                    new skylark.Skylark(null, 'stage', null);
                }).to.throw(skylark.ArgumentError);
            });

            it('should create a new instance of the given root object class', () => {
                var app = new skylark.Skylark(RootObject, 'stage', null);
                var root = app.root;
                expect(root).to.be.an.instanceOf(RootObject);
            });

            it('should maintain a count of created Skylark instances', function() {
                expect(skylark.Skylark['_count']).to.eql(0);
                var s1 = new skylark.Skylark(RootObject);
                expect(skylark.Skylark['_count']).to.eql(1);
                var s2 = new skylark.Skylark(RootObject);
                expect(skylark.Skylark['_count']).to.eql(2);

                s1.dispose();
                expect(skylark.Skylark['_count']).to.eql(1);

                s2.dispose();
                expect(skylark.Skylark['_count']).to.eql(0);

            });
        });

//        describe('when started', ()=> {
//            it('should pass the time delta in seconds to the stage', ()=> {
//                var skylark = new skylark.Skylark(RootObject, 'stage');
//                // note: start accesses the 'window' object - will currently fail
//                // in non-browser environments
//                skylark.start();
//            });
//        });
    });

    if(isBrowser) {
        describe('[browser-based]', ()=> {

            Helpers.manageStarling(this);

            describe('when intitializing', () => {


                it('should create a viewPort that matches the size of the canvas', (done) => {
                    jQuery().ready(()=> {
                        Helpers.createCanvas('stage', 600, 400);
                        var app = new skylark.Skylark(RootObject, 'stage');

                        var viewPort:skylark.Rectangle = app.viewPort;
                        expect(viewPort.width).to.equal(600);
                        expect(viewPort.height).to.equal(400);
                        done();
                    });
                });

                it('should auto-create a canvas element', (done) => {
                    jQuery().ready(()=> {
                        var app = new skylark.Skylark(RootObject, 'stage');
                        var canvasEl:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('stage');
                        expect(canvasEl).to.exist;
                        expect(app.canvas).to.equal(canvasEl);
                        expect(app.context).to.exist;
                        done();
                    });
                });
                it('should use configured width/height for auto-created canvas', (done) => {
                    jQuery().ready(()=> {
                        skylark.Skylark.stageDefaults.width = 123;
                        skylark.Skylark.stageDefaults.height = 456;

                        var app = new skylark.Skylark(RootObject, 'stage');

                        var canvasEl = app.canvas;
                        expect(canvasEl.width).to.eql(123);
                        expect(canvasEl.height).to.eql(456);
                        done();
                    });
                });

                it('should use configured color for auto-created canvas', (done) => {
                    jQuery().ready(()=> {
                        skylark.Skylark.stageDefaults.backgroundColor = 0xff0000;

                        var app = new skylark.Skylark(RootObject, 'stage');

                        var canvasEl = app.canvas;
                        expect(canvasEl.style.backgroundColor).to.eql('rgb(255, 0, 0)');
                        done();
                    });
                });

                it('should set stage color to the canvas bg color', ()=> {
                    Helpers.createCanvas('stage', 400, 400, '#efefef');
                    var app = new skylark.Skylark(RootObject);
                    expect(app.stage.color).to.eql(0xefefef);
                });
                it('should set the stage color to transparent black if canvas has no bg color', function(done) {
                    var canvas = Helpers.createCanvas('stage', 64, 64);
                    var app = new skylark.Skylark(RootObject);
                    expect(app.stage.color).to.eql(0);
                    expect(app.stage.alpha).to.eql(0);


                    // render the stage and compare with a white image
                    Helpers.captureFrame(app)
                        .then((image)=>{
                            Helpers.assertImage(image, this, 'test/resources/64x64white.png', done);
                        })
                        .always(function() {
                            Helpers.eraseDomSandbox();
                        });
                });


            });

            describe('CanvasHelper', function() {
                it('should not add the canvas to the DOM', function() {
                    // sanity check
                    if(jQuery('canvas').length !== 0)
                        throw new Error('Test Setup Failure');

                    skylark.Skylark.buffered = false;
                    var s = new skylark.Skylark(new skylark.Quad(10, 10));
                    expect(jQuery('canvas').length).to.eql(1);

                    var canvas = skylark.Skylark.getHelperCanvas(10, 10);
                    expect(jQuery('canvas').length).to.eql(1);
                    s.dispose();

                    expect(jQuery('canvas').length).to.eql(0);
                });
            });

        });

    }
});
