/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class ArgumentError extends DefaultError {
        constructor(msg:string) {
            this.name = 'ArgumentError';
            super(msg);
        }
    }
}
