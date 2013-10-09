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

describe('TextureAtlasTests', function() {
    var texture:skylark.ConcreteTexture;
    var atlas:skylark.TextureAtlas;

    beforeEach(function() {
        texture = new skylark.ConcreteTexture(64, 64);
    });

    describe('constructor', function() {
        it('should create regions from XML input', function() {
            var xml:string =
                "<TextureAtlas>\
                    <SubTexture name='ann' x='0' y='0' width='55.5' height='16' />\
                    <SubTexture name='bob' x='16' y='32' width='16' height='32' />\
                </TextureAtlas>";

            atlas = new skylark.TextureAtlas(texture, xml);

            var ann:skylark.SubTexture = <skylark.SubTexture>atlas.getTexture("ann");
            var bob:skylark.SubTexture = <skylark.SubTexture>atlas.getTexture("bob");

            expect(ann instanceof skylark.SubTexture).to.be.true;
            expect(bob instanceof skylark.SubTexture).to.be.true;

            expect(ann.width).to.eql(55.5);
            expect(ann.height).to.eql(16);
            expect(bob.width).to.eql(16);
            expect(bob.height).to.eql(32);

//            expect(ann.clipping.x).to.eql(0);
//            expect(ann.clipping.y).to.eql(0);
//            expect(bob.clipping.x).to.eql(0.25);
//            expect(bob.clipping.y).to.eql(0.5);
        });

        it('should fail on invalid XML', function() {
            var xml = "<TextureAtlas>\
              <SubTexture name ='ann' x='0' y='0' width='55.5' height='16' >\
            </TextureAtlas>";

            expect(function() {

                atlas = new skylark.TextureAtlas(texture, xml);
            }).to.throw();
        });

        it('should allow creation of an empty TextureAtlas (without xml)', function() {
            atlas = new skylark.TextureAtlas(texture);
            expect(atlas.getTextures().length).to.eql(0);
        });
    });

    describe('when manipulating regions manually', function() {
        it('should not fail when trying to remove a non-existing region', function() {
            atlas = new skylark.TextureAtlas(texture);
            atlas.removeRegion('carl');
        });

        it('should add a region', function() {
            atlas = new skylark.TextureAtlas(texture);
            var region = new skylark.Rectangle(0, 0, 55.5, 16);
            atlas.addRegion("ann", region);
            expect(atlas.getRegion('ann')).to.eql(region);
        });

        it('should remove a region', function() {
            var xml = "<TextureAtlas>\
              <SubTexture name='ann' x='0' y='0' width='55.5' height='16' />\
            </TextureAtlas>";

            atlas = new skylark.TextureAtlas(texture, xml);

            // sanity check
            expect(atlas.getRegion('ann')).to.exist;

            atlas.removeRegion('ann');

            expect(atlas.getRegion('ann')).to.not.exist;
        });

        it('should add/remove regions', function() {
            atlas = new skylark.TextureAtlas(texture);

            atlas.addRegion("ann", new skylark.Rectangle(0, 0, 55.5, 16));
            atlas.addRegion("bob", new skylark.Rectangle(16, 32, 16, 32));

            expect(atlas.getRegion("ann")).to.exist;
            expect(atlas.getRegion("bob")).to.exist;
            expect(atlas.getRegion("carl")).to.not.exist;

            atlas.removeRegion("carl"); // remove non-existant region - should not blow!
            atlas.removeRegion("bob");

            expect(atlas.getRegion("bob")).to.not.exist;
        });
    });

    describe('getTexture()', function() {
        it('should return a SubTexture with correctly configured clipping', function() {
            atlas = new skylark.TextureAtlas(texture);

            atlas.addRegion("ann", new skylark.Rectangle(0, 0, 55.5, 16));
            atlas.addRegion("bob", new skylark.Rectangle(16, 32, 16, 32));

            var ann:skylark.SubTexture = <skylark.SubTexture>atlas.getTexture('ann');
            var bob:skylark.SubTexture = <skylark.SubTexture>atlas.getTexture('bob');

            // check type at runtime
            expect(ann instanceof skylark.SubTexture).to.be.true;
            expect(bob instanceof skylark.SubTexture).to.be.true;

            expect(ann.root).to.eql(texture);
            expect(ann.base).to.eql(texture.base);

            expect(ann.clipping.x).to.eql(0);
            expect(ann.clipping.y).to.eql(0);
            //expect(ann.clipping.width).to.eql(55.5 / 64);
            expect(ann.clipping.height).to.eql(0.25);

            expect(bob.clipping.x).to.eql(0.25);
            expect(bob.clipping.y).to.eql(0.5);
            expect(bob.clipping.width).to.eql(0.25);
            expect(bob.clipping.height).to.eql(0.5);
        });

        it('should return no value when requesting a non-existing name', function() {
            atlas = new skylark.TextureAtlas(texture);

            var ann:skylark.SubTexture = <skylark.SubTexture>atlas.getTexture('ann');
            expect(ann).to.not.exist;
        });
    });

    describe('getTextures()', function() {
        beforeEach(function() {
            atlas = new skylark.TextureAtlas(texture);
            atlas.addRegion("ann", new skylark.Rectangle(0, 0, 1, 8));
            atlas.addRegion("prefix_3", new skylark.Rectangle(8, 0, 2, 8));
            atlas.addRegion("prefix_1", new skylark.Rectangle(16, 0, 3, 8));
            atlas.addRegion("bob", new skylark.Rectangle(24, 0, 4, 8));
            atlas.addRegion("prefix_2", new skylark.Rectangle(32, 0, 5, 8));
        });

        it('should return all textures when no name prefix is specified', function() {
            var items:skylark.Texture[] = atlas.getTextures();
            expect(items.length).to.eql(5);
        });

        it('should return textures in alphabetical order', function() {
            var items:skylark.Texture[] = atlas.getTextures();
            var widths = [ 1, 4, 3, 5, 2];
            for(var i = 0; i < widths.length; i++) {
                expect(items[i].width).to.eql(widths[i]);
            }
        });

        it('should return only textures with the specified name prefix', function() {
            var items:skylark.Texture[] = atlas.getTextures("prefix_");

            expect(items.length).to.eql(3);
            expect(items[0].width).to.eql(3);
            expect(items[1].width).to.eql(5);
            expect(items[2].width).to.eql(2);
        });
    });
});
