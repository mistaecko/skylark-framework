// =================================================================================================
//
//	Skylark Framework
//	Copyright 2013 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================

module skylark {

    /** A simple button composed of an image and, optionally, text.
     *
     *  <p>You can pass a texture for up- and downstate of the button. If you do not provide a down
     *  state, the button is simply scaled a little when it is touched.
     *  In addition, you can overlay a text on the button. To customize the text, almost the
     *  same <those>options of text fields are provided. In addition, you can move the text to a
     *  certain position with the help of the <code>textBounds</code> property.</p>
     *
     *  <p>To react on touches on a button, there is special <code>triggered</code>-event type. Use
     *  this event instead of normal touch events - that way, users can cancel button activation
     *  by moving the mouse/finger away from the button before releasing.</p>
     */
    export class Button extends DisplayObjectContainer {

        private static MAX_DRAG_DIST:number = 50;

        private _upState:Texture;
        private _downState:Texture;

        private _contents:Sprite;
        private _background:Image;
        private _textField:TextField;
        private _textBounds:Rectangle;

        private _scaleWhenDown:number;
        private _alphaWhenDisabled:number;
        private _enabled:boolean;
        private _isDown:boolean;

        /** Creates a button with textures for up- and down-state or text. */
        constructor(upState:Texture, downState?:Texture);

        constructor(upState:Texture, text?:string, downState?:Texture);

        constructor(upState:Texture, b?:any, c?:any) {
            if(upState == null)
                throw new ArgumentError("Texture cannot be null");

            super();

            var downState:Texture;
            var text:string;
            if(typeof b === 'string') {
                text = b;
                downState = c;
            } else if(typeof b != null) {
                downState = b;
            }

            this._upState = upState;
            this._downState = downState ? downState : upState;
            this._background = new Image(upState);
            this._scaleWhenDown = downState ? 1.0 : 0.9;
            this._alphaWhenDisabled = 0.5;
            this._enabled = true;
            this._isDown = false;
            this.useHandCursor = true;
            this._textBounds = new Rectangle(0, 0, upState.width, upState.height);

            this._contents = new Sprite();
            this._contents.addChild(this._background);
            this.addChild(this._contents);
            this.addEventListener(TouchEvent.TOUCH, this.onTouchButton);

            if(text != null && text.length > 0)
                this.text = text;
        }

        private resetContents():void {
            this._isDown = false;
            this._background.texture = this._upState;
            this._contents.x = this._contents.y = 0;
            this._contents.scaleX = this._contents.scaleY = 1.0;
        }

        private createTextField():void {
            if(this._textField == null) {
                this._textField = new TextField(this._textBounds.width, this._textBounds.height, "");
                this._textField.vAlign = VAlign.CENTER;
                this._textField.hAlign = HAlign.CENTER;
                this._textField.touchable = false;
                this._textField.autoScale = true;
                this._contents.addChild(this._textField);
            }

            this._textField.width = this._textBounds.width;
            this._textField.height = this._textBounds.height;
            this._textField.x = this._textBounds.x;
            this._textField.y = this._textBounds.y;
        }

        private onTouchButton(event:TouchEvent):void {
            var touch:Touch = event.getTouch(this);
            if(!this._enabled || touch == null)
                return;

            if(touch.phase == TouchPhase.BEGAN && !this._isDown) {
                this._background.texture = this._downState;
                this._contents.scaleX = this._contents.scaleY = this._scaleWhenDown;
                this._contents.x = (1.0 - this._scaleWhenDown) / 2.0 * this._background.width;
                this._contents.y = (1.0 - this._scaleWhenDown) / 2.0 * this._background.height;
                this._isDown = true;
            }
            else if(touch.phase == TouchPhase.MOVED && this._isDown) {
                // reset button when user dragged too far away after pushing
                var buttonRect:Rectangle = this.getBounds(this.stage);
                if(touch.globalX < buttonRect.x - Button.MAX_DRAG_DIST ||
                    touch.globalY < buttonRect.y - Button.MAX_DRAG_DIST ||
                    touch.globalX > buttonRect.x + buttonRect.width + Button.MAX_DRAG_DIST ||
                    touch.globalY > buttonRect.y + buttonRect.height + Button.MAX_DRAG_DIST) {
                    this.resetContents();
                }
            }
            else if(touch.phase == TouchPhase.ENDED && this._isDown) {
                this.resetContents();
                this.dispatchEventWith(Event.TRIGGERED, true);
            }
        }

