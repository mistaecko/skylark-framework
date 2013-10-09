/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('DisplayObjectContainer', () => {
    var E:number;
    var vAdded:number;
    var vAddedToStage:number;
    var vAddedChild:number;
    var vRemoved:number;
    var vRemovedFromStage:number;
    var vRemovedChild:number;

    beforeEach(() => {
        E = 0.0001;
        vAdded = 0;
        vAddedToStage = 0;
        vAddedChild = 0;
        vRemoved = 0;
        vRemovedFromStage = 0;
        vRemovedChild = 0;
    });

    describe('manipulating children', () => {

        function createSprite(numChildren:number):skylark.Sprite {
            var sprite:skylark.Sprite = new skylark.Sprite();
            for(var i:number = 0; i < numChildren; ++i) {
                var child:skylark.Sprite = new skylark.Sprite();
                child.name = i.toString();
                sprite.addChild(child);
            }
            return sprite;
        }

        it('should maintain the parent reference correctly', ()=> {
                var parent:skylark.Sprite = new skylark.Sprite();
                var child1:skylark.Sprite = new skylark.Sprite();
                var child2:skylark.Sprite = new skylark.Sprite();
                var returnValue:skylark.DisplayObject;

                assert.equal(0, parent.numChildren);
                assert.isUndefined(child1.parent); // assert.isNull

                returnValue = parent.addChild(child1);
                assert.equal(child1, returnValue);
                assert.equal(1, parent.numChildren);
                assert.equal(parent, child1.parent);

                returnValue = parent.addChild(child2);
                assert.equal(child2, returnValue);
                assert.equal(2, parent.numChildren);
                assert.equal(parent, child2.parent);
                assert.equal(child1, parent.getChildAt(0));
                assert.equal(child2, parent.getChildAt(1));

                returnValue = parent.removeChild(child1);
                assert.equal(child1, returnValue);
                assert.isNull(child1.parent);
                assert.equal(child2, parent.getChildAt(0));
                child1.removeFromParent(); // should *not* throw an exception

                returnValue = child2.addChild(child1);
                assert.equal(child1, returnValue);
                assert.isTrue(parent.contains(child1));
                assert.isTrue(parent.contains(child2));
                assert.equal(child2, child1.parent);

                returnValue = parent.addChildAt(child1, 0);
                assert.equal(child1, returnValue);
                assert.equal(parent, child1.parent);
                assert.isFalse(child2.contains(child1));
                assert.equal(child1, parent.getChildAt(0));
                assert.equal(child2, parent.getChildAt(1));

                returnValue = parent.removeChildAt(0);
                assert.equal(child1, returnValue);
                assert.equal(child2, parent.getChildAt(0));
                assert.equal(1, parent.numChildren);
            }
        );

        it('remove all children', ()=> {
            var parent:skylark.Sprite;
            var numChildren:number = 10;

            // removing all children

            parent = createSprite(numChildren);
            assert.equal(parent.numChildren, 10);

            parent.removeChildren();
            assert.equal(parent.numChildren, 0);
        });

        it('remove a subset', () => {
            var parent:skylark.Sprite;
            var numChildren:number = 10;

            parent = createSprite(numChildren);
            parent.removeChildren(3, 5);
            assert.equal(parent.numChildren, 7);
            assert.equal(parent.getChildAt(2).name, "2");
            assert.equal(parent.getChildAt(3).name, "6");
        });

        it('remove beginning from an ID', () => {
            var parent:skylark.Sprite;
            var numChildren:number = 10;

            parent = createSprite(numChildren);
            parent.removeChildren(5);
            assert.equal(parent.numChildren, 5);
            assert.equal(parent.getChildAt(4).name, "4");
        });

        it('setChildIndex', ()=> {
            var parent:skylark.Sprite = new skylark.Sprite();
            var child1:skylark.Sprite = new skylark.Sprite();
            var child2:skylark.Sprite = new skylark.Sprite();
            var child3:skylark.Sprite = new skylark.Sprite();

            parent.addChild(child1);
            parent.addChild(child2);
            parent.addChild(child3);

            child1.name = "child1";
            child2.name = "child2";
            child3.name = "child3";

            assert.equal(child1, parent.getChildByName("child1"));
            assert.equal(child2, parent.getChildByName("child2"));
            assert.equal(child3, parent.getChildByName("child3"));
            assert.isNull(parent.getChildByName("non-existing")); // assert.isNull

            child2.name = "child3";
            assert.equal(child2, parent.getChildByName("child3"));
        });

        it('setChildIndex', ()=> {
                var parent:skylark.Sprite = new skylark.Sprite();
                var childA:skylark.Sprite = new skylark.Sprite();
                var childB:skylark.Sprite = new skylark.Sprite();
                var childC:skylark.Sprite = new skylark.Sprite();

                parent.addChild(childA);
                parent.addChild(childB);
                parent.addChild(childC);

                parent.setChildIndex(childB, 0);
                assert.equal(parent.getChildAt(0), childB);
                assert.equal(parent.getChildAt(1), childA);
                assert.equal(parent.getChildAt(2), childC);

                parent.setChildIndex(childB, 1);
                assert.equal(parent.getChildAt(0), childA);
                assert.equal(parent.getChildAt(1), childB);
                assert.equal(parent.getChildAt(2), childC);

                parent.setChildIndex(childB, 2);
                assert.equal(parent.getChildAt(0), childA);
                assert.equal(parent.getChildAt(1), childC);
                assert.equal(parent.getChildAt(2), childB);

                assert.equal(3, parent.numChildren);
            }
        );

        it('swapChildren', ()=> {
                var parent:skylark.Sprite = new skylark.Sprite();
                var childA:skylark.Sprite = new skylark.Sprite();
                var childB:skylark.Sprite = new skylark.Sprite();
                var childC:skylark.Sprite = new skylark.Sprite();

                parent.addChild(childA);
                parent.addChild(childB);
                parent.addChild(childC);

                parent.swapChildren(childA, childC);
                assert.equal(parent.getChildAt(0), childC);
                assert.equal(parent.getChildAt(1), childB);
                assert.equal(parent.getChildAt(2), childA);

                parent.swapChildren(childB, childB); // should change nothing
                assert.equal(parent.getChildAt(0), childC);
                assert.equal(parent.getChildAt(1), childB);
                assert.equal(parent.getChildAt(2), childA);

                assert.equal(3, parent.numChildren);
            }
        );
    });

    describe('width and height', () => {
        it('with translated children', () => {
            var sprite:skylark.Sprite = new skylark.Sprite();
            var quad1:skylark.Quad = new skylark.Quad(10, 20);
            quad1.x = -10;
            quad1.y = -15;

            var quad2:skylark.Quad = new skylark.Quad(15, 25);
            quad2.x = 30;
            quad2.y = 25;

            sprite.addChild(quad1);
            sprite.addChild(quad2);

            assert.closeTo(sprite.width, 55, E);
            assert.closeTo(sprite.height, 65, E);
        });

        it('with rotated children', () => {
            var sprite:skylark.Sprite = new skylark.Sprite();
            var quad1:skylark.Quad = new skylark.Quad(10, 20);
            quad1.x = -10;
            quad1.y = -15;

            var quad2:skylark.Quad = new skylark.Quad(15, 25);
            quad2.x = 30;
            quad2.y = 25;

            sprite.addChild(quad1);
            sprite.addChild(quad2);

            assert.closeTo(sprite.width, 55, E);
            assert.closeTo(sprite.height, 65, E);

            quad1.rotation = Math.PI / 2;
            assert.closeTo(sprite.width, 75, E);
            assert.closeTo(sprite.height, 65, E);

            quad1.rotation = Math.PI;
            assert.closeTo(sprite.width, 65, E);
            assert.closeTo(sprite.height, 85, E);
        });

        it('when scaled', ()=> {
            var quad1:skylark.Quad = new skylark.Quad(100, 100);
            var quad2:skylark.Quad = new skylark.Quad(100, 100);
            quad2.x = quad2.y = 100;

            var sprite:skylark.Sprite = new skylark.Sprite();
            var childSprite:skylark.Sprite = new skylark.Sprite();

            sprite.addChild(childSprite);
            childSprite.addChild(quad1);
            childSprite.addChild(quad2);

            assert.closeTo(sprite.width, 200, E);
            assert.closeTo(sprite.height, 200, E);

            sprite.scaleX = 2.0;
            sprite.scaleY = 2.0;

            assert.closeTo(sprite.width, 400, E);
            assert.closeTo(sprite.height, 400, E);
        });

    });

    describe('bounds', () => {
        it('with translated children', ()=> {
            var quad:skylark.Quad = new skylark.Quad(10, 20);
            quad.x = -10;
            quad.y = 10;
            quad.rotation = Math.PI / 2;

            var sprite:skylark.Sprite = new skylark.Sprite();
            sprite.addChild(quad);

            var bounds:skylark.Rectangle = sprite.bounds;
            assert.closeTo(bounds.x, -30, E);
            assert.closeTo(bounds.y, 10, E);
            assert.closeTo(bounds.width, 20, E);
            assert.closeTo(bounds.height, 10, E);

            bounds = sprite.getBounds(sprite);
            assert.closeTo(bounds.x, -30, E);
            assert.closeTo(bounds.y, 10, E);
            assert.closeTo(bounds.width, 20, E);
            assert.closeTo(bounds.height, 10, E);
        });

        it('in space', ()=> {
            var root:skylark.Sprite = new skylark.Sprite();

            var spriteA:skylark.Sprite = new skylark.Sprite();
            spriteA.x = 50;
            spriteA.y = 50;
            addQuadToSprite(spriteA);
            root.addChild(spriteA);

            var spriteA1:skylark.Sprite = new skylark.Sprite();
            spriteA1.x = 150;
            spriteA1.y = 50;
            spriteA1.scaleX = spriteA1.scaleY = 0.5;
            addQuadToSprite(spriteA1);
            spriteA.addChild(spriteA1);

            var spriteA11:skylark.Sprite = new skylark.Sprite();
            spriteA11.x = 25;
            spriteA11.y = 50;
            spriteA11.scaleX = spriteA11.scaleY = 0.5;
            addQuadToSprite(spriteA11);
            spriteA1.addChild(spriteA11);

            var spriteA2:skylark.Sprite = new skylark.Sprite();
            spriteA2.x = 50;
            spriteA2.y = 150;
            spriteA2.scaleX = spriteA2.scaleY = 0.5;
            addQuadToSprite(spriteA2);
            spriteA.addChild(spriteA2);

            var spriteA21:skylark.Sprite = new skylark.Sprite();
            spriteA21.x = 50;
            spriteA21.y = 25;
            spriteA21.scaleX = spriteA21.scaleY = 0.5;
            addQuadToSprite(spriteA21);
            spriteA2.addChild(spriteA21);

            // ---

            var bounds:skylark.Rectangle = spriteA21.getBounds(spriteA11);
            var expectedBounds:skylark.Rectangle = new skylark.Rectangle(-350, 350, 100, 100);

            Helpers.compareRectangles(bounds, expectedBounds);

            // now <well>rotate

            spriteA11.rotation = Math.PI / 4.0;
            spriteA21.rotation = Math.PI / -4.0;

            bounds = spriteA21.getBounds(spriteA11);
            expectedBounds = new skylark.Rectangle(0, 394.974762, 100, 100);

            Helpers.compareRectangles(bounds, expectedBounds);

            function addQuadToSprite(sprite:skylark.Sprite):void {
                sprite.addChild(new skylark.Quad(100, 100));
            }
        });

        it('of an empty translated container should have zero width,height', ()=> {
            var sprite:skylark.Sprite = new skylark.Sprite();
            sprite.x = 100;
            sprite.y = 200;

            var bounds:skylark.Rectangle = sprite.bounds;
            assert.closeTo(bounds.x, 100, E);
            assert.closeTo(bounds.y, 200, E);
            assert.closeTo(bounds.width, 0, E);
            assert.closeTo(bounds.height, 0, E);
        });
    });

    it('sort', ()=> {
            var s1:skylark.Sprite = new skylark.Sprite();
            s1.y = 8;
            var s2:skylark.Sprite = new skylark.Sprite();
            s2.y = 3;
            var s3:skylark.Sprite = new skylark.Sprite();
            s3.y = 6;
            var s4:skylark.Sprite = new skylark.Sprite();
            s4.y = 1;

            var parent:skylark.Sprite = new skylark.Sprite();
            parent.addChild(s1);
            parent.addChild(s2);
            parent.addChild(s3);
            parent.addChild(s4);

            assert.equal(s1, parent.getChildAt(0));
            assert.equal(s2, parent.getChildAt(1));
            assert.equal(s3, parent.getChildAt(2));
            assert.equal(s4, parent.getChildAt(3));

            parent.sortChildren(function (child1:skylark.DisplayObject, child2:skylark.DisplayObject):number {
                if (child1.y < child2.y) return -1;
                else if (child1.y > child2.y) return 1;
                else return 0;
            });

            assert.equal(s4, parent.getChildAt(0));
            assert.equal(s2, parent.getChildAt(1));
            assert.equal(s3, parent.getChildAt(2));
            assert.equal(s1, parent.getChildAt(3));
        }
    );

    it('addExistingChild', ()=> {
            var sprite:skylark.Sprite = new skylark.Sprite();
            var quad:skylark.Quad = new skylark.Quad(100, 100);
            sprite.addChild(quad);
            sprite.addChild(quad);
            assert.equal(1, sprite.numChildren);
            assert.equal(0, sprite.getChildIndex(quad));
        }
    );

    it('removeWithEventHandler', ()=> {
            var parent:skylark.Sprite = new skylark.Sprite();
            var child0:skylark.Sprite = new skylark.Sprite();
            var child1:skylark.Sprite = new skylark.Sprite();
            var child2:skylark.Sprite = new skylark.Sprite();

            parent.addChild(child0);
            parent.addChild(child1);
            parent.addChild(child2);

            // Remove last child, and in its event listener remove first child.
            // That must work, even though the child changes its index in the event handler.

            child2.addEventListener(skylark.Event.REMOVED, function (event:skylark.Event):void {
                child0.removeFromParent();
            });

            parent.removeChildAt(2);

            assert.isNull(child2.parent);
            assert.isNull(child0.parent);
            assert.equal(child1, parent.getChildAt(0));
            assert.equal(1, parent.numChildren);
        }
    );

    it('should detect recursions in addChild', ()=> {
        var sprite1:skylark.Sprite = new skylark.Sprite();
        var sprite2:skylark.Sprite = new skylark.Sprite();
        var sprite3:skylark.Sprite = new skylark.Sprite();

        sprite1.addChild(sprite2);
        sprite2.addChild(sprite3);

        expect(() => {
          sprite3.addChild(sprite1);
        }).to.throw(skylark.ArgumentError);
      }
    );

    it('addAsChildToSelf', ()=> {
        var sprite:skylark.Sprite = new skylark.Sprite();

        expect(() => {
          sprite.addChild(sprite);
        }).to.throw(skylark.ArgumentError);

      }
    );

    it('displayListEvents', ()=> {
            var stage:skylark.Stage = new skylark.Stage(100, 100);
            var sprite:skylark.Sprite = new skylark.Sprite();
            var quad:skylark.Quad = new skylark.Quad(20, 20);

            quad.addEventListener(skylark.Event.ADDED, onAdded);
            quad.addEventListener(skylark.Event.ADDED_TO_STAGE, onAddedToStage);
            quad.addEventListener(skylark.Event.REMOVED, onRemoved);
            quad.addEventListener(skylark.Event.REMOVED_FROM_STAGE, onRemovedFromStage);

            stage.addEventListener(skylark.Event.ADDED, onAddedChild);
            stage.addEventListener(skylark.Event.REMOVED, onRemovedChild);

            sprite.addChild(quad);
            assert.equal(vAdded, 1);
            assert.equal(vRemoved, 0);
            assert.equal(vAddedToStage, 0);
            assert.equal(vRemovedFromStage, 0);
            assert.equal(vAddedChild, 0);
            assert.equal(vRemovedChild, 0);

            stage.addChild(sprite);
            assert.equal(vAdded, 1);
            assert.equal(vRemoved, 0);
            assert.equal(vAddedToStage, 1);
            assert.equal(vRemovedFromStage, 0);
            assert.equal(vAddedChild, 1);
            assert.equal(vRemovedChild, 0);

            stage.removeChild(sprite);
            assert.equal(1, vAdded);
            assert.equal(0, vRemoved);
            assert.equal(1, vAddedToStage);
            assert.equal(1, vRemovedFromStage);
            assert.equal(1, vAddedChild);
            assert.equal(1, vRemovedChild);

            sprite.removeChild(quad);
            assert.equal(1, vAdded);
            assert.equal(1, vRemoved);
            assert.equal(1, vAddedToStage);
            assert.equal(1, vRemovedFromStage);
            assert.equal(1, vAddedChild);
            assert.equal(1, vRemovedChild);
        }
    ); 

    it('removeFromStage', ()=> {
            var stage:skylark.Stage = new skylark.Stage(100, 100);
            var sprite:skylark.Sprite = new skylark.Sprite();
            stage.addChild(sprite);
            sprite.addEventListener(skylark.Event.REMOVED_FROM_STAGE, onSpriteRemovedFromStage);
            sprite.removeFromParent();
            assert.equal(vRemovedFromStage, 1);

            function onSpriteRemovedFromStage(e:skylark.Event):void {
                // stage should still be accessible in event listener
                assert.isNotNull(sprite.stage);
                vRemovedFromStage++;
            }
        }
    );



    function onAdded(event:skylark.Event):void {
        vAdded++;
    }

    function onAddedToStage(event:skylark.Event):void {
        vAddedToStage++;
    }

    function onAddedChild(event:skylark.Event):void {
        vAddedChild++;
    }

    function onRemoved(event:skylark.Event):void {
        vRemoved++;
    }

    function onRemovedFromStage(event:skylark.Event):void {
        vRemovedFromStage++;
    }

    function onRemovedChild(event:skylark.Event):void {
        vRemovedChild++;
    }

});
