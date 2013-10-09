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

describe('EventTests', function() {
    var eventType:string = 'test';

    var listener:skylark.EventListenerFn = function() {

    };

    var context = {
        isContext: true
    };

    describe('adding and removing', () => {
        it('find an added event listener', () => {
            var dispatcher:skylark.EventDispatcher = new skylark.EventDispatcher();
            var eventType = 'testEvent';

            dispatcher.addEventListener(eventType, listener, context);

            expect(dispatcher.findEventListener(eventType, listener, context)).to.eql(0);
        });
    });

    //[Test]
    it('Bubbling', function() {
        eventType = "test";

        var grandParent:skylark.Sprite = new skylark.Sprite();
        var parent:skylark.Sprite = new skylark.Sprite();
        var child:skylark.Sprite = new skylark.Sprite();

        grandParent.addChild(parent);
        parent.addChild(child);

        var grandParentEventHandlerHit:boolean = false;
        var parentEventHandlerHit:boolean = false;
        var childEventHandlerHit:boolean = false;
        var hitCount:number = 0;

        // bubble up

        grandParent.addEventListener(eventType, onGrandParentEvent);
        parent.addEventListener(eventType, onParentEvent);
        child.addEventListener(eventType, onChildEvent);

        var event:skylark.Event = new skylark.Event(eventType, true);
        child.dispatchEvent(event);

        expect(grandParentEventHandlerHit).to.be.true;
        expect(parentEventHandlerHit).to.be.true;
        expect(childEventHandlerHit).to.be.true;

        expect(hitCount).to.eql(3);

        // remove event handler

        parentEventHandlerHit = false;
        parent.removeEventListener(eventType, onParentEvent);
        child.dispatchEvent(event);

        assert.isFalse(parentEventHandlerHit);
        assert.equal(5, hitCount);

        // don't bubble

        event = new skylark.Event(eventType);

        grandParentEventHandlerHit = parentEventHandlerHit = childEventHandlerHit = false;
        parent.addEventListener(eventType, onParentEvent);
        child.dispatchEvent(event);

        assert.equal(6, hitCount);
        assert.isTrue(childEventHandlerHit);
        assert.isFalse(parentEventHandlerHit);
        assert.isFalse(grandParentEventHandlerHit);

        function onGrandParentEvent(event:skylark.Event):void {
            grandParentEventHandlerHit = true;
            assert.equal(child, event.target);
            assert.equal(grandParent, event.currentTarget);
            hitCount++;
        }

        function onParentEvent(event:skylark.Event):void {
            parentEventHandlerHit = true;
            assert.equal(child, event.target);
            assert.equal(parent, event.currentTarget);
            hitCount++;
        }

        function onChildEvent(event:skylark.Event):void {
            childEventHandlerHit = true;
            assert.equal(child, event.target);
            assert.equal(child, event.currentTarget);
            hitCount++;
        }
    });

    it('StopPropagation', function() {
        eventType = "test";

        var grandParent:skylark.Sprite = new skylark.Sprite();
        var parent:skylark.Sprite = new skylark.Sprite();
        var child:skylark.Sprite = new skylark.Sprite();

        grandParent.addChild(parent);
        parent.addChild(child);

        var hitCount:number = 0;

        // stop propagation at parent

        child.addEventListener(eventType, onEvent);
        parent.addEventListener(eventType, onEvent_StopPropagation);
        parent.addEventListener(eventType, onEvent);
        grandParent.addEventListener(eventType, onEvent);

        child.dispatchEvent(new skylark.Event(eventType, true));

        assert.equal(3, hitCount);

        // stop immediate propagation at parent

        parent.removeEventListener(eventType, onEvent_StopPropagation);
        parent.removeEventListener(eventType, onEvent);

        parent.addEventListener(eventType, onEvent_StopImmediatePropagation);
        parent.addEventListener(eventType, onEvent);

        child.dispatchEvent(new skylark.Event(eventType, true));

        assert.equal(5, hitCount);

        function onEvent(event:skylark.Event):void {
            hitCount++;
        }

        function onEvent_StopPropagation(event:skylark.Event):void {
            event.stopPropagation();
            hitCount++;
        }

        function onEvent_StopImmediatePropagation(event:skylark.Event):void {
            event.stopImmediatePropagation();
            hitCount++;
        }
    });

    it('RemoveEventListeners', function() {
        var hitCount:number = 0;
        var dispatcher:skylark.EventDispatcher = new skylark.EventDispatcher();

        dispatcher.addEventListener("Type1", onEvent);
        dispatcher.addEventListener("Type2", onEvent);
        dispatcher.addEventListener("Type3", onEvent);

        hitCount = 0;
        dispatcher.dispatchEvent(new skylark.Event("Type1"));
        assert.equal(1, hitCount);

        dispatcher.dispatchEvent(new skylark.Event("Type2"));
        assert.equal(2, hitCount);

        dispatcher.dispatchEvent(new skylark.Event("Type3"));
        assert.equal(3, hitCount);

        hitCount = 0;
        dispatcher.removeEventListener("Type1", onEvent);
        dispatcher.dispatchEvent(new skylark.Event("Type1"));
        assert.equal(0, hitCount);

        dispatcher.dispatchEvent(new skylark.Event("Type3"));
        assert.equal(1, hitCount);

        hitCount = 0;
        dispatcher.removeEventListeners();
        dispatcher.dispatchEvent(new skylark.Event("Type1"));
        dispatcher.dispatchEvent(new skylark.Event("Type2"));
        dispatcher.dispatchEvent(new skylark.Event("Type3"));
        assert.equal(0, hitCount);

        function onEvent(event:skylark.Event):void {
            ++hitCount;
        }
    });

    it('BlankEventDispatcher', function() {
        var dispatcher:skylark.EventDispatcher = new skylark.EventDispatcher();

        dispatcher.removeEventListener("Test", null);
        dispatcher.removeEventListeners("Test");
    });

    it('DuplicateEventHandler', function() {
        var dispatcher:skylark.EventDispatcher = new skylark.EventDispatcher();
        var callCount:number = 0;

        dispatcher.addEventListener("test", onEvent);
        dispatcher.addEventListener("test", onEvent);

        dispatcher.dispatchEvent(new skylark.Event("test"));
        assert.equal(1, callCount);

        function onEvent(event:skylark.Event):void {
            callCount++;
        }
    });

    it('BubbleWithModifiedChain', function() {
        eventType = "test";

        var grandParent:skylark.Sprite = new skylark.Sprite();
        var parent:skylark.Sprite = new skylark.Sprite();
        var child:skylark.Sprite = new skylark.Sprite();

        grandParent.addChild(parent);
        parent.addChild(child);

        var hitCount:number = 0;

        // listener on 'child' changes display list; bubbling must not be affected.

        grandParent.addEventListener(eventType, onEvent);
        parent.addEventListener(eventType, onEvent);
        child.addEventListener(eventType, onEvent);
        child.addEventListener(eventType, onEvent_removeFromParent);

        child.dispatchEvent(new skylark.Event(eventType, true));

        assert.isNull(parent.parent);
        assert.equal(3, hitCount);

        function onEvent(event:skylark.Event):void {
            hitCount++;
        }

        function onEvent_removeFromParent(event:skylark.Event):void {
            parent.removeFromParent();
        }
    });

    it('Redispatch', function() {
        eventType = "test";

        var grandParent:skylark.Sprite = new skylark.Sprite();
        var parent:skylark.Sprite = new skylark.Sprite();
        var child:skylark.Sprite = new skylark.Sprite();

        grandParent.addChild(parent);
        parent.addChild(child);

        grandParent.addEventListener(eventType, onEvent);
        parent.addEventListener(eventType, onEvent);
        child.addEventListener(eventType, onEvent);
        parent.addEventListener(eventType, onEvent_redispatch);

        var targets:any[] = [];
        var currentTargets:any[] = [];

        child.dispatchEventWith(eventType, true);

        // main bubble
        assert.equal(targets[0], child);
        assert.equal(currentTargets[0], child);

        // main bubble
        assert.equal(targets[1], child);
        assert.equal(currentTargets[1], parent);

        // inner bubble
        assert.equal(targets[2], parent);
        assert.equal(currentTargets[2], parent);

        // inner bubble
        assert.equal(targets[3], parent);
        assert.equal(currentTargets[3], grandParent);

        // main bubble
        assert.equal(targets[4], child);
        assert.equal(currentTargets[4], grandParent);

        function onEvent(event:skylark.Event):void {
            targets.push(event.target);
            currentTargets.push(event.currentTarget);
        }

        function onEvent_redispatch(event:skylark.Event):void {
            parent.removeEventListener(eventType, onEvent_redispatch);
            parent.dispatchEvent(event);
        }
    });

    it('Should pass "data" to listener', () => {
        var data:string = "payload";

        listener = sinon.spy();

        var disp:skylark.EventDispatcher = new skylark.EventDispatcher();
        disp.addEventListener(eventType, listener);

        disp.dispatchEventWith(eventType, false, data);

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.always.have.been.calledWith(sinon.match.any, data);
    });

    it('Should apply "this" when executing a listener', (done) => {
        eventType = "test";

        var obj:skylark.EventDispatcher = new skylark.EventDispatcher();
        obj.addEventListener(eventType, function() {
            expect(this).to.equal(obj);
            done();
        }, obj);

        obj.dispatchEvent(new skylark.Event(eventType, true));
    });

    it('should remove listeners with explicitely configured "this" context', () => {
        eventType = "test";

        var This = Object.create(null);
        function listener() {};

        var obj:skylark.EventDispatcher = new skylark.EventDispatcher();
        obj.addEventListener(eventType, listener, obj);

        // sanity check
        expect(obj.hasEventListener(eventType)).to.eql(true); //be.true

        obj.removeEventListener(eventType, listener, obj);
        expect(obj.hasEventListener(eventType)).to.eql(false); //be.false
    });

});