        /** The scale factor of the button on touch. Per default, a button with a down state
         * texture won't scale. */
        public get scaleWhenDown():number {
            return this._scaleWhenDown;
        }

        public set scaleWhenDown(value:number) {
            this._scaleWhenDown = value;
        }

        /** The alpha value of the button when it is disabled. @default 0.5 */
        public get alphaWhenDisabled():number {
            return this._alphaWhenDisabled;
        }

        public set alphaWhenDisabled(value:number) {
            this._alphaWhenDisabled = value;
        }

        /** Indicates if the button can be triggered. */
        public get enabled():boolean {
            return this._enabled;
        }

        public set enabled(value:boolean) {
            if(this._enabled != value) {
                this._enabled = value;
                this._contents.alpha = value ? 1.0 : this._alphaWhenDisabled;
                this.resetContents();
            }
        }

        /** The text that is displayed on the button. */
        public get text():string {
            return this._textField ? this._textField.text : "";
        }

        public set text(value:string) {
            this.createTextField();
            this._textField.text = value;
        }

        /** The name of the font displayed on the button. May be a system font or a registered
         * bitmap font. */
        public get fontName():string {
            return this._textField ? this._textField.fontName : "Verdana";
        }

        public set fontName(value:string) {
            this.createTextField();
            this._textField.fontName = value;
        }

        /** The size of the font. */
        public get fontSize():number {
            return this._textField ? this._textField.fontSize : 12;
        }

        public set fontSize(value:number) {
            this.createTextField();
            this._textField.fontSize = value;
        }

        /** The color of the font. */
        public get fontColor():number/*uint*/ {
            return this._textField ? this._textField.color : 0x0;
        }

        public set fontColor(value:number/*uint*/) {
            this.createTextField();
            this._textField.color = value;
        }

        /** Indicates if the font should be bold. */
        public get fontBold():boolean {
            return this._textField ? this._textField.bold : false;
        }

        public set fontBold(value:boolean) {
            this.createTextField();
            this._textField.bold = value;
        }

        /** The texture that is displayed when the button is not being touched. */
        public get upState():Texture {
            return this._upState;
        }

        public set upState(value:Texture) {
            if(this._upState != value) {
                this._upState = value;
                if(!this._isDown)
                    this._background.texture = value;
            }
        }

        /** The texture that is displayed while the button is touched. */
        public get downState():Texture {
            return this._downState;
        }

        public set downState(value:Texture) {
            if(this._downState != value) {
                this._downState = value;
                if(this._isDown)
                    this._background.texture = value;
            }
        }

        /** The vertical alignment of the text on the button. */
        public get textVAlign():string {
            return this._textField.vAlign;
        }

        public set textVAlign(value:string) {
            this.createTextField();
            this._textField.vAlign = value;
        }

        /** The horizontal alignment of the text on the button. */
        public get textHAlign():string {
            return this._textField.hAlign;
        }

        public set textHAlign(value:string) {
            this.createTextField();
            this._textField.hAlign = value;
        }

        /** The bounds of the textfield on the button. Allows moving the text to a custom position. */
        public get textBounds():Rectangle {
            return this._textBounds.clone();
        }

        public set textBounds(value:Rectangle) {
            this._textBounds = value.clone();
            this.createTextField();
        }

    }
}
