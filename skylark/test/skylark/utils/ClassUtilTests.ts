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

class TestClassParent {

}

class TestClass extends TestClassParent {
    constructor() {
        super();
    }
}

describe('ClassUtil', function() {
    var ClassUtil = skylark.ClassUtil;

    describe('getQualifiedClassName', function() {
        it('should determine the name from a TypeScript "class"', function() {
            expect(ClassUtil.getQualifiedClassName(TestClass)).to.eql('TestClass');
        });

        it('should determine the "class" name for a "class instance"', function() {
            var obj = new TestClass();
            expect(ClassUtil.getQualifiedClassName(obj)).to.eql('TestClass');
        });

        it('should fail with an error when presented with a non-function object', function() {
            expect(()=> {
                ClassUtil.getQualifiedClassName('test');
            }).to.throw();
        });
    });

    describe('isClass', function() {

        it('should return true for a TS class', function() {
            expect(ClassUtil.isClass(TestClass)).to.be.true;
        });

        it('should return false for a TS class "instance"', function() {
            expect(ClassUtil.isClass(new TestClass())).to.be.false;
        });
    });

    describe('isCanavsImageSource', function() {
        it('should return "true" for HTMLImageElements', function() {
            var image = new Image();
            expect(ClassUtil.isCanvasImageSource(image)).to.eql(true);
        });
        it('should return "true" for HTMLCanvasElements', function() {
            var canvas = document.createElement('canvas');
            expect(ClassUtil.isCanvasImageSource(canvas)).to.eql(true);
        });
        it('should return "false" for other objects', function() {
            expect(ClassUtil.isCanvasImageSource({})).to.eql(false);
            expect(ClassUtil.isCanvasImageSource(document.createElement('div'))).to.eql(false);
        });
    });

    describe('getDefinitionByName', function() {
        it('should return the correct class for a root-level class name', function() {
            expect(ClassUtil.getDefinitionByName('TestClass')).to.eql(TestClass);
        });
    });
});
