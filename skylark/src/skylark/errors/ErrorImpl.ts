// http://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
declare module skylark {
    class ErrorImpl implements Error {
        public name:string;
        public message:string;
        public stack:string;

        constructor(message?:string);
    }
}


(function(m) {
    m['ErrorImpl'] = Error;
})(skylark);
