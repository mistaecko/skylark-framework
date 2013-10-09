/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class IllegalSystemStateError extends DefaultError {
        constructor(msg:string) {
            super(msg);
        }
    }
}
