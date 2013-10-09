declare module chai {

    /**
     var err = new ReferenceError('This is a bad function.');
     var fn = function () { throw err; }
     expect(fn).to.throw(ReferenceError);
     expect(fn).to.throw(Error);
     expect(fn).to.throw(/bad function/);
     expect(fn).to.not.throw('good function');
     expect(fn).to.throw(ReferenceError, /bad function/);
     expect(fn).to.throw(err);
     expect(fn).to.not.throw(new RangeError('Out of range.'));
     */
    interface ThrowCb {
        ():void;
        (errorConstructor:new (...args: any[]) => Error):void;
        (errorConstructor:new (...args: any[]) => Error, expectedErrorMsg:RegExp):void;
        (expectedErrorMsg:string):void;
        (expectedErrorMsg:RegExp):void;
    }

    interface EqualFunction {
        (obj:any, msg?:string): Assertion;
    }

    class Assertion {
        public not:Assertion;
        public to:Assertion;
        public and:Assertion;
        public be:Assertion;
        public a:Assertion;
        public an:Assertion;

        public instanceof(constr:any):Assertion;
        public property(name:string):Assertion;

        public contain(a:any):Assertion;
        public at:Assertion;
        public least:(a:any)=>Assertion;

        public true:any;
        public false:any;
        //public defined:any;
        public undefined:any;
        public exist:any;
        public ok:any;
        public null:Assertion;
        public equal:EqualFunction;
        public eql:EqualFunction;
        public notEqual:EqualFunction;

        public closeTo:(expected:number, delta:number, msg?:string) => Assertion;

        // intellij does not understand this
        //public throw:ThrowCb;
        public throw(a?:any);
        public instanceOf:(a:any) => Assertion;

        // sinon-chai
        public have:Assertion;
        public always:Assertion;
        public been:Assertion;
        public not_called:Assertion;
        public called:Assertion;
        public calledOnce:Assertion;
        public calledTwice:Assertion;
        public calledThrice:Assertion;
        public calledBefore(stub:any):Assertion;
        public calledWith(...args:any[]):Assertion;
        public returns(value:any):Assertion;

//        publikc throw(errorConstructor:new (...args: any[]) => ErrorImpl):void;
//        public throw(expectedErrorMsg:string):void;
//        public throw(expectedErrorMsg:RegExp):void;
    }
}

declare function expect(a:any):chai.Assertion;
declare function should(a:any):chai.Assertion;

declare class assert {
    public static fail(actual:any, expected:any, message:string, operator?:any):void;
    public static match(a:any, b:any):void;
    public static equal(a:any, b:any):void;
    public static isFalse(a:any):void;
    public static isTrue(a:any):void;
    public static isNull(a:any):void;
    public static isNotNull(a:any):void;
    public static isUndefined(a:any):void;
    public static closeTo(a:any, b:any, c:any, msg?:string):void;
}