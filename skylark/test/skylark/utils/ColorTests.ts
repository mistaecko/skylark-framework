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

describe('Color', function() {
    describe('when converting hex values', ()=> {
        var parse = skylark.Color.fromString;

        it('should accept values prefixed with #', ()=> {
            expect(parse('#159EFF')).to.eql(0x159EFF);
        });

        it('should accept values without # prefix', ()=> {
            expect(parse('159EFF')).to.eql(0x159EFF);
        });
        it('should not fail for shortened hex codes', ()=> {
            expect(parse('#FFF')).to.eql(0xFFFFFF);
        });
//        it('should accept hex values with alpha channel', ()=> {
//            expect(parse('#FFFFFFFF')).to.eql(0xFFFFFFFF);
//            expect(parse('FFFFFFFF')).to.eql(0xFFFFFFFF);
//        });
        it('should accept named colors', ()=> {
            expect(parse('teal')).to.eql(0x008080);
        });
        it('should fail for null', ()=> {
            expect(()=> parse(null)).to.throw(skylark.ArgumentError);
        });
        it('should fail for undefined', ()=> {
            expect(()=>parse(undefined)).to.throw(skylark.ArgumentError);
        });
        it('should fail for an empty string', ()=> {
            expect(()=>parse('')).to.throw(skylark.ArgumentError);
        });
    });

    describe('toHexString', () => {
        it('should correctly convert an arbitrary color', () => {
            expect(skylark.Color.toHexString(38143)).to.eql('#0094ff');
        });
        it('should correctly convert black', () => {
            expect(skylark.Color.toHexString(0)).to.eql('#000000');
        });
        it('should correctly convert green', () => {
            expect(skylark.Color.toHexString(65280)).to.eql('#00ff00');
        });
    });
});
