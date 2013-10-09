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

describe('JugglerTests', () => {
    var E:number = 0.0001;

    //[Test]
    it('ModificationWithinCallback', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);
        var startReached:boolean = false;
        juggler.add(tween);

        tween.onComplete = () => {
            var otherTween:skylark.Tween = new skylark.Tween(quad, 1.0);
            otherTween.onStart = () => {
                startReached = true;
            };
            juggler.add(otherTween);
        };

        juggler.advanceTime(0.4); // -> 0.4 (start)
        juggler.advanceTime(0.4); // -> 0.8 (update)
        juggler.advanceTime(0.4); // -> 1.2 (complete)
        juggler.advanceTime(0.4); // -> 1.6 (start of new tween)

        assert.isTrue(startReached);
    });

    //[Test]
    it('Contains', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);

        assert.isFalse(juggler.contains(tween));
        juggler.add(tween);
        assert.isTrue(juggler.contains(tween));
    });

    //[Test]
    it('Purge', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        var tween1:skylark.Tween = new skylark.Tween(quad, 1.0);
        var tween2:skylark.Tween = new skylark.Tween(quad, 2.0);

        juggler.add(tween1);
        juggler.add(tween2);

        tween1.animate("x", 100);
        tween2.animate("y", 100);

        assert.isTrue(tween1.hasEventListener(skylark.Event.REMOVE_FROM_JUGGLER));
        assert.isTrue(tween2.hasEventListener(skylark.Event.REMOVE_FROM_JUGGLER));

        juggler.purge();

        assert.isFalse(tween1.hasEventListener(skylark.Event.REMOVE_FROM_JUGGLER));
        assert.isFalse(tween2.hasEventListener(skylark.Event.REMOVE_FROM_JUGGLER));

        juggler.advanceTime(10);

        assert.equal(0, quad.x);
        assert.equal(0, quad.y);
    });

    //[Test]
    it('PurgeFromAdvanceTime', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        var tween1:skylark.Tween = new skylark.Tween(quad, 1.0);
        var tween2:skylark.Tween = new skylark.Tween(quad, 1.0);
        var tween3:skylark.Tween = new skylark.Tween(quad, 1.0);

        juggler.add(tween1);
        juggler.add(tween2);
        juggler.add(tween3);


        tween2.onUpdate = function() {
            juggler.purge.apply(juggler, arguments);
        };

        // if this doesn't crash, we're fine =)
        juggler.advanceTime(0.5);
    });

    it('should handle two juggled items', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var counter:number = 0;

        var item1 = Object.create({
            advanceTime: function(time:number) {
                counter += 1;
            }
        });
        var item2 = Object.create({
            advanceTime: function(time:number) {
                counter += 100;
            }
        });

        juggler.add(item1);
        juggler.add(item2);

        juggler.advanceTime(1);

        expect(counter).to.eql(101);
    });

    it('should handle two tweened items using the same target', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var counter:number = 0;

        var item1 = {
            foo: 0,
            bar: 0
        };
        juggler.tween(item1, 1.0, {
            foo: 10
        });
        juggler.tween(item1, 1.0, {
            bar: 10
        });
        juggler.advanceTime(1);

        expect(item1.foo).to.eql(10);
        expect(item1.bar).to.eql(10);
    });

    //[Test]
    it('RemoveTweensWithTarget', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();

        var quad1:skylark.Quad = new skylark.Quad(100, 100);
        var quad2:skylark.Quad = new skylark.Quad(100, 100);

        var tween1:skylark.Tween = new skylark.Tween(quad1, 1.0);
        var tween2:skylark.Tween = new skylark.Tween(quad2, 1.0);

        tween1.animate("rotation", 1.0);
        tween2.animate("rotation", 1.0);

        juggler.add(tween1);
        juggler.add(tween2);

        juggler.removeTweens(quad1);
        juggler.advanceTime(1.0);

        assert.closeTo(quad1.rotation, 0.0, E);
        assert.closeTo(quad2.rotation, 1.0, E);
    });

    //[Test]
    it('AddTwice', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        var tween:skylark.Tween = new skylark.Tween(quad, 1.0);

        juggler.add(tween);
        juggler.add(tween);

        assert.closeTo(tween.currentTime, 0.0, E);
        juggler.advanceTime(0.5);
        assert.closeTo(tween.currentTime, 0.5, E);
    });

    //[Test]
    it('ModifyJugglerInCallback', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        var tween1:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween1.animate("x", 100);

        var tween2:skylark.Tween = new skylark.Tween(quad, 0.5);
        tween2.animate("y", 100);

        var tween3:skylark.Tween = new skylark.Tween(quad, 0.5);
        tween3.animate("scaleX", 0.5);

        tween2.onComplete = () => {
            juggler.remove(tween1);
            juggler.add(tween3);
        };

        juggler.add(tween1);
        juggler.add(tween2);

        juggler.advanceTime(0.5);
        juggler.advanceTime(0.5);

        assert.closeTo(quad.x, 50.0, E);
        assert.closeTo(quad.y, 100.0, E);
        assert.closeTo(quad.scaleX, 0.5, E);
    });

    //[Test]
    it('ModifyJugglerTwiceInCallback', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        var tween1:skylark.Tween = new skylark.Tween(quad, 1.0);
        var tween2:skylark.Tween = new skylark.Tween(quad, 1.0);
        tween2.fadeTo(0);

        juggler.add(tween1);
        juggler.add(tween2);

        juggler.remove(tween1); // sets slot in array to null
        tween2.onUpdate = function() {
            juggler.remove.apply(juggler, arguments);
        };
        tween2.onUpdateArgs = [tween2];

        juggler.advanceTime(0.5);
        juggler.advanceTime(0.5);

        assert.closeTo(quad.alpha, 0.5, E);
    });

    //[Test]
    it('TweenConvenienceMethod', () => {
        var juggler:skylark.Juggler = new skylark.Juggler();
        var quad:skylark.Quad = new skylark.Quad(100, 100);

        var completeCount:number = 0;
        var startCount:number = 0;

        juggler.tween(quad, 1.0, {
            x: 100,
            onStart: onStart,
            onComplete: onComplete
        });

        juggler.advanceTime(0.5);
        assert.equal(1, startCount);
        assert.equal(0, completeCount);
        assert.closeTo(quad.x, 50, E);

        juggler.advanceTime(0.5);
        assert.equal(1, startCount);
        assert.equal(1, completeCount);
        assert.closeTo(quad.x, 100, E);

        function onComplete():void {
            completeCount++;
        }
        function onStart():void {
            startCount++;
        }

    });
});
