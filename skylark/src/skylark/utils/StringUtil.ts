/// <reference path="../../_dependencies.ts"/>

module skylark {

    export class StringUtil {

        constructor() {}

        public static format(str:string, ...values:any[]) {
            var result = str,
                arg;
            for(arg = 0; arg < values.length; arg++) {
                result = result.replace("{" + arg + "}", values[arg]);
            }
            return result;
        }

        public static parseXml(xmlStr:string):Document {
            var document = ( new DOMParser() ).parseFromString(xmlStr, "text/xml");
            // note: the detection mechanism for parsing errors will fail for XML documents that
            //  contain 'parsererror' tags as legal input - for our use-cases it is (hopefully)
            //  safe to ignore such a scenario
            if(document.getElementsByTagName('parsererror').length)
                throw new InvalidXmlError('XML failed to parse correctly', xmlStr, document.getElementsByTagName('parsererror'));

            return  document;
        }

        public static xmlToJson(node:Document, simple:boolean = true) {
            if(!(node instanceof Document))
                throw new ArgumentError('xmlToJson expects a "Document" as first parameter.');

            var proto = {
                attribute: function(name) {
                    return this.attributes[name];
                }
            };

            function convert(node:Node) {
                if(!node) return null;

                function jsVar(s:any):string {
                    return String(s || '').replace(/-/g, "_");
                }

                function isNum(s:any):boolean {
                    var regexp = /^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/;
                    return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? s.trim() : ''));
                }

                function myArr(o:any):any[] {
                    if(!Array.isArray(o))
                        o = [ o ];
                    return o;
                }

                function createObj() {
                    return simple ? {} : Object.create(proto);
                }

                var txt = '',
                    obj = null,
                    target = null;
                var nodeType = node.nodeType;
                var nodeName = jsVar(node.localName || node.nodeName);
                var nodeValue = (<any>node).text || node.nodeValue || '';

                var childNodes = node.childNodes;
                if(childNodes) {
                    if(childNodes.length > 0) {
                        for(var i = 0; i < childNodes.length; i++) {
                            var cnode = childNodes[i];
                            var cnodeType = cnode.nodeType;
                            var cnodeName = jsVar(cnode.localName || cnode.nodeName);
                            var cnodeValue = (<any>cnode).text || cnode.nodeValue || '';
                            if(cnodeType == 8) {
                                continue; // ignore comment cnode
                            }
                            else if(cnodeType == 3 || cnodeType == 4 || !cnodeName) {
                                // ignore white-space in between tags
                                if(cnodeValue.match(/^\s+$/)) {
                                    continue;
                                }
                                txt += cnodeValue.replace(/^\s+/, '').replace(/\s+$/, '');
                                // make sure we ditch trailing spaces from markup
                            }
                            else {
                                obj = obj || createObj();
                                if(obj[cnodeName]) {
                                    // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
                                    obj[cnodeName] = myArr(obj[cnodeName]);

                                    obj[cnodeName][ obj[cnodeName].length ] = convert(cnode);
                                    obj[cnodeName].length = obj[cnodeName].length;
                                }
                                else {
                                    obj[cnodeName] = convert(cnode);
                                }
                            }

                        }
                    }
                }
                if(node.attributes) {
                    if(node.attributes.length > 0) {
                        obj = obj || createObj();
                        // in simple mode we write to json 'obj' - otherwise we create a standalone 'attributes' object
                        target = simple ? obj : {};

                        var attributes = node.attributes;
                        for(var i = 0; i < attributes.length; i++) {
                            var attr = attributes[i];
                            var attrName = jsVar(attr.name);
                            var attrValue = attr.value;
                            // avoid name collisions
                            if(target[attrName]) {
                                // http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
                                target[cnodeName] = myArr(target[cnodeName]);

                                target[attrName][ target[attrName].length ] = attrValue;
                            }
                            else {
                                target[attrName] = attrValue;
                            }
                        }
                    }
                }

                if(obj == null && !simple) {
                    obj = createObj();
                    if(txt != '')
                        obj.text = txt;
                }

                if(!simple)
                    obj.attributes = target;

                return obj || txt;
            }

            var result = convert(node);
            delete result.attributes;
            return result;
        }

        public static sortArray(arr:string[]):string[] {
            arr.sort(function(a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                if(a == b) return 0;
                if(a > b) return 1;
                return -1;
            });
            return arr;
        }
    }
}
