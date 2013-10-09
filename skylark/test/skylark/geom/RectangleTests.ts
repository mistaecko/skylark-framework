/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('Rectangle', ()=> {
    describe('sanity', ()=> {
        it('should have correct x, y', ()=> {
            var rect = new skylark.Rectangle(5, 6, 10, 10);

            expect(rect.x).to.equal(5);
            expect(rect.y).to.equal(6);
            expect(rect.width).to.equal(10);
            expect(rect.height).to.equal(10);
        });

        it('should have correct "right" value', function() {
            var rect = new skylark.Rectangle(5, 6, 10, 11);
            expect(rect.right).to.equal(15);
        });
        it('should have correct "bottom" value', function() {
            var rect = new skylark.Rectangle(5, 6, 10, 11);
            expect(rect.bottom).to.equal(17);
        });
    });

    describe('that is being resized', () => {
        it('by setting "x" should not change its width', () => {
            var rect = new skylark.Rectangle(5, 6, 10, 11);
            rect.x = 1;
            expect(rect.width).to.equal(10);
            expect(rect.right).to.equal(11);
        });
        it('by setting "y" should not change its height', () => {
            var rect = new skylark.Rectangle(5, 6, 10, 11);
            rect.y = 3;
            expect(rect.height).to.equal(11);
            expect(rect.bottom).to.equal(14);
        });
        it('by setting "width" should not change "x"', () => {
            var rect = new skylark.Rectangle(5, 6, 10, 11);
            rect.width = 13;
            expect(rect.width).to.equal(13);
            expect(rect.x).to.equal(5);
            expect(rect.right).to.equal(18);
        });
        it('by setting "height" should not change "y"', () => {
            var rect = new skylark.Rectangle(5, 6, 10, 11);
            rect.height = 13;
            expect(rect.height).to.equal(13);
            expect(rect.y).to.equal(6);
            expect(rect.bottom).to.equal(19);
        });
    });


    describe('containsPoint', ()=> {
        it('should return true if a Point is within its boundaries', ()=> {
            var rect = new skylark.Rectangle(5, 5, 10, 10);

            expect(rect.containsPoint(new skylark.Point(10, 10))).to.be.ok;
        });
        it('should return true if a Point is exactly at its boundaries', ()=> {
            var rect = new skylark.Rectangle(5, 5, 10, 10);

            expect(rect.containsPoint(new skylark.Point(5, 5))).to.be.ok;
            expect(rect.containsPoint(new skylark.Point(15, 15))).to.be.ok;
        });
        it('should return false if a Point is outside its boundaries', ()=> {
            var rect = new skylark.Rectangle(5, 5, 10, 10);

            expect(rect.containsPoint(new skylark.Point(4, 16))).to.not.be.ok;
        });
    })
});
