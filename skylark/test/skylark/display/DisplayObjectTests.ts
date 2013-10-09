/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('DisplayObject', ()=> {
    var deg2rad = skylark.MathUtil.deg2rad;

    var E:number = 0.0001;

    it('should have an initial alpha value of 1.0', () =>{
        var obj:skylark.DisplayObject = new skylark.DisplayObject();
        expect(obj.alpha).to.eql(1);
    });

    it('base of a Sprite', ()=> {
        var object1:skylark.Sprite = new skylark.Sprite();
        var object2:skylark.Sprite = new skylark.Sprite();
        var object3:skylark.Sprite = new skylark.Sprite();

        object1.addChild(object2);
        object2.addChild(object3);

        assert.equal(object1.base, object1);
        assert.equal(object2.base, object1);
        assert.equal(object3.base, object1);
    });

    it('base of a Quad', () => {
        var quad:skylark.Quad = new skylark.Quad(100, 100);
        assert.equal(quad.base, quad);
    });

    // should stage really be null??? see impl
    it('testRootAndStage', ()=>{
        var object1:skylark.Sprite = new skylark.Sprite();
        var object2:skylark.Sprite = new skylark.Sprite();
        var object3:skylark.Sprite = new skylark.Sprite();

        object1.addChild(object2);
        object2.addChild(object3);

        assert.equal(object1.root, null);
        assert.equal(object2.root, null);
        assert.equal(object3.root, null);
        assert.equal(object1.stage, null);
        assert.equal(object2.stage, null);
        assert.equal(object3.stage, null);

        var stage:skylark.Stage = new skylark.Stage(100, 100);
        stage.addChild(object1);

        assert.equal(object1.root, object1);
        assert.equal(object2.root, object1);
        assert.equal(object3.root, object1);
        assert.equal(object1.stage, stage);
        assert.equal(object2.stage, stage);
        assert.equal(object3.stage, stage);
    });

    it('testGetTransformationMatrix', ()=> {
        var sprite:skylark.Sprite = new skylark.Sprite();
        var child:skylark.Sprite = new skylark.Sprite();
        child.x = 30;
        child.y = 20;
        child.scaleX = 1.2;
        child.scaleY = 1.5;
        child.rotation = Math.PI / 4.0;
        sprite.addChild(child);

        var matrix:skylark.Matrix = sprite.getTransformationMatrix(child);
        var expectedMatrix:skylark.Matrix = child.transformationMatrix;
        expectedMatrix.invert();
        //[PORT]
        //Helpers.compareMatrices(expectedMatrix, matrix);

        matrix = child.getTransformationMatrix(sprite);
        //Helpers.compareMatrices(child.transformationMatrix, matrix);

        // more is tested indirectly via 'testBoundsInSpace' in DisplayObjectContainerTest
    });

    // note: quad bounds implementation is based on VertexData which is not implemented
    it('bounds', ()=> {
        var quad:skylark.Quad = new skylark.Quad(10, 20);
        quad.x = -10;
        quad.y =  10;
        quad.rotation = Math.PI / 2;

        var bounds:skylark.Rectangle = quad.bounds;
        assert.closeTo(bounds.x, -30, E);
        assert.closeTo(bounds.y, 10, E);
        assert.closeTo(bounds.width, 20, E);
        assert.closeTo(bounds.height, 10, E);

        bounds = quad.getBounds(quad);
        assert.closeTo(bounds.x, 0, E);
        assert.closeTo(bounds.y, 0, E);
        assert.closeTo(bounds.width, 10, E);
        assert.closeTo(bounds.height, 20, E);
    });


    describe('when scaling', () => {

        it('an empty object\'s width and height should not be affected', ()=> {
            var sprite:skylark.Sprite = new skylark.Sprite();
            assert.equal(1.0, sprite.scaleX);
            assert.equal(1.0, sprite.scaleY);

            // sprite is empty, scaling should thus have no effect!
            sprite.width = 100;
            sprite.height = 200;
            assert.equal(1.0, sprite.scaleX);
            assert.equal(1.0, sprite.scaleY);
            assert.equal(0.0, sprite.width);
            assert.equal(0.0, sprite.height);
        });

        // [PORT] Quad transformations not yet implemented
        it('to zero, should remember original width/height', () => {
            // setting a value to zero should be no problem -- and the original size
            // should be remembered.
            var quad:skylark.Quad = new skylark.Quad(100, 200);
            quad.scaleX = 0.0;
            quad.scaleY = 0.0;
            assert.closeTo(quad.width, 0, E);
            assert.closeTo(quad.height, 0, E);

            quad.scaleX = 1.0;
            quad.scaleY = 1.0;
            assert.closeTo(quad.width, 100, E);
            assert.closeTo(quad.height, 200, E);
        });

    })

    it('localToGlobal', ()=> {
        var root:skylark.Sprite = new skylark.Sprite();
        var sprite:skylark.Sprite = new skylark.Sprite();
        sprite.x = 10;
        sprite.y = 20;
        root.addChild(sprite);
        var sprite2:skylark.Sprite = new skylark.Sprite();
        sprite2.x = 150;
        sprite2.y = 200;
        sprite.addChild(sprite2);

        var localPoint:skylark.Point = new skylark.Point(0, 0);
        var globalPoint:skylark.Point = sprite2.localToGlobal(localPoint);
        var expectedPoint:skylark.Point = new skylark.Point(160, 220);
        Helpers.comparePoints(expectedPoint, globalPoint);

        // the position of the root object should be irrelevant -- we want the coordinates
        // *within* the root coordinate system!
        root.x = 50;
        globalPoint = sprite2.localToGlobal(localPoint);
        Helpers.comparePoints(expectedPoint, globalPoint);
    });

    it('globalToLocal', ()=> {
        var root:skylark.Sprite = new skylark.Sprite();
        var sprite:skylark.Sprite = new skylark.Sprite();
        sprite.x = 10;
        sprite.y = 20;
        root.addChild(sprite);
        var sprite2:skylark.Sprite = new skylark.Sprite();
        sprite2.x = 150;
        sprite2.y = 200;
        sprite.addChild(sprite2);

        var globalPoint:skylark.Point = new skylark.Point(160, 220);
        var localPoint:skylark.Point = sprite2.globalToLocal(globalPoint);
        var expectedPoint:skylark.Point = new skylark.Point();
        Helpers.comparePoints(expectedPoint, localPoint);

        // the position of the root object should be irrelevant -- we want the coordinates
        // *within* the root coordinate system!
        root.x = 50;
        localPoint = sprite2.globalToLocal(globalPoint);
        Helpers.comparePoints(expectedPoint, localPoint);
    });

    it('hitTestPoint', ()=> {
        var quad:skylark.Quad = new skylark.Quad(25, 10);
        assert.isNotNull(quad.hitTest(new skylark.Point(15, 5), true));
        assert.isNotNull(quad.hitTest(new skylark.Point(0, 0), true));
        assert.isNotNull(quad.hitTest(new skylark.Point(24.99, 0), true));
        assert.isNotNull(quad.hitTest(new skylark.Point(24.99, 9.99), true));
        assert.isNotNull(quad.hitTest(new skylark.Point(0, 9.99), true));
        assert.isNull(quad.hitTest(new skylark.Point(-1, -1), true));
        assert.isNull(quad.hitTest(new skylark.Point(25.01, 10.01), true));

        quad.visible = false;
        assert.isNull(quad.hitTest(new skylark.Point(15, 5), true));

        quad.visible = true;
        quad.touchable = false;
        assert.isNull(quad.hitTest(new skylark.Point(10, 5), true));

        quad.visible = false;
        quad.touchable = false;
        assert.isNull(quad.hitTest(new skylark.Point(10, 5), true));
    }); 

    it('rotation', ()=> {

        var quad:skylark.Quad = new skylark.Quad(100, 100);
        //[PORT]
        quad.rotation = deg2rad(400);
        assert.closeTo(quad.rotation, deg2rad(40), E);
        quad.rotation = deg2rad(220);
        assert.closeTo(quad.rotation, deg2rad(-140), E);
        quad.rotation = deg2rad(180);
        assert.closeTo(quad.rotation, deg2rad(180), E);
        quad.rotation = deg2rad(-90);
        assert.closeTo(quad.rotation, deg2rad(-90), E);
        quad.rotation = deg2rad(-179);
        assert.closeTo(quad.rotation, deg2rad(-179), E);
        quad.rotation = deg2rad(-180);
        assert.closeTo(quad.rotation, deg2rad(-180), E);
        quad.rotation = deg2rad(-181);
        assert.closeTo(quad.rotation, deg2rad(179), E);
        quad.rotation = deg2rad(-300);
        assert.closeTo(quad.rotation, deg2rad(60), E);
        quad.rotation = deg2rad(-370);
        assert.closeTo(quad.rotation, deg2rad(-10), E);
    });

    // [PORT] Quad transformations not yet implemented
    it('pivotPoint', ()=> {
        var width:number = 100.0;
        var height:number = 150.0;

        // a quad with a pivot point should behave <a>exactly quad without
        // pivot point inside a sprite

        var sprite:skylark.Sprite = new skylark.Sprite();
        var innerQuad:skylark.Quad = new skylark.Quad(width, height);
        sprite.addChild(innerQuad);
        var quad:skylark.Quad = new skylark.Quad(width, height);
        var spriteB:skylark.Rectangle = sprite.bounds;
        var quadB:skylark.Rectangle = quad.bounds;
        Helpers.compareRectangles(spriteB, quadB);

        innerQuad.x = -50;
        quad.pivotX = 50;
        innerQuad.y = -20;
        quad.pivotY = 20;
        Helpers.compareRectangles(sprite.bounds, quad.bounds);

        sprite.rotation = quad.rotation = deg2rad(45);
        Helpers.compareRectangles(sprite.bounds, quad.bounds);

        sprite.scaleX = quad.scaleX = 1.5;
        sprite.scaleY = quad.scaleY = 0.6;
        Helpers.compareRectangles(sprite.bounds, quad.bounds);

        sprite.x = quad.x = 5;
        sprite.y = quad.y = 20;
        Helpers.compareRectangles(sprite.bounds, quad.bounds);
    });

    // [PORT] Quad transformations not yet implemented
    it('pivotWithSkew', ()=> {

        var width:number = 200;
        var height:number = 100;
        var skewX:number = 0.2;
        var skewY:number = 0.35;
        var scaleY:number = 0.5;
        var rotation:number = 0.5;

        // create a scaled, rotated and skewed object from a sprite and a quad

        var quad:skylark.Quad = new skylark.Quad(width, height);
        quad.x = width / -2;
        quad.y = height / -2;

        var sprite:skylark.Sprite = new skylark.Sprite();
        sprite.x = width / 2;
        sprite.y = height / 2;
        sprite.skewX = skewX;
        sprite.skewY = skewY;
        sprite.rotation = rotation;
        sprite.scaleY = scaleY;
        sprite.addChild(quad);

        // do the same without a sprite, but with a pivoted quad

        var pQuad:skylark.Quad = new skylark.Quad(width, height);
        pQuad.x = width / 2;
        pQuad.y = height / 2;
        pQuad.pivotX = width / 2;
        pQuad.pivotY = height / 2;
        pQuad.skewX = skewX;
        pQuad.skewY = skewY;
        pQuad.scaleY = scaleY;
        pQuad.rotation = rotation;

        // the bounds have to be the same

        Helpers.compareRectangles(sprite.bounds, pQuad.bounds, 1.0);
    });

    it('name', ()=> {

        var sprite:skylark.Sprite = new skylark.Sprite();
        assert.isUndefined(sprite.name); //[PORT] assert.isNull

        sprite.name = "hugo";
        assert.equal(sprite.name, "hugo");
    });
});
