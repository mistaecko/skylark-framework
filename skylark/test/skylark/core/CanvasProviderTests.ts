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

describe('HTMLCanvasProvider', function() {

    describe('getBackgroundColor', function() {
        var canvas:HTMLCanvasElement;
        var provider:skylark.HTMLCanvasProvider;

        function createCanvas(style) {
            var $canvas = jQuery('<canvas style="' + style + '"></canvas>');
            $canvas.appendTo(document.body);
            canvas = <HTMLCanvasElement>$canvas[0]; // retrieve DOM node
            return canvas;
        }

        beforeEach(function() {
            provider = new skylark.HTMLCanvasProvider(<HTMLDocument>document);
        });

        it('should return the CSS background color', function() {
            createCanvas('background-color: red');
            expect(provider.getBackgroundColor(canvas)).to.eql(16711680);
        });

        it('should return "undefined" if background color is not set', function() {
            createCanvas('');
            expect(provider.getBackgroundColor(canvas)).to.be.undefined;
        });
    })
});
