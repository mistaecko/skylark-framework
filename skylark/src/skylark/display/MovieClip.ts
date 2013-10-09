// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
/// <reference path="../../_dependencies.ts"/>

module skylark {

    /** A MovieClip is a simple way to display an animation depicted by a list of textures.
     *
     *  <p>Pass the frames of the movie in a vector of textures to the constructor. The movie clip
     *  will have the width and height of the first frame. If you group your frames with the help
     *  of a texture atlas (which is recommended), use the <code>getTextures</code>-method of the
     *  atlas to receive the textures in the correct (alphabetic) order.</p>
     *
     *  <p>You can specify the desired framerate via the constructor. You can, however, manually
     *  give each frame a custom duration. You can also play a sound whenever a certain frame
     *  appears.</p>
     *
     *  <p>The methods <code>play</code> and <code>pause</code> control playback of the movie. You
     *  will receive an event of type <code>Event.MovieCompleted</code> when the movie finished
     *  playback. If the movie is looping, the event is dispatched once per loop.</p>
     *
     *  <p>As any animated object, a movie clip has to be added to a juggler (or have its
     *  <code>advanceTime</code> method called regularly) to run. The movie will dispatch
     *  an event of type "Event.COMPLETE" whenever it has displayed its last frame.</p>
     *
     *  @see skylark.TextureAtlas
     */
    export class MovieClip extends Image implements IAnimatable {
        private _textures:Texture[];
        private _sounds:any[];
        private _durations:number[];
        private _startTimes:number[];

        private _defaultFrameDuration:number;
        private _totalTime:number;
        private _currentTime:number;
        private _currentFrame:number;
        private _loop:boolean;
        private _playing:boolean;

        /** Creates a movie clip from the provided textures and with the specified default framerate.
         *  The movie will have the size of the first frame.
         */
        constructor(textures:Texture[], fps:number = 12) {
            if(textures.length > 0) {
                super(textures[0]);
                this.init(textures, fps);
            }
            else {
                throw new ArgumentError("Empty texture array");
            }
        }

        private init(textures:Texture[], fps:number):void {
            if(fps <= 0)
                throw new ArgumentError("Invalid fps: " + fps);

            var numFrames:number = textures.length;

            this._defaultFrameDuration = 1.0 / fps;
            this._loop = true;
            this._playing = true;
            this._currentTime = 0.0;
            this._currentFrame = 0;
            this._totalTime = this._defaultFrameDuration * numFrames;
            this._textures = textures.concat();
            this._sounds = new Array(numFrames);
            this._durations = new Array(numFrames);
            this._startTimes = new Array(numFrames);

            for(var i:number = 0; i < numFrames; ++i) {
                this._durations[i] = this._defaultFrameDuration;
                this._startTimes[i] = i * this._defaultFrameDuration;
            }
        }

// frame manipulation

        /** Adds an additional frame, optionally with a sound and a custom duration. If the
         *  duration is omitted, the default framerate is used (as specified in the constructor). */
        public addFrame(texture:Texture, sound:any /*media.Sound*/ = null, duration:number = -1):void {
            this.addFrameAt(this.numFrames, texture, sound, duration);
        }

        /** Adds a frame at a certain index, optionally with a sound and a custom duration. */
        public addFrameAt(frameID:number, texture:Texture, sound:any /*media.Sound*/= null, duration:number = -1):void {
            if(frameID < 0 || frameID > this.numFrames)
                throw new ArgumentError("Invalid frame id");

            if(duration < 0)
                duration = this._defaultFrameDuration;

            this._textures.splice(frameID, 0, texture);
            this._sounds.splice(frameID, 0, sound);
            this._durations.splice(frameID, 0, duration);
            this._totalTime += duration;

            if(frameID > 0 && frameID == this.numFrames)
                this._startTimes[frameID] = this._startTimes[frameID - 1] + this._durations[frameID - 1];
            else
                this.updateStartTimes();
        }

        /** Removes the frame at a certain ID. The successors will move down. */
        public removeFrameAt(frameID:number):void {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");
            if(this.numFrames == 1)
                throw new IllegalOperationError("Movie clip must not be empty");

            this._totalTime -= this.getFrameDuration(frameID);
            this._textures.splice(frameID, 1);
            this._sounds.splice(frameID, 1);
            this._durations.splice(frameID, 1);

            this.updateStartTimes();
        }

        /** Returns the texture of a certain frame. */
        public getFrameTexture(frameID:number):Texture {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");

            return this._textures[frameID];
        }

        /** Sets the texture of a certain frame. */
        public setFrameTexture(frameID:number, texture:Texture):void {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");

            this._textures[frameID] = texture;
        }

        /** Returns the sound of a certain frame. */
        public getFrameSound(frameID:number):any {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");

            return this._sounds[frameID];
        }

        /** Sets the sound of a certain frame. The sound will be played whenever the frame
         *  is displayed. */
        public setFrameSound(frameID:number, sound:any/*media.Sound*/):void {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");

            this._sounds[frameID] = sound;
        }

