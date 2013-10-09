var As2ts = require('../lib/as2ts');
var FakeFs = require('fake-fs');

describe('as2ts', function () {

    var skip =  {
        itShould: function(descr, input, expected) {
            return itShould(descr, input, expected, true);
        },
        itShouldT: function(descr, input, expected) {
            return itShouldT(descr, input, expected, true);
        }
    };

    function itShould(descr, input, expected, skip) {
        var fn = skip === true ? it.skip : it;
        fn(descr, function() {
            var result = As2ts.convertStr(input, 'DisplayObject', 'display');
            result.should.equal(expected);
        });
    }
    itShould.skip = skip.itShould;

    // for test classes
    function itShouldT(descr, input, expected, skip) {
        var fn = skip === true ? it.skip : it;
        fn(descr, function() {
            var result = As2ts.convertStr(input, 'DisplayObjectTests', 'tests');
            result.should.equal(expected);
        });
    }
    itShouldT.skip = skip.itShouldT;

    describe('syntax fixes', function() {

        describe('misc', function() {
            itShould(
                ':int => :number',
                'for (var i:int=children.length-1; i>=0; --i)',
                'for (var i:number=children.length-1; i>=0; --i)'
            );

            itShould(
                'private var',
                'private var mChildren:string;',
                'private mChildren:string;'
            );

            itShould(
                'private static var',
                'private static var mChildren:string;',
                'private static mChildren:string;'
            );

            itShould(
                'public override function',
                'public override function dispose():void',
                'public dispose():void'
            );

            itShould(
                'internal function => private',
                'internal function invokeEvent(event:MyClass):void',
                'private invokeEvent(event:MyClass):void'
            );

            itShould(
                ':Vector.<Type> => Type[]',
                'broadcastListeners:Vector.<MyClass> = new <MyClass>[];',
                'broadcastListeners:MyClass[] = [/*MyClass*/];'
            );

            itShould(
                'should correctly convert a Number Vector',
                'private var mRawData:Vector.<Number>;',
                'private mRawData:number[];'
            );

            itShould(
                'myvar[i] as Function => <Function>myvar[i]',
                'listener:Function = listeners[i] as Function;',
                'listener:Function = <Function>listeners[i] /* IMPORTANT: AS3 returns NULL if type is not castable! */;'
            );

            itShould(
                'type casts',
                'var button:Button = event.target as Button;',
                'var button:Button = <Button>event.target /* IMPORTANT: AS3 returns NULL if type is not castable! */;'
            );

            itShould(
                'as Vector.<TYPE>>',
                'listeners:Vector.<Function> = eventListeners as Vector.<Function>',
                'listeners:Function[] = <Array/*Function*/>eventListeners'
            );

            itShould(
                'int casts',
                'x = Constants.CenterX - int(button.width / 2);',
                'x = Constants.CenterX - Math.abs(button.width / 2);'
            );

            itShould(
                'package => module',
                'package starling.display',
                'module display'
            );

            itShould(
                'for each => for loop',
                'for each (var touch:events.Touch in touches) {',
                "for(var i=0; i<touches.length; i++) {\nvar touch:events.Touch = touches[i];\n"
            );

            itShould(
                'remove imports',
                '{\nimport flash.geom.Matrix;\nimport flash.geom.Point;\n/**\n',
                '{\n\n\n/**\n'
            );

            itShould(
                'comment out "Event" annotations',
                '[Event(name="added", type="starling.events.Event")]',
                '//[Event(name="added", type="starling.events.Event")]'
            );

            describe('prefix member variable references with "this."', function() {
                itShould(
                    'this for members',
                    'mScaleX = mScaleY = mAlpha = 1.0;',
                    'this.mScaleX = this.mScaleY = this.mAlpha = 1.0;'
                );

                // not implemented
                skip.itShould(
                    'this for members (more)',
                    'var red:number = mRawData[offset] / divisor;',
                    'var red:number = this.mRawData[offset] / divisor;'
                );

                itShould(
                    'this for members (return)',
                    'return mTarget;',
                    'return this.mTarget;'
                );

                itShould(
                    'this for members (special cases)',
                    '++mCurrentQuadBatchID;\n--mCurrentQuadBatchID;',
                    '++this.mCurrentQuadBatchID;\n--this.mCurrentQuadBatchID;'
                );

                itShould(
                    'this for members (no leading space)',
                    '    if (mFilter) ',
                    '    if (this.mFilter) '
                );

                itShould(
                    'this for members (!)',
                    'if (forTouch && (!mVisible || !mTouchable)) return null;',
                    'if (forTouch && (!this.mVisible || !this.mTouchable)) return null;'
                );

                itShould(
                    'this for members (return)',
                    '  return mCurrentTime;',
                    '  return this.mCurrentTime;'
                );

                // allow the converter to run on an already converted file
                itShould(
                    'this (blacklist 1)',
                    'mVertexData:MyClass;',
                    'mVertexData:MyClass;'
                );


                itShould(
                    'this (blacklist 2)',
                    'private var mScale:number',
                    'private mScale:number'
                );

                itShould(
                    'this (blacklist 3)',
                    'var mFlattenedContents = this.mFlattenedContents;',
                    'var mFlattenedContents = this.mFlattenedContents;'
                );

                itShould(
                    'this (blacklist 4)',
                    'var sBroadcastListeners = DisplayObject.sBroadcastListeners;',
                    'var sBroadcastListeners = DisplayObject.sBroadcastListeners;'
                );

                itShould(
                    'don\'t prepend "this." in object method calls',
                    'currentObject = currentObject.mParent;',
                    'currentObject = currentObject.mParent;'
                );

            });

            describe('prefix static member variable references with "ClassName."', function() {
                itShould(
                    'static member variables',
                    'sAncestors.length = 0;',
                    'DisplayObject.sAncestors.length = 0;'
                );
                itShould(
                    'static member variables (special cases)',
                    '(-sPoint.y + 1)',
                    '(-DisplayObject.sPoint.y + 1)'
                );
                itShould(
                    'static member variables (2)',
                    'if (sBubbleChains.length > 0) {',
                    'if (DisplayObject.sBubbleChains.length > 0) {'
                );
            });

            describe('try/catch', function() {
                itShould(
                    'remove type annotation from catch variable',
                    '} catch (e:Error) {',
                    '} catch (e) {'
                )
            });

            itShould(
                'static functions',
                'static function toPool(a:string):void',
                'static toPool(a:string):void'
            );

            itShould(
                'remove "use namespace"',
                'use namespace starling_internal;',
                ''
            );

            itShould(
                'const',
                'public static const myvar;',
                'public static myvar;'
            );

            itShould(
                'public static function',
                'public static function skew(matrix:Matr, skewX:number, skewY:number):void',
                'public static skew(matrix:Matr, skewX:number, skewY:number):void'
            );

            itShould(
                'protected',
                'protected function get marginY():number { return this.mMarginY; }',
                'get marginY():number { return this.mMarginY; }'
            );

            itShould(
                'protected in class variable declarations',
                'protected var mVertexData:MyClass;',
                'mVertexData:MyClass;'
            );

            itShould(
                'class header',
                'public class EventDispatcher',
                'export class EventDispatcher'
            );

            itShould(
                'property setters',
                'public set useHandCursor(value:string):void',
                'public set useHandCursor(value:string)'
            );

            itShould(
                'Boolean => boolean',
                'public set useHandCursor(value:Boolean)',
                'public set useHandCursor(value:boolean)'
            );

            itShould(
                'ignore Boolean in names',
                'var myBoolean:any',
                'var myBoolean:any'
            );

            itShould(
                'name constructors correctly',
                'public DisplayObject() {}',
                'constructor() {}'
            );

            itShould(
                'anonymous functions',
                'Starling.juggler.delayCall(function():void { a++; }, 2.0);',
                'Starling.juggler.delayCall(()=> { a++; }, 2.0);'
            );

            // not implemented
            skip.itShould(
                'name constructors correctly',
                'public DisplayObject(a:string, b:string) {}',
                'constructor() {}'
            );
        });

        describe('remove [Test] annotations', function() {
            itShouldT(
                'standard',
                '        [Test]',
                '        //[Test]'
            );
            itShouldT(
                'with trailing spaces and newline',
                '   [Test]  \n',
                '   //[Test]  \n'
            );
            itShouldT(
                'with attributes',
                '   [Test(expects="RangeError")]  ',
                '   //[Test(expects="RangeError")]  '
            );
            itShouldT(
                'more than one',
                '   [Test]\n    [Test]\n',
                '   //[Test]\n    //[Test]\n'
            );
        });

        describe('prefix with module identifier on known classes', function() {
            itShould(
                'extends',
                'public class ConcreteTexture extends Texture',
                'export class ConcreteTexture extends textures.Texture'
            );

            itShould(
                'Context3D',
                'myvar:Context3D',
                'myvar:display3D.Context3D'
            );

            itShould(
                'Event',
                'child.dispatchEventWith(Event.ADDED, true);',
                'child.dispatchEventWith(events.Event.ADDED, true);'
            );

            itShould(
                'Event (2)',
                'child.dispatchEventWith(Event.ADDED, true);',
                'child.dispatchEventWith(events.Event.ADDED, true);'
            );

            itShould(
                'Bitmap',
                'myvar:Bitmap',
                'myvar:textures.Bitmap'
            );

            itShould(
                'Casts',
                'return <Event>this.base;',
                'return <events.Event>this.base;'
            );

            itShould(
                'Casts',
                'return <events.Event>this.base;',
                'return <events.Event>this.base;'
            );

            itShould(
                'class constants',
                'return Event.A_CONSTANT',
                'return events.Event.A_CONSTANT'
            );
            itShould(
                'class constants',
                'return events.Event.A_CONSTANT',
                'return events.Event.A_CONSTANT'
            );

            itShould(
                'excempt self references',
                // default class/file name for tests is DisplayObject
                'myvar:DisplayObject',
                'myvar:DisplayObject'
            );

            itShould(
                'excempt references to the same module/package',
                // default class/file name for tests is DisplayObject
                'myvar:Quad',
                'myvar:Quad'
            );

            itShould(
                'only compare whole names',
                'var m:TouchProcessor',
                'var m:core.TouchProcessor'
            )
        });

        describe('test classes', function() {
            itShouldT(
                'class',
                'public class DisplayObjectTests\n',
                'describe(\'DisplayObjectTests\', function()\n'
            );
            itShouldT(
                'convert test functions to BDD "it"',
                'public function testInit():void\n{\n',
                'it(\'Init\', function()\n{\n'
            );
            itShouldT(
                'convert test functions in CamelCase to BDD "it"',
                'public function testSomeThing():void\n{\n',
                'it(\'SomeThing\', function()\n{\n'
            );
            itShouldT(
                'convert more than one test functions BDD "it"',
                [
                    '[Test]' ,
                    'public testInit():void' ,
                    '{' ,
                    '    blabla' ,
                    '}' ,
                    '' ,
                    '[Test]' ,
                    'public testOther():void' ,
                    '{'
                ].join('\n'),
                [
                    '//[Test]' ,
                    'it(\'Init\', function()' ,
                    '{' ,
                    '    blabla' ,
                    '}' ,
                    '' ,
                    '//[Test]' ,
                    'it(\'Other\', function()' ,
                    '{'
                ].join('\n')
            );
            itShouldT(
                'assertNotNull',
                'Assert.assertNotNull(obj);',
                'assert.isNotNull(obj);'
            );
            itShouldT(
                'assertNull',
                'Assert.assertNull(obj);',
                'assert.isNull(obj);'
            );
            itShouldT(
                'assertEquals',
                'Assert.assertEquals(object1.base, object1);',
                'assert.equal(object1.base, object1);'
            );

            itShouldT(
                'assertEquals (standalone)',
                ' assertEquals(object1.base, object1);',
                ' assert.equal(object1.base, object1);'
            );

            itShouldT(
                'replace assert.assertThat(.., closeTo(..))',
                'assert.assertThat(tween.currentTime, closeTo(0.0, E));',
                'assert.closeTo(tween.currentTime, 0.0, E);'
            );
            itShouldT(
                'replace assertThat(.., closeTo(..))',
                'assertThat(tween.currentTime, closeTo(0.0, E));',
                'assert.closeTo(tween.currentTime, 0.0, E);'
            );
            itShouldT(
                'replace private function',
                'private function createVertexDataWithMovedTexCoords():string',
                'function createVertexDataWithMovedTexCoords():string'
            );
        });
        describe('combined tests', function() {
            itShould(
                'Point',
                'private static var sHelperPoint:Point = new Point();',
                'private static sHelperPoint:geom.Point = new geom.Point();'
            );
        });

    });

    describe('file handling', function() {

        function withMockedFs(fn) {
            var loadFile = mocks.loadFile;

            // stub nodejs' fs module
            var fs = new FakeFs();

            //sinon.stub(fs, 'writeFileSync');

            // manually load the file and retrieve the exported object
            var as2ts = loadFile(__dirname + '/../lib/as2ts.js', {
                fs: fs
            }).exports;

            var mock = sinon.mock(as2ts);

            fn(as2ts, mock, fs);

            mock.verify();
            mock.restore();
        }

        it('should detect a Test file based on the naming pattern', function() {
            withMockedFs(function(as2ts, mock, fs) {
                fs.file('/dir/mymodule/MyClassTests.ts', 'package tests { /* blabla */}');
                mock.expects('convertTestStr').once().withExactArgs('package tests { /* blabla */}', 'MyClassTests', 'tests');
                as2ts.convert('/dir/mymodule/MyClassTests.ts');
            });
        });

        it('should extract class and module name from the file name', function() {
            withMockedFs(function(as2ts, mock, fs) {
                fs.file('/dir/mymodule/myfile.js', 'package mymodule { /* blabla */}');
                sinon.stub(fs, 'writeFileSync');
                mock.expects("convertStr").once().withExactArgs('package mymodule { /* blabla */}', 'myfile', 'mymodule');
                as2ts.convert('/dir/mymodule/myfile.js');
            });

        });

        it('should rewrite an input file', function () {
            withMockedFs(function(as2ts, mock, fs) {
                fs.file('myfile.js', 'CONTENT');

                sinon.stub(fs, 'writeFileSync');
                as2ts.convert('myfile.js');

                fs.writeFileSync.should.have.been.calledWith('myfile.js', 'CONTENT', 'UTF-8');
            });
        });

        describe('should process all files in a directory', function() {
            it('if a directory path is given without trailing slash', function() {
                withMockedFs(function(as2ts, mock, fs) {
                    fs.file('root/a.ts', 'a');
                    fs.file('root/b.ts', 'b');
                    mock.expects('convertStr').twice();
                    as2ts.convert('root');
                });
            });

            it('if a directory path is given with trailing slash', function() {
                withMockedFs(function(as2ts, mock, fs) {
                    fs.file('root/a.ts', 'a');
                    fs.file('root/b.ts', 'b');
                    fs.file('root/sub/c.ts', 'c');
                    mock.expects('convertStr').thrice();
                    as2ts.convert('root');
                });
            });
        });

        it('should parse only valid files in a directory', function() {
            withMockedFs(function(as2ts, mock, fs) {
                fs.file('root/dir/_myfile.ts', 'CONTENT');
                fs.file('root/dir/_events.d.ts', 'CONTENT');
                mock.expects('convertStr').never();
                as2ts.convert('root');
            });
        });

    });

//    it('should determine the class hierarchy from the file system', function() {
//        var loadFile = mocks.loadFile;
//
//
//        var fs = new FakeFs();
//
//        var root = 'dir/src/';
//
//        fs.dir(root);
//        fs.at(root + 'display')
//            .file('_display.ts')
//            .file('BlendMode.ts')
//            .file('DisplayObject.ts')
//
//        // manually load the file and retrieve the exported object
//        var as2ts = loadFile(__dirname + '/../lib/as2ts.js', {
//            fs: fs
//        }).exports;
//
//        var result = as2ts.readClassHierarchy('dir/src/');
//
//        result.should.equal({
//            display: ['BlendMode', 'DisplayObject'],
//            geom: [ 'Matrix' ]
//        })
//    });
});