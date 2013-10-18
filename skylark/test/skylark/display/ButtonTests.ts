/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('Button', function() {
    var up:skylark.Texture;
    var down:skylark.Texture;

    Helpers.manageStarling(this);

    beforeEach(function(done) {
        jQuery.when(
                util.Helpers.waitForImage('/test/resources/button.png'),
                util.Helpers.waitForImage('/test/resources/button_pressed.png')
        )
            .then((i1, i2) => {
                up = new skylark.ConcreteTexture(i1);
                down = new skylark.ConcreteTexture(i2);
            })
            .done(()=> done());
    });

    // problems with skylark.Skylark background color remains from other test!?
    it('should render with the "up" texture', function(done) {
        var button = new skylark.Button(up);
        Helpers.assertImage(button, this,'test/resources/button.png', done);
    });

    it.skip('should render the "down" texture when pressed', function(done) {
        var button = new skylark.Button(up, down);

        skylark.Skylark.buffered = false;
        skylark.Skylark.multitouchEnabled = false;

        jQuery('<canvas id="stage" style="width:137px; height:140px; /*position: absolute; top:0; left:0*/"></canvas>').prependTo(document.body);
        var app = skylark.Skylark.create(button);

        app.start();
        (</*IntelliJ*/Window>window).scrollTo(0,0);
        var el = (<SimulateJQuery>$('canvas'));
        el.simulate('mousedown', { clientX: 0, clientY: 10 });
        Helpers.captureFrame(app).then((image:HTMLImageElement)=> {
            return Helpers.compareImage(image.src, 'test/resources/button_pressed.png', (<any>this.test).title);
        })
            .done((match)=> {
                if(!match)
                    assert.fail('[image]', '[image]', 'Images are not equal', 'imagediff');
                else
                    done();
            });
    });

    function renderButtonWithText(font, done) {
        var texture = skylark.Texture.fromColor(100, 50, 0xff0000, false, 1.0);
        var button1 = new skylark.Button(texture, 'Kaboom');
        button1.fontSize = 16;
        button1.fontName = font;

        skylark.Skylark.stageDefaults.width = 100;
        skylark.Skylark.stageDefaults.height = 15;

        Helpers.assertImage(button1, this, 'test/resources/button-with-text-' + font.toLowerCase() + '.png', done);
    }

    function renderTwoButtonsWithText(font, done) {
        var texture = skylark.Texture.fromColor(100, 50, 0xff0000, false, 1.0);

        var button1 = new skylark.Button(texture, 'Kaboom');
        button1.fontSize = 16;
        button1.fontName = font;

        var button2 = new skylark.Button(texture, 'Bang');
        button2.fontSize = 16;
        button2.fontName = font;
        button2.y = 50;

        var root = new skylark.Sprite();
        root.addChild(button1);
        root.addChild(button2);

        Helpers.assertImage(root, this, 'test/resources/buttons-with-text-' + font.toLowerCase() + '.png', done);
    }

    it('should render a button with TrueType text', function(done) {
        renderButtonWithText.call(this, 'Arial', done);
    });
    it('should render two buttons with different TrueType text', function(done) {
        renderTwoButtonsWithText.call(this, 'Arial', done);
    });
    it('should render a button with Bitmap text', function(done) {
        renderButtonWithText.call(this, 'mini', done);
    });
    it('should render two buttons with different Bitmap text', function(done) {
        renderTwoButtonsWithText.call(this, 'mini', done);
    });

});
