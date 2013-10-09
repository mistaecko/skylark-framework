/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class AbstractClassError extends DefaultError {
        constructor(msg:string = null) {
            super(msg);
        }
    }
}
