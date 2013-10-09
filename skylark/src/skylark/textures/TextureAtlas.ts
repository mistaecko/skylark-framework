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

    /** A texture atlas is a collection of many smaller textures in one big image. This class
     *  is used to access textures from such an atlas.
     *
     *  <p>Using a texture atlas for your textures solves two problems:</p>
     *
     *  <ul>
     *    <li>There is always one texture active at a given moment. Whenever you change the active
     *        texture, a "texture-switch" has to be executed, and that switch takes time.</li>
     *    <li>Any Stage3D texture has to have side lengths that are powers of two. Skylark hides
     *        this limitation from you, but at the cost of additional graphics memory.</li>
     *  </ul>
     *
     *  <p>By using a texture atlas, you avoid both texture switches and the power-of-two
     *  limitation. All textures are within one big "super-texture", and Skylark takes care that
     *  the correct part of this texture is displayed.</p>
     *
     *  <p>There are several ways to create a texture atlas. One is to use the atlas generator
     *  script that is bundled with Skylark's sibling, the <a href="http://www.sparrow-framework.org">
     *  Sparrow framework</a>. It was only tested in Mac OS X, though. A great multi-platform
     *  alternative is the commercial tool <a href="http://www.texturepacker.com">
     *  Texture Packer</a>.</p>
     *
     *  <p>Whatever tool you use, Skylark expects the following file format:</p>
     *
     *  <listing>
     *    &lt;TextureAtlas imagePath='atlas.png'&gt;
     *      &lt;SubTexture name='texture_1' x='0'  y='0' width='50' height='50'/&gt;
     *      &lt;SubTexture name='texture_2' x='50' y='0' width='20' height='30'/&gt;
     *    &lt;/TextureAtlas&gt;
     *  </listing>
     *
     *  <p>If your images have transparent areas at their edges, you can make use of the
     *  <code>frame</code> property of the Texture class. Trim the texture by removing the
     *  transparent edges and specify the original texture size like this:</p>
     *
     *  <listing>
     *    &lt;SubTexture name='trimmed' x='0' y='0' height='10' width='10'
     *        frameX='-10' frameY='-10' frameWidth='30' frameHeight='30'/&gt;
     *  </listing>
     */
    export class TextureAtlas {

        private _atlasTexture:Texture;
        private _textureRegions:Dictionary;
        private _textureFrames:Dictionary;

        /** helper objects */
        private _names:string[] = [];

        /** Create a texture atlas from a texture by parsing the regions from an XML file. */
        constructor(texture:Texture, atlasXml?:Document);

        constructor(texture:Texture, atlasXml?:string);

        constructor(texture:Texture, atlasXml:any = null) {
            this._textureRegions = <Dictionary>{};
            this._textureFrames = <Dictionary>{};
            this._atlasTexture = texture;

            if(typeof atlasXml === 'string')
                atlasXml = (/*IntelliJ*/<any>StringUtil).parseXml(atlasXml);

            if(atlasXml != null)
                this.parseAtlasXml(atlasXml);
        }

        /** Disposes the atlas texture. */
        public dispose():void {
            this._atlasTexture.dispose();
        }

        /** This is called by the constructor and will parse an XML in Skylark's
         *  default atlas file format. Override this method to create custom parsing logic
         *  (e.g. to support a different file format). */
        public parseAtlasXml(xml:Document):void {
            var scale:number = this._atlasTexture.scale;

            function getFirstChild(node:Node, tagName:string):Node {
                var children = node.childNodes;
                for(var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if(child.nodeName === tagName)
                        return child;
                }
            }

            // note: getElementsByTagName returns all matching nodes in the document, not only direct children
            //  While this *might* cause strange results on incorrectly formatted XML input, it is just not
            //  worth the effort to code a more restrictive parser.
            var textures = xml.getElementsByTagName('SubTexture');
            for(var i = 0; i < textures.length; i++) {
                var subTexture:any = textures[i];

                var name:string = subTexture.getAttribute("name");
                var x:number = parseFloat(subTexture.getAttribute("x")) / scale;
                var y:number = parseFloat(subTexture.getAttribute("y")) / scale;
                var width:number = parseFloat(subTexture.getAttribute("width")) / scale;
                var height:number = parseFloat(subTexture.getAttribute("height")) / scale;
                var frameX:number = parseFloat(subTexture.getAttribute("frameX")) / scale;
                var frameY:number = parseFloat(subTexture.getAttribute("frameY")) / scale;
                var frameWidth:number = parseFloat(subTexture.getAttribute("frameWidth")) / scale;
                var frameHeight:number = parseFloat(subTexture.getAttribute("frameHeight")) / scale;

                var region:Rectangle = new Rectangle(x, y, width, height);
                var frame:Rectangle = frameWidth > 0 && frameHeight > 0 ?
                    new Rectangle(frameX, frameY, frameWidth, frameHeight) : null;

                this.addRegion(name, region, frame);
            }
        }

        /** Retrieves a subtexture by name. Returns <code>null</code> if it is not found. */
        public getTexture(name:string):Texture {
            var region:Rectangle = this._textureRegions[name];

            if(region == null)
                return null;
            else
                return (</*IntelliJ*/any>Texture).fromTexture(this._atlasTexture, region, this._textureFrames[name]);
        }

        /** Returns all textures that start with a certain string, sorted alphabetically
         *  (especially useful for "MovieClip"). */
        public getTextures(prefix:string = "", result:Texture[] = null):Texture[] {
            if(result == null)
                result = [];

            var names = this.getNames(prefix, this._names);
            for(var i = 0; i < names.length; i++)
                result.push(this.getTexture(names[i]));

            this._names.length = 0;
            return result;
        }

        /** Returns all texture names that start with a certain string, sorted alphabetically. */
        public getNames(prefix:string = "", result:string[] = null):string[] {
            if(result == null) result = [/*String*/];

            for(var name in this._textureRegions)
                if(name.indexOf(prefix) === 0)
                    result.push(name);

            (/*IntelliJ*/<any>StringUtil).sortArray(result);

            return result;
        }

        /** Returns the region rectangle associated with a specific name. */
        public getRegion(name:string):Rectangle {
            return this._textureRegions[name];
        }

        /** Returns the frame rectangle of a specific region, or <code>null</code> if that region
         *  has no frame. */
        public getFrame(name:string):Rectangle {
            return this._textureFrames[name];
        }

        /** Adds a named region for a subtexture (described by rectangle with coordinates in
         *  pixels) with an optional frame. */
        public addRegion(name:string, region:Rectangle, frame:Rectangle = null):void {
            this._textureRegions[name] = region;
            this._textureFrames[name] = frame;
        }

        /** Removes a region with a certain name. */
        public removeRegion(name:string):void {
            delete this._textureRegions[name];
            delete this._textureFrames[name];
        }
    }
}
