// BDD
interface describeDef {
    (cb: () => void): void;
    (cb: (done:() => void) => void) : void;
    (title: string, cb: () => void) : void;
    (title: string, cb: (done:() => void) => void);
    only:describeDef;
    skip:describeDef;
}

interface itDef {
    (cb: () => void): void;
    (cb: (done:() => void) => void) : void;
    (title: string, cb: () => void) : void;
    (title: string, cb: (done:() => void) => void) : void;
    only:itDef;
    skip:itDef;
}
//declare function describe(cb: () => void);
//declare function describe(cb: (done:() => void) => void);
//declare function describe(title: string, cb: () => void);
//declare function describe(title: string, cb: (done:() => void) => void);
//
//declare function it(cb: () => void);
//declare function it(cb: (done:() => void) => void);
//declare function it(title: string, cb: () => void);
//declare function it(title: string, cb: (done:() => void) => void);

declare var it:itDef;
declare var describe:describeDef;

declare function before(cb: () => void);
declare function before(cb: (done:() => void) => void);
declare function before(title: string, cb: () => void);
declare function before(title: string, cb: (done:() => void) => void);

declare function after(cb: () => void);
declare function after(cb: (done:() => void) => void);
declare function after(title: string, cb: () => void);
declare function after(title: string, cb: (done:() => void) => void);

interface beforeEachDef {
    (cb: () => void);
    (cb: (done:() => void) => void);
    (title: string, cb: () => void);
    (title: string, cb: (done:() => void) => void);
}

interface afterEachDef {
    (cb: () => void);
    (cb: (done:() => void) => void);
    (title: string, cb: () => void);
    (title: string, cb: (done:() => void) => void);
}

declare var beforeEach:beforeEachDef;
declare var afterEach:afterEachDef;

// TDD
declare function suite(title: string, cb: () => void);
declare function test(title: string, cb: () => void);
declare function test(title: string, cb: (done:() => void) => void);
declare function setup(title: string, cb: () => void);
declare function teardown(title: string, cb: () => void);

declare function suite(cb: () => void);
declare function test(cb: () => void);
declare function test(cb: (done:() => void) => void);
declare function setup(cb: () => void);
declare function teardown(cb: () => void);

declare class MochaSuite {
    beforeEach: beforeEachDef;
    afterEach: afterEachDef;
}
declare class MochaTest {

}