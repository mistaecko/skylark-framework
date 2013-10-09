/// <reference path="../../../lib/jquery/jquery.simulate.d.ts"/>
/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

if(isBrowser) {
    var TouchEvent = skylark.TouchEvent;
    var KeyboardEvent = skylark.KeyboardEvent;

    describe('[browser-based] Skylark UIEvent Tests', () => {
        beforeEach(()=> {
            jQuery('canvas').remove();
        });

        afterEach(()=> {
            if(skylark.Skylark.current)
                skylark.Skylark.current.dispose();
        });

        it('keydown', (done) => {
            jQuery().ready(() => {
                var app = new skylark.Skylark(skylark.DisplayObjectContainer, 'stage');
                app.stage.addEventListener(KeyboardEvent.KEY_DOWN, (event:skylark.KeyboardEvent)=> {
                    expect(event.ctrlKey).to.eql(true);
                    done();
                });
                app.start();

                // simulate
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                (<SimulateJQuery>$('canvas')).simulate('keydown', { keyCode: 10, ctrlKey: true });
            });
        });

        // note: on Chrome, we experienced an issue with the 'mousedown' not fireing when the chrome window
        // executing the test is not the active tab and chrome is non-minimized.
        it('mousedown', function(done) {
            jQuery().ready(() => {
                var canvas = Helpers.createCanvas('stage', 100, 100);
                canvas.style.cssText = 'position: absolute; left: 0; top: 0';

                var app = new skylark.Skylark(skylark.DisplayObjectContainer, 'stage');
                app.stage.addEventListener(TouchEvent.TOUCH, (event:skylark.KeyboardEvent)=> {
                        done();
                });
                app.start();

                // simulate
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                var el = (<SimulateJQuery>$('canvas'));
                el.simulate('mousedown', { clientX: 50, clientY: 50 });
            });
        });

        it('mousedown boundaries', (done) => {
            jQuery().ready(() => {
                var canvas = Helpers.createCanvas('stage', 100, 100);
                canvas.style.cssText = 'position: absolute; left: 0; top: 0';


                var app = new skylark.Skylark(skylark.DisplayObjectContainer, 'stage');
                app.start();

                // simulate

                // outside boundaries!
                var spy = sinon.spy();
                app.stage.addEventListener(TouchEvent.TOUCH, spy);
                app.stage.removeEventListener(TouchEvent.TOUCH, spy);
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                (<SimulateJQuery>$(document)).simulate('mousedown', { clientX: 150, clientY: 150 });
                expect(spy).to.not.have.been.called;

                var count = 4;
                app.stage.addEventListener(TouchEvent.TOUCH, (event:skylark.TouchEvent)=> {
                    count--;
                    if(count === 0)
                        done();
                });

                var el = (<SimulateJQuery>$('canvas'));
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                el.simulate('mousedown', { clientX: 0, clientY: 0 });
                el.simulate('mousedown', { clientX: 100, clientY: 100 });
                el.simulate('mousedown', { clientX: 0, clientY: 100 });
                el.simulate('mousedown', { clientX: 100, clientY: 0 });
            });
        });

        it('mousedown with hit test', function(done) {
            this.timeout(500);
            jQuery().ready(() => {
                var canvas = Helpers.createCanvas('stage', 100, 100);
                canvas.style.cssText = 'position: absolute; left: 0; top: 0';

                var child:skylark.Quad = new skylark.Quad(2, 2);
                child.x = 50;
                child.y = 50;

//                var MyDisplayObject = function() {
//                    skylark.DisplayObjectContainer.call(this, 100, 100);
//                    this.addChild(child);
//                };
//                MyDisplayObject.prototype = Object.create(skylark.DisplayObjectContainer.prototype);

                var app = new skylark.Skylark(child, 'stage');
                child.addEventListener(TouchEvent.TOUCH, (event:skylark.Event)=> {
                    done();
                });
                app.start();

                // simulate
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                (<SimulateJQuery>$('canvas')).simulate('mousedown', {
                    clientX: 50,
                    clientY: 50
                });
            });
        });

        it('mouse event coordinates should be relative to canvas element', (done)=> {
            jQuery().ready(()=> {

                var canvas = Helpers.createCanvas('stage', 100, 100);
                canvas.style.cssText = 'position: absolute; left: 300px; top: 300px';

                var app = new skylark.Skylark(skylark.DisplayObjectContainer, 'stage');
                app.stage.addEventListener(TouchEvent.TOUCH, (event:skylark.TouchEvent)=> {
                    expect(event.touches[0].globalX).to.eql(50);
                    expect(event.touches[0].globalY).to.eql(50);
                    done();
                });
                app.start();

                // simulate - scroll to document top first, then trigger event with clientX, clientY
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                (<SimulateJQuery>$('canvas')).simulate('mousedown', {
                    clientX: 350,
                    clientY: 350
                });

            });
        });
        it('mouse event coordinates should be relative to canvas content box', (done)=> {
            jQuery().ready(()=> {

                var canvas = Helpers.createCanvas('stage', 100, 100);
                canvas.style.cssText = 'position: absolute; left: 300px; top: 300px; padding: 10px;';

                var app = new skylark.Skylark(skylark.DisplayObjectContainer, 'stage');
                app.stage.addEventListener(TouchEvent.TOUCH, (event:skylark.TouchEvent)=> {
                    // [clientX] - [offset] - [padding] = 350 - 300 - 10 = 40
                    expect(event.touches[0].globalX).to.eql(40);
                    expect(event.touches[0].globalY).to.eql(40);
                    done();
                });
                app.start();

                // simulate - scroll to document top first, then trigger event with clientX, clientY
                (</*IntelliJ*/Window>window).scrollTo(0,0);
                (<SimulateJQuery>$('canvas')).simulate('mousedown', {
                    clientX: 350,
                    clientY: 350
                });

            });
        });
    });
}
