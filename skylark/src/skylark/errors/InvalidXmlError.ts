/// <reference path="../../_dependencies.ts"/>

module skylark {
    export class InvalidXmlError extends DefaultError {
        private _xml:string;
        private _parserErrors:NodeList;

        constructor(msg:string = null, xml:string = null, errors:NodeList = null) {
            super(msg);
            this.name = 'InvalidXmlError';
            this._xml = xml;
            this._parserErrors = errors;
        }

        public toString():string {
            return this.message + ' | ' + this._parserErrors[0].textContent;
        }
    }
}
