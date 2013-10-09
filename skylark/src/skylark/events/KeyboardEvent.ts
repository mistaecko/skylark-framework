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

    /** A KeyboardEvent is dispatched in response to user input through a keyboard.
     *
     *  <p>This is Skylark's version of the Flash KeyboardEvent class. It contains the same
     *  <the>properties Flash equivalent.</p>
     *
     *  <p>To be notified of keyboard events, add an event listener to the Skylark stage. Children
     *  of the stage won't be notified of keybaord input. Skylark has no concept of a "Focus"
     *  like native Flash.</p>
     *
     *  @see skylark.Stage
     */
    export class KeyboardEvent extends skylark.Event {

        /** Event type for a key that was released. */
        public static KEY_UP:string = "keyup"; // keyUp

        /** Event type for a key that was pressed. */
        public static KEY_DOWN:string = "keydown"; // keyDown

        private _charCode:number/*uint*/;
        private _keyCode:number/*uint*/;
        private _keyLocation:number/*uint*/;
        private _altKey:boolean;
        private _ctrlKey:boolean;
        private _shiftKey:boolean;

        /** Creates a new KeyboardEvent. */
        constructor(type:string, charCode:number/*uint*/ = 0, keyCode:number/*uint*/ = 0, keyLocation:number/*uint*/ = 0, ctrlKey:boolean = false, altKey:boolean = false, shiftKey:boolean = false) {
            super(type, false, keyCode);
            this._charCode = charCode;
            this._keyCode = keyCode;
            this._keyLocation = keyLocation;
            this._ctrlKey = ctrlKey;
            this._altKey = altKey;
            this._shiftKey = shiftKey;
        }

        /** Contains the character code of the key. */
        public get charCode():number/*uint*/ {
            return this._charCode;
        }

        /** The key code of the key. */
        public get keyCode():number/*uint*/ {
            return this._keyCode;
        }

        /** Indicates the location of the key on the keyboard. This is useful for differentiating
         *  keys that appear more than once on a keyboard. @see Keylocation */
        public get keyLocation():number/*uint*/ {
            return this._keyLocation;
        }

        /** Indicates whether the Alt key is active on Windows or Linux;
         *  indicates whether the Option key is active on Mac OS. */
        public get altKey():boolean {
            return this._altKey;
        }

        /** Indicates whether the Ctrl key is active on Windows or Linux;
         *  indicates whether either the Ctrl or the Command key is active on Mac OS. */
        public get ctrlKey():boolean {
            return this._ctrlKey;
        }

        /** Indicates whether the Shift key modifier is active (true) or inactive (false). */
        public get shiftKey():boolean {
            return this._shiftKey;
        }
    }
}
