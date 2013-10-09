/// <reference path="../Game.ts"/>

module demo {

    export class TextureScene extends demo.Scene {
        constructor() {
            super();

            // the flight textures are actually loaded from an atlas texture.
            // the "AssetManager" class wraps it away for us.

            var image1:skylark.Image = new skylark.Image(Game.assets.getTexture("flight_00"));
            image1.x = -20;
            image1.y = 0;
            this.addChild(image1);

            var image2:skylark.Image = new skylark.Image(Game.assets.getTexture("flight_04"));
            image2.x = 90;
            image2.y = 85;
            this.addChild(image2);

            var image3:skylark.Image = new skylark.Image(Game.assets.getTexture("flight_08"));
            image3.x = 100;
            image3.y = -60;
            this.addChild(image3);

//            try {
//                // display a compressed texture
//                var compressedTexture:skylark.Texture = Game.assets.getTexture("compressed_texture");
//                var image:skylark.Image = new skylark.Image(compressedTexture);
//                image.x = Constants.CenterX - image.width / 2;
//                image.y = 280;
//                this.addChild(image);
//            }
//            catch (e) {
//                // if it fails, it's probably not supported
//                var textField:skylark.TextField = new skylark.TextField(220, 128,
//                    "Update to Flash Player 11.4 or AIR 3.4 (swf-version=17) to see a compressed " +
//                        "ATF texture instead of this boring text.", "Verdana", 14);
//                textField.x = Constants.CenterX - textField.width / 2;
//                textField.y = 280;
//                this.addChild(textField);
//            }
        }
    }
}