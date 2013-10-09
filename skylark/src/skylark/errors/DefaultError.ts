/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class DefaultError extends ErrorImpl {
        constructor(msg:string) {
            super(msg);

            // inspired by http://stackoverflow.com/a/5251506/456042 (http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript)
            // also see http://blog.getify.com/howto-custom-error-types-in-javascript/
            // http://stackoverflow.com/questions/783818/how-do-i-create-a-custom-error-in-javascript
            if(this.name == null)
                this.name = 'DefaultError';
            this.message = msg;
            this.stack = (new Error('[' + this.name + '] ' + msg))['stack'];
        }
    }
}
