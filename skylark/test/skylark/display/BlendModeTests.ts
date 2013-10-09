/// <reference path="../../_harness.d.ts"/>
require('../../_common.js');

describe('Canvas & Blend Modes', function () {

    Helpers.installCleanup(this);

    it.skip('experiment with globalCompositeOperation state mgmt', function () {
        var canvas = Helpers.createCanvas('tmp49547', 300, 300/*, '#00ff00'*/);
        var ctx = canvas.getContext('2d');

        // switch to multiply blending
        ctx.globalCompositeOperation = 'multiply';
        // draw magenta circle
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        // draw cyan circle
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalCompositeOperation = 'source-out';
        ctx.globalCompositeOperation = null;
        ctx.fillStyle = 'rgb(0,255,255)';
        ctx.beginPath();
        ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();


        // draw yellow circle
        ctx.save();
        ctx.globalCompositeOperation = null;
        ctx.fillStyle = 'rgb(255,255,0)';
        ctx.beginPath();
        ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    });

    it('should render a quad in blend mode "multiplied"', function (done) {
        skylark.Skylark.stageDefaults = {
            width: 100,
            height: 100,
            backgroundColor: 0xffff00 // yellow
        };

        var quad = new skylark.Quad(100, 100, 0x00ffff); // cyan
        quad.blendMode = skylark.BlendMode.MULTIPLY;

        var app = skylark.Skylark.create(quad);
        Helpers.captureFrame(app).then((img)=> {
            Helpers.assertImage(img, this, '/test/resources/multiply.png', done);
        });
    });

    var texture:skylark.Texture;
    beforeEach(function(done) {
        Helpers.waitForImage('/test/resources/airborne.png').then((img)=> {
            texture = new skylark.ConcreteTexture(img);
        }).done(()=> done());
    });

    it('should render a texture in blend mode "multiplied"', function (done) {
        skylark.Skylark.stageDefaults = {
            width: 100,
            height: 100,
            backgroundColor: 0xffff00 // yellow
        };

        var quad = new skylark.Image(texture)
        quad.blendMode = skylark.BlendMode.MULTIPLY;

        var app = skylark.Skylark.create(quad);
        Helpers.captureFrame(app).then((img)=> {
            Helpers.assertImage(img, this, '/test/resources/multiply-airborne.png', done);
        });
    });
});
