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

class StubAssetManager extends skylark.AssetManager {

    public queue:any[] = [];

    constructor() {
        super(1.0);
    }

//    public enqueue(...rawAssets):void {
//        for(var i = 0; i < rawAssets.length; i++) {
//            this.queue.push(rawAssets[i]);
//        }
//    }
//
//    public loadQueue(listener) {
//        var queue = this.queue;
//        for(var i = 0; i < queue.length; i++) {
//            var item = queue[i];
//            this.addTexture(this.getName(item), new skylark.ConcreteTexture(10,10));
//        }
//        listener(1, true);
//    }

}

describe('AssetManager (Base)', function() {

    var am:skylark.AssetManager;

    var assets = [
        'test/resources/pig.png',
        'test/resources/grass_3.png',
        'test/resources/grass_1.png',
        'test/resources/grass_0.png',
        'test/resources/grass_2.png',
        'test/resources/sausage.png'
    ];

    function fill(assets:string[]) {
        for(var i = 0; i < assets.length; i++) {
            var asset = assets[i];
            if(/.*\.png$/.test(asset))
                am.addTexture(am.getName(asset), new skylark.ConcreteTexture(i,i));
            else
                throw Error('Unsupported: ' + asset);
//            else if(/.*\.xml$/.test(asset))
//                am.addTextureAtlas(am.getName(asset), new skylark.TextureAtlas(new skylark.ConcreteTexture(i, i), ''))
        }
    }

    beforeEach(function() {
        am = new StubAssetManager();
    });

    it('should fail when adding a texture twice', function() {
        var texture = new skylark.ConcreteTexture(10, 10);
        am.addTexture('name', texture);

        expect(()=> am.addTexture('name', texture)).to.throw();
    });

    describe('getTextures', function() {
        it('should return textures with a given prefix', function() {
            fill(assets);
            var textures = am.getTextures('grass_');
            expect(textures.length).to.eql(4);
        });

        it('should return all textures when no prefix is given', function() {
           fill(assets);
            expect(am.getTextures().length).to.eql(assets.length);
        });

        it('should return textures based on a given array of names', function() {
            fill(assets);
            var result = am.getTextures(['grass_2', 'grass_1']);
            expect(result.length).to.eql(2);
            expect(result[0].width).to.eql(4); // note: 'width' values are unique, see 'fill' function
            expect(result[1].width).to.eql(2);
        });
    });

    describe('getTexture', function() {
        var xml:string =
            "<TextureAtlas imagePath='texture-atlas-02-base'>\
                <SubTexture name='ann' x='0' y='0' width='55.5' height='16' />\
                <SubTexture name='bob' x='16' y='32' width='16' height='32' />\
            </TextureAtlas>";

        it('should find a texture in a TextureAtlas', function() {
            var baseTexture = new skylark.ConcreteTexture(11, 12);
            var texture = new skylark.TextureAtlas(baseTexture, xml);
            am.addTextureAtlas('texture-atlas-02-base', texture);

            var result = am.getTexture('ann');
            expect(result).to.exist;
            expect(result.width).to.be.closeTo(55.5, Helpers.E);
        });
    });

    describe('getName', function() {
        it('should extract the name without extension from an URL', function() {
            var str = 'http://monkeybusiness.org/path/to/image.png';
            expect(am.getName(str)).to.eql('image');
        });
        it('should extract the name from an URL when there is no file extension', function() {
            var str = 'http://monkeybusiness.org/path/to/image';
            expect(am.getName(str)).to.eql('image');
        });
        it.skip('should support the filename as (last) URL parameter', function() {
            var str = 'http://monkeybusiness.org/path/to/insanity?filename=image.png';
            expect(am.getName(str)).to.eql('image');
        });
        it.skip('should support the filename as URL hash', function() {
            var str = 'http://monkeybusiness.org/path/to/insanity?param=ignore.png#ignore.png';
            expect(am.getName(str)).to.eql('image');
        });
        it('should correctly interpret a URL encoded string', function() {
            var str = 'http://monkeybusiness.org/A question that sometimes drives me hazy/' + encodeURIComponent('~am I or are the others crazy?.png');
            expect(am.getName(str)).to.eql('~am I or are the others crazy?');
        });
    });
});
