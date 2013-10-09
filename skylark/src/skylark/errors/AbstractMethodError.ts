/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class AbstractMethodError extends DefaultError {
        constructor(msg?:string) {
            super(msg || 'ABSTRACT METHOD ERROR: Method must be implemented in a sub-class.');
        }
    }
}
