declare module imagediff {
    export function createCanvas(width:number, height:number):HTMLCanvasElement;
    export function createCanvas():HTMLCanvasElement;
    export function diff(a:any, b:any):any;
    export function equal(a:any, b:any, tolerance?:number):boolean;
}
