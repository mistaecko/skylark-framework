// =================================================================================================
//
//	Skylark Framework
//	Copyright 2012 Gamua OG. All Rights Reserved.
//
//	This program is free software. You can redistribute and/or modify it
//	in accordance with the terms of the accompanying license agreement.
//
// =================================================================================================
/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('PxLoaderAssetManager', function() {

    var url1 = "/test/resources/texture-atlas-01.xml";
    var xml1:string =
        "<TextureAtlas imagePath='texture-atlas-01-base.png'> <SubTexture name='ann' x='0' y='0' width='55.5' height='16' /> <SubTexture name='bob' x='16' y='32' width='16' height='32' /> </TextureAtlas>";

    var url2 = "/test/resources/airborne.png";
    var url3 = "/test/resources/texture-atlas-01-base.png";

    var am;

    beforeEach(function() {
        am = new skylark.PxLoaderAssetManager(1);
    });

    describe('image', function() {

        it('"getType()" should return "image"', function() {
            expect(am.getType(url2)).to.eql('image');
        });

        it('should enqueue a "png" url', function() {
            var loader = am.getLoader(); // create and fetch
            var spy = sinon.spy(loader, 'addImage');

            am.enqueue(url2);

            expect(spy).to.have.been.called;
        });

    });

    describe('loadQueue', function(done) {
        it('should report progress', function(done) {
            am.enqueue(url2);
            am.loadQueue(()=> done())
        });

        it('should report completion', function(done) {
            am.enqueue(url2);
            am.loadQueue((ratio, complete)=> {
                if(complete)
                    done();
            })
        });

        it('should report a ratio of "1" only once when "complete"', function(done) {
            am.enqueue(url3);
            am.enqueue(url1);

            var count = 0;
            am.loadQueue((ratio, complete)=> {
                if(ratio === 1 && !complete)
                    assert.fail(complete, false, 'Expected "complete" to be "true" when "ratio" is "1"');
                if(complete)
                    count++;
            });

            setTimeout(()=> {
                expect(count).to.eql(1);
                done();
            }, 200);
        });

        it('should add a loaded image as texture', function(done) {
            var spy = sinon.spy(am, 'addTexture');

            am.enqueue(url2);
            am.loadQueue((ratio, complete) => {
                if(complete) {
                    expect(spy).to.have.been.called;
                    expect(spy).to.have.been.calledWith('airborne', sinon.match.any);
                    var texture = spy.getCall(0).args[1];
                    expect(texture.base).to.exist;
                    expect(texture.base.image).to.exist;
                    done();
                }
            });
        });

    });

    describe('xml', function() {

        describe('PxLoaderXml', function() {
            var server;
            var loader;

            beforeEach(function() {
                loader = new PxLoader();
            });

            if(!isBrowser) {
                beforeEach(function() {
                    server = sinon.fakeServer.create();
                    server.autoRespond = true;
                    server.respondWith(
                        url1,
                        [200, { "Content-Type": "text/xml" }, xml1]
                    )
                });
                afterEach(function() {
                    if(server)
                        server.restore();
                });
            }

            it('should trigger the loader\'s onLoad function', function(done) {
                var xmlLoader = new skylark.PxLoaderXml(url1);
                loader.onLoad = function() { done(); }
                xmlLoader.start(loader);
            });

            it('should set the XML Document as "data" property', function(done) {
                var xmlLoader = new skylark.PxLoaderXml(url1);

                var loader = <PxLoader>{
                    onLoad: function(item:skylark.PxLoaderXml) {
                        expect(item.complete).to.be['true'];
                        expect(item.getXml()).to.exist;
                        expect(item.getXml()).to.be.an.instanceof(Document);
                        expect(item.getXml().getElementsByTagName('SubTexture').length).to.eql(2);
                        done();
                    }
                };
                xmlLoader.start(loader);
            });

            it('should correctly determine the root node name', function(done) {
                var xmlLoader = new skylark.PxLoaderXml(url1);

                var loader = <PxLoader>({
                    onLoad: function(item:skylark.PxLoaderXml) {
                        expect(item.rootNode).to.exist;
                        expect(item.rootNode.nodeName).to.eql('TextureAtlas');
                        done();
                    }
                });
                xmlLoader.start(loader);
            });

        });

        it('"getType()" should return "xml"', function() {
            expect(am.getType(url1)).to.eql('xml');
        });

        it('should enqueue an "xml" url', function() {
            var loader = am.getLoader(); // create and fetch
            var spy = sinon.spy(loader, 'addXml');

            am.enqueue(url1);

            expect(spy).to.have.been.called;
        });

        describe('TextureAtlas', function() {
            it('should add a TextureAtlas', function(done) {
                // image that provides the base texture
                am.addTexture('texture-atlas-01-base', new skylark.ConcreteTexture(1,1));

                var spy = sinon.spy(am, 'addTextureAtlas');

                am.enqueue(url1);
                am.loadQueue((ratio, complete) => {
                    if(complete) {
                        expect(spy).to.have.been.called;
                        expect(spy).to.have.been.calledWith('texture-atlas-01-base', sinon.match.any);
                        done();
                    }
                });
            });

            it('should remove the texture entry for the TextureAtlas base texture', function(done) {
                // image that provides the base texture
                am.addTexture('texture-atlas-01-base', new skylark.ConcreteTexture(1,1));

                var spy = sinon.spy(am, 'removeTexture');

                am.enqueue(url1);
                am.loadQueue((ratio, complete) => {
                    if(complete) {
                        expect(spy).to.have.been.called;
                        expect(spy).to.have.been.calledWith('texture-atlas-01-base');
                        done();
                    }
                });
            });

            it('should delay processing of TextureAtlas if base texture is still loading', function(done) {
                var server = sinon.fakeServer.create();
                server.autoRespond = false;

                var addTextureSpy = sinon.spy(am, 'addTexture');
                var addTextureAtlasSpy = sinon.spy(am, 'addTextureAtlas');

                var resource;

                // stub PxLoader#addImage so we have full control over when it completes loading
                (<any>PxLoader).prototype.addImage = function(url, tags, priority) {
                    resource = new PxLoaderImage(url, tags, priority);
                    var loader;

                    this.add(resource);
                    resource.start = function(ldr) {
                        loader = ldr;
                    }
                    resource.triggerComplete = function() {
                        // fake image properties (since we never respond to the actual url request)
                        var img = this.img;
                        img.complete = true;
                        img.width = 256;
                        img.height = 512;

                        loader.onLoad(this);
                    }
                    return resource.img;
                }

                am.enqueue(url3); // texture
                am.enqueue(url1); // texture atlas
                am.loadQueue((ratio, complete) => {
                    if(complete) {
                        expect(addTextureSpy).to.have.been.called;
                        expect(addTextureAtlasSpy).to.have.been.called;
                        expect(addTextureSpy).to.have.been.calledBefore(addTextureAtlasSpy);
                        done();
                    }
                });

                // first complete loading of xml...
                server.requests[0].respond(200, { "Content-Type": "text/xml" }, xml1);
                // ...then the image
                resource.triggerComplete();

                server.restore();
            });
        });
    });

});

//var mock = sinon.mock(loader);
//mock.expects('onLoad').once();//.withArgs('stage').returns(new stubs.MHTMLCanvasElement());
//            setTimeout(function() {
//                mock.verify();
//                mock.restore();
//                done();
//            }, 1000)