        /** Returns the duration of a certain frame (in seconds). */
        public getFrameDuration(frameID:number):number {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");

            return this._durations[frameID];
        }

        /** Sets the duration of a certain frame (in seconds). */
        public setFrameDuration(frameID:number, duration:number):void {
            if(frameID < 0 || frameID >= this.numFrames)
                throw new ArgumentError("Invalid frame id");

            this._totalTime -= this.getFrameDuration(frameID);
            this._totalTime += duration;
            this._durations[frameID] = duration;
            this.updateStartTimes();
        }

// playback methods

        /** Starts playback. Beware that the clip has to be added to a juggler, too! */
        public play():void {
            this._playing = true;
        }

        /** Pauses playback. */
        public pause():void {
            this._playing = false;
        }

        /** Stops playback, resetting "currentFrame" to zero. */
        public stop():void {
            this._playing = false;
            this.currentFrame = 0;
        }

// helpers

        private updateStartTimes():void {
            var numFrames:number = this.numFrames;

            this._startTimes.length = 0;
            this._startTimes[0] = 0;

            for(var i:number = 1; i < numFrames; ++i)
                this._startTimes[i] = this._startTimes[i - 1] + this._durations[i - 1];
        }

// IAnimatable

        /** @inheritDoc */
        public advanceTime(passedTime:number):void {
            var finalFrame:number;
            var previousFrame:number = this._currentFrame;
            var restTime:number = 0.0;
            var breakAfterFrame:boolean = false;

            if(this._loop && this._currentTime == this._totalTime) {
                this._currentTime = 0.0;
                this._currentFrame = 0;
            }

            if(this._playing && passedTime > 0.0 && this._currentTime < this._totalTime) {
                this._currentTime += passedTime;
                finalFrame = this._textures.length - 1;

                while(this._currentTime >= this._startTimes[this._currentFrame] + this._durations[this._currentFrame]) {
                    if(this._currentFrame == finalFrame) {
                        if(this.hasEventListener(Event.COMPLETE)) {
                            if(this._currentFrame != previousFrame)
                                this.texture = this._textures[this._currentFrame];

                            restTime = this._currentTime - this._totalTime;
                            this._currentTime = this._totalTime;
                            this.dispatchEventWith(Event.COMPLETE);
                            breakAfterFrame = true;
                        }

                        if(this._loop) {
                            this._currentTime -= this._totalTime;
                            this._currentFrame = 0;
                        }
                        else {
                            this._currentTime = this._totalTime;
                            breakAfterFrame = true;
                        }
                    }
                    else {
                        this._currentFrame++;
                    }

                    var sound:media.Sound = this._sounds[this._currentFrame];
                    if(sound) sound.play();
                    if(breakAfterFrame) break;
                }
            }

            if(this._currentFrame != previousFrame)
                this.texture = this._textures[this._currentFrame];

            if(restTime)
                this.advanceTime(restTime);
        }

        /** Indicates if a (non-looping) movie has come to its end. */
        public get isComplete():boolean {
            return !this._loop && this._currentTime >= this._totalTime;
        }

// properties

        /** The total duration of the clip in seconds. */
        public get totalTime():number {
            return this._totalTime;
        }

        /** The total number of frames. */
        public get numFrames():number {
            return this._textures.length;
        }

        /** Indicates if the clip should loop. */
        public get loop():boolean {
            return this._loop;
        }

        public set loop(value:boolean) {
            this._loop = value;
        }

        /** The index of the frame that is currently displayed. */
        public get currentFrame():number {
            return this._currentFrame;
        }

        public set currentFrame(value:number) {
            this._currentFrame = value;
            this._currentTime = 0.0;

            for(var i:number = 0; i < value; ++i)
                this._currentTime += this.getFrameDuration(i);

            this.texture = this._textures[this._currentFrame];
            if(this._sounds[this._currentFrame])
                this._sounds[this._currentFrame].play();
        }

        /** The default number of frames per second. Individual frames can have different
         *  durations. If you change the fps, the durations of all frames will be scaled
         *  relatively to the previous value. */
        public get fps():number {
            return 1.0 / this._defaultFrameDuration;
        }

        public set fps(value:number) {
            if(value <= 0)
                throw new ArgumentError("Invalid fps: " + value);

            var newFrameDuration:number = 1.0 / value;
            var acceleration:number = newFrameDuration / this._defaultFrameDuration;
            this._currentTime *= acceleration;
            this._defaultFrameDuration = newFrameDuration;

            for(var i:number = 0; i < this.numFrames; ++i) {
                var duration:number = this._durations[i] * acceleration;
                this._totalTime = this._totalTime - this._durations[i] + duration;
                this._durations[i] = duration;
            }

            this.updateStartTimes();
        }

        /** Indicates if the clip is still playing. Returns <code>false</code> when the end
         *  is reached. */
        public get isPlaying():boolean {
            if(this._playing)
                return this._loop || this._currentTime < this._totalTime;
            else
                return false;
        }
    }
}
