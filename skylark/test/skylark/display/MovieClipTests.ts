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

describe('MovieClipTests', function() {
    var E:number = 0.0001;

    function texture(width, height) {
        var image = new stubs.MImage(width, height);
        return new skylark.ConcreteTexture(image);
    }

    //[Test]
    it('FrameManipulation', function() {
        var fps:number = 4.0;
        var frameDuration:number = 1.0 / fps;
        var format:string = null;

        var texture0 = texture(16, 16);
        var texture1 = texture(16, 16);
        var texture2 = texture(16, 16);
        var texture3 = texture(16, 16);

        var movie:skylark.MovieClip = new skylark.MovieClip([texture0], fps);

        assert.closeTo(movie.width, texture0.width, E);
        assert.closeTo(movie.height, texture0.height, E);
        assert.closeTo(movie.totalTime, frameDuration, E);
        assert.equal(1, movie.numFrames);
        assert.equal(0, movie.currentFrame);
        assert.equal(true, movie.loop);
        assert.equal(true, movie.isPlaying);

        movie.pause();
        assert.isFalse(movie.isPlaying);

        movie.play();
        assert.isTrue(movie.isPlaying);

        movie.addFrame(texture1);
        assert.equal(2, movie.numFrames);
        assert.equal(texture0, movie.getFrameTexture(0));
        assert.equal(texture1, movie.getFrameTexture(1));
//        assert.isNull(movie.getFrameSound(0));
//        assert.isNull(movie.getFrameSound(1));
        assert.closeTo(movie.getFrameDuration(0), frameDuration, E);
        assert.closeTo(movie.getFrameDuration(1), frameDuration, E);

        movie.addFrame(texture2, null, 0.5);
        assert.closeTo(movie.getFrameDuration(2), 0.5, E);
        assert.closeTo(movie.totalTime, 1.0, E);

        movie.addFrameAt(2, texture3); // -> 0, 1, 3, 2
        assert.equal(4, movie.numFrames);
        assert.equal(texture1, movie.getFrameTexture(1));
        assert.equal(texture3, movie.getFrameTexture(2));
        assert.equal(texture2, movie.getFrameTexture(3));
        assert.closeTo(movie.totalTime, 1.0 + frameDuration, E);

        movie.removeFrameAt(0); // -> 1, 3, 2
        assert.equal(3, movie.numFrames);
        assert.equal(texture1, movie.getFrameTexture(0));
        assert.closeTo(movie.totalTime, 1.0, E);

        movie.removeFrameAt(1); // -> 1, 2
        assert.equal(2, movie.numFrames);
        assert.equal(texture1, movie.getFrameTexture(0));
        assert.equal(texture2, movie.getFrameTexture(1));
        assert.closeTo(movie.totalTime, 0.75, E);

        movie.setFrameTexture(1, texture3);
        assert.equal(texture3, movie.getFrameTexture(1));

        movie.setFrameDuration(1, 0.75);
        assert.closeTo(movie.totalTime, 1.0, E);

        movie.addFrameAt(2, texture3);
        assert.equal(texture3, movie.getFrameTexture(2));
    });

    //[Test]
    it('AdvanceTime', function() {
        var fps:number = 4.0;
        var frameDuration:number = 1.0 / fps;
        var format:string = null;

        var texture0 = texture(16, 16);
        var texture1 = texture(16, 16);
        var texture2 = texture(16, 16);
        var texture3 = texture(16, 16);

        var movie:skylark.MovieClip = new skylark.MovieClip([texture0], fps);
        movie.addFrame(texture2, null, 0.5);
        movie.addFrame(texture3);
        movie.addFrameAt(0, texture1);

        assert.equal(0, movie.currentFrame);
        movie.advanceTime(frameDuration / 2.0);
        assert.equal(0, movie.currentFrame);
        movie.advanceTime(frameDuration);
        assert.equal(1, movie.currentFrame);
        movie.advanceTime(frameDuration);
        assert.equal(2, movie.currentFrame);
        movie.advanceTime(frameDuration);
        assert.equal(2, movie.currentFrame);
        movie.advanceTime(frameDuration);
        assert.equal(3, movie.currentFrame);
        movie.advanceTime(frameDuration);
        assert.equal(0, movie.currentFrame);
        assert.isFalse(movie.isComplete);

        movie.loop = false;
        movie.advanceTime(movie.totalTime + frameDuration);
        assert.equal(3, movie.currentFrame);
        assert.isFalse(movie.isPlaying);
        assert.isTrue(movie.isComplete);

        movie.currentFrame = 0;
        assert.equal(0, movie.currentFrame);
        movie.advanceTime(frameDuration * 1.1);
        assert.equal(1, movie.currentFrame);

        movie.stop();
        assert.isFalse(movie.isPlaying);
        assert.isFalse(movie.isComplete);
        assert.equal(0, movie.currentFrame);
    });

    //[Test]
    it('ChangeFps', function() {
        var frames = createFrames(3);
        var movie:skylark.MovieClip = new skylark.MovieClip(frames, 4.0);

        assert.closeTo(movie.fps, 4.0, E);

        movie.fps = 3.0;
        assert.closeTo(movie.fps, 3.0, E);
        assert.closeTo(movie.getFrameDuration(0), 1.0 / 3.0, E);
        assert.closeTo(movie.getFrameDuration(1), 1.0 / 3.0, E);
        assert.closeTo(movie.getFrameDuration(2), 1.0 / 3.0, E);

        movie.setFrameDuration(1, 1.0);
        assert.closeTo(movie.getFrameDuration(1), 1.0, E);

        movie.fps = 6.0;
        assert.closeTo(movie.getFrameDuration(1), 0.5, E);
        assert.closeTo(movie.getFrameDuration(0), 1.0 / 6.0, E);
    });

    //[Test]
    it('CompletedEvent', function() {
        var fps:number = 4.0;
        var frameDuration:number = 1.0 / fps;
        var completedCount:number = 0;

        var frames = createFrames(4);
        var movie:skylark.MovieClip = new skylark.MovieClip(frames, fps);
        movie.addEventListener(skylark.Event.COMPLETE, onMovieCompleted);
        movie.loop = false;

        assert.isFalse(movie.isComplete);
        movie.advanceTime(frameDuration);
        assert.equal(1, movie.currentFrame);
        assert.equal(0, completedCount);
        movie.advanceTime(frameDuration);
        assert.equal(2, movie.currentFrame);
        assert.equal(0, completedCount);
        movie.advanceTime(frameDuration);
        assert.equal(3, movie.currentFrame);
        assert.equal(0, completedCount);
        movie.advanceTime(frameDuration);
        assert.equal(3, movie.currentFrame);
        assert.equal(1, completedCount);
        assert.isTrue(movie.isComplete);
        movie.advanceTime(movie.numFrames * 2 * frameDuration);
        assert.equal(3, movie.currentFrame);
        assert.equal(1, completedCount);
        assert.isTrue(movie.isComplete);

        movie.loop = true;
        completedCount = 0;

        assert.isFalse(movie.isComplete);
        movie.advanceTime(frameDuration);
        assert.equal(1, movie.currentFrame);
        assert.equal(0, completedCount);
        movie.advanceTime(frameDuration);
        assert.equal(2, movie.currentFrame);
        assert.equal(0, completedCount);
        movie.advanceTime(frameDuration);
        assert.equal(3, movie.currentFrame);
        assert.equal(0, completedCount);
        movie.advanceTime(frameDuration);
        assert.equal(0, movie.currentFrame);
        assert.equal(1, completedCount);
        movie.advanceTime(movie.numFrames * 2 * frameDuration);
        assert.equal(3, completedCount);

        function onMovieCompleted(event:skylark.Event):void {
            completedCount++;
        }
    });

    //[Test]
    it('ChangeCurrentFrameInCompletedEvent', function() {
        var fps:number = 4.0;
        var frameDuration:number = 1.0 / fps;
        var completedCount:number = 0;

        var frames = createFrames(4);
        var movie:skylark.MovieClip = new skylark.MovieClip(frames, fps);

        movie.loop = true;
        movie.addEventListener(skylark.Event.COMPLETE, onMovieCompleted);
        movie.advanceTime(1.75);

        assert.isFalse(movie.isPlaying);
        assert.equal(0, movie.currentFrame);

        function onMovieCompleted(event:skylark.Event):void {
            movie.pause();
            movie.currentFrame = 0;
        }
    });

    it('should animate without affecting x/y position', function() {
        var support = new skylark.RenderSupport();
        support.context = <CanvasRenderingContext2D>new stubs.MHTMLCanvasElement().getContext('2d');

        var fps:number = 1.0;

        var frames = createFrames(4);
        var movie:skylark.MovieClip = new skylark.MovieClip(frames, fps);

        movie.x = 10;
        movie.y = 1;

        movie.loop = true;

        movie.advanceTime(2); // 2 frames
        movie.render(support);

        expect(movie.x).to.eql(10);
        expect(movie.y).to.eql(1);

        stubs.MStarling.restore();

    });

    //[Test]
//    it('RemoveAllFrames', function() {
//        var frames[] = createFrames(2);
//        var movie:skylark.MovieClip = new skylark.MovieClip(frames);
//
//        // it must not be allowed to remove the last frame
//        movie.removeFrameAt(0);
//        var throwsError:boolean = false;
//
//        try {
//            movie.removeFrameAt(0);
//        }
//        catch(error:Error) {
//            throwsError = true;
//        }
//
//        assert.isTrue(throwsError);
//    });

    //[Test]
    it('LastTextureInFastPlayback', function() {
        var fps:number = 20.0;
        var frameDuration:number = 0.5;

        var frames = createFrames(3);
        var movie:skylark.MovieClip = new skylark.MovieClip(frames, fps);
        movie.addEventListener(skylark.Event.COMPLETE, onMovieCompleted);
        movie.advanceTime(1.0);

        function onMovieCompleted():void {
            assert.equal(frames[2], movie.texture);
        }
    });

    //[Test]
    it('AssignedTextureWithCompleteHandler', function() {
        // https://github.com/PrimaryFeather/Starling-Framework/issues/232

        var frames = createFrames(2);
        var movie:skylark.MovieClip = new skylark.MovieClip(frames, 2);

        movie.addEventListener(skylark.Event.COMPLETE, onComplete);
        assert.equal(frames[0], movie.texture);

        movie.advanceTime(0.5);
        assert.equal(frames[1], movie.texture);

        movie.advanceTime(0.5);
        assert.equal(frames[0], movie.texture);

        movie.advanceTime(0.5);
        assert.equal(frames[1], movie.texture);

        function onComplete():void { /* does not have to do anything */
        }
    });

    function createFrames(count:number):skylark.Texture[] {
        var frames:skylark.Texture[] = [/*Texture*/];
        var format:string = null;

        for(var i:number = 0; i < count; ++i)
            frames.push(texture(16, 16));

        return frames;
    }
});
