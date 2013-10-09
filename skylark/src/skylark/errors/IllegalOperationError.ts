/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class IllegalOperationError extends DefaultError {
        constructor(msg:string) {
            super(msg);
        }
    }
}
