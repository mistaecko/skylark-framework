/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class MissingContextError extends DefaultError {
        constructor(msg:string = null) {
            super(msg);
        }
    }
}
