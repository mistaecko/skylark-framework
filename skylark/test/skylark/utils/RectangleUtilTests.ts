// =================================================================================================
//
//	Skylark Framework
//	Copyright 2012 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('RectangleUtilTests', function() {

    it('Intersection', function() {
        var expectedRect:skylark.Rectangle;
        var rect:skylark.Rectangle = new skylark.Rectangle(-5, -10, 10, 20);

        var overlapRect:skylark.Rectangle = new skylark.Rectangle(-10, -15, 10, 10);
        var identRect:skylark.Rectangle = new skylark.Rectangle(-5, -10, 10, 20);
        var outsideRect:skylark.Rectangle = new skylark.Rectangle(10, 10, 10, 10);
        var touchingRect:skylark.Rectangle = new skylark.Rectangle(5, 0, 10, 10);
        var insideRect:skylark.Rectangle = new skylark.Rectangle(0, 0, 1, 2);

        expectedRect = new skylark.Rectangle(-5, -10, 5, 5);
        Helpers.compareRectangles(expectedRect,
            skylark.RectangleUtil.intersect(rect, overlapRect));

        expectedRect = rect;
        Helpers.compareRectangles(expectedRect,
            skylark.RectangleUtil.intersect(rect, identRect));

        expectedRect = new skylark.Rectangle();
        Helpers.compareRectangles(expectedRect,
            skylark.RectangleUtil.intersect(rect, outsideRect));

        expectedRect = new skylark.Rectangle(5, 0, 0, 10);
        Helpers.compareRectangles(expectedRect,
            skylark.RectangleUtil.intersect(rect, touchingRect));

        expectedRect = insideRect;
        Helpers.compareRectangles(expectedRect,
            skylark.RectangleUtil.intersect(rect, insideRect));
    });

    it('Fit', function() {
        var into:skylark.Rectangle = new skylark.Rectangle(50, 50, 200, 100);

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 200, 100), into),
            new skylark.Rectangle(50, 50, 200, 100));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 50, 50), into, skylark.ScaleMode.NONE),
            new skylark.Rectangle(125, 75, 50, 50));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 400, 200), into, skylark.ScaleMode.NONE),
            new skylark.Rectangle(-50, 0, 400, 200));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 50, 50), into, skylark.ScaleMode.SHOW_ALL),
            new skylark.Rectangle(100, 50, 100, 100));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 400, 200), into, skylark.ScaleMode.SHOW_ALL),
            new skylark.Rectangle(50, 50, 200, 100));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 800, 400), into, skylark.ScaleMode.SHOW_ALL),
            new skylark.Rectangle(50, 50, 200, 100));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 400, 200), into, skylark.ScaleMode.NO_BORDER),
            new skylark.Rectangle(50, 50, 200, 100));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 200, 200), into, skylark.ScaleMode.NO_BORDER),
            new skylark.Rectangle(50, 0, 200, 200));

        Helpers.compareRectangles(
            skylark.RectangleUtil.fit(new skylark.Rectangle(0, 0, 800, 800), into, skylark.ScaleMode.NO_BORDER),
            new skylark.Rectangle(50, 0, 200, 200));
    });
});
