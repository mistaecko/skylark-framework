/// <reference path="../Game.ts"/>

module demo {
    export class TextScene extends demo.Scene {
        constructor() {
            super();
            this.init();
        }

        private init():void {
            // TrueType fonts

            var offset:number = 10;
            var ttFont:string = "Ubuntu";
            var ttFontSize:number = 19;

            var colorTF:skylark.TextField = new skylark.TextField(300, 80,
                "TextFields can have a border and a color. They can be aligned in different ways, ...",
                ttFont, ttFontSize);
            colorTF.x = colorTF.y = offset;
            colorTF.border = true;
            colorTF.color = 0x333399;
            this.addChild(colorTF);

            var leftTF:skylark.TextField = new skylark.TextField(145, 80,
                "... e.g.\ntop-left ...", ttFont, ttFontSize);
            leftTF.x = offset;
            leftTF.y = colorTF.y + colorTF.height + offset;
            leftTF.hAlign = skylark.HAlign.LEFT;
            leftTF.vAlign = skylark.VAlign.TOP;
            leftTF.border = true;
            leftTF.color = 0x993333;
            this.addChild(leftTF);

            var rightTF:skylark.TextField = new skylark.TextField(145, 80,
                "... or\nbottom right ...", ttFont, ttFontSize);
            rightTF.x = 2 * offset + leftTF.width;
            rightTF.y = leftTF.y;
            rightTF.hAlign = skylark.HAlign.RIGHT;
            rightTF.vAlign = skylark.VAlign.BOTTOM;
            rightTF.color = 0x228822;
            rightTF.border = true;
            this.addChild(rightTF);

            var fontTF:skylark.TextField = new skylark.TextField(300, 80,
                "... or centered. Embedded fonts are detected automatically.",
                ttFont, ttFontSize, 0x0, true);
            fontTF.x = offset;
            fontTF.y = leftTF.y + leftTF.height + offset;
            fontTF.border = true;
            this.addChild(fontTF);

            // Bitmap fonts!

            // First, you will need to create a bitmap font texture.
            //
            // E.g. with this tool: www.angelcode.com/products/bmfont/ or one that uses the same
            // data format. Export the font <an>data XML file, and the <a>texture png with white
            // characters on a transparent background (32 bit).
            //
            // Then, you just have to register the font at the TextField class.    
            // Look at the file "Assets.as" to see how this is done.
            // After that, you can use them just like a conventional TrueType font.

            var bmpFontTF:skylark.TextField = new skylark.TextField(300, 150,
                "It is very easy to use Bitmap fonts,\nas well!", "Desyrel");

            bmpFontTF.fontSize = skylark.BitmapFont.NATIVE_SIZE; // the native bitmap font size, no scaling
            bmpFontTF.color = skylark.Color.WHITE; // use white to use the <it>texture is (no tinting)
            bmpFontTF.x = offset;
            bmpFontTF.y = fontTF.y + fontTF.height + offset;
            this.addChild(bmpFontTF);

            // A tip: you can add the font-texture to your standard texture atlas and reference 
            // it from there. That way, you save texture space and avoid another texture-switch.
        }
    }
}