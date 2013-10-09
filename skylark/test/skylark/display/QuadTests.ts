/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('Quad', ()=> {
    var deg2rad = skylark.MathUtil.deg2rad;

    var E:number = 0.0001;

    describe('alpha', () => {
        it('should create a Quad with alpha 1.0', function() {
            var quad:skylark.Quad = new skylark.Quad(100, 100);
            expect(quad.alpha).to.eql(1.0);
        });
        it('should get and set an alpha value', () => {
            var quad:skylark.Quad = new skylark.Quad(100, 100);
            quad.alpha = 0.5;
            expect((<any>quad)._alpha).to.eql(0.5);
            expect(quad.alpha).to.eql(0.5);
        });

        it('should render a quad with alpha transparent', function() {
            var quad:skylark.Quad = new skylark.Quad(100, 100);
            quad.alpha = 0.5;
            quad.color = 0xff0000;

            skylark.Skylark.stageDefaults = {
                width: 100,
                height: 100,
                backgroundColor: 0xffffff
            };

            skylark.Skylark.create(quad);

            //todo - evaluate
        });
    });

    describe('bounds', () => {

        describe('relative to itself', () => {
            it('should be correct for non-transformed object', () => {
                var quad = new skylark.Quad(10, 11);
                var bounds = quad.getBounds(quad, null);
                expect(bounds).to.eql(new skylark.Rectangle(0, 0, 10, 11));
            });

            it('should ignore a translation', () => {
                var quad = new skylark.Quad(10, 11);
                quad.x = 20;
                quad.y = 21;
                var bounds = quad.getBounds(quad, null);
                expect(bounds).to.eql(new skylark.Rectangle(0, 0, 10, 11));
            });

            it('should ignore a rotation', () => {
                var quad = new skylark.Quad(10, 11);
                quad.rotation = Math.PI / 2;

                var bounds = quad.getBounds(quad, null);
                expect(bounds).to.eql(new skylark.Rectangle(0, 0, 10, 11));
            });
        });

        describe('relative to the parent', () => {
            it('should be correct for non-transformed objects', () => {
                var quad = new skylark.Quad(10, 11);
                var relativeTo = new skylark.DisplayObjectContainer();
                relativeTo.addChild(quad);

                var bounds = quad.getBounds(relativeTo, null);

                expect(bounds).to.eql(new skylark.Rectangle(0, 0, 10, 11));
            });

            it('should be correct for translated objects', () => {
                var quad = new skylark.Quad(10, 11);
                quad.x = 20;
                quad.y = 21;

                var relativeTo = new skylark.DisplayObjectContainer();
                relativeTo.addChild(quad);

                var bounds = quad.getBounds(relativeTo, null);

                expect(bounds).to.eql(new skylark.Rectangle(20, 21, 10, 11));
            });

            it('should be correct for rotated objects', () => {
                var quad = new skylark.Quad(10, 11);
                quad.rotation = Math.PI / 2;

                var relativeTo = new skylark.DisplayObjectContainer();
                relativeTo.addChild(quad);

                var bounds = quad.getBounds(relativeTo, null);
                expect(bounds).to.eql(new skylark.Rectangle(-11, 0, 11, 10));
            });
        });


    });
});
