/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

class MyDisplayObject extends skylark.DisplayObjectContainer {

    private _counter:number = 0;

    constructor() {
        super();
        this.addChild(new skylark.Quad(40, 60));
    }

    public render(support:skylark.RenderSupport):void {
        super.render(support);
        this._counter++;
    }
}

if(isBrowser) {
    describe('[browser-based] Canvas Drawing', () => {
        Helpers.manageStarling(this);

        it('requestAnimationFrame sanity test', function(done) {
            jQuery().ready(()=> {
                // if browser is in background, requestAnimationFrame is not called -> skip this test
                // page visibility API - http://www.w3.org/TR/2011/WD-page-visibility-20110602/
                if(document.visibilityState === 'visible') {
                    var app = skylark.Skylark.create(MyDisplayObject, 'stage');
                    var spy = sinon.spy(app, 'onEnterFrame');
                    app.start();
                    this.timeout(1000);
                    setTimeout(() => {
                        spy.restore();
                        expect(spy.called).to.be.true;
                        expect(spy.callCount).to.be.at.least(3);
                        done();
                    }, 250);
                } else {
                    done();
                }
            });
        });

        it('should set stage color to the canvas bg color', ()=> {
            Helpers.createCanvas('stage', 400, 400, '#efefef');
            var app = new skylark.Skylark(new skylark.DisplayObject());
            expect(app.stage.color).to.eql(0xefefef);
        });

    });
}
