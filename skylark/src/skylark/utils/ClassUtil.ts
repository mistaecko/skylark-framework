/// <reference path="../../_dependencies.ts"/>

module skylark {

    export class ClassUtil {

        /**
         * The closest possible implementation for the AS3 aquivalent of `getQualifiedClassName`.
         *
         * Note: this actually only returns the 'class name' without module/package path (since that
         * information is not available at run-time in TypeScript).
         *
         * @param obj the object or class
         * @returns {string} the class name
         *
         * todo maybe rename to getClassName and only leave a deprecated alias with this name in place
         */
        public static getQualifiedClassName(obj):string {
            var constructor;
            if(typeof obj === 'function') {
                constructor = obj;
            } else if(typeof obj === 'object' && obj.constructor != null) {
                constructor = obj.constructor;
            } else
                throw new ArgumentError('Given object is not a (constructor) function or an object instance created by a constructor function!');

            return constructor.name;

            // http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
//            var funcNameRegex = /function (.{1,})\(/;
//            var results = (funcNameRegex).exec((obj).constructor.toString());
//            return (results && results.length > 1) ? results[1] : "";
        }

        public static getDefinitionByName(name:string):any {
            //todo do some sanity checks
            return eval(name);
        }

        /**
         * Checks whether the given object is a (TypeScript) class.
         *
         *     class MyClass {
         *       ...
         *     }
         *     ClassUtil.isClass(MyClass); // true
         *     ClassUtil.isClass(new MyClass()); // false
         *
         * Note: In JavaScript, there is no explicit notion of a 'class', but rather
         * function objects that are used as constructor function (using the 'new'
         * keyword) to create new objects.
         *
         * @param obj the object to check
         * @returns {boolean} true if the given object is a (TypeScrip) class, otherwise false.
         */
        public static isClass(obj):boolean {
            // if it is a function, and the function has a 'constructor' property
            // (which is a convention applied by TypeScript), we assume it is a
            // TypeScript class.
            return typeof obj === 'function' && obj.constructor != null;
        }

        /**
         * Determine whether the given object is a valid `CanvasImageSource`,
         * and therefore a valid argument to `CanvasRenderingContext2D#drawImage`.
         *
         * Note: the HTML5 spec defines a `CanvasImageSource` type, however, since
         * interfaces in JavaScript do not exist and have no type representation that
         * could be checked with the `instanceof` operator, we provide this helper
         * function.
         *
         * @param obj the object to evaluate
         * @returns {boolean} `true` if the object is a CanvasImageSource and can be drawn onto a 2D canvas
         */
        public static isCanvasImageSource(obj:any):boolean {
            // todo how to support other interface types?
            //    CanvasRenderingContext2D
            //    ImageBitmap
            return obj instanceof HTMLCanvasElement ||
                obj instanceof HTMLImageElement ||
                obj instanceof HTMLVideoElement;
        }
    }
}
