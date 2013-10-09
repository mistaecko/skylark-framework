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

// note: file is currently excluded from compile:test

describe('StringUtilTests', function() {

    var StringUtil = skylark.StringUtil;

    var xmlStr =
        '<?xml version="1.0" encoding="UTF-8"?>\
        <!-- Created with TexturePacker http://texturepacker.com-->\
        <!-- $TexturePacker:SmartUpdate:b5a3a0fc11066b0b1abae44d821c9402$ -->\
        <TextureAtlas imagePath="throw-atlas.png">\
            <SubTexture name="throw" x="2" y="2" width="174" height="176">\
            </SubTexture>\
        </TextureAtlas>';

    var xmlStr2 =
        '<?xml version="1.0" encoding="UTF-8"?>\
        <!-- Created with TexturePacker http://texturepacker.com-->\
        <!-- $TexturePacker:SmartUpdate:b5a3a0fc11066b0b1abae44d821c9402$ -->\
        <TextureAtlas imagePath="base.png">\
            <SubTexture name="beavis" x="0" y="0" width="16" height="16"></SubTexture>\
            <SubTexture name="butthead" x="0" y="16" width="32" height="32"></SubTexture>\
        </TextureAtlas>';

    var invalidXml =
        '<?xml version="1.0" encoding="UTF-8"?>\
            <!-- Created with TexturePacker http://texturepacker.com-->\
            <!-- $TexturePacker:SmartUpdate:b5a3a0fc11066b0b1abae44d821c9402$ -->\
            <TextureAtlas imagePath="throw-atlas.png">\
                <SubTexture name="throw" x="2" y="2" width="174" height="176">\
                </SubTexture>\
            <TextureAtlas>'; // <== TYPO!

    it('should parse an xml string into a document', function() {
        var xml = StringUtil.parseXml(xmlStr);
        expect(xml).to.exist;
        expect(xml.nodeName).to.eql('#document');
        expect(xml.getElementsByTagName('SubTexture').length).to.eql(1);
    });

    it('should fail when parsing an invalid xml string', function() {
        expect(()=> {
            StringUtil.parseXml(invalidXml);
        }).to.throw();
    });

    describe('xmlToJson (simple)', function() {
        var parseXml = StringUtil.parseXml;
        var xmlToJson = StringUtil.xmlToJson;

        it('should convert a simple single-node XML document', function() {
            var xml = parseXml('<TextureAtlas></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: ''
            });
        });
        it('should convert an attribute', function() {
            var xml = parseXml('<TextureAtlas imagePath="base.png"></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    imagePath: "base.png"
                }
            });
        });
        it('should avoid name clashes between attribtues and nodes', function() {
            var xml = parseXml('<TextureAtlas imagePath="base.png"><imagePath>other.png</imagePath></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    imagePath: ['other.png', "base.png"]
                }
            });
        });
        it('should understand a node list', function() {
            var xml = parseXml('<TextureAtlas><SubTexture>Texture 1</SubTexture><SubTexture>Texture 2</SubTexture></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    SubTexture: [
                        'Texture 1',
                        'Texture 2'
                    ]
                }
            });
        });

        it('should convert a TextureAtlas', function() {
            var xml = parseXml(xmlStr2);
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    SubTexture: [
                        {
                            height: "16",
                            name: 'beavis',
                            width: "16",
                            x: "0",
                            y: "0"
                        },
                        {
                            height: "32",
                            name: 'butthead',
                            width: "32",
                            x: "0",
                            y: "16"
                        }
                    ],
                    imagePath: 'base.png'
                }
            });
        });
    });

    // todo - fix comparison which is broken after we introduced prototype based objects in output
    describe.skip('xmlToJson (non-simple)', function() {
        var parseXml = StringUtil.parseXml;
        var xmlToJson = function(xml) {
            return StringUtil.xmlToJson(xml, false);
        };
        function assert(actual, expected) {

        }

        it('should convert a simple single-node XML document', function() {
            var xml = parseXml('<TextureAtlas></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    attributes: {}
                }
            });
        });
        it('should convert an attribute', function() {
            var xml = parseXml('<TextureAtlas imagePath="base.png"></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    attributes: {
                        imagePath: "base.png"
                    }
                }
            });
        });
        it('should avoid name clashes between attribtues and nodes', function() {
            var xml = parseXml('<TextureAtlas imagePath="base.png"><imagePath>other.png</imagePath></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    imagePath: {
                        attributes: {},
                        text: 'other.png'
                    },
                    attributes: {
                        imagePath: "base.png"
                    }
                }
            });
        });
        it('should understand a node list', function() {
            var xml = parseXml('<TextureAtlas><SubTexture>Texture 1</SubTexture><SubTexture>Texture 2</SubTexture></TextureAtlas>');
            var result = xmlToJson(xml);
            expect(result).to.eql({
                TextureAtlas: {
                    attributes: {},
                    SubTexture: [
                        {
                            attributes: {},
                            text: 'Texture 1'
                        },
                        {
                            attributes: {},
                            text: 'Texture 2'
                        }
                    ]
                }
            });
        });

    });
});
