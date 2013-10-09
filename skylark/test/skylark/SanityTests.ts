//mocha.use('bdd');
//expect = chai.expect;

/// <reference path="../_harness.d.ts"/>
require('../_common');

describe('Sanity Check', ()=>{
   it('should not fail', ()=> {
       expect(true).to.be.ok;
   });
});
