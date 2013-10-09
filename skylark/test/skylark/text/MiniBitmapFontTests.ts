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

describe('MiniBitmapFont', function() {
    var reference = 'test/resources/mini.png';

    afterEach(()=> {
        Helpers.eraseDomSandbox();
    });

    it('should define the texture base as png', function(done) {
        var image = new Image();
        image.src = skylark.MiniBitmapFont['IMAGE_DATA'];
        Helpers.assertImage(image, this, reference, done);
    });

    it('should load the proper texture', function(done) {
        var texture:skylark.Texture = skylark.MiniBitmapFont.texture;
        Helpers.assertImage(texture, this, reference, done);
    });

});
