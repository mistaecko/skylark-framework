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

describe('TweenTests', () => {
    var E:number = 0.0001;

    function executeTween(time:number, advanceTime:number):void {
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var tween:skylark.Tween = new skylark.Tween(quad, time);
        tween.animate("x", 100);
        var startCount:number = 0;
        var updateCount:number = 0;
        var completeCount:number = 0;

        tween.onStart = () => {
            startCount++;
        };
        tween.onUpdate = () => {
            updateCount++
        };
        tween.onComplete = () => {
            completeCount++
        };

        tween.advanceTime(advanceTime);

        assert.equal(1, updateCount);
        assert.equal(1, startCount);
        assert.equal(advanceTime >= time ? 1 : 0, completeCount);
    }

    //[Test]
    it('BasicTween', () => {
        var startX:number = 10.0;
        var startY:number = 20.0;
        var endX:number = 100.0;
        var endY:number = 200.0;
        var startAlpha:number = 1.0;
        var endAlpha:number = 0.0;
        var totalTime:number = 2.0;

        var startCount:number = 0;
        var updateCount:number = 0;
        var completeCount:number = 0;

        var quad:skylark.Quad = new skylark.Quad(100, 100);
        quad.x = startX;
        quad.y = startY;
        quad.alpha = startAlpha;

        var tween:skylark.Tween = new skylark.Tween(quad, totalTime, skylark.Transitions.LINEAR);
        tween.moveTo(endX, endY);
        tween.animate("alpha", endAlpha);
        tween.onStart = () => {
            startCount++;
        };
        tween.onUpdate = () => {
            updateCount++;
        };
        tween.onComplete = () => {
            completeCount++;
        };

        tween.advanceTime(totalTime / 3.0);
        assert.closeTo(quad.x, startX + (endX - startX) / 3.0, E);
        assert.closeTo(quad.y, startY + (endY - startY) / 3.0, E);
        assert.closeTo(quad.alpha, startAlpha + (endAlpha - startAlpha) / 3.0, E);
        assert.equal(1, startCount);
        assert.equal(1, updateCount);
        assert.equal(0, completeCount);
        assert.isFalse(tween.isComplete);

        tween.advanceTime(totalTime / 3.0);
        assert.closeTo(quad.x, startX + 2 * (endX - startX) / 3.0, E);
        assert.closeTo(quad.y, startY + 2 * (endY - startY) / 3.0, E);
        assert.closeTo(quad.alpha, startAlpha + 2 * (endAlpha - startAlpha) / 3.0, E);
        assert.equal(1, startCount);
        assert.equal(2, updateCount);
        assert.equal(0, completeCount);
        assert.isFalse(tween.isComplete);

        tween.advanceTime(totalTime / 3.0);
        assert.closeTo(quad.x, endX, E);
        assert.closeTo(quad.y, endY, E);
        assert.closeTo(quad.alpha, endAlpha, E);
        assert.equal(1, startCount);
        assert.equal(3, updateCount);
        assert.equal(1, completeCount);
        assert.isTrue(tween.isComplete);
    });

    //[Test]
    it('SequentialTweens', () => {
        var startPos:number = 0.0;
        var targetPos:number = 50.0;
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        // 2 tweens should move object up, then down
        var tween1:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween1.animate("y", targetPos);

        var tween2:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween2.animate("y", startPos);
        tween2.delay = tween1.totalTime;

        tween1.advanceTime(1.0);
        assert.closeTo(quad.y, targetPos, E);

        tween2.advanceTime(1.0);
        assert.closeTo(quad.y, targetPos, E);

        tween2.advanceTime(0.5);
        assert.closeTo(quad.y, (targetPos - startPos) / 2.0, E);

        tween2.advanceTime(0.5);
        assert.closeTo(quad.y, startPos, E);
    });

    //[Test]
    it('TweenFromZero', () => {
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        quad.scaleX = 0.0;

        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween.animate("scaleX", 1.0);

        tween.advanceTime(0.0);
        assert.closeTo(quad.width, 0.0, E);

        tween.advanceTime(0.5);
        assert.closeTo(quad.width, 50.0, E);

        tween.advanceTime(0.5);
        assert.closeTo(quad.width, 100.0, E);
    });

    //[Test]
    it('ResetTween', () => {
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween.animate("x", 100);

        tween.advanceTime(0.5);
        assert.closeTo(quad.x, 50, E);

        tween.reset(this, 1.0);
        tween.advanceTime(0.5);

        // tween should no longer change quad.x
        assert.closeTo(quad.x, 50, E);
    });

    //[Test]
    it('ResetTweenInOnComplete', () => {
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var juggler:skylark.Juggler = new skylark.Juggler();

        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween.animate("x", 100);
        tween.onComplete = () => {
            tween.reset(quad, 1.0);
            tween.animate("x", 0);
            juggler.add(tween);
        };

        juggler.add(tween);

        juggler.advanceTime(1.0);
        assert.closeTo(quad.x, 100, E);
        assert.closeTo(tween.currentTime, 0, E);

        juggler.advanceTime(1.0);
        assert.closeTo(quad.x, 0, E);
        assert.isTrue(tween.isComplete);
    });

    //[Test]
    it('ShortTween', () => {
        executeTween(0.1, 0.1);
    });

    //[Test]
    it('ZeroTween', () => {
        executeTween(0.0, 0.1);
    });

    //[Test]
    it('CustomTween', () => {
        function transition(ratio : number ): number { return ratio; }

        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var tween:skylark.Tween = new skylark.Tween(quad, 1.0, transition);
        tween.animate("x", 100);

        tween.advanceTime(0.1);
        assert.closeTo(quad.x, 10, E);

        tween.advanceTime(0.5);
        assert.closeTo(quad.x, 60, E);

        tween.advanceTime(0.4);
        assert.closeTo(quad.x, 100, E);

        assert.equal("custom", tween.transition);
    });

    //[Test]
    it('RepeatedTween', () => {
        var startCount:number = 0;
        var repeatCount:number = 0;
        var completeCount:number = 0;

        function onStart() : void { startCount++; }
        function onRepeat() : void { repeatCount++; }
        function onComplete() : void { completeCount++; } ;

        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween.repeatCount = 3;
        tween.onStart = onStart;
        tween.onRepeat = onRepeat;
        tween.onComplete = onComplete;
        tween.animate("x", 100);

        tween.advanceTime(1.5);
        assert.closeTo(quad.x, 50, E);
        assert.equal(tween.repeatCount, 2);
        assert.equal(startCount, 1);
        assert.equal(repeatCount, 1);
        assert.equal(completeCount, 0);

        tween.advanceTime(0.75);
        assert.closeTo(quad.x, 25, E);
        assert.equal(tween.repeatCount, 1);
        assert.equal(startCount, 1);
        assert.equal(repeatCount, 2);
        assert.equal(completeCount, 0);
        assert.isFalse(tween.isComplete);

        tween.advanceTime(1.0);
        assert.closeTo(quad.x, 100, E);
        assert.equal(tween.repeatCount, 1);
        assert.equal(startCount, 1);
        assert.equal(repeatCount, 2);
        assert.equal(completeCount, 1);
        assert.isTrue(tween.isComplete);

    });


//[Test]
it('ReverseTween', () => {
    var startCount:number = 0;
    var completeCount:number = 0;

    var quad:skylark.Quad = new skylark.Quad(100, 100);
    var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
    tween.repeatCount = 4;
    tween.reverse = true;
    tween.animate("x", 100);

    tween.advanceTime(0.75);
    assert.closeTo(quad.x, 75, E);

    tween.advanceTime(0.5);
    assert.closeTo(quad.x, 75, E);

    tween.advanceTime(0.5);
    assert.closeTo(quad.x, 25, E);
    assert.isFalse(tween.isComplete);

    tween.advanceTime(1.25);
    assert.closeTo(quad.x, 100, E);
    assert.isFalse(tween.isComplete);

    tween.advanceTime(10);
    assert.closeTo(quad.x, 0, E);
    assert.isTrue(tween.isComplete);
});


//[Test]
it('InfiniteTween', () => {
    var quad:skylark.Quad = new skylark.Quad(100, 100);
    var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
    tween.animate("x", 100);
    tween.repeatCount = 0;

    tween.advanceTime(30.5);
    assert.closeTo(quad.x, 50, E);

    tween.advanceTime(100.5);
    assert.closeTo(quad.x, 100, E);
    assert.isFalse(tween.isComplete);
});


})
;
