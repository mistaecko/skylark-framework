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

    /** An EnterFrameEvent is triggered once per frame and is dispatched to all objects in the
     *  display tree.
     *
     *  It contains information about the time that has passed since the last frame. That way, you
     *  can easily make animations that are independent of the frame rate, taking the passed time
     *  into account.
     */
    export class EnterFrameEvent extends /*IntelliJ*/skylark.Event {

        /** Event type for a display object that is entering a new frame. */
        public static ENTER_FRAME:string = "enterFrame";

        /** Creates an enter frame event with the passed time. */
        constructor(type:string, passedTime:number, bubbles:boolean = false) {
            super(type, bubbles, passedTime);
        }

        /** The time that has passed since the last frame (in seconds). */
        public get passedTime():number {
            return <number>this.data;
        }
    }
}
