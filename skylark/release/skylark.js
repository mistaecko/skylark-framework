var NativeImage = Image;
var skylark;
(function (skylark) {
    var Matrix = (function () {
        function Matrix(a, b, c, d, tx, ty) {
            if (typeof b === "undefined") { b = 0; }
            if (typeof c === "undefined") { c = 0; }
            if (typeof d === "undefined") { d = 0; }
            if (typeof tx === "undefined") { tx = 0; }
            if (typeof ty === "undefined") { ty = 0; }
            if (typeof a === 'undefined') {
                a = 1;
                b = 0;
                c = 0;
                d = 1;
                tx = 0;
                ty = 0;
            }

            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        Matrix.prototype.setTo = function (a, b, c, d, tx, ty) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        };

        Matrix.prototype.identity = function () {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.tx = 0;
            this.ty = 0;
        };

        Matrix.prototype.transformPoint = function (p) {
            var result = new skylark.Point((p.x * this.a) + (p.y * this.c) + this.tx, (p.x * this.b) + (p.y * this.d) + this.ty);

            return result;
        };

        Matrix.prototype.translate = function (x, y) {
            this.tx += x;
            this.ty += y;
        };

        Matrix.prototype.rotate = function (angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);

            var rotateMatrix = new Matrix(cos, sin, -sin, cos, 0, 0);
            this.concat(rotateMatrix);
        };

        Matrix.prototype.scale = function (x, y) {
            var scaleMatrix = new Matrix(x, 0, 0, y, 0, 0);
            this.concat(scaleMatrix);
        };

        Matrix.prototype.concat = function (m) {
            this.copyFrom(new Matrix((this.a * m.a) + (this.b * m.c), (this.a * m.b) + (this.b * m.d), (this.c * m.a) + (this.d * m.c), (this.c * m.b) + (this.d * m.d), (this.tx * m.a) + (this.ty * m.c) + m.tx, (this.tx * m.b) + (this.ty * m.d) + m.ty));
        };

        Matrix.prototype.invert = function () {
            var adbc = ((this.a * this.d) - (this.b * this.c));

            this.copyFrom(new Matrix((this.d / adbc), (-this.b / adbc), (-this.c / adbc), (this.a / adbc), (((this.c * this.ty) - (this.d * this.tx)) / adbc), -(((this.a * this.ty) - (this.b * this.tx)) / adbc)));
        };

        Matrix.prototype.clone = function () {
            var result = new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);

            return result;
        };

        Matrix.prototype.copyFrom = function (m) {
            this.a = m.a;
            this.b = m.b;
            this.c = m.c;
            this.d = m.d;
            this.tx = m.tx;
            this.ty = m.ty;
        };
        return Matrix;
    })();
    skylark.Matrix = Matrix;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Point = (function () {
        function Point(x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            this.x = x;
            this.y = y;
        }
        Point.prototype.add = function (p) {
            return new Point((this.x + p.x), (this.y + p.y));
        };

        Point.prototype.subtract = function (p) {
            return new Point((this.x - p.x), (this.y - p.y));
        };

        Point.prototype.dot = function (p) {
            return ((this.x * p.x) + (this.y * p.y));
        };

        Point.prototype.cross = function (p) {
            return ((this.x * p.y) - (this.y * p.x));
        };

        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };

        Point.prototype.setTo = function (x, y) {
            this.x = x;
            this.y = y;
        };

        Object.defineProperty(Point.prototype, "length", {
            get: function () {
                var x = this.x;
                var y = this.y;
                return Math.sqrt(x * x + y * y);
            },
            enumerable: true,
            configurable: true
        });

        Point.distance = function (p1, p2) {
            return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
        };
        return Point;
    })();
    skylark.Point = Point;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Rectangle = (function () {
        function Rectangle(x, y, width, height) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof width === "undefined") { width = 0; }
            if (typeof height === "undefined") { height = 0; }
            this.setTo(x, y, width, height);
        }
        Rectangle.prototype.setTo = function (x, y, width, height) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof width === "undefined") { width = 0; }
            if (typeof height === "undefined") { height = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        };

        Object.defineProperty(Rectangle.prototype, "bottom", {
            get: function () {
                return this.y + this.height;
            },
            set: function (value) {
                if (value != null)
                    this.height = (value - this.y);
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Rectangle.prototype, "bottomright", {
            get: function () {
                return new skylark.Point(this.right, this.bottom);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Rectangle.prototype, "left", {
            set: function (newX) {
                if (newX !== null && typeof newX !== 'undefined') {
                    this.width += (this.x - newX);
                    this.x = newX;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Rectangle.prototype, "right", {
            get: function () {
                return this.x + this.width;
            },
            set: function (value) {
                if (value != null)
                    this.width = (value - this.x);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Rectangle.prototype, "size", {
            get: function () {
                return new skylark.Point(this.width, this.height);
            },
            set: function (size) {
                throw new skylark.IllegalOperationError('Not yet implemented');
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Rectangle.prototype, "top", {
            set: function (newY) {
                if (newY !== null && typeof newY !== 'undefined') {
                    this.height += (this.y - newY);
                    this.y = newY;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Rectangle.prototype, "topLeft", {
            get: function () {
                return new skylark.Point(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });

        Rectangle.prototype.clone = function () {
            return new Rectangle(this.x, this.y, this.width, this.height);
        };

        Rectangle.prototype.contains = function (x, y) {
            var isInside = (x >= this.x) && (y >= this.y) && (x <= this.right) && (y <= this.bottom);
            return isInside;
        };

        Rectangle.prototype.containsPoint = function (point) {
            return this.contains(point.x, point.y);
        };

        Rectangle.prototype.containsRect = function (rect) {
            var isInside = (rect.x >= this.x) && (rect.y >= this.y) && (rect.right <= this.right) && (rect.bottom <= this.bottom);
            return isInside;
        };

        Rectangle.prototype.equals = function (toCompare) {
            var isIdentical = (toCompare.x === this.x) && (toCompare.y === this.y) && (toCompare.width === this.width) && (toCompare.height === this.height);
            return isIdentical;
        };

        Rectangle.prototype.inflate = function (dx, dy) {
            this.x -= dx;
            this.y -= dy;
            this.width += (2 * dx);
            this.height += (2 * dy);
        };

        Rectangle.prototype.inflatePoint = function (point) {
            this.inflate(point.x, point.y);
        };

        Rectangle.prototype.inclusiveRangeContains = function (value, min, max) {
            var isInside = (value >= min) && (value <= max);

            return isInside;
        };

        Rectangle.prototype.intersectRange = function (aMin, aMax, bMin, bMax) {
            var maxMin = Math.max(aMin, bMin);
            if (!this.inclusiveRangeContains(maxMin, aMin, aMax) || !this.inclusiveRangeContains(maxMin, bMin, bMax))
                return null;

            var minMax = Math.min(aMax, bMax);

            if (!this.inclusiveRangeContains(minMax, aMin, aMax) || !this.inclusiveRangeContains(minMax, bMin, bMax))
                return null;

            return { min: maxMin, max: minMax };
        };

        Rectangle.prototype.intersection = function (toIntersect) {
            var xSpan = this.intersectRange(this.x, this.right, toIntersect.x, toIntersect.right);

            if (!xSpan)
                return null;

            var ySpan = this.intersectRange(this.y, this.bottom, toIntersect.y, toIntersect.bottom);

            if (!ySpan)
                return null;

            var result = new Rectangle(xSpan.min, ySpan.min, (xSpan.max - xSpan.min), (ySpan.max - ySpan.min));

            return result;
        };

        Rectangle.prototype.intersects = function (toIntersect) {
            var intersection = this.intersection(toIntersect);

            return (intersection !== null);
        };

        Rectangle.prototype.isEmpty = function () {
            return ((this.width <= 0) || (this.height <= 0));
        };

        Rectangle.prototype.offset = function (dx, dy) {
            this.x += dx;
            this.y += dy;
        };

        Rectangle.prototype.offsetPoint = function (point) {
            this.offset(point.x, point.y);
        };

        Rectangle.prototype.setEmpty = function () {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        };

        Rectangle.prototype.toString = function () {
            var result = '{';
            result += '"x":' + this.x + ',';
            result += '"y":' + this.y + ',';
            result += '"width":' + this.width + ',';
            result += '"height":' + this.height + '}';

            return result;
        };

        Rectangle.prototype.union = function (toUnion) {
            var minX = Math.min(toUnion.x, this.x);
            var maxX = Math.max(toUnion.right, this.right);
            var minY = Math.min(toUnion.y, this.y);
            var maxY = Math.max(toUnion.bottom, this.bottom);

            var result = new Rectangle(minX, minY, (maxX - minX), (maxY - minY));

            return result;
        };
        return Rectangle;
    })();
    skylark.Rectangle = Rectangle;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Event = (function () {
        function Event(type, bubbles, data) {
            if (typeof bubbles === "undefined") { bubbles = false; }
            if (typeof data === "undefined") { data = null; }
            this._type = type;
            this._bubbles = bubbles;
            this._data = data;
        }
        Event.prototype.stopPropagation = function () {
            this._stopsPropagation = true;
        };

        Event.prototype.stopImmediatePropagation = function () {
            this._stopsPropagation = this._stopsImmediatePropagation = true;
        };

        Event.prototype.toString = function () {
            var name = (skylark.ClassUtil.getQualifiedClassName(this).split("::").pop());

            return skylark.StringUtil.format("[{0} type=\"{1}\" bubbles={2}]", name, this._type, this._bubbles);
        };

        Object.defineProperty(Event.prototype, "bubbles", {
            get: function () {
                return this._bubbles;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Event.prototype, "target", {
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Event.prototype, "currentTarget", {
            get: function () {
                return this._currentTarget;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Event.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Event.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });

        Event.prototype.setTarget = function (value) {
            this._target = value;
        };

        Event.prototype.setCurrentTarget = function (value) {
            this._currentTarget = value;
        };

        Event.prototype.setData = function (value) {
            this._data = value;
        };

        Object.defineProperty(Event.prototype, "stopsPropagation", {
            get: function () {
                return this._stopsPropagation;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Event.prototype, "stopsImmediatePropagation", {
            get: function () {
                return this._stopsImmediatePropagation;
            },
            enumerable: true,
            configurable: true
        });

        Event.fromPool = function (type, bubbles, data) {
            if (typeof bubbles === "undefined") { bubbles = false; }
            if (typeof data === "undefined") { data = null; }
            if (Event._eventPool.length)
                return Event._eventPool.pop().reset(type, bubbles, data);
else
                return new Event(type, bubbles, data);
        };

        Event.toPool = function (event) {
            event._data = event._target = event._currentTarget = null;
            Event._eventPool.push(event);
        };

        Event.prototype.reset = function (type, bubbles, data) {
            if (typeof bubbles === "undefined") { bubbles = false; }
            if (typeof data === "undefined") { data = null; }
            this._type = type;
            this._bubbles = bubbles;
            this._data = data;
            this._target = this._currentTarget = null;
            this._stopsPropagation = this._stopsImmediatePropagation = false;
            return this;
        };
        Event.ADDED = "added";

        Event.ADDED_TO_STAGE = "addedToStage";

        Event.ENTER_FRAME = "enterFrame";

        Event.REMOVED = "removed";

        Event.REMOVED_FROM_STAGE = "removedFromStage";

        Event.TRIGGERED = "triggered";

        Event.FLATTEN = "flatten";

        Event.RESIZE = "resize";

        Event.COMPLETE = "complete";

        Event.CONTEXT3D_CREATE = "context3DCreate";

        Event.ROOT_CREATED = "rootCreated";

        Event.REMOVE_FROM_JUGGLER = "removeFromJuggler";

        Event.CHANGE = "change";

        Event.CANCEL = "cancel";

        Event.SCROLL = "scroll";

        Event.OPEN = "open";

        Event.CLOSE = "close";

        Event.SELECT = "select";

        Event._eventPool = [];
        return Event;
    })();
    skylark.Event = Event;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Touch = (function () {
        function Touch(id, globalX, globalY, phase, target) {
            this.mID = id;
            this._globalX = this._previousGlobalX = globalX;
            this._globalY = this._previousGlobalY = globalY;
            this._tapCount = 0;
            this._phase = phase;
            this._target = target;
            this._pressure = this._width = this._height = 1.0;
            this._bubbleChain = [];
            this.updateBubbleChain();
        }
        Touch.prototype.getLocation = function (space, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            if (resultPoint == null)
                resultPoint = new skylark.Point();
            space.base.getTransformationMatrix(space, Touch._helperMatrix);

            return skylark.MatrixUtil.transformCoords(Touch._helperMatrix, this._globalX, this._globalY, resultPoint);
        };

        Touch.prototype.getPreviousLocation = function (space, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            if (resultPoint == null)
                resultPoint = new skylark.Point();
            space.base.getTransformationMatrix(space, Touch._helperMatrix);

            return skylark.MatrixUtil.transformCoords(Touch._helperMatrix, this._previousGlobalX, this._previousGlobalY, resultPoint);
        };

        Touch.prototype.getMovement = function (space, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            if (resultPoint == null)
                resultPoint = new skylark.Point();
            this.getLocation(space, resultPoint);
            var x = resultPoint.x;
            var y = resultPoint.y;
            this.getPreviousLocation(space, resultPoint);
            resultPoint.setTo(x - resultPoint.x, y - resultPoint.y);

            return resultPoint;
        };

        Touch.prototype.isTouching = function (target) {
            return this._bubbleChain.indexOf(target) != -1;
        };

        Touch.prototype.toString = function () {
            return skylark.StringUtil.format("Touch {0}: globalX={1}, globalY={2}, phase={3}", this.mID, this._globalX, this._globalY, this._phase);
        };

        Touch.prototype.clone = function () {
            var clone = new Touch(this.mID, this._globalX, this._globalY, this._phase, this._target);
            clone._previousGlobalX = this._previousGlobalX;
            clone._previousGlobalY = this._previousGlobalY;
            clone._tapCount = this._tapCount;
            clone._timestamp = this._timestamp;
            clone._pressure = this._pressure;
            clone._width = this._width;
            clone._height = this._height;

            return clone;
        };

        Touch.prototype.updateBubbleChain = function () {
            if (this._target) {
                var length = 1;
                var element = this._target;

                this._bubbleChain.length = 1;
                this._bubbleChain[0] = element;

                while ((element = element.parent) != null)
                    this._bubbleChain[length++] = element;
            } else {
                this._bubbleChain.length = 0;
            }
        };

        Object.defineProperty(Touch.prototype, "id", {
            get: function () {
                return this.mID;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "globalX", {
            get: function () {
                return this._globalX;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "globalY", {
            get: function () {
                return this._globalY;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "previousGlobalX", {
            get: function () {
                return this._previousGlobalX;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "previousGlobalY", {
            get: function () {
                return this._previousGlobalY;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "tapCount", {
            get: function () {
                return this._tapCount;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "phase", {
            get: function () {
                return this._phase;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "target", {
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "timestamp", {
            get: function () {
                return this._timestamp;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "pressure", {
            get: function () {
                return this._pressure;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Touch.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });

        Touch.prototype.dispatchEvent = function (event) {
            if (this._target)
                event.dispatch(this._bubbleChain);
        };

        Object.defineProperty(Touch.prototype, "bubbleChain", {
            get: function () {
                return this._bubbleChain.concat();
            },
            enumerable: true,
            configurable: true
        });

        Touch.prototype.setTarget = function (value) {
            this._target = value;
            this.updateBubbleChain();
        };

        Touch.prototype.setPosition = function (globalX, globalY) {
            this._previousGlobalX = this._globalX;
            this._previousGlobalY = this._globalY;
            this._globalX = globalX;
            this._globalY = globalY;
        };

        Touch.prototype.setSize = function (width, height) {
            this._width = width;
            this._height = height;
        };

        Touch.prototype.setPhase = function (value) {
            this._phase = value;
        };

        Touch.prototype.setTapCount = function (value) {
            this._tapCount = value;
        };

        Touch.prototype.setTimestamp = function (value) {
            this._timestamp = value;
        };

        Touch.prototype.setPressure = function (value) {
            this._pressure = value;
        };
        Touch._helperMatrix = new skylark.Matrix();
        return Touch;
    })();
    skylark.Touch = Touch;
})(skylark || (skylark = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var skylark;
(function (skylark) {
    var TouchEvent = (function (_super) {
        __extends(TouchEvent, _super);
        function TouchEvent(type, touches, shiftKey, ctrlKey, bubbles) {
            if (typeof shiftKey === "undefined") { shiftKey = false; }
            if (typeof ctrlKey === "undefined") { ctrlKey = false; }
            if (typeof bubbles === "undefined") { bubbles = true; }
            _super.call(this, type, bubbles, touches);

            this._shiftKey = shiftKey;
            this._ctrlKey = ctrlKey;
            this._timestamp = -1.0;
            this._visitedObjects = [];

            var numTouches = touches.length;
            for (var i = 0; i < numTouches; ++i)
                if (touches[i].timestamp > this._timestamp)
                    this._timestamp = touches[i].timestamp;
        }
        TouchEvent.prototype.getTouches = function (target, phase, result) {
            if (typeof phase === "undefined") { phase = null; }
            if (typeof result === "undefined") { result = null; }
            if (result == null)
                result = [];
            var allTouches = this.data;
            var numTouches = allTouches.length;

            for (var i = 0; i < numTouches; ++i) {
                var touch = allTouches[i];
                var correctTarget = touch.isTouching(target);
                var correctPhase = (phase == null || phase == touch.phase);

                if (correctTarget && correctPhase)
                    result.push(touch);
            }
            return result;
        };

        TouchEvent.prototype.getTouch = function (target, phase) {
            if (typeof phase === "undefined") { phase = null; }
            this.getTouches(target, phase, TouchEvent._touches);
            if (TouchEvent._touches.length) {
                var touch = TouchEvent._touches[0];
                TouchEvent._touches.length = 0;
                return touch;
            } else
                return null;
        };

        TouchEvent.prototype.interactsWith = function (target) {
            if (this.getTouch(target) == null) {
                return false;
            } else {
                var touches = this.getTouches(target);

                for (var i = touches.length - 1; i >= 0; --i)
                    if (touches[i].phase != skylark.TouchPhase.ENDED)
                        return true;

                return false;
            }
        };

        TouchEvent.prototype.dispatch = function (chain) {
            if (chain && chain.length) {
                var chainLength = this.bubbles ? chain.length : 1;
                var previousTarget = this.target;
                this.setTarget(chain[0]);

                for (var i = 0; i < chainLength; ++i) {
                    var chainElement = chain[i];
                    if (this._visitedObjects.indexOf(chainElement) == -1) {
                        var stopPropagation = chainElement.invokeEvent(this);
                        this._visitedObjects.push(chainElement);
                        if (stopPropagation)
                            break;
                    }
                }

                this.setTarget(previousTarget);
            }
        };

        Object.defineProperty(TouchEvent.prototype, "timestamp", {
            get: function () {
                return this._timestamp;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchEvent.prototype, "touches", {
            get: function () {
                return (this.data).concat();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchEvent.prototype, "shiftKey", {
            get: function () {
                return this._shiftKey;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchEvent.prototype, "ctrlKey", {
            get: function () {
                return this._ctrlKey;
            },
            enumerable: true,
            configurable: true
        });
        TouchEvent.TOUCH = "touch";

        TouchEvent._touches = [];
        return TouchEvent;
    })(skylark.Event);
    skylark.TouchEvent = TouchEvent;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TouchPhase = (function () {
        function TouchPhase() {
            throw new skylark.AbstractClassError();
        }
        TouchPhase.HOVER = "hover";

        TouchPhase.BEGAN = "began";

        TouchPhase.MOVED = "moved";

        TouchPhase.STATIONARY = "stationary";

        TouchPhase.ENDED = "ended";
        return TouchPhase;
    })();
    skylark.TouchPhase = TouchPhase;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var KeyboardEvent = (function (_super) {
        __extends(KeyboardEvent, _super);
        function KeyboardEvent(type, charCode, keyCode, keyLocation, ctrlKey, altKey, shiftKey) {
            if (typeof charCode === "undefined") { charCode = 0; }
            if (typeof keyCode === "undefined") { keyCode = 0; }
            if (typeof keyLocation === "undefined") { keyLocation = 0; }
            if (typeof ctrlKey === "undefined") { ctrlKey = false; }
            if (typeof altKey === "undefined") { altKey = false; }
            if (typeof shiftKey === "undefined") { shiftKey = false; }
            _super.call(this, type, false, keyCode);
            this._charCode = charCode;
            this._keyCode = keyCode;
            this._keyLocation = keyLocation;
            this._ctrlKey = ctrlKey;
            this._altKey = altKey;
            this._shiftKey = shiftKey;
        }
        Object.defineProperty(KeyboardEvent.prototype, "charCode", {
            get: function () {
                return this._charCode;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(KeyboardEvent.prototype, "keyCode", {
            get: function () {
                return this._keyCode;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(KeyboardEvent.prototype, "keyLocation", {
            get: function () {
                return this._keyLocation;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(KeyboardEvent.prototype, "altKey", {
            get: function () {
                return this._altKey;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(KeyboardEvent.prototype, "ctrlKey", {
            get: function () {
                return this._ctrlKey;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(KeyboardEvent.prototype, "shiftKey", {
            get: function () {
                return this._shiftKey;
            },
            enumerable: true,
            configurable: true
        });
        KeyboardEvent.KEY_UP = "keyup";

        KeyboardEvent.KEY_DOWN = "keydown";
        return KeyboardEvent;
    })(skylark.Event);
    skylark.KeyboardEvent = KeyboardEvent;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var EnterFrameEvent = (function (_super) {
        __extends(EnterFrameEvent, _super);
        function EnterFrameEvent(type, passedTime, bubbles) {
            if (typeof bubbles === "undefined") { bubbles = false; }
            _super.call(this, type, bubbles, passedTime);
        }
        Object.defineProperty(EnterFrameEvent.prototype, "passedTime", {
            get: function () {
                return this.data;
            },
            enumerable: true,
            configurable: true
        });
        EnterFrameEvent.ENTER_FRAME = "enterFrame";
        return EnterFrameEvent;
    })(skylark.Event);
    skylark.EnterFrameEvent = EnterFrameEvent;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var EventListener = (function () {
        function EventListener(fn, context) {
            this.context = context;
            this.fn = fn;
        }
        return EventListener;
    })();
    skylark.EventListener = EventListener;

    var EventDispatcher = (function () {
        function EventDispatcher() {
        }
        EventDispatcher.prototype.addEventListener = function (type, listener, This) {
            if (typeof This === "undefined") { This = null; }
            if (this._eventListeners == null)
                this._eventListeners = {};

            var listeners = this._eventListeners[type];

            var entry = new EventListener(listener, This || this);
            if (listeners == null)
                this._eventListeners[type] = [entry];
else if (this.findEventListener(type, listener, This || this) === -1)
                listeners.push(entry);
        };

        EventDispatcher.prototype.removeEventListener = function (type, listener, This) {
            if (typeof This === "undefined") { This = null; }
            if (this._eventListeners) {
                var listeners = this._eventListeners[type];
                if (listeners) {
                    var numListeners = listeners.length;
                    var remainingListeners = [];

                    for (var i = 0; i < numListeners; ++i) {
                        var eventListener = listeners[i];
                        if (eventListener.context !== (This || this) || eventListener.fn !== listener)
                            remainingListeners.push(eventListener);
                    }
                    this._eventListeners[type] = remainingListeners;
                }
            }
        };

        EventDispatcher.prototype.findEventListener = function (type, listener, This) {
            if (typeof This === "undefined") { This = null; }
            var chain = this._eventListeners[type];
            if (chain != null) {
                for (var i = 0; i < chain.length; i++) {
                    var l = chain[i];
                    if (l.context === This && l.fn === listener)
                        return i;
                }
            }
            return -1;
        };

        EventDispatcher.prototype.removeEventListeners = function (type) {
            if (typeof type === "undefined") { type = null; }
            if (type && this._eventListeners)
                delete this._eventListeners[type];
else
                this._eventListeners = null;
        };

        EventDispatcher.prototype.dispatchEvent = function (event) {
            var bubbles = event.bubbles;

            if (!bubbles && (this._eventListeners == null || !(event.type in this._eventListeners)))
                return;

            var previousTarget = event.target;
            event.setTarget(this);

            if (bubbles && (this instanceof skylark.DisplayObject))
                this.bubbleEvent(event);
else
                this.invokeEvent(event);

            if (previousTarget)
                event.setTarget(previousTarget);
        };

        EventDispatcher.prototype.invokeEvent = function (event) {
            var listeners = this._eventListeners ? this._eventListeners[event.type] : null;
            var numListeners = listeners == null ? 0 : listeners.length;

            if (numListeners) {
                event.setCurrentTarget(this);

                for (var i = 0; i < numListeners; ++i) {
                    var eventListener = listeners[i];
                    var listener = eventListener.fn;
                    var context = eventListener.context;

                    (listener).apply(context, [event, event.data]);

                    if (event.stopsImmediatePropagation)
                        return true;
                }

                return event.stopsPropagation;
            } else {
                return false;
            }
        };

        EventDispatcher.prototype.bubbleEvent = function (event) {
            var chain;
            var element = this;
            var length = 1;

            if (EventDispatcher._bubbleChains.length > 0) {
                chain = EventDispatcher._bubbleChains.pop();
                chain[0] = element;
            } else
                chain = [element];

            while ((element = (element).parent) != null)
                chain[length++] = element;

            for (var i = 0; i < length; ++i) {
                var stopPropagation = chain[i].invokeEvent(event);
                if (stopPropagation)
                    break;
            }

            chain.length = 0;
            EventDispatcher._bubbleChains.push(chain);
        };

        EventDispatcher.prototype.dispatchEventWith = function (type, bubbles, data) {
            if (typeof bubbles === "undefined") { bubbles = false; }
            if (typeof data === "undefined") { data = null; }
            if (bubbles || this.hasEventListener(type)) {
                var event = skylark.Event.fromPool(type, bubbles, data);
                this.dispatchEvent(event);
                skylark.Event.toPool(event);
            }
        };

        EventDispatcher.prototype.hasEventListener = function (type) {
            var listeners = this._eventListeners ? this._eventListeners[type] : null;
            return listeners ? listeners.length != 0 : false;
        };
        EventDispatcher._bubbleChains = [];
        return EventDispatcher;
    })();
    skylark.EventDispatcher = EventDispatcher;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var DisplayObject = (function (_super) {
        __extends(DisplayObject, _super);
        function DisplayObject() {
            _super.call(this);

            this.mX = this.mY = this._pivotX = this._pivotY = this._rotation = this._skewX = this._skewY = 0.0;
            this._scaleX = this._scaleY = this._alpha = 1.0;
            this._visible = this._touchable = true;
            this._blendMode = skylark.BlendMode.AUTO;
            this._transformationMatrix = new skylark.Matrix();
            this._orientationChanged = this._useHandCursor = false;
        }
        DisplayObject.prototype.dispose = function () {
            this.removeEventListeners(null);
        };

        DisplayObject.prototype.removeFromParent = function (dispose) {
            if (typeof dispose === "undefined") { dispose = false; }
            if (this._parent)
                this._parent.removeChild(this, dispose);
        };

        DisplayObject.prototype.getTransformationMatrix = function (targetSpace, resultMatrix) {
            if (typeof resultMatrix === "undefined") { resultMatrix = null; }
            var commonParent;
            var currentObject;

            if (resultMatrix)
                resultMatrix.identity();
else
                resultMatrix = new skylark.Matrix();

            if (targetSpace === this) {
                return resultMatrix;
            } else if (targetSpace === this._parent || (targetSpace == null && this._parent == null)) {
                resultMatrix.copyFrom(this.transformationMatrix);
                return resultMatrix;
            } else if (targetSpace == null || targetSpace === this.base) {
                currentObject = this;
                while (currentObject != targetSpace) {
                    resultMatrix.concat(currentObject.transformationMatrix);
                    currentObject = currentObject._parent;
                }

                return resultMatrix;
            } else if (targetSpace._parent === this) {
                targetSpace.getTransformationMatrix(this, resultMatrix);
                resultMatrix.invert();

                return resultMatrix;
            }

            commonParent = null;
            currentObject = this;

            while (currentObject) {
                DisplayObject._ancestors.push(currentObject);
                currentObject = currentObject._parent;
            }

            currentObject = targetSpace;
            while (currentObject && DisplayObject._ancestors.indexOf(currentObject) === -1)
                currentObject = currentObject._parent;

            DisplayObject._ancestors.length = 0;

            if (currentObject)
                commonParent = currentObject;
else
                throw new skylark.ArgumentError("Object not connected to target");

            currentObject = this;
            while (currentObject != commonParent) {
                resultMatrix.concat(currentObject.transformationMatrix);
                currentObject = currentObject._parent;
            }

            if (commonParent === targetSpace)
                return resultMatrix;

            DisplayObject._helperMatrix.identity();
            currentObject = targetSpace;
            while (currentObject != commonParent) {
                DisplayObject._helperMatrix.concat(currentObject.transformationMatrix);
                currentObject = currentObject._parent;
            }

            DisplayObject._helperMatrix.invert();
            resultMatrix.concat(DisplayObject._helperMatrix);

            return resultMatrix;
        };

        DisplayObject.prototype.getBounds = function (targetSpace, resultRect) {
            if (typeof resultRect === "undefined") { resultRect = null; }
            throw new skylark.AbstractMethodError("Method needs to be implemented in subclass");
        };

        DisplayObject.prototype.hitTest = function (localPoint, forTouch) {
            if (typeof forTouch === "undefined") { forTouch = false; }
            if (forTouch && (!this._visible || !this._touchable))
                return null;

            if (this.getBounds(this, DisplayObject._helperRect).containsPoint(localPoint))
                return this;
else
                return null;
        };

        DisplayObject.prototype.localToGlobal = function (localPoint, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            this.getTransformationMatrix(this.base, DisplayObject._helperMatrix);
            return skylark.MatrixUtil.transformCoords(DisplayObject._helperMatrix, localPoint.x, localPoint.y, resultPoint);
        };

        DisplayObject.prototype.globalToLocal = function (globalPoint, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            this.getTransformationMatrix(this.base, DisplayObject._helperMatrix);
            DisplayObject._helperMatrix.invert();
            return skylark.MatrixUtil.transformCoords(DisplayObject._helperMatrix, globalPoint.x, globalPoint.y, resultPoint);
        };

        DisplayObject.prototype.render = function (support) {
            throw new skylark.AbstractMethodError("Method needs to be implemented in subclass");
        };

        Object.defineProperty(DisplayObject.prototype, "hasVisibleArea", {
            get: function () {
                return this._alpha != 0.0 && this._visible && this._scaleX != 0.0 && this._scaleY != 0.0;
            },
            enumerable: true,
            configurable: true
        });

        DisplayObject.prototype.setParent = function (value) {
            var ancestor = value;
            while (ancestor != this && ancestor != null)
                ancestor = ancestor._parent;

            if (ancestor === this)
                throw new skylark.ArgumentError("An object cannot be <a>added child to itself or one " + "of its children (or children's children, etc.)");
else
                this._parent = value;
        };

        DisplayObject.isEquivalent = function (a, b, epsilon) {
            if (typeof epsilon === "undefined") { epsilon = 0.0001; }
            return (a - epsilon < b) && (a + epsilon > b);
        };

        DisplayObject.normalizeAngle = function (angle) {
            while (angle < -Math.PI)
                angle += Math.PI * 2.0;
            while (angle > Math.PI)
                angle -= Math.PI * 2.0;
            return angle;
        };

        Object.defineProperty(DisplayObject.prototype, "transformationMatrix", {
            get: function () {
                if (this._orientationChanged) {
                    this._orientationChanged = false;
                    this._transformationMatrix.identity();

                    if (this._scaleX != 1.0 || this._scaleY != 1.0)
                        this._transformationMatrix.scale(this._scaleX, this._scaleY);
                    if (this._skewX != 0.0 || this._skewY != 0.0)
                        skylark.MatrixUtil.skew(this._transformationMatrix, this._skewX, this._skewY);
                    if (this._rotation != 0.0)
                        this._transformationMatrix.rotate(this._rotation);
                    if (this.mX != 0.0 || this.mY != 0.0)
                        this._transformationMatrix.translate(this.mX, this.mY);

                    if (this._pivotX != 0.0 || this._pivotY != 0.0) {
                        this._transformationMatrix.tx = this.mX - this._transformationMatrix.a * this._pivotX - this._transformationMatrix.c * this._pivotY;
                        this._transformationMatrix.ty = this.mY - this._transformationMatrix.b * this._pivotX - this._transformationMatrix.d * this._pivotY;
                    }
                }

                return this._transformationMatrix;
            },
            set: function (matrix) {
                this._orientationChanged = false;
                this._transformationMatrix.copyFrom(matrix);

                this.mX = matrix.tx;
                this.mY = matrix.ty;

                this._scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
                this._skewY = Math.acos(matrix.a / this._scaleX);

                if (!DisplayObject.isEquivalent(matrix.b, this._scaleX * Math.sin(this._skewY))) {
                    this._scaleX *= -1;
                    this._skewY = Math.acos(matrix.a / this._scaleX);
                }

                this._scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
                this._skewX = Math.acos(matrix.d / this._scaleY);

                if (!DisplayObject.isEquivalent(matrix.c, -this._scaleY * Math.sin(this._skewX))) {
                    this._scaleY *= -1;
                    this._skewX = Math.acos(matrix.d / this._scaleY);
                }

                if (DisplayObject.isEquivalent(this._skewX, this._skewY)) {
                    this._rotation = this._skewX;
                    this._skewX = this._skewY = 0;
                } else {
                    this._rotation = 0;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "useHandCursor", {
            get: function () {
                return this._useHandCursor;
            },
            set: function (value) {
                if (value !== this._useHandCursor) {
                    this._useHandCursor = value;
                }
            },
            enumerable: true,
            configurable: true
        });


        DisplayObject.prototype.onTouch = function (event) {
        };

        Object.defineProperty(DisplayObject.prototype, "bounds", {
            get: function () {
                return this.getBounds(this._parent);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DisplayObject.prototype, "width", {
            get: function () {
                return this.getBounds(this._parent, DisplayObject._helperRect).width;
            },
            set: function (value) {
                this.scaleX = 1.0;
                var actualWidth = this.width;
                if (actualWidth != 0.0)
                    this.scaleX = value / actualWidth;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "height", {
            get: function () {
                return this.getBounds(this._parent, DisplayObject._helperRect).height;
            },
            set: function (value) {
                this.scaleY = 1.0;
                var actualHeight = this.height;
                if (actualHeight != 0.0)
                    this.scaleY = value / actualHeight;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "x", {
            get: function () {
                return this.mX;
            },
            set: function (value) {
                if (this.mX != value) {
                    this.mX = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "y", {
            get: function () {
                return this.mY;
            },
            set: function (value) {
                if (this.mY != value) {
                    this.mY = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "pivotX", {
            get: function () {
                return this._pivotX;
            },
            set: function (value) {
                if (this._pivotX != value) {
                    this._pivotX = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "pivotY", {
            get: function () {
                return this._pivotY;
            },
            set: function (value) {
                if (this._pivotY != value) {
                    this._pivotY = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "scaleX", {
            get: function () {
                return this._scaleX;
            },
            set: function (value) {
                if (this._scaleX != value) {
                    this._scaleX = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "scaleY", {
            get: function () {
                return this._scaleY;
            },
            set: function (value) {
                if (this._scaleY != value) {
                    this._scaleY = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "skewX", {
            get: function () {
                return this._skewX;
            },
            set: function (value) {
                value = DisplayObject.normalizeAngle(value);

                if (this._skewX != value) {
                    this._skewX = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "skewY", {
            get: function () {
                return this._skewY;
            },
            set: function (value) {
                value = DisplayObject.normalizeAngle(value);

                if (this._skewY != value) {
                    this._skewY = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "rotation", {
            get: function () {
                return this._rotation;
            },
            set: function (value) {
                value = DisplayObject.normalizeAngle(value);

                if (this._rotation != value) {
                    this._rotation = value;
                    this._orientationChanged = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "alpha", {
            get: function () {
                return this._alpha;
            },
            set: function (value) {
                this._alpha = value < 0.0 ? 0.0 : (value > 1.0 ? 1.0 : value);
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                this._visible = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "touchable", {
            get: function () {
                return this._touchable;
            },
            set: function (value) {
                this._touchable = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "blendMode", {
            get: function () {
                return this._blendMode;
            },
            set: function (value) {
                this._blendMode = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DisplayObject.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DisplayObject.prototype, "base", {
            get: function () {
                var currentObject = this;
                while (currentObject._parent)
                    currentObject = currentObject._parent;
                return currentObject;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DisplayObject.prototype, "root", {
            get: function () {
                var currentObject = this;
                while (currentObject._parent) {
                    if (currentObject._parent instanceof skylark.Stage)
                        return currentObject;
else
                        currentObject = currentObject.parent;
                }

                return null;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DisplayObject.prototype, "stage", {
            get: function () {
                var s = this.base;
                return s instanceof skylark.Stage ? s : null;
            },
            enumerable: true,
            configurable: true
        });
        DisplayObject._ancestors = [];
        DisplayObject._helperRect = new skylark.Rectangle();
        DisplayObject._helperMatrix = new skylark.Matrix();
        return DisplayObject;
    })(skylark.EventDispatcher);
    skylark.DisplayObject = DisplayObject;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var DisplayObjectContainer = (function (_super) {
        __extends(DisplayObjectContainer, _super);
        function DisplayObjectContainer() {
            _super.call(this);

            this._children = [];
        }
        DisplayObjectContainer.prototype.dispose = function () {
            for (var i = this._children.length - 1; i >= 0; --i)
                this._children[i].dispose();

            _super.prototype.dispose.call(this);
        };

        DisplayObjectContainer.prototype.addChild = function (child) {
            this.addChildAt(child, this.numChildren);
            return child;
        };

        DisplayObjectContainer.prototype.addChildAt = function (child, index) {
            var numChildren = this._children.length;

            if (index >= 0 && index <= numChildren) {
                child.removeFromParent();

                if (index == numChildren)
                    this._children.push(child);
else
                    this._children.splice(index, 0, child);

                child.setParent(this);
                child.dispatchEventWith(skylark.Event.ADDED, true);

                if (this.stage) {
                    var container = child;
                    if (child instanceof DisplayObjectContainer) {
                        (container).broadcastEventWith(skylark.Event.ADDED_TO_STAGE);
                    } else {
                        child.dispatchEventWith(skylark.Event.ADDED_TO_STAGE);
                    }
                }

                return child;
            } else {
                throw new RangeError("Invalid child index");
            }
        };

        DisplayObjectContainer.prototype.removeChild = function (child, dispose) {
            if (typeof dispose === "undefined") { dispose = false; }
            var childIndex = this.getChildIndex(child);
            if (childIndex != -1)
                this.removeChildAt(childIndex, dispose);
            return child;
        };

        DisplayObjectContainer.prototype.removeChildAt = function (index, dispose) {
            if (typeof dispose === "undefined") { dispose = false; }
            if (index >= 0 && index < this.numChildren) {
                var child = this._children[index];
                child.dispatchEventWith(skylark.Event.REMOVED, true);

                if (this.stage) {
                    var container = child;
                    if (child instanceof DisplayObjectContainer) {
                        (container).broadcastEventWith(skylark.Event.REMOVED_FROM_STAGE);
                    } else {
                        child.dispatchEventWith(skylark.Event.REMOVED_FROM_STAGE);
                    }
                }

                child.setParent(null);
                index = this._children.indexOf(child);
                if (index >= 0)
                    this._children.splice(index, 1);
                if (dispose)
                    child.dispose();

                return child;
            } else {
                throw new RangeError("Invalid child index");
            }
        };

        DisplayObjectContainer.prototype.removeChildren = function (beginIndex, endIndex, dispose) {
            if (typeof beginIndex === "undefined") { beginIndex = 0; }
            if (typeof endIndex === "undefined") { endIndex = -1; }
            if (typeof dispose === "undefined") { dispose = false; }
            if (endIndex < 0 || endIndex >= this.numChildren)
                endIndex = this.numChildren - 1;

            for (var i = beginIndex; i <= endIndex; ++i)
                this.removeChildAt(beginIndex, dispose);
        };

        DisplayObjectContainer.prototype.getChildAt = function (index) {
            if (index >= 0 && index < this.numChildren)
                return this._children[index];
else
                throw new RangeError("Invalid child index");
        };

        DisplayObjectContainer.prototype.getChildByName = function (name) {
            var numChildren = this._children.length;
            for (var i = 0; i < numChildren; ++i)
                if (this._children[i].name == name)
                    return this._children[i];

            return null;
        };

        DisplayObjectContainer.prototype.getChildIndex = function (child) {
            return this._children.indexOf(child);
        };

        DisplayObjectContainer.prototype.setChildIndex = function (child, index) {
            var oldIndex = this.getChildIndex(child);
            if (oldIndex == -1)
                throw new skylark.ArgumentError("Not a child of this container");
            this._children.splice(oldIndex, 1);
            this._children.splice(index, 0, child);
        };

        DisplayObjectContainer.prototype.swapChildren = function (child1, child2) {
            var index1 = this.getChildIndex(child1);
            var index2 = this.getChildIndex(child2);
            if (index1 == -1 || index2 == -1)
                throw new skylark.ArgumentError("Not a child of this container");
            this.swapChildrenAt(index1, index2);
        };

        DisplayObjectContainer.prototype.swapChildrenAt = function (index1, index2) {
            var child1 = this.getChildAt(index1);
            var child2 = this.getChildAt(index2);
            this._children[index1] = child2;
            this._children[index2] = child1;
        };

        DisplayObjectContainer.prototype.sortChildren = function (compareFunction) {
            this._children.sort(compareFunction);
        };

        DisplayObjectContainer.prototype.contains = function (child) {
            while (child) {
                if (child == this)
                    return true;
else
                    child = child.parent;
            }
            return false;
        };

        DisplayObjectContainer.prototype.getBounds = function (targetSpace, resultRect) {
            if (typeof resultRect === "undefined") { resultRect = null; }
            if (resultRect == null)
                resultRect = new skylark.Rectangle();

            var numChildren = this._children.length;

            if (numChildren == 0) {
                this.getTransformationMatrix(targetSpace, DisplayObjectContainer._helperMatrix);
                skylark.MatrixUtil.transformCoords(DisplayObjectContainer._helperMatrix, 0.0, 0.0, DisplayObjectContainer._helperPoint);
                resultRect.setTo(DisplayObjectContainer._helperPoint.x, DisplayObjectContainer._helperPoint.y, 0, 0);
                return resultRect;
            } else if (numChildren == 1) {
                return this._children[0].getBounds(targetSpace, resultRect);
            } else {
                var minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE;
                var minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;

                for (var i = 0; i < numChildren; ++i) {
                    this._children[i].getBounds(targetSpace, resultRect);
                    minX = minX < resultRect.x ? minX : resultRect.x;
                    maxX = maxX > resultRect.right ? maxX : resultRect.right;
                    minY = minY < resultRect.y ? minY : resultRect.y;
                    maxY = maxY > resultRect.bottom ? maxY : resultRect.bottom;
                }

                resultRect.setTo(minX, minY, maxX - minX, maxY - minY);
                return resultRect;
            }
        };

        DisplayObjectContainer.prototype.hitTest = function (localPoint, forTouch) {
            if (typeof forTouch === "undefined") { forTouch = false; }
            if (forTouch && (!this.visible || !this.touchable))
                return null;

            var localX = localPoint.x;
            var localY = localPoint.y;

            var numChildren = this._children.length;
            for (var i = numChildren - 1; i >= 0; --i) {
                var child = this._children[i];
                this.getTransformationMatrix(child, DisplayObjectContainer._helperMatrix);

                skylark.MatrixUtil.transformCoords(DisplayObjectContainer._helperMatrix, localX, localY, DisplayObjectContainer._helperPoint);
                var target = child.hitTest(DisplayObjectContainer._helperPoint, forTouch);

                if (target)
                    return target;
            }

            return null;
        };

        DisplayObjectContainer.prototype.render = function (support) {
            var alpha = this.alpha;
            var numChildren = this._children.length;
            var blendMode = support.blendMode;

            for (var i = 0; i < numChildren; ++i) {
                var child = this._children[i];

                if (child.hasVisibleArea) {
                    support.pushState();
                    support.transformMatrix(child);
                    support.blendMode = child.blendMode;
                    support.alpha = child.alpha;

                    child.render(support);

                    support.blendMode = blendMode;
                    support.popState();
                }
            }
        };

        DisplayObjectContainer.prototype.broadcastEvent = function (event) {
            if (event.bubbles)
                throw new skylark.ArgumentError("Broadcast of bubbling events is prohibited");

            var _broadcastListeners = DisplayObjectContainer._broadcastListeners;

            var fromIndex = DisplayObjectContainer._broadcastListeners.length;
            this.getChildEventListeners(this, event.type, DisplayObjectContainer._broadcastListeners);
            var toIndex = DisplayObjectContainer._broadcastListeners.length;

            for (var i = fromIndex; i < toIndex; ++i)
                DisplayObjectContainer._broadcastListeners[i].dispatchEvent(event);

            DisplayObjectContainer._broadcastListeners.length = fromIndex;
        };

        DisplayObjectContainer.prototype.broadcastEventWith = function (type, data) {
            if (typeof data === "undefined") { data = null; }
            var event = skylark.Event.fromPool(type, false, data);
            this.broadcastEvent(event);
            skylark.Event.toPool(event);
        };

        DisplayObjectContainer.prototype.getChildEventListeners = function (object, eventType, listeners) {
            var container = object;

            if (object.hasEventListener(eventType))
                listeners.push(object);

            if (container && container._children) {
                var children = container._children;
                var numChildren = children.length;

                for (var i = 0; i < numChildren; ++i)
                    this.getChildEventListeners(children[i], eventType, listeners);
            }
        };

        Object.defineProperty(DisplayObjectContainer.prototype, "numChildren", {
            get: function () {
                return this._children.length;
            },
            enumerable: true,
            configurable: true
        });
        DisplayObjectContainer._helperMatrix = new skylark.Matrix();
        DisplayObjectContainer._helperPoint = new skylark.Point();
        DisplayObjectContainer._broadcastListeners = [];
        return DisplayObjectContainer;
    })(skylark.DisplayObject);
    skylark.DisplayObjectContainer = DisplayObjectContainer;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Quad = (function (_super) {
        __extends(Quad, _super);
        function Quad(width, height, color, premultipliedAlpha) {
            if (typeof color === "undefined") { color = 0xffffff; }
            if (typeof premultipliedAlpha === "undefined") { premultipliedAlpha = true; }
            _super.call(this);
            if (width == null || height == null)
                throw new skylark.ArgumentError('Either "width" or "height" is undefined: ' + width + ', ' + height);
            this._tinted = color != 0xffffff;

            this._vertexData = new skylark.VertexData(4, premultipliedAlpha);
            this._vertexData.setPosition(0, 0.0, 0.0);
            this._vertexData.setPosition(1, width, 0.0);
            this._vertexData.setPosition(2, 0.0, height);
            this._vertexData.setPosition(3, width, height);
            this._vertexData.setUniformColor(color);

            this.onVertexDataChanged();
        }
        Quad.prototype.onVertexDataChanged = function () {
        };

        Quad.prototype.getBounds = function (targetSpace, resultRect) {
            if (typeof resultRect === "undefined") { resultRect = null; }
            if (resultRect == null)
                resultRect = new skylark.Rectangle();

            if (targetSpace === this) {
                this._vertexData.getPosition(3, Quad._helperPoint);
                resultRect.setTo(0.0, 0.0, Quad._helperPoint.x, Quad._helperPoint.y);
            } else if (targetSpace === this.parent && this.rotation === 0.0) {
                var scaleX = this.scaleX;
                var scaleY = this.scaleY;
                this._vertexData.getPosition(3, Quad._helperPoint);
                resultRect.setTo(this.x - this.pivotX * scaleX, this.y - this.pivotY * scaleY, Quad._helperPoint.x * scaleX, Quad._helperPoint.y * scaleY);
                if (scaleX < 0) {
                    resultRect.width *= -1;
                    resultRect.x -= resultRect.width;
                }
                if (scaleY < 0) {
                    resultRect.height *= -1;
                    resultRect.y -= resultRect.height;
                }
            } else {
                this.getTransformationMatrix(targetSpace, Quad._helperMatrix);
                this._vertexData.getBounds(Quad._helperMatrix, 0, 4, resultRect);
            }

            return resultRect;
        };

        Quad.prototype.getVertexColor = function (vertexID) {
            return this._vertexData.getColor(vertexID);
        };

        Quad.prototype.setVertexColor = function (vertexID, color) {
            this._vertexData.setColor(vertexID, color);
            this.onVertexDataChanged();

            if (color != 0xffffff)
                this._tinted = true;
else
                this._tinted = this._vertexData.tinted;
        };

        Quad.prototype.getVertexAlpha = function (vertexID) {
            return this._vertexData.getAlpha(vertexID);
        };

        Quad.prototype.setVertexAlpha = function (vertexID, alpha) {
            this._vertexData.setAlpha(vertexID, alpha);
            this.onVertexDataChanged();

            if (alpha != 1.0)
                this._tinted = true;
else
                this._tinted = this._vertexData.tinted;
        };

        Object.defineProperty(Quad.prototype, "color", {
            get: function () {
                return this._vertexData.getColor(0);
            },
            set: function (value) {
                for (var i = 0; i < 4; ++i)
                    this.setVertexColor(i, value);

                if (value != 0xffffff || this.alpha != 1.0)
                    this._tinted = true;
else
                    this._tinted = this._vertexData.tinted;
            },
            enumerable: true,
            configurable: true
        });



        Object.defineProperty(Quad.prototype, "alpha", {
            get: function () {
                return Object.getOwnPropertyDescriptor(_super.prototype, 'alpha').get.call(this);
            },
            set: function (value) {
                Object.getOwnPropertyDescriptor(_super.prototype, 'alpha').set.call(this, value);

                if (value < 1.0)
                    this._tinted = true;
else
                    this._tinted = this._vertexData.tinted;
            },
            enumerable: true,
            configurable: true
        });

        Quad.prototype.copyVertexDataTo = function (targetData, targetVertexID) {
            if (typeof targetVertexID === "undefined") { targetVertexID = 0; }
            this._vertexData.copyTo(targetData, targetVertexID);
        };

        Quad.prototype.render = function (support) {
            var context = support.context;

            context.save();

            var m = support.mvpMatrix;

            context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);

            context.globalAlpha = support.alpha;

            if (this.blendMode == null)
                throw new skylark.IllegalOperationError('a blend mode value of "null" is not supported!');

            support.applyBlendMode(false);

            this.renderTransformed(support, context);

            context.restore();
        };

        Quad.prototype.renderTransformed = function (support, context) {
            context.fillStyle = skylark.Color.toHexString(this.color);
            context.fillRect(0, 0, this.width, this.height);
        };

        Object.defineProperty(Quad.prototype, "tinted", {
            get: function () {
                return this._tinted;
            },
            enumerable: true,
            configurable: true
        });
        Quad._helperPoint = new skylark.Point();
        Quad._helperMatrix = new skylark.Matrix();
        return Quad;
    })(skylark.DisplayObject);
    skylark.Quad = Quad;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image(a) {
            if (a == null)
                throw new skylark.ArgumentError("Image constructor requires a Texture or a HTMLImageElement/Image object");

            var texture;
            if (a instanceof HTMLImageElement)
                texture = new skylark.ConcreteTexture(a);
else
                texture = a;

            var frame = texture.frame;
            var width = frame ? frame.width : texture.width;
            var height = frame ? frame.height : texture.height;
            var pma = texture.premultipliedAlpha;

            _super.call(this, width, height, 0xffffff, pma);

            this._vertexData.setTexCoords(0, 0.0, 0.0);
            this._vertexData.setTexCoords(1, 1.0, 0.0);
            this._vertexData.setTexCoords(2, 0.0, 1.0);
            this._vertexData.setTexCoords(3, 1.0, 1.0);

            this._texture = texture;
            this._smoothing = skylark.TextureSmoothing.BILINEAR;
            this._vertexDataCache = new skylark.VertexData(4, pma);
            this._vertexDataCacheInvalid = true;
        }
        Image.prototype.onVertexDataChanged = function () {
            this._vertexDataCacheInvalid = true;
        };

        Image.prototype.readjustSize = function () {
            var texture = this.texture;
            var frame = texture.frame;
            var width = frame ? frame.width : texture.width;
            var height = frame ? frame.height : texture.height;

            this._vertexData.setPosition(0, 0.0, 0.0);
            this._vertexData.setPosition(1, width, 0.0);
            this._vertexData.setPosition(2, 0.0, height);
            this._vertexData.setPosition(3, width, height);

            this.onVertexDataChanged();
        };

        Image.prototype.setTexCoords = function (vertexID, coords) {
            this._vertexData.setTexCoords(vertexID, coords.x, coords.y);
            this.onVertexDataChanged();
        };

        Image.prototype.getTexCoords = function (vertexID, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            if (resultPoint == null)
                resultPoint = new skylark.Point();
            this._vertexData.getTexCoords(vertexID, resultPoint);
            return resultPoint;
        };

        Image.prototype.copyVertexDataTo = function (targetData, targetVertexID) {
            if (typeof targetVertexID === "undefined") { targetVertexID = 0; }
            if (this._vertexDataCacheInvalid) {
                this._vertexDataCacheInvalid = false;
                this._vertexData.copyTo(this._vertexDataCache);
                this._texture.adjustVertexData(this._vertexDataCache, 0, 4);
            }

            this._vertexDataCache.copyTo(targetData, targetVertexID);
        };

        Object.defineProperty(Image.prototype, "texture", {
            get: function () {
                return this._texture;
            },
            set: function (value) {
                if (value == null)
                    throw new skylark.ArgumentError("Texture cannot be null");

                if (value != this._texture) {
                    this._texture = value;
                    this._vertexData.setPremultipliedAlpha(this._texture.premultipliedAlpha);
                    this.onVertexDataChanged();
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Image.prototype, "smoothing", {
            get: function () {
                return this._smoothing;
            },
            set: function (value) {
                if (skylark.TextureSmoothing.isValid(value))
                    this._smoothing = value;
else
                    throw new skylark.ArgumentError("Invalid smoothing mode: " + value);
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Image.prototype, "color", {
            set: function (value) {
                throw new skylark.DefaultError('Image class does not support "color" tinting (yet?)');
            },
            enumerable: true,
            configurable: true
        });

        Image.prototype.renderTransformed = function (support, context) {
            if (this._vertexDataCacheInvalid) {
                this._vertexDataCacheInvalid = false;
                this._vertexData.copyTo(this._vertexDataCache);
                this._texture.adjustVertexData(this._vertexDataCache, 0, 4);
            }

            var texture = this._texture;
            var base = texture.base;
            var image = base != null ? base.image : null;

            if (image == null)
                throw new skylark.DefaultError('Cannot render Texture without "base.image" property');

            var vd = this._vertexDataCache;
            var hp = skylark.Quad._helperPoint;

            var textureWidth = texture.root.width;
            var textureHeight = texture.root.height;

            vd.getTexCoords(0, hp);
            var sx = hp.x * textureWidth;
            var sy = hp.y * textureHeight;
            vd.getTexCoords(3, hp);
            var sw = hp.x * textureWidth - sx;
            var sh = hp.y * textureHeight - sy;

            vd.getPosition(0, hp);
            var dx = hp.x;
            var dy = hp.y;

            var dw = sw;
            var dh = sh;

            context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        };
        return Image;
    })(skylark.Quad);
    skylark.Image = Image;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip(textures, fps) {
            if (typeof fps === "undefined") { fps = 12; }
            if (textures.length > 0) {
                _super.call(this, textures[0]);
                this.init(textures, fps);
            } else {
                throw new skylark.ArgumentError("Empty texture array");
            }
        }
        MovieClip.prototype.init = function (textures, fps) {
            if (fps <= 0)
                throw new skylark.ArgumentError("Invalid fps: " + fps);

            var numFrames = textures.length;

            this._defaultFrameDuration = 1.0 / fps;
            this._loop = true;
            this._playing = true;
            this._currentTime = 0.0;
            this._currentFrame = 0;
            this._totalTime = this._defaultFrameDuration * numFrames;
            this._textures = textures.concat();
            this._sounds = new Array(numFrames);
            this._durations = new Array(numFrames);
            this._startTimes = new Array(numFrames);

            for (var i = 0; i < numFrames; ++i) {
                this._durations[i] = this._defaultFrameDuration;
                this._startTimes[i] = i * this._defaultFrameDuration;
            }
        };

        MovieClip.prototype.addFrame = function (texture, sound, duration) {
            if (typeof sound === "undefined") { sound = null; }
            if (typeof duration === "undefined") { duration = -1; }
            this.addFrameAt(this.numFrames, texture, sound, duration);
        };

        MovieClip.prototype.addFrameAt = function (frameID, texture, sound, duration) {
            if (typeof sound === "undefined") { sound = null; }
            if (typeof duration === "undefined") { duration = -1; }
            if (frameID < 0 || frameID > this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            if (duration < 0)
                duration = this._defaultFrameDuration;

            this._textures.splice(frameID, 0, texture);
            this._sounds.splice(frameID, 0, sound);
            this._durations.splice(frameID, 0, duration);
            this._totalTime += duration;

            if (frameID > 0 && frameID == this.numFrames)
                this._startTimes[frameID] = this._startTimes[frameID - 1] + this._durations[frameID - 1];
else
                this.updateStartTimes();
        };

        MovieClip.prototype.removeFrameAt = function (frameID) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");
            if (this.numFrames == 1)
                throw new skylark.IllegalOperationError("Movie clip must not be empty");

            this._totalTime -= this.getFrameDuration(frameID);
            this._textures.splice(frameID, 1);
            this._sounds.splice(frameID, 1);
            this._durations.splice(frameID, 1);

            this.updateStartTimes();
        };

        MovieClip.prototype.getFrameTexture = function (frameID) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            return this._textures[frameID];
        };

        MovieClip.prototype.setFrameTexture = function (frameID, texture) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            this._textures[frameID] = texture;
        };

        MovieClip.prototype.getFrameSound = function (frameID) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            return this._sounds[frameID];
        };

        MovieClip.prototype.setFrameSound = function (frameID, sound) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            this._sounds[frameID] = sound;
        };

        MovieClip.prototype.getFrameDuration = function (frameID) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            return this._durations[frameID];
        };

        MovieClip.prototype.setFrameDuration = function (frameID, duration) {
            if (frameID < 0 || frameID >= this.numFrames)
                throw new skylark.ArgumentError("Invalid frame id");

            this._totalTime -= this.getFrameDuration(frameID);
            this._totalTime += duration;
            this._durations[frameID] = duration;
            this.updateStartTimes();
        };

        MovieClip.prototype.play = function () {
            this._playing = true;
        };

        MovieClip.prototype.pause = function () {
            this._playing = false;
        };

        MovieClip.prototype.stop = function () {
            this._playing = false;
            this.currentFrame = 0;
        };

        MovieClip.prototype.updateStartTimes = function () {
            var numFrames = this.numFrames;

            this._startTimes.length = 0;
            this._startTimes[0] = 0;

            for (var i = 1; i < numFrames; ++i)
                this._startTimes[i] = this._startTimes[i - 1] + this._durations[i - 1];
        };

        MovieClip.prototype.advanceTime = function (passedTime) {
            var finalFrame;
            var previousFrame = this._currentFrame;
            var restTime = 0.0;
            var breakAfterFrame = false;

            if (this._loop && this._currentTime == this._totalTime) {
                this._currentTime = 0.0;
                this._currentFrame = 0;
            }

            if (this._playing && passedTime > 0.0 && this._currentTime < this._totalTime) {
                this._currentTime += passedTime;
                finalFrame = this._textures.length - 1;

                while (this._currentTime >= this._startTimes[this._currentFrame] + this._durations[this._currentFrame]) {
                    if (this._currentFrame == finalFrame) {
                        if (this.hasEventListener(skylark.Event.COMPLETE)) {
                            if (this._currentFrame != previousFrame)
                                this.texture = this._textures[this._currentFrame];

                            restTime = this._currentTime - this._totalTime;
                            this._currentTime = this._totalTime;
                            this.dispatchEventWith(skylark.Event.COMPLETE);
                            breakAfterFrame = true;
                        }

                        if (this._loop) {
                            this._currentTime -= this._totalTime;
                            this._currentFrame = 0;
                        } else {
                            this._currentTime = this._totalTime;
                            breakAfterFrame = true;
                        }
                    } else {
                        this._currentFrame++;
                    }

                    var sound = this._sounds[this._currentFrame];
                    if (sound)
                        sound.play();
                    if (breakAfterFrame)
                        break;
                }
            }

            if (this._currentFrame != previousFrame)
                this.texture = this._textures[this._currentFrame];

            if (restTime)
                this.advanceTime(restTime);
        };

        Object.defineProperty(MovieClip.prototype, "isComplete", {
            get: function () {
                return !this._loop && this._currentTime >= this._totalTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(MovieClip.prototype, "totalTime", {
            get: function () {
                return this._totalTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(MovieClip.prototype, "numFrames", {
            get: function () {
                return this._textures.length;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(MovieClip.prototype, "loop", {
            get: function () {
                return this._loop;
            },
            set: function (value) {
                this._loop = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(MovieClip.prototype, "currentFrame", {
            get: function () {
                return this._currentFrame;
            },
            set: function (value) {
                this._currentFrame = value;
                this._currentTime = 0.0;

                for (var i = 0; i < value; ++i)
                    this._currentTime += this.getFrameDuration(i);

                this.texture = this._textures[this._currentFrame];
                if (this._sounds[this._currentFrame])
                    this._sounds[this._currentFrame].play();
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(MovieClip.prototype, "fps", {
            get: function () {
                return 1.0 / this._defaultFrameDuration;
            },
            set: function (value) {
                if (value <= 0)
                    throw new skylark.ArgumentError("Invalid fps: " + value);

                var newFrameDuration = 1.0 / value;
                var acceleration = newFrameDuration / this._defaultFrameDuration;
                this._currentTime *= acceleration;
                this._defaultFrameDuration = newFrameDuration;

                for (var i = 0; i < this.numFrames; ++i) {
                    var duration = this._durations[i] * acceleration;
                    this._totalTime = this._totalTime - this._durations[i] + duration;
                    this._durations[i] = duration;
                }

                this.updateStartTimes();
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(MovieClip.prototype, "isPlaying", {
            get: function () {
                if (this._playing)
                    return this._loop || this._currentTime < this._totalTime;
else
                    return false;
            },
            enumerable: true,
            configurable: true
        });
        return MovieClip;
    })(skylark.Image);
    skylark.MovieClip = MovieClip;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            _super.call(this);
        }
        Sprite.prototype.dispose = function () {
            this.disposeFlattenedContents();
            _super.prototype.dispose.call(this);
        };

        Sprite.prototype.disposeFlattenedContents = function () {
            var _flattenedContents = this._flattenedContents;

            if (this._flattenedContents) {
                for (var i = 0, max = this._flattenedContents.length; i < max; ++i)
                    this._flattenedContents[i].dispose();

                this._flattenedContents = null;
            }
        };

        Sprite.prototype.flatten = function () {
            this._flattenRequested = true;
            this.broadcastEventWith(skylark.Event.FLATTEN);
        };

        Sprite.prototype.unflatten = function () {
            this._flattenRequested = false;
            this.disposeFlattenedContents();
        };

        Object.defineProperty(Sprite.prototype, "isFlattened", {
            get: function () {
                return (this._flattenedContents != null) || this._flattenRequested;
            },
            enumerable: true,
            configurable: true
        });
        return Sprite;
    })(skylark.DisplayObjectContainer);
    skylark.Sprite = Sprite;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Stage = (function (_super) {
        __extends(Stage, _super);
        function Stage(width, height, color, alpha) {
            _super.call(this);
            this._enterFrameEvent = new skylark.EnterFrameEvent(skylark.Event.ENTER_FRAME, 0.0);
            this._width = width;
            this._height = height;

            if (typeof color === 'undefined') {
                color = 0;
                alpha = 0;
            }

            if (typeof alpha === 'undefined')
                alpha = 1.0;

            this._color = color;
            this.alpha = alpha;
        }
        Stage.prototype.advanceTime = function (passedTime) {
            this._enterFrameEvent.reset(skylark.Event.ENTER_FRAME, false, passedTime);
            this.broadcastEvent(this._enterFrameEvent);
        };

        Stage.prototype.hitTest = function (localPoint, forTouch) {
            if (typeof forTouch === "undefined") { forTouch = false; }
            if (forTouch && (!this.visible || !this.touchable))
                return null;

            if (localPoint.x < 0 || localPoint.x > this._width || localPoint.y < 0 || localPoint.y > this._height)
                return null;

            var target = _super.prototype.hitTest.call(this, localPoint, forTouch);
            if (target == null)
                target = this;
            return target;
        };

        Object.defineProperty(Stage.prototype, "width", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot set width of stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "height", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot set height of stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "x", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot set x-coordinate of stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "y", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot set y-coordinate of stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "scaleX", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot scale stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "scaleY", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot scale stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "rotation", {
            set: function (value) {
                throw new skylark.IllegalOperationError("Cannot rotate stage");
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stage.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (value) {
                this._color = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Stage.prototype, "stageWidth", {
            get: function () {
                return this._width;
            },
            set: function (value) {
                this._width = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Stage.prototype, "stageHeight", {
            get: function () {
                return this._height;
            },
            set: function (value) {
                this._height = value;
            },
            enumerable: true,
            configurable: true
        });

        return Stage;
    })(skylark.DisplayObjectContainer);
    skylark.Stage = Stage;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var BlendMode = (function () {
        function BlendMode() {
            throw new skylark.AbstractClassError();
        }
        BlendMode.AUTO = "auto";

        BlendMode.NONE = "copy";

        BlendMode.NORMAL = "source-over";

        BlendMode.ADD = "add";

        BlendMode.MULTIPLY = "multiply";

        BlendMode.SCREEN = "screen";

        BlendMode.ERASE = "destination-out";
        return BlendMode;
    })();
    skylark.BlendMode = BlendMode;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(upState, b, c) {
            if (upState == null)
                throw new skylark.ArgumentError("Texture cannot be null");

            _super.call(this);

            var downState;
            var text;
            if (typeof b === 'string') {
                text = b;
                downState = c;
            } else if (typeof b != null) {
                downState = b;
            }

            this._upState = upState;
            this._downState = downState ? downState : upState;
            this._background = new skylark.Image(upState);
            this._scaleWhenDown = downState ? 1.0 : 0.9;
            this._alphaWhenDisabled = 0.5;
            this._enabled = true;
            this._isDown = false;
            this.useHandCursor = true;
            this._textBounds = new skylark.Rectangle(0, 0, upState.width, upState.height);

            this._contents = new skylark.Sprite();
            this._contents.addChild(this._background);
            this.addChild(this._contents);
            this.addEventListener(skylark.TouchEvent.TOUCH, this.onTouchButton);

            if (text != null && text.length > 0)
                this.text = text;
        }
        Button.prototype.resetContents = function () {
            this._isDown = false;
            this._background.texture = this._upState;
            this._contents.x = this._contents.y = 0;
            this._contents.scaleX = this._contents.scaleY = 1.0;
        };

        Button.prototype.createTextField = function () {
            if (this._textField == null) {
                this._textField = new skylark.TextField(this._textBounds.width, this._textBounds.height, "");
                this._textField.vAlign = skylark.VAlign.CENTER;
                this._textField.hAlign = skylark.HAlign.CENTER;
                this._textField.touchable = false;
                this._textField.autoScale = true;
                this._contents.addChild(this._textField);
            }

            this._textField.width = this._textBounds.width;
            this._textField.height = this._textBounds.height;
            this._textField.x = this._textBounds.x;
            this._textField.y = this._textBounds.y;
        };

        Button.prototype.onTouchButton = function (event) {
            var touch = event.getTouch(this);
            if (!this._enabled || touch == null)
                return;

            if (touch.phase == skylark.TouchPhase.BEGAN && !this._isDown) {
                this._background.texture = this._downState;
                this._contents.scaleX = this._contents.scaleY = this._scaleWhenDown;
                this._contents.x = (1.0 - this._scaleWhenDown) / 2.0 * this._background.width;
                this._contents.y = (1.0 - this._scaleWhenDown) / 2.0 * this._background.height;
                this._isDown = true;
            } else if (touch.phase == skylark.TouchPhase.MOVED && this._isDown) {
                var buttonRect = this.getBounds(this.stage);
                if (touch.globalX < buttonRect.x - Button.MAX_DRAG_DIST || touch.globalY < buttonRect.y - Button.MAX_DRAG_DIST || touch.globalX > buttonRect.x + buttonRect.width + Button.MAX_DRAG_DIST || touch.globalY > buttonRect.y + buttonRect.height + Button.MAX_DRAG_DIST) {
                    this.resetContents();
                }
            } else if (touch.phase == skylark.TouchPhase.ENDED && this._isDown) {
                this.resetContents();
                this.dispatchEventWith(skylark.Event.TRIGGERED, true);
            }
        };

        Object.defineProperty(Button.prototype, "scaleWhenDown", {
            get: function () {
                return this._scaleWhenDown;
            },
            set: function (value) {
                this._scaleWhenDown = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "alphaWhenDisabled", {
            get: function () {
                return this._alphaWhenDisabled;
            },
            set: function (value) {
                this._alphaWhenDisabled = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "enabled", {
            get: function () {
                return this._enabled;
            },
            set: function (value) {
                if (this._enabled != value) {
                    this._enabled = value;
                    this._contents.alpha = value ? 1.0 : this._alphaWhenDisabled;
                    this.resetContents();
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "text", {
            get: function () {
                return this._textField ? this._textField.text : "";
            },
            set: function (value) {
                this.createTextField();
                this._textField.text = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "fontName", {
            get: function () {
                return this._textField ? this._textField.fontName : "Verdana";
            },
            set: function (value) {
                this.createTextField();
                this._textField.fontName = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "fontSize", {
            get: function () {
                return this._textField ? this._textField.fontSize : 12;
            },
            set: function (value) {
                this.createTextField();
                this._textField.fontSize = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "fontColor", {
            get: function () {
                return this._textField ? this._textField.color : 0x0;
            },
            set: function (value) {
                this.createTextField();
                this._textField.color = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "fontBold", {
            get: function () {
                return this._textField ? this._textField.bold : false;
            },
            set: function (value) {
                this.createTextField();
                this._textField.bold = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "upState", {
            get: function () {
                return this._upState;
            },
            set: function (value) {
                if (this._upState != value) {
                    this._upState = value;
                    if (!this._isDown)
                        this._background.texture = value;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "downState", {
            get: function () {
                return this._downState;
            },
            set: function (value) {
                if (this._downState != value) {
                    this._downState = value;
                    if (this._isDown)
                        this._background.texture = value;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "textVAlign", {
            get: function () {
                return this._textField.vAlign;
            },
            set: function (value) {
                this.createTextField();
                this._textField.vAlign = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "textHAlign", {
            get: function () {
                return this._textField.hAlign;
            },
            set: function (value) {
                this.createTextField();
                this._textField.hAlign = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Button.prototype, "textBounds", {
            get: function () {
                return this._textBounds.clone();
            },
            set: function (value) {
                this._textBounds = value.clone();
                this.createTextField();
            },
            enumerable: true,
            configurable: true
        });

        Button.MAX_DRAG_DIST = 50;
        return Button;
    })(skylark.DisplayObjectContainer);
    skylark.Button = Button;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var ClassUtil = (function () {
        function ClassUtil() {
        }
        ClassUtil.getQualifiedClassName = function (obj) {
            var constructor;
            if (typeof obj === 'function') {
                constructor = obj;
            } else if (typeof obj === 'object' && obj.constructor != null) {
                constructor = obj.constructor;
            } else
                throw new skylark.ArgumentError('Given object is not a (constructor) function or an object instance created by a constructor function!');

            return constructor.name;
        };

        ClassUtil.getDefinitionByName = function (name) {
            return eval(name);
        };

        ClassUtil.isClass = function (obj) {
            return typeof obj === 'function' && obj.constructor != null;
        };

        ClassUtil.isCanvasImageSource = function (obj) {
            return obj instanceof HTMLCanvasElement || obj instanceof HTMLImageElement || obj instanceof HTMLVideoElement;
        };
        return ClassUtil;
    })();
    skylark.ClassUtil = ClassUtil;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var StringUtil = (function () {
        function StringUtil() {
        }
        StringUtil.format = function (str) {
            var values = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                values[_i] = arguments[_i + 1];
            }
            var result = str, arg;
            for (arg = 0; arg < values.length; arg++) {
                result = result.replace("{" + arg + "}", values[arg]);
            }
            return result;
        };

        StringUtil.parseXml = function (xmlStr) {
            var document = (new DOMParser()).parseFromString(xmlStr, "text/xml");

            if (document.getElementsByTagName('parsererror').length)
                throw new skylark.InvalidXmlError('XML failed to parse correctly', xmlStr, document.getElementsByTagName('parsererror'));

            return document;
        };

        StringUtil.xmlToJson = function (node, simple) {
            if (typeof simple === "undefined") { simple = true; }
            if (!(node instanceof Document))
                throw new skylark.ArgumentError('xmlToJson expects a "Document" as first parameter.');

            var proto = {
                attribute: function (name) {
                    return this.attributes[name];
                }
            };

            function convert(node) {
                if (!node)
                    return null;

                function jsVar(s) {
                    return String(s || '').replace(/-/g, "_");
                }

                function isNum(s) {
                    var regexp = /^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/;
                    return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? s.trim() : ''));
                }

                function myArr(o) {
                    if (!Array.isArray(o))
                        o = [o];
                    return o;
                }

                function createObj() {
                    return simple ? {} : Object.create(proto);
                }

                var txt = '', obj = null, target = null;
                var nodeType = node.nodeType;
                var nodeName = jsVar(node.localName || node.nodeName);
                var nodeValue = (node).text || node.nodeValue || '';

                var childNodes = node.childNodes;
                if (childNodes) {
                    if (childNodes.length > 0) {
                        for (var i = 0; i < childNodes.length; i++) {
                            var cnode = childNodes[i];
                            var cnodeType = cnode.nodeType;
                            var cnodeName = jsVar(cnode.localName || cnode.nodeName);
                            var cnodeValue = (cnode).text || cnode.nodeValue || '';
                            if (cnodeType == 8) {
                                continue;
                            } else if (cnodeType == 3 || cnodeType == 4 || !cnodeName) {
                                if (cnodeValue.match(/^\s+$/)) {
                                    continue;
                                }
                                txt += cnodeValue.replace(/^\s+/, '').replace(/\s+$/, '');
                            } else {
                                obj = obj || createObj();
                                if (obj[cnodeName]) {
                                    obj[cnodeName] = myArr(obj[cnodeName]);

                                    obj[cnodeName][obj[cnodeName].length] = convert(cnode);
                                    obj[cnodeName].length = obj[cnodeName].length;
                                } else {
                                    obj[cnodeName] = convert(cnode);
                                }
                            }
                        }
                    }
                }
                if (node.attributes) {
                    if (node.attributes.length > 0) {
                        obj = obj || createObj();

                        target = simple ? obj : {};

                        var attributes = node.attributes;
                        for (var i = 0; i < attributes.length; i++) {
                            var attr = attributes[i];
                            var attrName = jsVar(attr.name);
                            var attrValue = attr.value;

                            if (target[attrName]) {
                                target[cnodeName] = myArr(target[cnodeName]);

                                target[attrName][target[attrName].length] = attrValue;
                            } else {
                                target[attrName] = attrValue;
                            }
                        }
                    }
                }

                if (obj == null && !simple) {
                    obj = createObj();
                    if (txt != '')
                        obj.text = txt;
                }

                if (!simple)
                    obj.attributes = target;

                return obj || txt;
            }

            var result = convert(node);
            delete result.attributes;
            return result;
        };

        StringUtil.sortArray = function (arr) {
            arr.sort(function (a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                if (a == b)
                    return 0;
                if (a > b)
                    return 1;
                return -1;
            });
            return arr;
        };
        return StringUtil;
    })();
    skylark.StringUtil = StringUtil;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Arguments = (function () {
        function Arguments() {
        }
        Arguments.number = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (typeof arg !== 'number')
                    throw new skylark.ArgumentError('Value is not a number: ' + arg);
            }
        };
        return Arguments;
    })();
    skylark.Arguments = Arguments;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var MatrixUtil = (function () {
        function MatrixUtil() {
            throw new skylark.AbstractClassError();
        }
        MatrixUtil.transformCoords = function (matrix, x, y, resultPoint) {
            if (typeof resultPoint === "undefined") { resultPoint = null; }
            if (resultPoint == null)
                resultPoint = new skylark.Point();

            resultPoint.x = matrix.a * x + matrix.c * y + matrix.tx;
            resultPoint.y = matrix.d * y + matrix.b * x + matrix.ty;

            return resultPoint;
        };

        MatrixUtil.skew = function (matrix, skewX, skewY) {
            var sinX = Math.sin(skewX);
            var cosX = Math.cos(skewX);
            var sinY = Math.sin(skewY);
            var cosY = Math.cos(skewY);

            matrix.setTo(matrix.a * cosY - matrix.b * sinX, matrix.a * sinY + matrix.b * cosX, matrix.c * cosY - matrix.d * sinX, matrix.c * sinY + matrix.d * cosX, matrix.tx * cosY - matrix.ty * sinX, matrix.tx * sinY + matrix.ty * cosX);
        };

        MatrixUtil.prependMatrix = function (base, prep) {
            base.setTo(base.a * prep.a + base.c * prep.b, base.b * prep.a + base.d * prep.b, base.a * prep.c + base.c * prep.d, base.b * prep.c + base.d * prep.d, base.tx + base.a * prep.tx + base.c * prep.ty, base.ty + base.b * prep.tx + base.d * prep.ty);
        };

        MatrixUtil.prependTranslation = function (matrix, tx, ty) {
            matrix.tx += matrix.a * tx + matrix.c * ty;
            matrix.ty += matrix.b * tx + matrix.d * ty;
        };

        MatrixUtil.prependScale = function (matrix, sx, sy) {
            matrix.setTo(matrix.a * sx, matrix.b * sx, matrix.c * sy, matrix.d * sy, matrix.tx, matrix.ty);
        };

        MatrixUtil.prependRotation = function (matrix, angle) {
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);

            matrix.setTo(matrix.a * cos + matrix.c * sin, matrix.b * cos + matrix.d * sin, matrix.c * cos - matrix.a * sin, matrix.d * cos - matrix.b * sin, matrix.tx, matrix.ty);
        };

        MatrixUtil.prependSkew = function (matrix, skewX, skewY) {
            var sinX = Math.sin(skewX);
            var cosX = Math.cos(skewX);
            var sinY = Math.sin(skewY);
            var cosY = Math.cos(skewY);

            matrix.setTo(matrix.a * cosY + matrix.c * sinY, matrix.b * cosY + matrix.d * sinY, matrix.c * cosX - matrix.a * sinX, matrix.d * cosX - matrix.b * sinX, matrix.tx, matrix.ty);
        };
        MatrixUtil._rawData = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        return MatrixUtil;
    })();
    skylark.MatrixUtil = MatrixUtil;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var VertexData = (function () {
        function VertexData(numVertices, premultipliedAlpha) {
            if (typeof premultipliedAlpha === "undefined") { premultipliedAlpha = false; }
            this._numVertices = 0;
            this._rawData = [];
            this._premultipliedAlpha = premultipliedAlpha;
            this.numVertices = numVertices;
        }
        VertexData.prototype.clone = function (vertexID, numVertices) {
            if (typeof vertexID === "undefined") { vertexID = 0; }
            if (typeof numVertices === "undefined") { numVertices = -1; }
            if (numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var clone = new VertexData(0, this._premultipliedAlpha);
            clone._numVertices = numVertices;
            clone._rawData = this._rawData.slice(vertexID * VertexData.ELEMENTS_PER_VERTEX, numVertices * VertexData.ELEMENTS_PER_VERTEX);
            return clone;
        };

        VertexData.prototype.copyTo = function (targetData, targetVertexID, vertexID, numVertices) {
            if (typeof targetVertexID === "undefined") { targetVertexID = 0; }
            if (typeof vertexID === "undefined") { vertexID = 0; }
            if (typeof numVertices === "undefined") { numVertices = -1; }
            if (numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var targetRawData = targetData._rawData;
            var targetIndex = targetVertexID * VertexData.ELEMENTS_PER_VERTEX;
            var sourceIndex = vertexID * VertexData.ELEMENTS_PER_VERTEX;
            var dataLength = numVertices * VertexData.ELEMENTS_PER_VERTEX;

            for (var i = sourceIndex; i < dataLength; ++i)
                targetRawData[Number(targetIndex++)] = this._rawData[i];
        };

        VertexData.prototype.append = function (data) {
            var targetIndex = this._rawData.length;
            var rawData = data._rawData;
            var rawDataLength = rawData.length;

            for (var i = 0; i < rawDataLength; ++i)
                this._rawData[Number(targetIndex++)] = rawData[i];

            this._numVertices += data.numVertices;
        };

        VertexData.prototype.setPosition = function (vertexID, x, y) {
            var offset = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            this._rawData[offset] = x;
            this._rawData[Number(offset + 1)] = y;
        };

        VertexData.prototype.getPosition = function (vertexID, position) {
            var offset = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            position.x = this._rawData[offset];
            position.y = this._rawData[Number(offset + 1)];
        };

        VertexData.prototype.setColor = function (vertexID, color) {
            var offset = this.getOffset(vertexID) + VertexData.COLOR_OFFSET;
            var multiplier = this._premultipliedAlpha ? this._rawData[Number(offset + 3)] : 1.0;
            this._rawData[offset] = ((color >> 16) & 0xff) / 255.0 * multiplier;
            this._rawData[Number(offset + 1)] = ((color >> 8) & 0xff) / 255.0 * multiplier;
            this._rawData[Number(offset + 2)] = (color & 0xff) / 255.0 * multiplier;
        };

        VertexData.prototype.getColor = function (vertexID) {
            var offset = this.getOffset(vertexID) + VertexData.COLOR_OFFSET;
            var divisor = this._premultipliedAlpha ? this._rawData[Number(offset + 3)] : 1.0;

            if (divisor == 0) {
                return 0;
            } else {
                var red = this._rawData[offset] / divisor;
                var green = this._rawData[Number(offset + 1)] / divisor;
                var blue = this._rawData[Number(offset + 2)] / divisor;

                return (Number(red * 255) << 16) | (Number(green * 255) << 8) | Number(blue * 255);
            }
        };

        VertexData.prototype.setAlpha = function (vertexID, alpha) {
            var offset = this.getOffset(vertexID) + VertexData.COLOR_OFFSET + 3;

            if (this._premultipliedAlpha) {
                if (alpha < 0.001)
                    alpha = 0.001;
                var color = this.getColor(vertexID);
                this._rawData[offset] = alpha;
                this.setColor(vertexID, color);
            } else {
                this._rawData[offset] = alpha;
            }
        };

        VertexData.prototype.getAlpha = function (vertexID) {
            var offset = this.getOffset(vertexID) + VertexData.COLOR_OFFSET + 3;
            return this._rawData[offset];
        };

        VertexData.prototype.setTexCoords = function (vertexID, u, v) {
            var offset = this.getOffset(vertexID) + VertexData.TEXCOORD_OFFSET;
            this._rawData[offset] = u;
            this._rawData[Number(offset + 1)] = v;
        };

        VertexData.prototype.getTexCoords = function (vertexID, texCoords) {
            var offset = this.getOffset(vertexID) + VertexData.TEXCOORD_OFFSET;
            texCoords.x = this._rawData[offset];
            texCoords.y = this._rawData[Number(offset + 1)];
        };

        VertexData.prototype.translateVertex = function (vertexID, deltaX, deltaY) {
            var offset = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            this._rawData[offset] += deltaX;
            this._rawData[Number(offset + 1)] += deltaY;
        };

        VertexData.prototype.transformVertex = function (vertexID, matrix, numVertices) {
            if (typeof numVertices === "undefined") { numVertices = 1; }
            var offset = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;

            for (var i = 0; i < numVertices; ++i) {
                var x = this._rawData[offset];
                var y = this._rawData[Number(offset + 1)];

                this._rawData[offset] = matrix.a * x + matrix.c * y + matrix.tx;
                this._rawData[Number(offset + 1)] = matrix.d * y + matrix.b * x + matrix.ty;

                offset += VertexData.ELEMENTS_PER_VERTEX;
            }
        };

        VertexData.prototype.setUniformColor = function (color) {
            for (var i = 0; i < this._numVertices; ++i)
                this.setColor(i, color);
        };

        VertexData.prototype.setUniformAlpha = function (alpha) {
            for (var i = 0; i < this._numVertices; ++i)
                this.setAlpha(i, alpha);
        };

        VertexData.prototype.scaleAlpha = function (vertexID, alpha, numVertices) {
            if (typeof numVertices === "undefined") { numVertices = 1; }
            if (alpha == 1.0)
                return;
            if (numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var i;

            if (this._premultipliedAlpha) {
                for (i = 0; i < numVertices; ++i)
                    this.setAlpha(vertexID + i, this.getAlpha(vertexID + i) * alpha);
            } else {
                var offset = this.getOffset(vertexID) + VertexData.COLOR_OFFSET + 3;
                for (i = 0; i < numVertices; ++i)
                    this._rawData[Number(offset + i * VertexData.ELEMENTS_PER_VERTEX)] *= alpha;
            }
        };

        VertexData.prototype.getOffset = function (vertexID) {
            return vertexID * VertexData.ELEMENTS_PER_VERTEX;
        };

        VertexData.prototype.getBounds = function (transformationMatrix, vertexID, numVertices, resultRect) {
            if (typeof transformationMatrix === "undefined") { transformationMatrix = null; }
            if (typeof vertexID === "undefined") { vertexID = 0; }
            if (typeof numVertices === "undefined") { numVertices = -1; }
            if (typeof resultRect === "undefined") { resultRect = null; }
            if (resultRect == null)
                resultRect = new skylark.Rectangle();
            if (numVertices < 0 || vertexID + numVertices > this._numVertices)
                numVertices = this._numVertices - vertexID;

            var minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE;
            var minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;
            var offset = this.getOffset(vertexID) + VertexData.POSITION_OFFSET;
            var x, y, i;

            if (transformationMatrix == null) {
                for (i = vertexID; i < numVertices; ++i) {
                    x = this._rawData[offset];
                    y = this._rawData[Number(offset + 1)];
                    offset += VertexData.ELEMENTS_PER_VERTEX;

                    minX = minX < x ? minX : x;
                    maxX = maxX > x ? maxX : x;
                    minY = minY < y ? minY : y;
                    maxY = maxY > y ? maxY : y;
                }
            } else {
                for (i = vertexID; i < numVertices; ++i) {
                    x = this._rawData[offset];
                    y = this._rawData[Number(offset + 1)];
                    offset += VertexData.ELEMENTS_PER_VERTEX;

                    skylark.MatrixUtil.transformCoords(transformationMatrix, x, y, VertexData._helperPoint);
                    minX = minX < VertexData._helperPoint.x ? minX : VertexData._helperPoint.x;
                    maxX = maxX > VertexData._helperPoint.x ? maxX : VertexData._helperPoint.x;
                    minY = minY < VertexData._helperPoint.y ? minY : VertexData._helperPoint.y;
                    maxY = maxY > VertexData._helperPoint.y ? maxY : VertexData._helperPoint.y;
                }
            }

            resultRect.setTo(minX, minY, maxX - minX, maxY - minY);
            return resultRect;
        };

        Object.defineProperty(VertexData.prototype, "tinted", {
            get: function () {
                var offset = VertexData.COLOR_OFFSET;

                for (var i = 0; i < this._numVertices; ++i) {
                    for (var j = 0; j < 4; ++j)
                        if (this._rawData[Number(offset + j)] != 1.0)
                            return true;

                    offset += VertexData.ELEMENTS_PER_VERTEX;
                }

                return false;
            },
            enumerable: true,
            configurable: true
        });

        VertexData.prototype.setPremultipliedAlpha = function (value, updateData) {
            if (typeof updateData === "undefined") { updateData = true; }
            if (value == this._premultipliedAlpha)
                return;

            if (updateData) {
                var dataLength = this._numVertices * VertexData.ELEMENTS_PER_VERTEX;

                for (var i = VertexData.COLOR_OFFSET; i < dataLength; i += VertexData.ELEMENTS_PER_VERTEX) {
                    var alpha = this._rawData[Number(i + 3)];
                    var divisor = this._premultipliedAlpha ? alpha : 1.0;
                    var multiplier = value ? alpha : 1.0;

                    if (divisor != 0) {
                        this._rawData[i] = this._rawData[i] / divisor * multiplier;
                        this._rawData[Number(i + 1)] = this._rawData[Number(i + 1)] / divisor * multiplier;
                        this._rawData[Number(i + 2)] = this._rawData[Number(i + 2)] / divisor * multiplier;
                    }
                }
            }

            this._premultipliedAlpha = value;
        };

        Object.defineProperty(VertexData.prototype, "premultipliedAlpha", {
            get: function () {
                return this._premultipliedAlpha;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(VertexData.prototype, "numVertices", {
            get: function () {
                return this._numVertices;
            },
            set: function (value) {
                var i;
                var delta = value - this._numVertices;

                for (i = 0; i < delta; ++i)
                    this._rawData.push(0, 0, 0, 0, 0, 1, 0, 0);

                for (i = 0; i < -(delta * VertexData.ELEMENTS_PER_VERTEX); ++i)
                    this._rawData.pop();

                this._numVertices = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(VertexData.prototype, "rawData", {
            get: function () {
                return this._rawData;
            },
            enumerable: true,
            configurable: true
        });
        VertexData.ELEMENTS_PER_VERTEX = 8;

        VertexData.POSITION_OFFSET = 0;

        VertexData.COLOR_OFFSET = 2;

        VertexData.TEXCOORD_OFFSET = 6;

        VertexData._helperPoint = new skylark.Point();
        return VertexData;
    })();
    skylark.VertexData = VertexData;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var RectangleUtil = (function () {
        function RectangleUtil() {
            throw new skylark.AbstractClassError();
        }
        RectangleUtil.intersect = function (rect1, rect2, resultRect) {
            if (typeof resultRect === "undefined") { resultRect = null; }
            if (resultRect == null)
                resultRect = new skylark.Rectangle();

            var left = Math.max(rect1.x, rect2.x);
            var right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
            var top = Math.max(rect1.y, rect2.y);
            var bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

            if (left > right || top > bottom)
                resultRect.setEmpty();
else
                resultRect.setTo(left, top, right - left, bottom - top);

            return resultRect;
        };

        RectangleUtil.fit = function (rectangle, into, scaleMode, pixelPerfect, resultRect) {
            if (typeof scaleMode === "undefined") { scaleMode = "showAll"; }
            if (typeof pixelPerfect === "undefined") { pixelPerfect = false; }
            if (typeof resultRect === "undefined") { resultRect = null; }
            if (!skylark.ScaleMode.isValid(scaleMode))
                throw new skylark.ArgumentError("Invalid scaleMode: " + scaleMode);
            if (resultRect == null)
                resultRect = new skylark.Rectangle();

            var width = rectangle.width;
            var height = rectangle.height;
            var factorX = into.width / width;
            var factorY = into.height / height;
            var factor = 1.0;

            if (scaleMode == skylark.ScaleMode.SHOW_ALL) {
                factor = factorX < factorY ? factorX : factorY;
                if (pixelPerfect)
                    factor = RectangleUtil.nextSuitableScaleFactor(factor, false);
            } else if (scaleMode == skylark.ScaleMode.NO_BORDER) {
                factor = factorX > factorY ? factorX : factorY;
                if (pixelPerfect)
                    factor = RectangleUtil.nextSuitableScaleFactor(factor, true);
            }

            width *= factor;
            height *= factor;

            resultRect.setTo(into.x + (into.width - width) / 2, into.y + (into.height - height) / 2, width, height);

            return resultRect;
        };

        RectangleUtil.nextSuitableScaleFactor = function (factor, up) {
            var divisor = 1.0;

            if (up) {
                if (factor >= 0.5) {
                    return Math.ceil(factor);
                } else {
                    while (1.0 / (divisor + 1) > factor)
                        ++divisor;
                }
            } else {
                if (factor >= 1.0) {
                    return Math.floor(factor);
                } else {
                    while (1.0 / divisor > factor)
                        ++divisor;
                }
            }

            return 1.0 / divisor;
        };
        return RectangleUtil;
    })();
    skylark.RectangleUtil = RectangleUtil;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var ScaleMode = (function () {
        function ScaleMode() {
            throw new skylark.AbstractClassError();
        }
        ScaleMode.isValid = function (scaleMode) {
            return scaleMode == ScaleMode.NONE || scaleMode == ScaleMode.NO_BORDER || scaleMode == ScaleMode.SHOW_ALL;
        };
        ScaleMode.NONE = "none";

        ScaleMode.NO_BORDER = "noBorder";

        ScaleMode.SHOW_ALL = "showAll";
        return ScaleMode;
    })();
    skylark.ScaleMode = ScaleMode;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var MathUtil = (function () {
        function MathUtil() {
        }
        MathUtil.rad2deg = function (rad) {
            return rad / Math.PI * 180.0;
        };

        MathUtil.deg2rad = function (deg) {
            return deg / 180.0 * Math.PI;
        };

        MathUtil.getNextPowerOfTwo = function (number) {
            if (number > 0 && (number & (number - 1)) == 0)
                return number;
else {
                var result = 1;
                while (result < number)
                    result <<= 1;
                return result;
            }
        };
        return MathUtil;
    })();
    skylark.MathUtil = MathUtil;
})(skylark || (skylark = {}));
(function (root) {
    var trimLeft = /^[\s,#]+/, trimRight = /\s+$/, tinyCounter = 0, math = Math, mathRound = math.round, mathMin = math.min, mathMax = math.max, mathRandom = math.random;

    function tinycolor(color, opts) {
        color = (color) ? color : '';
        opts = opts || {};

        if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
            return color;
        }

        var rgb = inputToRGB(color);
        var r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a, roundA = mathRound(100 * a) / 100, format = opts.format || rgb.format;

        if (r < 1) {
            r = mathRound(r);
        }
        if (g < 1) {
            g = mathRound(g);
        }
        if (b < 1) {
            b = mathRound(b);
        }

        return {
            ok: rgb.ok,
            format: format,
            _tc_id: tinyCounter++,
            alpha: a,
            red: r,
            green: g,
            blue: b,
            toHsv: function () {
                var hsv = rgbToHsv(r, g, b);
                return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: a };
            },
            toHsvString: function () {
                var hsv = rgbToHsv(r, g, b);
                var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                return (a == 1) ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + roundA + ")";
            },
            toHsl: function () {
                var hsl = rgbToHsl(r, g, b);
                return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: a };
            },
            toHslString: function () {
                var hsl = rgbToHsl(r, g, b);
                var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                return (a == 1) ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + roundA + ")";
            },
            toHex: function (allow3Char) {
                return rgbToHex(r, g, b, allow3Char);
            },
            toHexString: function (allow3Char) {
                return '#' + rgbToHex(r, g, b, allow3Char);
            },
            toRgb: function () {
                return { r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a };
            },
            toRgbString: function () {
                return (a == 1) ? "rgb(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" : "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + roundA + ")";
            },
            toPercentageRgb: function () {
                return { r: mathRound(bound01(r, 255) * 100) + "%", g: mathRound(bound01(g, 255) * 100) + "%", b: mathRound(bound01(b, 255) * 100) + "%", a: a };
            },
            toPercentageRgbString: function () {
                return (a == 1) ? "rgb(" + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%)" : "rgba(" + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%, " + roundA + ")";
            },
            toName: function () {
                if (a === 0) {
                    return "transparent";
                }

                return hexNames[rgbToHex(r, g, b, true)] || false;
            },
            toFilter: function (secondColor) {
                var hex = rgbToHex(r, g, b, false);
                var secondHex = hex;
                var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
                var secondAlphaHex = alphaHex;
                var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                if (secondColor) {
                    var s = tinycolor(secondColor, false);
                    secondHex = s.toHex();
                    secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
                }

                return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
            },
            toString: function (format) {
                format = format || this.format;
                var formattedString = false;
                if (format === "rgb") {
                    formattedString = this.toRgbString();
                }
                if (format === "prgb") {
                    formattedString = this.toPercentageRgbString();
                }
                if (format === "hex" || format === "hex6") {
                    formattedString = this.toHexString();
                }
                if (format === "hex3") {
                    formattedString = this.toHexString(true);
                }
                if (format === "name") {
                    formattedString = this.toName();
                }
                if (format === "hsl") {
                    formattedString = this.toHslString();
                }
                if (format === "hsv") {
                    formattedString = this.toHsvString();
                }

                return formattedString || this.toHexString();
            }
        };
    }

    function inputToRGB(color) {
        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color === "number") {
            color = numberInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            } else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            } else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }

    function rgbToRgb(r, g, b) {
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        if (s === 0) {
            r = g = b = l;
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
            h = 0;
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [v, q, p, p, t, v][mod], g = [t, v, v, q, p, p][mod], b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    function rgbToHex(r, g, b, allow3Char) {
        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }

    tinycolor['equals'] = function (color1, color2) {
        if (!color1 || !color2) {
            return false;
        }
        return tinycolor(color1, false).toRgbString() == tinycolor(color2, false).toRgbString();
    };

    var names = (tinycolor).names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    var hexNames = tinycolor['hexNames'] = flip(names);

    function flip(o) {
        var flipped = {};
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    function bound01(n, max) {
        if (isOnePointZero(n)) {
            n = "100%";
        }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        if (processPercent) {
            n = parseInt((n * max), 10) / 100;
        }

        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        return (n % max) / parseFloat(max);
    }

    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    function parseHex(val) {
        return parseInt(val, 16);
    }

    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    var matchers = (function () {
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    function stringInputToObject(color) {
        color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        } else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseHex(match[1]),
                g: parseHex(match[2]),
                b: parseHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseHex(match[1] + '' + match[1]),
                g: parseHex(match[2] + '' + match[2]),
                b: parseHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    function numberInputToObject(color) {
        return {
            r: (color >> 16) & 0xff,
            g: (color >> 8) & 0xff,
            b: (color) & 0xff
        };
    }

    root.TinyColor = tinycolor;
})(skylark);
var skylark;
(function (skylark) {
    var Color = (function () {
        function Color() {
            throw new skylark.AbstractClassError();
        }
        Color.getAlpha = function (color) {
            return (color >> 24) & 0xff;
        };

        Color.getRed = function (color) {
            return (color >> 16) & 0xff;
        };

        Color.getGreen = function (color) {
            return (color >> 8) & 0xff;
        };

        Color.getBlue = function (color) {
            return color & 0xff;
        };

        Color.rgb = function (red, green, blue) {
            return (red << 16) | (green << 8) | blue;
        };

        Color.argb = function (alpha, red, green, blue) {
            return (alpha << 24) | (red << 16) | (green << 8) | blue;
        };

        Color.fromString = function (cssString) {
            var result = skylark.TinyColor(cssString);
            if (!result.ok)
                throw new skylark.ArgumentError('Color format mismatch: ' + cssString);
            if (result.alpha === 1)
                return Color.rgb(result.red, result.green, result.blue);
else
                return Color.argb(result.alpha, result.red, result.green, result.blue);
        };

        Color.toHexString = function (rgb) {
            return skylark.TinyColor(rgb).toHexString();
        };
        Color.WHITE = 0xffffff;
        Color.SILVER = 0xc0c0c0;
        Color.GRAY = 0x808080;
        Color.BLACK = 0x000000;
        Color.RED = 0xff0000;
        Color.MAROON = 0x800000;
        Color.YELLOW = 0xffff00;
        Color.OLIVE = 0x808000;
        Color.LIME = 0x00ff00;
        Color.GREEN = 0x008000;
        Color.AQUA = 0x00ffff;
        Color.TEAL = 0x008080;
        Color.BLUE = 0x0000ff;
        Color.NAVY = 0x000080;
        Color.FUCHSIA = 0xff00ff;
        Color.PURPLE = 0x800080;
        return Color;
    })();
    skylark.Color = Color;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var HAlign = (function () {
        function HAlign() {
            throw new skylark.AbstractClassError();
        }
        HAlign.isValid = function (hAlign) {
            return hAlign == HAlign.LEFT || hAlign == HAlign.CENTER || hAlign == HAlign.RIGHT;
        };
        HAlign.LEFT = "left";

        HAlign.CENTER = "center";

        HAlign.RIGHT = "right";
        return HAlign;
    })();
    skylark.HAlign = HAlign;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var VAlign = (function () {
        function VAlign() {
            throw new skylark.AbstractClassError();
        }
        VAlign.isValid = function (vAlign) {
            return vAlign == VAlign.TOP || vAlign == VAlign.CENTER || vAlign == VAlign.BOTTOM;
        };
        VAlign.TOP = "top";

        VAlign.CENTER = "middle";
        VAlign.MIDDLE = "middle";

        VAlign.BOTTOM = "bottom";
        return VAlign;
    })();
    skylark.VAlign = VAlign;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var BitmapData = (function () {
        function BitmapData(width, height, a, b) {
            var transparent = true;
            var bytes;
            var fillColor = 0xFFFFFFFF;

            if (Array.isArray(a)) {
                bytes = a;
                if (bytes.length !== width * height)
                    throw new skylark.ArgumentError('Number of pixels in ByteArray does not match width*height');
            } else {
                if (typeof a !== 'undefined')
                    transparent = !!a;
                if (typeof b !== 'undefined')
                    fillColor = b;

                var length = width * height;
                bytes = [];
                for (var i = 0; i < length; i++)
                    bytes.push(fillColor);
            }

            this._width = width;
            this._height = height;
            this._bytes = bytes;
        }
        BitmapData.toDataURL = function (image) {
            var canvas;
            if (image instanceof CanvasRenderingContext2D && (image).canvas != null) {
                canvas = (image).canvas;
            } else if (image instanceof HTMLCanvasElement) {
                canvas = (image);
            } else {
                canvas = skylark.Skylark.getHelperCanvas(image.width, image.height);
                canvas.getContext('2d').drawImage(image, 0, 0);
            }
            return canvas.toDataURL();
        };

        BitmapData.prototype.getPixel32 = function (x, y) {
            return this._bytes[y * this._width + x];
        };

        Object.defineProperty(BitmapData.prototype, "bytes", {
            get: function () {
                return this._bytes;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapData.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapData.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });

        BitmapData.prototype.dispose = function () {
            this._bytes = null;
        };

        BitmapData.prototype.asUrl = function () {
            var rows = [];
            var height = this._height;
            var width = this._width;
            var bytes = this._bytes;

            for (var r = 0; r < height; r++) {
                var start = r * width;
                var end = (r + 1) * width;
                var row = [];
                for (var i = start; i < end; i++) {
                    var px = [skylark.Color.getRed(bytes[i]), skylark.Color.getGreen(bytes[i]), skylark.Color.getBlue(bytes[i])];
                    row.push(px);
                }

                rows.push(row);
            }

            return skylark.Bitmap.create(rows, 1.0);
        };
        return BitmapData;
    })();
    skylark.BitmapData = BitmapData;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var _asLittleEndianHex = function (value, bytes) {
        var result = [];

        for (; bytes > 0; bytes--) {
            result.push(String.fromCharCode(value & 255));
            value >>= 8;
        }

        return result.join('');
    };

    var _collapseData = function (rows, row_padding) {
        var i, rows_len = rows.length, j, pixels_len = rows_len ? rows[0].length : 0, pixel, padding = '', result = [];

        for (; row_padding > 0; row_padding--) {
            padding += '\x00';
        }

        for (i = 0; i < rows_len; i++) {
            for (j = 0; j < pixels_len; j++) {
                pixel = rows[i][j];
                result.push(String.fromCharCode(pixel[2]) + String.fromCharCode(pixel[1]) + String.fromCharCode(pixel[0]));
            }
            result.push(padding);
        }

        return result.join('');
    };

    var _scaleRows = function (rows, scale) {
        var real_w = rows.length, scaled_w = parseInt(String(real_w * scale)), real_h = real_w ? rows[0].length : 0, scaled_h = parseInt(String(real_h * scale)), new_rows = [], new_row, x, y;

        for (y = 0; y < scaled_h; y++) {
            new_rows.push(new_row = []);
            for (x = 0; x < scaled_w; x++) {
                new_row.push(rows[parseInt(String(y / scale))][parseInt(String(x / scale))]);
            }
        }
        return new_rows;
    };

    var Bitmap = (function () {
        function Bitmap() {
        }
        Bitmap.create = function (rows, scale) {
            if (!window.btoa) {
                console.log('Oh no, your browser does not support base64 encoding - window.btoa()!!');
                return false;
            }

            scale = scale || 1;
            if (scale != 1) {
                rows = _scaleRows(rows, scale);
            }

            var height = rows.length, width = height ? rows[0].length : 0, row_padding = (4 - (width * 3) % 4) % 4, num_data_bytes = (width * 3 + row_padding) * height, num_file_bytes = 54 + num_data_bytes, file;

            height = _asLittleEndianHex(height, 4);
            width = _asLittleEndianHex(width, 4);
            num_data_bytes = _asLittleEndianHex(num_data_bytes, 4);
            num_file_bytes = _asLittleEndianHex(num_file_bytes, 4);

            file = ('BM' + num_file_bytes + '\x00\x00' + '\x00\x00' + '\x36\x00\x00\x00' + '\x28\x00\x00\x00' + width + height + '\x01\x00' + '\x18\x00' + '\x00\x00\x00\x00' + num_data_bytes + '\x13\x0B\x00\x00' + '\x13\x0B\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + _collapseData(rows, row_padding));

            return 'data:image/bmp;base64,' + btoa(file);
        };
        return Bitmap;
    })();
    skylark.Bitmap = Bitmap;
})(skylark || (skylark = {}));
((function (global) {
    function PxLoader(settings) {
        settings = settings || {};
        this.settings = settings;

        if (settings.statusInterval == null) {
            settings.statusInterval = 5000;
        }

        if (settings.loggingDelay == null) {
            settings.loggingDelay = 20 * 1000;
        }

        if (settings.noProgressTimeout == null) {
            settings.noProgressTimeout = Infinity;
        }

        var entries = [], progressListeners = [], timeStarted, progressChanged = Date.now();

        var ResourceState = {
            QUEUED: 0,
            WAITING: 1,
            LOADED: 2,
            ERROR: 3,
            TIMEOUT: 4
        };

        var ensureArray = function (val) {
            if (val == null) {
                return [];
            }

            if (Array.isArray(val)) {
                return val;
            }

            return [val];
        };

        this.add = function (resource) {
            resource.tags = new PxLoaderTags(resource.tags);

            if (resource.priority == null) {
                resource.priority = Infinity;
            }

            entries.push({
                resource: resource,
                status: ResourceState.QUEUED
            });
        };

        this.addProgressListener = function (callback, tags) {
            progressListeners.push({
                callback: callback,
                tags: new PxLoaderTags(tags)
            });
        };

        this.addCompletionListener = function (callback, tags) {
            progressListeners.push({
                tags: new PxLoaderTags(tags),
                callback: function (e) {
                    if (e.completedCount === e.totalCount) {
                        callback(e);
                    }
                }
            });
        };

        var getResourceSort = function (orderedTags) {
            orderedTags = ensureArray(orderedTags);
            var getTagOrder = function (entry) {
                var resource = entry.resource, bestIndex = Infinity;
                for (var i = 0; i < resource.tags.length; i++) {
                    for (var j = 0; j < Math.min(orderedTags.length, bestIndex); j++) {
                        if (resource.tags.all[i] === orderedTags[j] && j < bestIndex) {
                            bestIndex = j;
                            if (bestIndex === 0) {
                                break;
                            }
                        }
                        if (bestIndex === 0) {
                            break;
                        }
                    }
                }
                return bestIndex;
            };
            return function (a, b) {
                var aOrder = getTagOrder(a), bOrder = getTagOrder(b);
                if (aOrder < bOrder) {
                    return -1;
                }
                if (aOrder > bOrder) {
                    return 1;
                }

                if (a.priority < b.priority) {
                    return -1;
                }
                if (a.priority > b.priority) {
                    return 1;
                }
                return 0;
            };
        };

        this.start = function (orderedTags) {
            timeStarted = Date.now();

            var compareResources = getResourceSort(orderedTags);
            entries.sort(compareResources);

            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                entry.status = ResourceState.WAITING;
                entry.resource.start(this);
            }

            setTimeout(statusCheck, 100);
        };

        var statusCheck = function () {
            var checkAgain = false, noProgressTime = Date.now() - progressChanged, timedOut = (noProgressTime >= settings.noProgressTimeout), shouldLog = (noProgressTime >= settings.loggingDelay);

            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                if (entry.status !== ResourceState.WAITING) {
                    continue;
                }

                if (entry.resource.checkStatus) {
                    entry.resource.checkStatus();
                }

                if (entry.status === ResourceState.WAITING) {
                    if (timedOut) {
                        entry.resource.onTimeout();
                    } else {
                        checkAgain = true;
                    }
                }
            }

            if (shouldLog && checkAgain) {
                log();
            }

            if (checkAgain) {
                setTimeout(statusCheck, settings.statusInterval);
            }
        };

        this.isBusy = function () {
            for (var i = 0, len = entries.length; i < len; i++) {
                if (entries[i].status === ResourceState.QUEUED || entries[i].status === ResourceState.WAITING) {
                    return true;
                }
            }
            return false;
        };

        var onProgress = function (resource, statusType) {
            var entry = null, i, len, numResourceTags, listener, shouldCall;

            for (i = 0, len = entries.length; i < len; i++) {
                if (entries[i].resource === resource) {
                    entry = entries[i];
                    break;
                }
            }

            if (entry == null || entry.status !== ResourceState.WAITING) {
                return;
            }
            entry.status = statusType;
            progressChanged = Date.now();

            numResourceTags = resource.tags.length;

            for (i = 0, len = progressListeners.length; i < len; i++) {
                listener = progressListeners[i];
                if (listener.tags.length === 0) {
                    shouldCall = true;
                } else {
                    shouldCall = resource.tags.intersects(listener.tags);
                }

                if (shouldCall) {
                    sendProgress(entry, listener);
                }
            }
        };

        this.onLoad = function (resource) {
            onProgress(resource, ResourceState.LOADED);
        };
        this.onError = function (resource) {
            onProgress(resource, ResourceState.ERROR);
        };
        this.onTimeout = function (resource) {
            onProgress(resource, ResourceState.TIMEOUT);
        };

        var sendProgress = function (updatedEntry, listener) {
            var completed = 0, total = 0, i, len, entry, includeResource;
            for (i = 0, len = entries.length; i < len; i++) {
                entry = entries[i];
                includeResource = false;

                if (listener.tags.length === 0) {
                    includeResource = true;
                } else {
                    includeResource = entry.resource.tags.intersects(listener.tags);
                }

                if (includeResource) {
                    total++;
                    if (entry.status === ResourceState.LOADED || entry.status === ResourceState.ERROR || entry.status === ResourceState.TIMEOUT) {
                        completed++;
                    }
                }
            }

            listener.callback({
                resource: updatedEntry.resource,
                loaded: (updatedEntry.status === ResourceState.LOADED),
                error: (updatedEntry.status === ResourceState.ERROR),
                timeout: (updatedEntry.status === ResourceState.TIMEOUT),
                completedCount: completed,
                totalCount: total
            });
        };

        var log = this.log = function (showAll) {
            if (!window.console) {
                return;
            }

            var elapsedSeconds = Math.round((Date.now() - timeStarted) / 1000);
            window.console.log('PxLoader elapsed: ' + elapsedSeconds + ' sec');

            for (var i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                if (!showAll && entry.status !== ResourceState.WAITING) {
                    continue;
                }

                var message = 'PxLoader: #' + i + ' ' + entry.resource.getName();
                switch (entry.status) {
                    case ResourceState.QUEUED:
                        message += ' (Not Started)';
                        break;
                    case ResourceState.WAITING:
                        message += ' (Waiting)';
                        break;
                    case ResourceState.LOADED:
                        message += ' (Loaded)';
                        break;
                    case ResourceState.ERROR:
                        message += ' (Error)';
                        break;
                    case ResourceState.TIMEOUT:
                        message += ' (Timeout)';
                        break;
                }

                if (entry.resource.tags.length > 0) {
                    message += ' Tags: [' + entry.resource.tags.all.join(',') + ']';
                }

                window.console.log(message);
            }
        };
    }

    function PxLoaderTags(values) {
        this.all = [];
        this.first = null;
        this.length = 0;

        this.lookup = {};

        if (values) {
            if (Array.isArray(values)) {
                this.all = values.slice(0);
            } else if (typeof values === 'object') {
                for (var key in values) {
                    if (values.hasOwnProperty(key)) {
                        this.all.push(key);
                    }
                }
            } else {
                this.all.push(values);
            }

            this.length = this.all.length;
            if (this.length > 0) {
                this.first = this.all[0];
            }

            for (var i = 0; i < this.length; i++) {
                this.lookup[this.all[i]] = true;
            }
        }
    }

    PxLoaderTags.prototype.intersects = function (other) {
        if (this.length === 0 || other.length === 0) {
            return false;
        }

        if (this.length === 1 && other.length === 1) {
            return this.first === other.first;
        }

        if (other.length < this.length) {
            return other.intersects(this);
        }

        for (var key in this.lookup) {
            if (other.lookup[key]) {
                return true;
            }
        }

        return false;
    };

    function PxLoaderImage(url, tags, priority) {
        var self = this, loader = null;

        this.img = new Image();
        this.tags = tags;
        this.priority = priority;

        var onReadyStateChange = function () {
            if (self.img.readyState === 'complete') {
                removeEventHandlers();
                loader.onLoad(self);
            }
        };

        var onLoad = function () {
            removeEventHandlers();
            loader.onLoad(self);
        };

        var onError = function () {
            removeEventHandlers();
            loader.onError(self);
        };

        var removeEventHandlers = function () {
            self.unbind('load', onLoad);
            self.unbind('readystatechange', onReadyStateChange);
            self.unbind('error', onError);
        };

        this.start = function (pxLoader) {
            loader = pxLoader;

            self.bind('load', onLoad);
            self.bind('readystatechange', onReadyStateChange);
            self.bind('error', onError);

            self.img.src = url;
        };

        this.checkStatus = function () {
            if (self.img.complete) {
                removeEventHandlers();
                loader.onLoad(self);
            }
        };

        this.onTimeout = function () {
            removeEventHandlers();
            if (self.img.complete) {
                loader.onLoad(self);
            } else {
                loader.onTimeout(self);
            }
        };

        this.getName = function () {
            return url;
        };

        this.bind = function (eventName, eventHandler) {
            if (self.img.addEventListener) {
                self.img.addEventListener(eventName, eventHandler, false);
            } else if (self.img.attachEvent) {
                self.img.attachEvent('on' + eventName, eventHandler);
            }
        };

        this.unbind = function (eventName, eventHandler) {
            if (self.img.removeEventListener) {
                self.img.removeEventListener(eventName, eventHandler, false);
            } else if (self.img.detachEvent) {
                self.img.detachEvent('on' + eventName, eventHandler);
            }
        };
    }

    PxLoader.prototype.addImage = function (url, tags, priority) {
        var imageLoader = new PxLoaderImage(url, tags, priority);
        this.add(imageLoader);

        return imageLoader.img;
    };

    global.PxLoader = PxLoader;
    global.PxLoaderImage = PxLoaderImage;
})(this));

var PxResourceState;
(function (PxResourceState) {
    PxResourceState[PxResourceState["QUEUED"] = 0] = "QUEUED";
    PxResourceState[PxResourceState["WAITING"] = 1] = "WAITING";
    PxResourceState[PxResourceState["LOADED"] = 2] = "LOADED";
    PxResourceState[PxResourceState["ERROR"] = 3] = "ERROR";
    PxResourceState[PxResourceState["TIMEOUT"] = 4] = "TIMEOUT";
})(PxResourceState || (PxResourceState = {}));
var skylark;
(function (skylark) {
    var AssetManager = (function (_super) {
        __extends(AssetManager, _super);
        function AssetManager(scaleFactor, useMipmaps) {
            if (typeof scaleFactor === "undefined") { scaleFactor = 1.0; }
            if (typeof useMipmaps === "undefined") { useMipmaps = false; }
            _super.call(this);
            this.SUPPORTED_EXTENSIONS = ["png", "jpg", "jpeg", "atf", "mp3", "xml", "fnt"];
            this._verbose = false;
            this._scaleFactor = scaleFactor;
            this._useMipMaps = useMipmaps;
            this._textures = {};
            this._atlases = {};
            this._sounds = {};
        }
        AssetManager.prototype.dispose = function () {
            var key;
            var textures = this._textures;
            var atlases = this._atlases;

            for (key in textures) {
                if (textures.hasOwnProperty(key)) {
                    textures[key].dispose();
                    delete textures[key];
                }
            }
            for (key in atlases) {
                if (atlases.hasOwnProperty(key)) {
                    atlases[key].dispose();
                    delete atlases[key];
                }
            }
        };

        AssetManager.prototype.getTexture = function (name) {
            var textures = this._textures;
            if (name in textures) {
                return textures[name];
            } else {
                var atlases = this._atlases;
                for (var key in atlases) {
                    if (atlases.hasOwnProperty(key)) {
                        var texture = atlases[key].getTexture(name);
                        if (texture)
                            return texture;
                    }
                }
                return null;
            }
        };

        AssetManager.prototype.getTextures = function (a, result) {
            var names;
            var prefix;
            if (Array.isArray(a)) {
                names = a;
            } else {
                prefix = a;
                names = this.getTextureNames(prefix, AssetManager._names);
            }

            if (result == null)
                result = [];

            for (var i = 0; i < names.length; i++)
                result.push(this.getTexture(names[i]));

            AssetManager._names.length = 0;
            return result;
        };

        AssetManager.prototype.getTextureNames = function (prefix, result) {
            if (typeof prefix === "undefined") { prefix = ""; }
            if (typeof result === "undefined") { result = null; }
            if (result == null)
                result = [];

            var key;

            var textures = this._textures;
            for (key in textures)
                if (textures.hasOwnProperty(key))
                    if (key.indexOf(prefix) == 0)
                        result.push(key);

            var atlases = this._atlases;
            for (key in atlases)
                if (atlases.hasOwnProperty(key))
                    atlases[key].getNames(prefix, result);

            skylark.StringUtil.sortArray(result);

            return result;
        };

        AssetManager.prototype.getTextureAtlas = function (name) {
            return this._atlases[name];
        };

        AssetManager.prototype.getSound = function (name) {
            return this._sounds[name];
        };

        AssetManager.prototype.getSoundNames = function (prefix) {
            if (typeof prefix === "undefined") { prefix = ""; }
            var names = [];

            var sounds = this._sounds;
            for (var name in sounds)
                if (sounds.hasOwnProperty(name))
                    if (name.indexOf(prefix) == 0)
                        names.push(name);

            return skylark.StringUtil.sortArray(names);
        };

        AssetManager.prototype.playSound = function (name, startTime, loops, transform) {
            if (typeof startTime === "undefined") { startTime = 0; }
            if (typeof loops === "undefined") { loops = 0; }
            if (typeof transform === "undefined") { transform = null; }
            if (name in this._sounds)
                return this.getSound(name).play(startTime, loops, transform);
else
                return null;
        };

        AssetManager.prototype.addTexture = function (name, texture) {
            if (this._verbose)
                this.log("Adding texture '" + name + "'");

            var textures = this._textures;
            if (name in textures)
                throw new Error("Duplicate texture name: " + name);

            textures[name] = texture;
        };

        AssetManager.prototype.addTextureAtlas = function (name, atlas) {
            if (this._verbose)
                this.log("Adding texture atlas '" + name + "'");

            var atlases = this._atlases;
            if (name in atlases)
                throw new Error("Duplicate texture atlas name: " + name);

            atlases[name] = atlas;
        };

        AssetManager.prototype.addSound = function (name, sound) {
            if (this._verbose)
                this.log("Adding sound '" + name + "'");

            var sounds = this._sounds;
            if (name in sounds)
                throw new Error("Duplicate sound name: " + name);

            sounds[name] = sound;
        };

        AssetManager.prototype.removeTexture = function (name, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            var textures = this._textures;
            var texture;
            if (dispose && (texture = textures[name]))
                texture.dispose();

            delete textures[name];
        };

        AssetManager.prototype.removeTextureAtlas = function (name, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            var atlases = this._atlases;
            var atlas;
            if (dispose && (atlas = atlases[name]))
                atlas.dispose();

            delete atlases[name];
        };

        AssetManager.prototype.removeSound = function (name) {
            delete this._sounds[name];
        };

        AssetManager.prototype.purge = function () {
            var textures = this._textures;
            var key;
            for (key in textures)
                if (textures.hasOwnProperty(key))
                    textures[key].dispose();

            var atlases = this._atlases;
            for (key in atlases)
                if (atlases.hasOwnProperty(key))
                    atlases[key].dispose();

            this._textures = {};
            this._atlases = {};
            this._sounds = {};
        };

        AssetManager.prototype.enqueue = function () {
            var rawAssets = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                rawAssets[_i] = arguments[_i + 0];
            }
            throw new skylark.AbstractMethodError();
        };

        AssetManager.prototype.loadQueue = function (onProgress) {
            throw new skylark.AbstractMethodError();
        };

        AssetManager.prototype.onQueueComplete = function () {
            this.dispatchEventWith(skylark.Event.COMPLETE, false);
        };

        AssetManager.prototype.processTextureAtlas = function (xml, resource, resume) {
            if (typeof resume === "undefined") { resume = false; }
            var _this = this;
            var root = AssetManager.findRootNode(xml);

            if (root.nodeName !== 'TextureAtlas')
                throw new skylark.ArgumentError('Provided XML document/node is not named "TextureAtlas"');

            var imagePath = (root).getAttribute('imagePath');

            var name = this.getName(imagePath);

            var atlasTexture = this.getTexture(name);
            if (atlasTexture == null) {
                if (resume)
                    throw new Error('Texture for TextureAtlas is missing: ' + name);
else
                    this.addPending({
                        resume: function () {
                            _this.processTextureAtlas(xml, resource, true);
                        }
                    });
            } else {
                this.addTextureAtlas(name, new skylark.TextureAtlas(atlasTexture, xml));
                this.removeTexture(name, false);
            }
        };

        AssetManager.prototype.addPending = function (job) {
            var pending = this._pending;
            if (!pending)
                this._pending = pending = [];

            pending.push(job);
        };

        AssetManager.prototype.processPending = function () {
            var pending = this._pending;
            if (pending) {
                this._pending = null;
                pending = pending.slice(0);
                for (var i = 0; i < pending.length; i++) {
                    pending[i].resume();
                }
            }
        };

        AssetManager.prototype.getName = function (name) {
            if (typeof name !== 'string')
                throw new skylark.ArgumentError('Cannot extract name from non-String: ' + name);

            var matches;

            matches = AssetManager._urlParseRE.exec(name);

            if (matches && matches.length >= 15) {
                name = decodeURIComponent(matches[15]);
                matches = /(.*?)(\.[\w]{1,4})?$/.exec(name);
                if (matches && matches.length)
                    return matches[1];
            }
            throw new skylark.ArgumentError("Could not extract name from String '" + name + "'");
        };

        AssetManager.prototype.log = function (message) {
            if (this._verbose)
                console.log("[AssetManager]", message);
        };

        Object.defineProperty(AssetManager.prototype, "verbose", {
            get: function () {
                return this._verbose;
            },
            set: function (value) {
                this._verbose = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(AssetManager.prototype, "useMipMaps", {
            get: function () {
                return this._useMipMaps;
            },
            set: function (value) {
                this._useMipMaps = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(AssetManager.prototype, "scaleFactor", {
            get: function () {
                return this._scaleFactor;
            },
            set: function (value) {
                this._scaleFactor = value;
            },
            enumerable: true,
            configurable: true
        });


        AssetManager.findRootNode = function (data) {
            if (!data || !data.hasChildNodes())
                return null;

            var children = data.childNodes;
            var node;
            for (var i = 0; i < children.length; i++) {
                node = children[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    break;
                }
            }
            return node;
        };
        AssetManager._names = [];

        AssetManager._urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
        return AssetManager;
    })(skylark.EventDispatcher);
    skylark.AssetManager = AssetManager;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var PxLoaderAssetManager = (function (_super) {
        __extends(PxLoaderAssetManager, _super);
        function PxLoaderAssetManager() {
            _super.apply(this, arguments);
        }
        PxLoaderAssetManager.prototype.getLoader = function () {
            var loader = this._loader;
            if (loader == null)
                loader = this._loader = this.createLoader();

            return loader;
        };

        PxLoaderAssetManager.prototype.createLoader = function () {
            return new PxLoader();
        };

        PxLoaderAssetManager.prototype.enqueue = function () {
            var rawAssets = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                rawAssets[_i] = arguments[_i + 0];
            }
            var loader = this.getLoader();

            function add(url, type) {
                if (url == null)
                    throw new Error('Missing required parameter "url"');

                if (type === 'image')
                    loader.addImage(url);
else if (type === 'sound')
                    loader.addSound(url);
else if (type === 'xml')
                    loader.addXml(url);
else if (type == null)
                    loader.addGeneric(url);
            }

            for (var i = 0; i < rawAssets.length; i++) {
                var rawAsset = rawAssets[i];

                if (Array.isArray(rawAsset)) {
                    this.enqueue.apply(this, rawAsset);
                } else if (typeof rawAsset === 'string') {
                    var type = this.getType(rawAsset);
                    add(rawAsset, type);
                } else if (typeof rawAsset === 'object') {
                    var type = this.getType(rawAsset);
                    if (rawAsset.url == null)
                        throw new Error('Asset definition is missing required property "url"!');
                    add(rawAsset.url, type);
                } else {
                    this.log("Ignoring unsupported asset type: " + skylark.ClassUtil.getQualifiedClassName(rawAsset));
                }
            }
        };

        PxLoaderAssetManager.prototype.getType = function (url) {
            if (typeof url === 'object' && url.type)
                return url.type;

            var type;
            var ext = /\.(\w{1,3})$/.exec(url);
            if (ext == null || !ext.length)
                return null;

            switch (ext[1]) {
                case 'png':
                case 'jpeg':
                    type = 'image';
                    break;
                case 'mp3':
                case 'ogg':
                    type = 'audio';
                    break;
                case 'xml':
                    type = 'xml';
                    break;
            }
            return type;
        };

        PxLoaderAssetManager.prototype.loadQueue = function (onProgress) {
            var _this = this;
            var loader = this._loader;

            if (!this._loader) {
                onProgress(1, true);
                return;
            }

            loader.addProgressListener(function (e) {
                if (e.error)
                    _this.onError(e);
else if (e.loaded)
                    _this.onLoaded(e);
else if (e.timeout)
                    _this.onTimeout(e);

                if ((e.completedCount / e.totalCount) < 1)
                    onProgress(e.completedCount / e.totalCount, false);
            });

            loader.addCompletionListener(function (e) {
                _this.onComplete(e);
                onProgress(1, true);
            });

            loader.start(['image', 'textureatlas', 'xml']);
        };

        PxLoaderAssetManager.prototype.onError = function (e) {
            console.log('[ERROR] Resource failed!');
        };

        PxLoaderAssetManager.prototype.onLoaded = function (e) {
            var resource = e.resource;
            if (resource instanceof PxLoaderXml) {
                var rootNode = resource.rootNode;
                if (rootNode && rootNode.nodeName === 'TextureAtlas') {
                    this.processTextureAtlas(resource.getXml(), resource);
                } else {
                    throw new Error('Unsupported XML content - expecting a root node "TextureAtlas" but found "' + rootNode + '"');
                }
            } else if (resource instanceof PxLoaderImage) {
                var name = this.getName(resource.getName());
                var img = resource.img;
                this.addTexture(name, new skylark.ConcreteTexture(new skylark.DefaultImageSource(img)));
            }
        };

        PxLoaderAssetManager.prototype.onTimeout = function (e) {
            console.log('[ERROR] Resource timed out!');
        };

        PxLoaderAssetManager.prototype.onComplete = function (e) {
            this.processPending();

            this.onQueueComplete();
        };
        return PxLoaderAssetManager;
    })(skylark.AssetManager);
    skylark.PxLoaderAssetManager = PxLoaderAssetManager;

    var PxLoaderXml = (function () {
        function PxLoaderXml(name, tags, priority) {
            this._complete = false;
            this._tags = [];
            this._name = name;
            this._tags = tags;
            this._priority = priority;
        }
        PxLoaderXml.prototype.start = function (pxLoader) {
            var _this = this;
            var loader = this._loader = pxLoader;

            var xhr = new XMLHttpRequest();

            function cleanup() {
                xhr.onload = null;
                xhr.onerror = null;
                xhr.onabort = null;
            }

            xhr.onload = function (evt) {
                cleanup();
                _this.onLoad(xhr.responseXML);
            };
            xhr.onerror = function (evt) {
                cleanup();
                _this.onError(xhr.statusText);
            };
            xhr.onabort = function (evt) {
                cleanup();
                _this.onAbort();
            };
            xhr.ontimeout = function (evt) {
                cleanup();
                _this.onTimeout();
            };
            ;

            xhr.open("GET", this._name);
            xhr.send();
        };

        PxLoaderXml.prototype.checkStatus = function () {
            if (this._complete)
                this._loader.onLoad(this);
        };

        PxLoaderXml.prototype.getName = function () {
            return this._name;
        };

        PxLoaderXml.prototype.getXml = function () {
            return this._data;
        };

        PxLoaderXml.prototype.onTimeout = function () {
            if (this._complete)
                this._loader.onLoad(this);
else
                this._loader.onTimeout(this);
        };

        PxLoaderXml.prototype.onLoad = function (data) {
            this._complete = true;
            this._data = data;
            this._loader.onLoad(this);
        };

        PxLoaderXml.prototype.onError = function (textStatus) {
            this._loader.onError(this);
        };

        PxLoaderXml.prototype.onAbort = function () {
            this._loader.onError(this);
        };

        Object.defineProperty(PxLoaderXml.prototype, "complete", {
            get: function () {
                return this._complete;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(PxLoaderXml.prototype, "rootNode", {
            get: function () {
                return skylark.AssetManager.findRootNode(this._data);
            },
            enumerable: true,
            configurable: true
        });
        return PxLoaderXml;
    })();
    skylark.PxLoaderXml = PxLoaderXml;
})(skylark || (skylark = {}));

PxLoader['prototype']['addXml'] = function (name, tags, priority) {
    var loader = new skylark.PxLoaderXml(name, tags, priority);
    this.add(loader);
    return name;
};
var skylark;
(function (skylark) {
    var State = (function () {
        function State() {
            this.matrix = new skylark.Matrix();
            this.blendMode = null;
            this.parentBlendMode = null;
            this.alpha = 1.0;
        }
        return State;
    })();

    var RenderSupport = (function () {
        function RenderSupport() {
            this._projectionMatrix = new skylark.Matrix();
            this._modelViewMatrix = new skylark.Matrix();
            this._mvpMatrix = new skylark.Matrix();
            this._stateStack = [];
            this._stateStackSize = 0;
            this._drawCount = 0;
            this._blendMode = skylark.BlendMode.NORMAL;
            this._parentBlendMode = null;

            this.loadIdentity();
            this.setOrthographicProjection(0, 0, 400, 300);
        }
        RenderSupport.prototype.setOrthographicProjection = function (x, y, width, height) {
            this._projectionMatrix.setTo(2.0 / width, 0, 0, -2.0 / height, -(2 * x + width) / width, (2 * y + height) / height);
        };

        RenderSupport.prototype.loadIdentity = function () {
            this._modelViewMatrix.identity();
        };

        RenderSupport.prototype.translateMatrix = function (dx, dy) {
            skylark.MatrixUtil.prependTranslation(this._modelViewMatrix, dx, dy);
        };

        RenderSupport.prototype.rotateMatrix = function (angle) {
            skylark.MatrixUtil.prependRotation(this._modelViewMatrix, angle);
        };

        RenderSupport.prototype.scaleMatrix = function (sx, sy) {
            skylark.MatrixUtil.prependScale(this._modelViewMatrix, sx, sy);
        };

        RenderSupport.prototype.prependMatrix = function (matrix) {
            skylark.MatrixUtil.prependMatrix(this._modelViewMatrix, matrix);
        };

        RenderSupport.prototype.transformMatrix = function (object) {
            skylark.MatrixUtil.prependMatrix(this._modelViewMatrix, object.transformationMatrix);
        };

        RenderSupport.prototype.pushState = function () {
            var state;
            if (this._stateStack.length < this._stateStackSize + 1) {
                state = new State();
                this._stateStack.push(state);
                this._stateStackSize++;
            } else {
                state = this._stateStack[this._stateStackSize++];
            }

            var blendMode = this.blendMode;

            state.matrix.copyFrom(this._modelViewMatrix);
            state.alpha = this.alpha;
            state.blendMode = blendMode;
            state.parentBlendMode = this.parentBlendMode;

            this.alpha = 1.0;
            this.parentBlendMode = blendMode;
            this.blendMode = skylark.BlendMode.AUTO;
        };

        RenderSupport.prototype.popState = function () {
            var state = this._stateStack[--this._stateStackSize];
            this._modelViewMatrix.copyFrom(state.matrix);
            this._alpha = state.alpha;
            this.blendMode = state.blendMode;
        };

        RenderSupport.prototype.resetMatrix = function () {
            this._stateStackSize = 0;
            this.loadIdentity();
        };

        RenderSupport.transformMatrixForObject = function (matrix, object) {
            skylark.MatrixUtil.prependMatrix(matrix, object.transformationMatrix);
        };

        Object.defineProperty(RenderSupport.prototype, "mvpMatrix", {
            get: function () {
                this._mvpMatrix.copyFrom(this._modelViewMatrix);

                return this._mvpMatrix;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(RenderSupport.prototype, "modelViewMatrix", {
            get: function () {
                return this._modelViewMatrix;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(RenderSupport.prototype, "projectionMatrix", {
            get: function () {
                return this._projectionMatrix;
            },
            enumerable: true,
            configurable: true
        });

        RenderSupport.prototype.applyBlendMode = function (premultipliedAlpha) {
            var context = this.context;

            var blendMode = this.blendMode;
            if (blendMode == null)
                blendMode = this.parentBlendMode || skylark.BlendMode.NORMAL;

            context.globalCompositeOperation = blendMode;
        };

        Object.defineProperty(RenderSupport.prototype, "blendMode", {
            get: function () {
                return this._blendMode;
            },
            set: function (value) {
                if (value != skylark.BlendMode.AUTO)
                    this._blendMode = value;
            },
            enumerable: true,
            configurable: true
        });



        Object.defineProperty(RenderSupport.prototype, "parentBlendMode", {
            get: function () {
                return this._parentBlendMode;
            },
            set: function (value) {
                this._parentBlendMode = value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(RenderSupport.prototype, "alpha", {
            get: function () {
                return this._alpha;
            },
            set: function (alpha) {
                this._alpha = alpha;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(RenderSupport.prototype, "context", {
            get: function () {
                return this._context;
            },
            set: function (context) {
                this._context = context;
                this._canvas = context.canvas;
                if (this._canvas == null)
                    throw new skylark.ArgumentError('CanvasRenderingContext2D without a HTMLCanvas reference!');
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(RenderSupport.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });


        RenderSupport.prototype.nextFrame = function () {
            this.resetMatrix();
            this._blendMode = skylark.BlendMode.NORMAL;
            this._drawCount = 0;
        };

        RenderSupport.clear = function (context, rgb, alpha) {
            if (typeof rgb === "undefined") { rgb = 0; }
            if (typeof alpha === "undefined") { alpha = 1.0; }
            var canvas = context.canvas;
            if (canvas == null)
                throw new skylark.IllegalSystemStateError('CanvasRenderingContext2D without a "canvas" reference!');

            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            if (rgb === 0 && alpha === 0) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                context.fillStyle = skylark.Color.toHexString(rgb);
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
            context.restore();
        };

        RenderSupport.prototype.clear = function (rgb, alpha) {
            if (typeof rgb === "undefined") { rgb = 0; }
            if (typeof alpha === "undefined") { alpha = 1.0; }
            var context = this.context;

            if (context == null)
                throw new skylark.MissingContextError();

            RenderSupport.clear(context, rgb, alpha);
        };

        RenderSupport.prototype.raiseDrawCount = function (value) {
            if (typeof value === "undefined") { value = 1; }
            this._drawCount += value;
        };

        Object.defineProperty(RenderSupport.prototype, "drawCount", {
            get: function () {
                return this._drawCount;
            },
            enumerable: true,
            configurable: true
        });
        RenderSupport._point = new skylark.Point();
        RenderSupport._rectangle = new skylark.Rectangle();
        return RenderSupport;
    })();
    skylark.RenderSupport = RenderSupport;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var ServiceFactory = (function () {
        function ServiceFactory() {
            this.services = {
                assetManager: 'skylark.PxLoaderAssetManager',
                canvasProvider: 'skylark.HTMLCanvasProvider'
            };
            this.instances = {};
        }
        ServiceFactory.prototype.use = function (obj) {
            if (obj == null)
                throw new skylark.ArgumentError('Parameter "obj:0" is null or undefined!');
            return skylark.Skylark;
        };

        ServiceFactory.prototype.get = function (name) {
            var instance = this.instances[name];
            if (instance == null) {
                instance = this.resolve(name);
                this.instances[name] = instance;
            }
            return instance;
        };

        ServiceFactory.prototype.resolve = function (name) {
            var resolved = this.services[name];
            var instance;

            if (typeof resolved === 'function')
                resolved = resolved();

            if (typeof resolved === 'string')
                resolved = eval(resolved);

            if (typeof resolved === 'function') {
                instance = new resolved();
            } else if (typeof resolved === 'object') {
                instance = resolved;
            } else if (resolved != null) {
                throw new Error('We do not understand service or service factory for "' + name + '"');
            } else if (this.services[name] == null) {
                throw new Error('Could not resolve service for "' + name + '"' + ' - service is not configured!');
            } else {
                throw new Error('Could not resolve service for "' + name + '"' + ' - configuration resolved to NULL or UNDEFINED');
            }

            this.instances[name] = instance;
            return instance;
        };
        return ServiceFactory;
    })();
    skylark.ServiceFactory = ServiceFactory;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Skylark = (function (_super) {
        __extends(Skylark, _super);
        function Skylark(rootClass, id, viewPort) {
            if (typeof id === "undefined") { id = 'stage'; }
            if (typeof viewPort === "undefined") { viewPort = null; }
            _super.call(this);
            this._bufferedRender = false;
            this._shareContext = false;

            if (id == null)
                id = 'stage';
            if (rootClass == null)
                throw new skylark.ArgumentError("Root class must not be null");

            this.initializeCanvasProvider();
            var canvas = this.initializeCanvas(id);
            var color = this._canvasProvider.getBackgroundColor(canvas);
            if (viewPort == null)
                viewPort = new skylark.Rectangle(0, 0, canvas.width, canvas.height);

            this.buffered = Skylark._buffered;
            if (this.buffered)
                this.initializeBufferCanvas();

            this.makeCurrent();

            if (typeof rootClass === 'object') {
                this._root = rootClass;
                this._rootClass = rootClass.constructor;
            } else
                this._rootClass = rootClass;

            this._viewPort = viewPort;
            this._previousViewPort = new skylark.Rectangle();

            if (viewPort.width === 0 && viewPort.height === 0)
                throw new skylark.ArgumentError('Cannot create Skylark instance without width and height');

            this._stage = new skylark.Stage(viewPort.width, viewPort.height, color);
            this._touchProcessor = new skylark.TouchProcessor(this._stage);
            this._juggler = new skylark.Juggler();

            this._simulateMultitouch = false;

            this._lastFrameTimestamp = this.getTimer() / 1000.0;
            this._support = new skylark.RenderSupport();

            this.updateViewPort();
            this.initializeRoot();

            var eventTypes = this.touchEventTypes;
            var i = eventTypes.length;
            var touchEventType;
            this.$onTouch = this.onTouch.bind(this);
            while (i-- > -1)
                canvas.addEventListener(eventTypes[i], this.$onTouch, false);

            this.$onKey = this.onKey.bind(this);
            this.$onResize = this.onResize.bind(this);
            this.$onMouseLeave = this.onMouseLeave.bind(this);

            canvas.addEventListener('keydown', this.$onKey, false);
            canvas.addEventListener('keyup', this.$onKey, false);
            canvas.addEventListener('resize', this.$onResize, false);
            canvas.addEventListener('mouseleave', this.$onMouseLeave, false);

            this._touchProcessor.simulateMultitouch = this._simulateMultitouch;
            this._lastFrameTimestamp = this.getTimer() / 1000.0;

            Skylark._count++;
        }
        Object.defineProperty(Skylark, "buffered", {
            get: function () {
                return Skylark._buffered;
            },
            set: function (value) {
                Skylark._buffered = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Skylark, "stageDefaults", {
            get: function () {
                return Skylark._stageDefaults;
            },
            set: function (config) {
                var defaults = Skylark._stageDefaults;
                if (typeof config.width !== 'undefined')
                    defaults.width = config.width;
                if (typeof config.height !== 'undefined')
                    defaults.height = config.height;
                if (typeof config.backgroundColor !== 'undefined')
                    defaults.backgroundColor = config.backgroundColor;
            },
            enumerable: true,
            configurable: true
        });


        Skylark.create = function (rootClass, elementId) {
            return new Skylark(rootClass, elementId);
        };

        Skylark.onReady = function (fn) {
            var readyState = document.readyState;
            if (readyState == "complete" || readyState == "interactive") {
                fn(this);
            } else {
                var onReady = (function () {
                    return function listener() {
                        document.removeEventListener("DOMContentLoaded", listener, false);
                        fn(this);
                    };
                })();
                document.addEventListener("DOMContentLoaded", onReady, false);
            }
        };

        Skylark.prototype.initializeCanvas = function (id) {
            var canvasProvider = this._canvasProvider;
            var canvas = canvasProvider.getCanvasById(id);
            if (canvas == null) {
                var defaults = Skylark._stageDefaults;
                canvas = canvasProvider.createCanvas(id, defaults.width, defaults.height);
                if (defaults.backgroundColor != null)
                    canvas.style.backgroundColor = skylark.Color.toHexString(defaults.backgroundColor);
            } else {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }

            (canvas).setAttribute('tabIndex', 0);
            (canvas).focus();

            this._canvas = canvas;
            this._context = canvas.getContext('2d');

            return canvas;
        };

        Skylark.prototype.initializeBufferCanvas = function () {
            var canvasProvider = this._canvasProvider;
            var canvas;
            var onscreenCanvas = this._canvas;

            canvas = canvasProvider.createCanvasWith(function (canvas) {
                canvas.style.cssText = 'position:absolute; top:-10000px; left:-10000px';
                canvas.id = onscreenCanvas.id + '-buffer';
                canvas.width = onscreenCanvas.width;
                canvas.height = onscreenCanvas.height;
            });

            this._bufferCanvas = canvas;
            this._buffer = canvas.getContext('2d');

            return canvas;
        };

        Skylark.prototype.initializeCanvasProvider = function () {
            this._canvasProvider = Skylark._serviceFactory.get('canvasProvider');
        };

        Skylark.prototype.initializeRoot = function () {
            var cls = this._rootClass;
            if (this._root == null) {
                this._root = new cls();
            }
            if (!(this._root instanceof skylark.DisplayObject))
                throw new Error('Root object is not of type "DisplayObject": ' + skylark.ClassUtil.getQualifiedClassName(this._root));

            this._stage.addChildAt(this._root, 0);

            this.dispatchEventWith(skylark.Event.ROOT_CREATED, false, this._root);
        };

        Skylark.prototype.updateViewPort = function (updateAliasing) {
            if (typeof updateAliasing === "undefined") { updateAliasing = false; }
            var modified = false;
            if (updateAliasing || (modified = this._previousViewPort.width != this._viewPort.width || this._previousViewPort.height != this._viewPort.height || this._previousViewPort.x != this._viewPort.x || this._previousViewPort.y != this._viewPort.y)) {
                this._previousViewPort.setTo(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height);
            }
        };

        Skylark.prototype.nextFrame = function () {
            var now = this.getTimer() / 1000.0;
            var passedTime = now - this._lastFrameTimestamp;
            this._lastFrameTimestamp = now;

            this.advanceTime(passedTime);
            this.render();
        };

        Skylark.prototype.advanceTime = function (passedTime) {
            this.makeCurrent();

            this._touchProcessor.advanceTime(passedTime);
            this._stage.advanceTime(passedTime);
            this._juggler.advanceTime(passedTime);
        };

        Skylark.prototype.render = function () {
            var support = this._support;
            var stage = this._stage;
            var viewPort = this._viewPort;

            this.makeCurrent();

            support.context = this.context;

            this.updateViewPort();
            support.nextFrame();

            if (!this._shareContext)
                support.clear(stage.color, stage.alpha);

            var scaleX = viewPort.width / stage.stageWidth;
            var scaleY = viewPort.height / stage.stageHeight;

            support.setOrthographicProjection(viewPort.x < 0 ? -viewPort.x / scaleX : 0.0, viewPort.y < 0 ? -viewPort.y / scaleY : 0.0, viewPort.width / scaleX, viewPort.height / scaleY);

            stage.render(support);

            if (this._bufferedRender)
                this.flushBuffer();
        };

        Skylark.prototype.flushBuffer = function () {
            var onscreen = this._context;

            onscreen.clearRect(0, 0, this._canvas.width, this._canvas.height);
            onscreen.drawImage(this._bufferCanvas, 0, 0);
        };

        Skylark.prototype.makeCurrent = function () {
            Skylark.current = this;
            return this;
        };

        Skylark.prototype.start = function () {
            this._started = true;
            this._lastFrameTimestamp = this.getTimer() / 1000.0;
            this.$onEnterFrame = this.onEnterFrame.bind(this);

            this._afHandle = window.requestAnimationFrame(this.$onEnterFrame);

            return this;
        };

        Skylark.prototype.startOnReady = function () {
            var document = window.document, _this = this;

            if (document.readyState == "complete" || document.readyState == "interactive") {
                this.start();
            } else {
                function onReady(ev) {
                    document.removeEventListener("DOMContentLoaded", onReady, false);
                    _this.start();
                }

                document.addEventListener("DOMContentLoaded", onReady, false);
            }
            return this;
        };

        Skylark.prototype.stop = function () {
            this._started = false;
            if (this._afHandle != null)
                window.cancelAnimationFrame(this._afHandle);
            this._afHandle = null;
        };

        Skylark.prototype.isStarted = function () {
            return this._started;
        };

        Skylark.prototype.onEnterFrame = function () {
            var that = this;
            this._afHandle = window.requestAnimationFrame(this.$onEnterFrame);
            if (this._started)
                this.nextFrame();
else
                this.render();
        };

        Skylark.getHelperCanvas = function (width, height) {
            var canvas = Skylark._helperCanvas;
            if (canvas == null) {
                canvas = Skylark._serviceFactory.get('canvasProvider').createCanvas('skylark-temporary-' + new Date().getTime(), width, height, true);
                Skylark._helperCanvas = canvas;
            } else {
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
            }
            return canvas;
        };

        Skylark.prototype.onKey = function (event) {
            event.preventDefault();

            if (!this._started)
                return;

            this.makeCurrent();

            this._stage.dispatchEvent(new skylark.KeyboardEvent(event.type, (event).charCode, (event).keyCode, (event).location, event.ctrlKey, event.altKey, event.shiftKey));
        };

        Skylark.prototype.onResize = function (event) {
        };

        Skylark.prototype.onMouseLeave = function (event) {
            this._touchProcessor.enqueueMouseLeftStage();
        };

        Skylark.prototype.onTouch = function (event) {
            if (!this._started)
                return;

            var canvas = this._canvas;
            var stage = this._stage;
            var viewPort = this._viewPort;
            var touchProcessor = this._touchProcessor;

            var globalX;
            var globalY;
            var touchID;
            var phase;
            var pressure = 1.0;
            var width = 1.0;
            var height = 1.0;

            var leftMouseDown = this._leftMouseDown;

            function getPhase(eventType) {
                var phase;

                switch (event.type) {
                    case 'touchstart':
                        phase = skylark.TouchPhase.BEGAN;
                        break;
                    case 'touchmove':
                        phase = skylark.TouchPhase.MOVED;
                        break;
                    case 'touchend':
                        phase = skylark.TouchPhase.ENDED;
                        break;
                    case 'mousedown':
                        phase = skylark.TouchPhase.BEGAN;
                        break;
                    case 'mouseup':
                        phase = skylark.TouchPhase.ENDED;
                        break;
                    case 'mousemove':
                        phase = (leftMouseDown ? skylark.TouchPhase.MOVED : skylark.TouchPhase.HOVER);
                        break;
                    default:
                        throw new Error('Unknown event type: ' + event.type);
                }
                return phase;
            }

            if (event instanceof MouseEvent) {
                var mouseEvent = event;

                globalX = mouseEvent.clientX;
                globalY = mouseEvent.clientY;

                touchID = 0;

                if (event.type == 'mousedown')
                    leftMouseDown = true;
else if (event.type == 'mouseup')
                    leftMouseDown = false;

                this._leftMouseDown = leftMouseDown;

                phase = getPhase(event.type);

                enqueue();
            } else {
                var touches = (event).changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var touch = touches[i];

                    globalX = touch.clientX;
                    globalY = touch.clientY;
                    touchID = touch.identifier;

                    pressure = touch.webkitForce;
                    width = touch.webkitRadiusX;
                    height = touch.webkitRadiusY;
                    phase = getPhase(event.type);

                    enqueue();
                }
            }

            function enqueue() {
                var rect = canvas.getBoundingClientRect();

                var computedStyle = window.getComputedStyle(canvas, null);
                var paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left'), 10);
                var paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'), 10);

                globalX = globalX - rect.left - paddingLeft;
                globalY = globalY - rect.top - paddingTop;

                globalX = stage.stageWidth * (globalX - viewPort.x) / viewPort.width;
                globalY = stage.stageHeight * (globalY - viewPort.y) / viewPort.height;

                event.preventDefault();

                touchProcessor.enqueue(touchID, phase, globalX, globalY, pressure, width, height);
            }
        };

        Object.defineProperty(Skylark.prototype, "touchEventTypes", {
            get: function () {
                return !Skylark.multitouchEnabled ? ['mousedown', 'mousemove', 'mouseup'] : ['touchstart', 'touchmove', 'touchend'];
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark, "multitouchEnabled", {
            get: function () {
                return this._multitouchEnabled;
            },
            set: function (value) {
                if (Skylark._current != null)
                    throw new skylark.IllegalOperationError("'multitouchEnabled' must be set before Skylark instance is created");
else
                    this._multitouchEnabled = value;
            },
            enumerable: true,
            configurable: true
        });


        Skylark.prototype.getTimer = function () {
            return new Date().getTime();
        };

        Object.defineProperty(Skylark.prototype, "stage", {
            get: function () {
                return this._stage;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark.prototype, "juggler", {
            get: function () {
                return this._juggler;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark.prototype, "simulateMultitouch", {
            get: function () {
                return this._simulateMultitouch;
            },
            set: function (value) {
                this._simulateMultitouch = value;
                if (this._context)
                    this._touchProcessor.simulateMultitouch = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Skylark.prototype, "viewPort", {
            get: function () {
                return this._viewPort;
            },
            set: function (value) {
                this._viewPort = value.clone();
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Skylark.prototype, "contextData", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark, "contentScaleFactor", {
            get: function () {
                if (Skylark._current == null)
                    throw new Error('Cannot determine "contentScaleFactor" when no Skylark instance is active');
                return Skylark._current.contentScaleFactor;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark.prototype, "contentScaleFactor", {
            get: function () {
                return this._viewPort.width / this._stage.stageWidth;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark.prototype, "root", {
            get: function () {
                return this._root;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark.prototype, "context", {
            get: function () {
                return this._bufferedRender ? this._buffer : this._context;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Skylark.prototype, "buffered", {
            get: function () {
                return this._bufferedRender;
            },
            set: function (enabled) {
                this._bufferedRender = enabled;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Skylark, "current", {
            get: function () {
                return Skylark._current;
            },
            set: function (instance) {
                Skylark._current = instance;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Skylark, "context", {
            get: function () {
                var current = Skylark.current;
                return current != null ? Skylark.current.context : null;
            },
            enumerable: true,
            configurable: true
        });

        Skylark.prototype.dispose = function () {
            if (this._started)
                this.stop();

            if (Skylark._current === this)
                Skylark._current = null;

            if (--Skylark._count === 0) {
                var canvas = Skylark._helperCanvas;
                Skylark._helperCanvas = null;
                this._canvasProvider.dispose(canvas);
            }

            if (this._canvas) {
                this._canvasProvider.dispose(this._canvas);
                this._canvas = null;
            }
            if (this._context)
                this._context = null;
        };
        Skylark._count = 0;

        Skylark._serviceFactory = new skylark.ServiceFactory();

        Skylark._buffered = false;

        Skylark._multitouchEnabled = false;

        Skylark._stageDefaults = {
            backgroundColor: null,
            width: 400,
            height: 300
        };
        return Skylark;
    })(skylark.EventDispatcher);
    skylark.Skylark = Skylark;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var DefaultImageSource = (function () {
        function DefaultImageSource(image) {
            if (image instanceof HTMLImageElement && !(image.height > 0 && image.width > 0))
                throw new Error('Cannot create ConcreteTexture based on Image that has not yet completed loading or has no dimensions');

            this._image = image;
        }
        Object.defineProperty(DefaultImageSource.prototype, "width", {
            get: function () {
                return (this._image).width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefaultImageSource.prototype, "height", {
            get: function () {
                return (this._image).height;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefaultImageSource.prototype, "image", {
            get: function () {
                return this._image;
            },
            enumerable: true,
            configurable: true
        });

        DefaultImageSource.prototype.dispose = function () {
            this._image = null;
        };
        return DefaultImageSource;
    })();
    skylark.DefaultImageSource = DefaultImageSource;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TouchMarker = (function (_super) {
        __extends(TouchMarker, _super);
        function TouchMarker() {
            _super.call(this);
            this._center = new skylark.Point();
            this._texture = this.createTexture();

            for (var i = 0; i < 2; ++i) {
                var marker = new skylark.Image(this._texture);
                marker.pivotX = this._texture.width / 2;
                marker.pivotY = this._texture.height / 2;
                marker.touchable = false;
                this.addChild(marker);
            }
        }
        TouchMarker.prototype.dispose = function () {
            this._texture.dispose();
            _super.prototype.dispose.call(this);
        };

        TouchMarker.prototype.moveMarker = function (x, y, withCenter) {
            if (typeof withCenter === "undefined") { withCenter = false; }
            if (withCenter) {
                this._center.x += x - this.realMarker.x;
                this._center.y += y - this.realMarker.y;
            }

            this.realMarker.x = x;
            this.realMarker.y = y;
            this.mockMarker.x = 2 * this._center.x - x;
            this.mockMarker.y = 2 * this._center.y - y;
        };

        TouchMarker.prototype.moveCenter = function (x, y) {
            this._center.x = x;
            this._center.y = y;
            this.moveMarker(this.realX, this.realY);
        };

        TouchMarker.prototype.createTexture = function () {
            var scale = 1.0;
            var radius = 12 * scale;
            var width = 32 * scale;
            var height = 32 * scale;
            var thickness = 1.5 * scale;

            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', String(width));
            canvas.setAttribute('height', String(height));

            var context = canvas.getContext('2d');

            context.beginPath();
            context.arc(width / 2, height / 2, radius + thickness, 0, 2 * Math.PI, false);
            context.lineWidth = thickness;
            context.strokeStyle = '#000000';
            context.globalAlpha = 0.3;
            context.stroke();

            context.beginPath();
            context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, false);
            context.fillStyle = skylark.Color.toHexString(0x000000);
            context.globalAlpha = 0.1;
            context.fill();
            context.lineWidth = thickness;
            context.strokeStyle = '#ffffff';
            context.stroke();

            return skylark.Texture.fromCanvas(canvas);
        };

        Object.defineProperty(TouchMarker.prototype, "realMarker", {
            get: function () {
                return this.getChildAt(0);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchMarker.prototype, "mockMarker", {
            get: function () {
                return this.getChildAt(1);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchMarker.prototype, "realX", {
            get: function () {
                return this.realMarker.x;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchMarker.prototype, "realY", {
            get: function () {
                return this.realMarker.y;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchMarker.prototype, "mockX", {
            get: function () {
                return this.mockMarker.x;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TouchMarker.prototype, "mockY", {
            get: function () {
                return this.mockMarker.y;
            },
            enumerable: true,
            configurable: true
        });
        return TouchMarker;
    })(skylark.Sprite);
    skylark.TouchMarker = TouchMarker;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TrackMarker = (function (_super) {
        __extends(TrackMarker, _super);
        function TrackMarker() {
            _super.call(this);

            var texture = this.createTexture();

            var marker = new skylark.Image(texture);
            marker.pivotX = texture.width / 2;
            marker.pivotY = texture.height / 2;
            marker.touchable = false;
            this.addChild(marker);
        }
        TrackMarker.prototype.moveMarker = function (x, y) {
            this.x = x;
            this.y = y;
        };

        TrackMarker.prototype.createTexture = function () {
            var scale = 1.0;
            var radius = 12 * scale;
            var width = 32 * scale;
            var height = 32 * scale;
            var thickness = 1.5 * scale;

            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', String(width));
            canvas.setAttribute('height', String(height));

            var context = canvas.getContext('2d');

            context.beginPath();
            context.arc(width / 2, height / 2, radius + thickness, 0, 2 * Math.PI, false);
            context.lineWidth = thickness;
            context.strokeStyle = '#000000';
            context.globalAlpha = 0.3;
            context.stroke();

            context.beginPath();
            context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, false);
            context.fillStyle = skylark.Color.toHexString(0x000000);
            context.globalAlpha = 0.1;
            context.fill();
            context.lineWidth = thickness;
            context.strokeStyle = '#ffffff';
            context.stroke();

            return skylark.Texture.fromCanvas(canvas);
        };
        return TrackMarker;
    })(skylark.Sprite);
    skylark.TrackMarker = TrackMarker;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TouchProcessor = (function () {
        function TouchProcessor(stage) {
            this._shiftDown = false;
            this._ctrlDown = false;
            this._stage = stage;
            this._elapsedTime = 0.0;
            this._currentTouches = [];
            this._queue = [];
            this._lastTaps = [];

            this._stage.addEventListener(skylark.KeyboardEvent.KEY_DOWN, this.onKey, this);
            this._stage.addEventListener(skylark.KeyboardEvent.KEY_UP, this.onKey, this);
        }
        TouchProcessor.prototype.dispose = function () {
            this._stage.removeEventListener(skylark.KeyboardEvent.KEY_DOWN, this.onKey, this);
            this._stage.removeEventListener(skylark.KeyboardEvent.KEY_UP, this.onKey, this);
            if (this._touchMarker)
                this._touchMarker.dispose();
        };

        TouchProcessor.prototype.advanceTime = function (passedTime) {
            var i;
            var len;
            var touchID;
            var touch;
            var touchData;

            this._elapsedTime += passedTime;

            var taps = this._lastTaps;
            var elapsedTime = this._elapsedTime;
            len = taps.length;
            if (len > 0) {
                for (i = len - 1; i >= 0; --i)
                    if (elapsedTime - taps[i].timestamp > TouchProcessor.MULTITAP_TIME)
                        taps.splice(i, 1);
            }

            while (this._queue.length > 0) {
                TouchProcessor._processedTouchIDs.length = TouchProcessor._hoveringTouchData.length = 0;

                var currentTouches = this._currentTouches;
                var len = currentTouches.length;
                for (i = 0, touch = currentTouches[i]; i < len; i++) {
                    if (touch.phase == skylark.TouchPhase.BEGAN || touch.phase == skylark.TouchPhase.MOVED)
                        touch.setPhase(skylark.TouchPhase.STATIONARY);
                }

                while (this._queue.length > 0 && TouchProcessor._processedTouchIDs.indexOf(this._queue[this._queue.length - 1][0]) == -1) {
                    var touchArgs = this._queue.pop();
                    touchID = touchArgs[0];
                    touch = this.getCurrentTouch(touchID);

                    if (touch && touch.phase == skylark.TouchPhase.HOVER && touch.target)
                        TouchProcessor._hoveringTouchData.push({
                            touch: touch,
                            target: touch.target,
                            bubbleChain: touch.bubbleChain
                        });

                    this.processTouch.apply(this, touchArgs);
                    TouchProcessor._processedTouchIDs.push(touchID);
                }

                var touchEvent = new skylark.TouchEvent(skylark.TouchEvent.TOUCH, this._currentTouches, this._shiftDown, this._ctrlDown);

                var touchDataArr = TouchProcessor._hoveringTouchData;
                len = touchDataArr.length;
                for (i = 0, touchData = touchDataArr[i]; i < len; i++) {
                    if ((touchData.touch).target != touchData.target)
                        touchEvent.dispatch(touchData.bubbleChain);
                }

                var ids = TouchProcessor._processedTouchIDs;
                for (i = 0; i < ids.length; i++) {
                    this.getCurrentTouch(ids[i]).dispatchEvent(touchEvent);
                }

                var touches = this._currentTouches;
                for (i = touches.length - 1; i >= 0; --i)
                    if (touches[i].phase == skylark.TouchPhase.ENDED)
                        touches.splice(i, 1);
            }
        };

        TouchProcessor.prototype.enqueue = function (touchID, phase, globalX, globalY, pressure, width, height) {
            if (typeof pressure === "undefined") { pressure = 1.0; }
            if (typeof width === "undefined") { width = 1.0; }
            if (typeof height === "undefined") { height = 1.0; }
            this._queue.unshift(arguments);

            if (this._ctrlDown && this.simulateMultitouch && touchID == 0) {
                this._touchMarker.moveMarker(globalX, globalY, this._shiftDown);
                this._queue.unshift([1, phase, this._touchMarker.mockX, this._touchMarker.mockY]);
            }
        };

        TouchProcessor.prototype.enqueueMouseLeftStage = function () {
            var mouse = this.getCurrentTouch(0);
            if (mouse == null || mouse.phase != skylark.TouchPhase.HOVER)
                return;

            var offset = 1;
            var exitX = mouse.globalX;
            var exitY = mouse.globalY;
            var distLeft = mouse.globalX;
            var distRight = this._stage.stageWidth - distLeft;
            var distTop = mouse.globalY;
            var distBottom = this._stage.stageHeight - distTop;
            var minDist = Math.min(distLeft, distRight, distTop, distBottom);

            if (minDist == distLeft)
                exitX = -offset;
else if (minDist == distRight)
                exitX = this._stage.stageWidth + offset;
else if (minDist == distTop)
                exitY = -offset;
else
                exitY = this._stage.stageHeight + offset;

            this.enqueue(0, skylark.TouchPhase.HOVER, exitX, exitY);
        };

        TouchProcessor.prototype.processTouch = function (touchID, phase, globalX, globalY, pressure, width, height) {
            if (typeof pressure === "undefined") { pressure = 1.0; }
            if (typeof width === "undefined") { width = 1.0; }
            if (typeof height === "undefined") { height = 1.0; }
            var position = new skylark.Point(globalX, globalY);
            var touch = this.getCurrentTouch(touchID);

            if (touch == null) {
                touch = new skylark.Touch(touchID, globalX, globalY, phase, null);
                this.addCurrentTouch(touch);
            }

            touch.setPosition(globalX, globalY);
            touch.setPhase(phase);
            touch.setTimestamp(this._elapsedTime);
            touch.setPressure(pressure);
            touch.setSize(width, height);

            if (phase == skylark.TouchPhase.HOVER || phase == skylark.TouchPhase.BEGAN)
                touch.setTarget(this._stage.hitTest(position, true));

            if (phase == skylark.TouchPhase.BEGAN)
                this.processTap(touch);
        };

        TouchProcessor.prototype.onKey = function (event) {
            if (event.keyCode == 17 || event.keyCode == 15) {
                var wasCtrlDown = this._ctrlDown;
                this._ctrlDown = event.type == skylark.KeyboardEvent.KEY_DOWN;

                if (this.simulateMultitouch && wasCtrlDown != this._ctrlDown) {
                    this._touchMarker.visible = this._ctrlDown;
                    this._touchMarker.moveCenter(this._stage.stageWidth / 2, this._stage.stageHeight / 2);

                    var mouseTouch = this.getCurrentTouch(0);
                    var mockedTouch = this.getCurrentTouch(1);

                    if (mouseTouch)
                        this._touchMarker.moveMarker(mouseTouch.globalX, mouseTouch.globalY);

                    if (wasCtrlDown && mockedTouch && mockedTouch.phase != skylark.TouchPhase.ENDED) {
                        this._queue.unshift([1, skylark.TouchPhase.ENDED, mockedTouch.globalX, mockedTouch.globalY]);
                    } else if (this._ctrlDown && mouseTouch) {
                        if (mouseTouch.phase == skylark.TouchPhase.HOVER || mouseTouch.phase == skylark.TouchPhase.ENDED)
                            this._queue.unshift([1, skylark.TouchPhase.HOVER, this._touchMarker.mockX, this._touchMarker.mockY]);
else
                            this._queue.unshift([1, skylark.TouchPhase.BEGAN, this._touchMarker.mockX, this._touchMarker.mockY]);
                    }
                }
            } else if (event.keyCode == 16) {
                this._shiftDown = event.type == skylark.KeyboardEvent.KEY_DOWN;
            }
        };

        TouchProcessor.prototype.processTap = function (touch) {
            var nearbyTap = null;
            var minSqDist = TouchProcessor.MULTITAP_DISTANCE * TouchProcessor.MULTITAP_DISTANCE;

            var taps = this._lastTaps;
            var len = taps.length;
            var i;
            var tap;
            for (i = 0, tap = taps[i]; i < len; i++) {
                var sqDist = Math.pow(tap.globalX - touch.globalX, 2) + Math.pow(tap.globalY - touch.globalY, 2);
                if (sqDist <= minSqDist) {
                    nearbyTap = tap;
                    break;
                }
            }

            if (nearbyTap) {
                touch.setTapCount(nearbyTap.tapCount + 1);
                this._lastTaps.splice(this._lastTaps.indexOf(nearbyTap), 1);
            } else {
                touch.setTapCount(1);
            }

            this._lastTaps.push(touch.clone());
        };

        TouchProcessor.prototype.addCurrentTouch = function (touch) {
            var currentTouches = this._currentTouches;

            for (var i = currentTouches.length - 1; i >= 0; --i) {
                if (currentTouches[i].id == touch.id)
                    currentTouches.splice(i, 1);
            }
            currentTouches.push(touch);
        };

        TouchProcessor.prototype.getCurrentTouch = function (touchID) {
            var touches = this._currentTouches;
            var len = touches.length;
            for (var i = 0, touch; i < len; i++) {
                touch = touches[i];
                if (touch.id == touchID)
                    return touch;
            }
            return null;
        };

        TouchProcessor.prototype.enableTouchMarker = function (enable) {
            if (typeof enable === "undefined") { enable = true; }
            var touchMarker = this._touchMarker;
            if (enable && touchMarker == null) {
                touchMarker = new skylark.TouchMarker();
                this._touchMarker = touchMarker;
                touchMarker.visible = false;
                this._stage.addChild(touchMarker);
            } else if (!enable && touchMarker != null) {
                touchMarker.removeFromParent(true);
                this._touchMarker = null;
            }
        };

        TouchProcessor.prototype.enableTrackMarkers = function (enable) {
            if (typeof enable === "undefined") { enable = true; }
            var stage = this._stage;
            if (enable) {
                this._trackMarkers = {
                    pool: [],
                    active: {},
                    createMarker: function () {
                        return new skylark.TrackMarker();
                    },
                    fromPool: function () {
                        var pool = this.pool;
                        var marker;
                        if (pool.length > 0) {
                            marker = pool.pop();
                        } else {
                            marker = this.createMarker();
                            marker.visible = false;
                            stage.addChild(marker);
                        }
                        return marker;
                    },
                    toPool: function (marker) {
                        var pool = this.pool;
                        marker.visible = false;
                        pool.push(marker);
                    },
                    update: function (touch) {
                        var touchId = touch.id;
                        var phase = touch.phase;
                        var marker = this.active[touchId];
                        if (marker == null) {
                            marker = this.fromPool();
                            this.active[touchId] = marker;
                        }

                        marker.moveMarker(touch.globalX, touch.globalY);

                        if (phase === skylark.TouchPhase.BEGAN) {
                            marker.visible = true;
                        } else if (phase === skylark.TouchPhase.ENDED) {
                            this.active[touchId] = null;
                            this.toPool(marker);
                        }
                    },
                    dispose: function () {
                        var active = this.active;
                        for (var key in active) {
                            active[key].dispose();
                            active[key] = null;
                        }
                        var pool = this.pool;
                        for (var i = 0; i < pool.length; i++) {
                            var marker = pool[i];
                            marker.dispose;
                        }
                        pool.length = 0;
                    }
                };
            } else if (this._trackMarkers != null) {
                this._trackMarkers.dispose();
                this._trackMarkers = null;
            }
        };

        Object.defineProperty(TouchProcessor.prototype, "simulateMultitouch", {
            get: function () {
                return this._simulateMultitouch;
            },
            set: function (enable) {
                if (this.simulateMultitouch !== enable) {
                    this.enableTouchMarker(enable);
                    this._simulateMultitouch = enable;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TouchProcessor.prototype, "trackMultitouch", {
            get: function () {
                return this._trackMultitouch;
            },
            set: function (enable) {
                if (this.trackMultitouch !== enable) {
                    this.enableTrackMarkers(enable);
                    var stage = this._stage;
                    if (enable)
                        stage.addEventListener(skylark.TouchEvent.TOUCH, this.updateTouchMarker, this);
else
                        stage.removeEventListener(skylark.TouchEvent.TOUCH, this.updateTouchMarker, this);

                    this._trackMultitouch = enable;
                }
            },
            enumerable: true,
            configurable: true
        });


        TouchProcessor.prototype.updateTouchMarker = function (event) {
            var touches = event.data;
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                this._trackMarkers.update(touch);
            }
        };
        TouchProcessor.MULTITAP_TIME = 0.3;
        TouchProcessor.MULTITAP_DISTANCE = 25;

        TouchProcessor._processedTouchIDs = [];
        TouchProcessor._hoveringTouchData = [];
        return TouchProcessor;
    })();
    skylark.TouchProcessor = TouchProcessor;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var AbstractCanvasProvider = (function () {
        function AbstractCanvasProvider() {
        }
        AbstractCanvasProvider.prototype.getElementById = function (id) {
            throw new skylark.AbstractMethodError();
        };

        AbstractCanvasProvider.prototype.createCanvasWith = function (cb, offscreen) {
            if (typeof offscreen === "undefined") { offscreen = false; }
            throw new skylark.AbstractMethodError();
        };

        AbstractCanvasProvider.prototype.getCanvasById = function (id) {
            var canvas = this.getElementById(id);
            if (canvas != null && !(canvas instanceof HTMLCanvasElement))
                throw new TypeError('The DOM element with id "' + id + '" is not a HTMLCanvasElement!');
            return canvas;
        };

        AbstractCanvasProvider.prototype.createCanvas = function (id, width, height, offscreen) {
            if (typeof width === "undefined") { width = null; }
            if (typeof height === "undefined") { height = null; }
            if (typeof offscreen === "undefined") { offscreen = false; }
            if (this.getElementById(id) != null)
                throw new Error('Cannot create canvas with id "' + id + '" - the DOM already contains an element with that id.');

            return this.createCanvasWith(function (canvas) {
                canvas.id = id;
                canvas.width = width;
                canvas.height = height;
            }, offscreen);
        };

        AbstractCanvasProvider.prototype.getBackgroundColor = function (canvas) {
            var cssColor = canvas.style.backgroundColor;
            if (cssColor != null && cssColor != '')
                return skylark.Color.fromString(cssColor);
        };

        AbstractCanvasProvider.prototype.dispose = function (canvas) {
            if (canvas && canvas.parentNode != null)
                canvas.parentNode.removeChild(canvas);
        };
        return AbstractCanvasProvider;
    })();
    skylark.AbstractCanvasProvider = AbstractCanvasProvider;

    var HTMLCanvasProviderFactory = (function () {
        function HTMLCanvasProviderFactory() {
        }
        Object.defineProperty(HTMLCanvasProviderFactory.prototype, "isCanvasProviderFactory", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });

        HTMLCanvasProviderFactory.prototype.create = function () {
            return new HTMLCanvasProvider(document);
        };
        return HTMLCanvasProviderFactory;
    })();
    skylark.HTMLCanvasProviderFactory = HTMLCanvasProviderFactory;

    var HTMLCanvasProvider = (function (_super) {
        __extends(HTMLCanvasProvider, _super);
        function HTMLCanvasProvider(doc) {
            _super.call(this);
            this._document = doc != null ? doc : document;
        }
        HTMLCanvasProvider.prototype.getElementById = function (id) {
            return document.getElementById(id);
        };

        HTMLCanvasProvider.prototype.createCanvasWith = function (cb, offscreen) {
            if (typeof offscreen === "undefined") { offscreen = false; }
            var canvas = document.createElement('canvas');

            cb.call(this, canvas);

            if (!offscreen) {
                var body = document.body;
                body.appendChild(canvas);
            }

            return canvas;
        };
        return HTMLCanvasProvider;
    })(AbstractCanvasProvider);
    skylark.HTMLCanvasProvider = HTMLCanvasProvider;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var DelayedCall = (function (_super) {
        __extends(DelayedCall, _super);
        function DelayedCall(call, a, b, c) {
            _super.call(this);
            var thisArg, delay, args;
            if (typeof a === 'number') {
                thisArg = this;
                delay = a;
                args = b;
            } else {
                thisArg = a;
                delay = b;
                args = c;
            }

            this.reset(call, thisArg, delay, args);
        }
        DelayedCall.prototype.reset = function (call, thisArg, delay, args) {
            if (typeof args === "undefined") { args = null; }
            this._currentTime = 0;
            this._totalTime = Math.max(delay, 0.0001);
            this._call = call;
            this._this = thisArg;
            this._args = args;
            this._repeatCount = 1;

            return this;
        };

        DelayedCall.prototype.advanceTime = function (time) {
            var previousTime = this._currentTime;
            this._currentTime = Math.min(this._totalTime, this._currentTime + time);

            if (previousTime < this._totalTime && this._currentTime >= this._totalTime) {
                (this._call).apply(this._this || null, this._args);

                if (this._repeatCount == 0 || this._repeatCount > 1) {
                    if (this._repeatCount > 0)
                        this._repeatCount -= 1;
                    this._currentTime = 0;
                    this.advanceTime((previousTime + time) - this._totalTime);
                } else {
                    this.dispatchEventWith(skylark.Event.REMOVE_FROM_JUGGLER);
                }
            }
        };

        Object.defineProperty(DelayedCall.prototype, "isComplete", {
            get: function () {
                return this._repeatCount == 1 && this._currentTime >= this._totalTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DelayedCall.prototype, "totalTime", {
            get: function () {
                return this._totalTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DelayedCall.prototype, "currentTime", {
            get: function () {
                return this._currentTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DelayedCall.prototype, "repeatCount", {
            get: function () {
                return this._repeatCount;
            },
            set: function (value) {
                this._repeatCount = value;
            },
            enumerable: true,
            configurable: true
        });

        return DelayedCall;
    })(skylark.EventDispatcher);
    skylark.DelayedCall = DelayedCall;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Juggler = (function () {
        function Juggler() {
            this._elapsedTime = 0;
            this._objects = [];
        }
        Juggler.prototype.add = function (object) {
            if (object && this._objects.indexOf(object) == -1) {
                this._objects.push(object);

                if (object instanceof skylark.EventDispatcher)
                    (object).addEventListener(skylark.Event.REMOVE_FROM_JUGGLER, this.onRemove, this);
            }
        };

        Juggler.prototype.contains = function (object) {
            return this._objects.indexOf(object) != -1;
        };

        Juggler.prototype.remove = function (object) {
            if (object == null)
                return;

            if (object instanceof skylark.EventDispatcher)
                (object).removeEventListener(skylark.Event.REMOVE_FROM_JUGGLER, this.onRemove, this);

            var index = this._objects.indexOf(object);
            if (index != -1)
                this._objects[index] = null;
        };

        Juggler.prototype.removeTweens = function (target) {
            if (target == null)
                return;

            var objects = this._objects;
            for (var i = objects.length - 1; i >= 0; --i) {
                var tween = objects[i];
                if (tween && tween.target == target) {
                    tween.removeEventListener(skylark.Event.REMOVE_FROM_JUGGLER, this.onRemove, this);
                    objects[i] = null;
                }
            }
        };

        Juggler.prototype.purge = function () {
            var objects = this._objects;

            for (var i = objects.length - 1; i >= 0; --i) {
                var obj = objects[i];
                if (obj && obj instanceof skylark.EventDispatcher) {
                    (obj).removeEventListener(skylark.Event.REMOVE_FROM_JUGGLER, this.onRemove, this);
                }
                objects[i] = null;
            }
        };

        Juggler.prototype.delayCall = function (call, a, b) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 3); _i++) {
                args[_i] = arguments[_i + 3];
            }
            if (call == null)
                return null;

            var thisArg, delay;
            if (typeof a === 'object' || typeof a === 'function') {
                thisArg = a;
                delay = b;
            } else if (typeof a === 'number') {
                delay = a;
                if (b) {
                    if (args != null)
                        args.unshift(b);
else
                        args = [b];
                }
            }
            var delayedCall = new skylark.DelayedCall(call, thisArg, delay, args);
            this.add(delayedCall);
            return delayedCall;
        };

        Juggler.prototype.tween = function (target, time, properties) {
            var tween = skylark.Tween.fromPool(target, time);

            for (var property in properties) {
                var value = properties[property];

                if (typeof tween[property] !== 'undefined')
                    tween[property] = value;
else if (typeof target[property] !== 'undefined')
                    tween.animate(property, value);
else
                    throw new skylark.ArgumentError("Invalid property: " + property);
            }

            tween.addEventListener(skylark.Event.REMOVE_FROM_JUGGLER, this.onPooledTweenComplete);
            this.add(tween);
        };

        Juggler.prototype.onPooledTweenComplete = function (event, data) {
            skylark.Tween.toPool(event.target);
        };

        Juggler.prototype.advanceTime = function (time) {
            var objects = this._objects;
            var numObjects = objects.length;
            var currentIndex = 0;
            var i;

            this._elapsedTime += time;
            if (numObjects == 0)
                return;

            for (i = 0; i < numObjects; ++i) {
                var object = objects[i];
                if (object) {
                    if (currentIndex != i) {
                        objects[currentIndex] = object;
                        objects[i] = null;
                    }

                    object.advanceTime(time);
                    ++currentIndex;
                }
            }

            if (currentIndex != i) {
                numObjects = objects.length;

                while (i < numObjects)
                    objects[currentIndex++] = objects[i++];

                objects.length = currentIndex;
            }
        };

        Juggler.prototype.onRemove = function (event) {
            var target = event.target;
            this.remove(target);

            if (target instanceof skylark.Tween && (target).isComplete)
                this.add((target).nextTween);
        };

        Object.defineProperty(Juggler.prototype, "elapsedTime", {
            get: function () {
                return this._elapsedTime;
            },
            enumerable: true,
            configurable: true
        });
        return Juggler;
    })();
    skylark.Juggler = Juggler;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Transitions = (function () {
        function Transitions() {
            throw new skylark.AbstractClassError();
        }
        Transitions.getTransition = function (name) {
            if (Transitions._transitions == null)
                Transitions.registerDefaults();
            return Transitions._transitions[name];
        };

        Transitions.register = function (name, func) {
            if (Transitions._transitions == null)
                Transitions.registerDefaults();
            Transitions._transitions[name] = func;
        };

        Transitions.registerDefaults = function () {
            Transitions._transitions = {};

            Transitions.register(Transitions.LINEAR, Transitions.linear);
            Transitions.register(Transitions.EASE_IN, Transitions.easeIn);
            Transitions.register(Transitions.EASE_OUT, Transitions.easeOut);
            Transitions.register(Transitions.EASE_IN_OUT, Transitions.easeInOut);
            Transitions.register(Transitions.EASE_OUT_IN, Transitions.easeOutIn);
            Transitions.register(Transitions.EASE_IN_BACK, Transitions.easeInBack);
            Transitions.register(Transitions.EASE_OUT_BACK, Transitions.easeOutBack);
            Transitions.register(Transitions.EASE_IN_OUT_BACK, Transitions.easeInOutBack);
            Transitions.register(Transitions.EASE_OUT_IN_BACK, Transitions.easeOutInBack);
            Transitions.register(Transitions.EASE_IN_ELASTIC, Transitions.easeInElastic);
            Transitions.register(Transitions.EASE_OUT_ELASTIC, Transitions.easeOutElastic);
            Transitions.register(Transitions.EASE_IN_OUT_ELASTIC, Transitions.easeInOutElastic);
            Transitions.register(Transitions.EASE_OUT_IN_ELASTIC, Transitions.easeOutInElastic);
            Transitions.register(Transitions.EASE_IN_BOUNCE, Transitions.easeInBounce);
            Transitions.register(Transitions.EASE_OUT_BOUNCE, Transitions.easeOutBounce);
            Transitions.register(Transitions.EASE_IN_OUT_BOUNCE, Transitions.easeInOutBounce);
            Transitions.register(Transitions.EASE_OUT_IN_BOUNCE, Transitions.easeOutInBounce);
        };

        Transitions.linear = function (ratio) {
            return ratio;
        };

        Transitions.easeIn = function (ratio) {
            return ratio * ratio * ratio;
        };

        Transitions.easeOut = function (ratio) {
            var invRatio = ratio - 1.0;
            return invRatio * invRatio * invRatio + 1;
        };

        Transitions.easeInOut = function (ratio) {
            return Transitions.easeCombined(Transitions.easeIn, Transitions.easeOut, ratio);
        };

        Transitions.easeOutIn = function (ratio) {
            return Transitions.easeCombined(Transitions.easeOut, Transitions.easeIn, ratio);
        };

        Transitions.easeInBack = function (ratio) {
            var s = 1.70158;
            return Math.pow(ratio, 2) * ((s + 1.0) * ratio - s);
        };

        Transitions.easeOutBack = function (ratio) {
            var invRatio = ratio - 1.0;
            var s = 1.70158;
            return Math.pow(invRatio, 2) * ((s + 1.0) * invRatio + s) + 1.0;
        };

        Transitions.easeInOutBack = function (ratio) {
            return Transitions.easeCombined(Transitions.easeInBack, Transitions.easeOutBack, ratio);
        };

        Transitions.easeOutInBack = function (ratio) {
            return Transitions.easeCombined(Transitions.easeOutBack, Transitions.easeInBack, ratio);
        };

        Transitions.easeInElastic = function (ratio) {
            if (ratio == 0 || ratio == 1)
                return ratio;
else {
                var p = 0.3;
                var s = p / 4.0;
                var invRatio = ratio - 1;
                return -1.0 * Math.pow(2.0, 10.0 * invRatio) * Math.sin((invRatio - s) * (2.0 * Math.PI) / p);
            }
        };

        Transitions.easeOutElastic = function (ratio) {
            if (ratio == 0 || ratio == 1)
                return ratio;
else {
                var p = 0.3;
                var s = p / 4.0;
                return Math.pow(2.0, -10.0 * ratio) * Math.sin((ratio - s) * (2.0 * Math.PI) / p) + 1;
            }
        };

        Transitions.easeInOutElastic = function (ratio) {
            return Transitions.easeCombined(Transitions.easeInElastic, Transitions.easeOutElastic, ratio);
        };

        Transitions.easeOutInElastic = function (ratio) {
            return Transitions.easeCombined(Transitions.easeOutElastic, Transitions.easeInElastic, ratio);
        };

        Transitions.easeInBounce = function (ratio) {
            return 1.0 - Transitions.easeOutBounce(1.0 - ratio);
        };

        Transitions.easeOutBounce = function (ratio) {
            var s = 7.5625;
            var p = 2.75;
            var l;
            if (ratio < (1.0 / p)) {
                l = s * Math.pow(ratio, 2);
            } else {
                if (ratio < (2.0 / p)) {
                    ratio -= 1.5 / p;
                    l = s * Math.pow(ratio, 2) + 0.75;
                } else {
                    if (ratio < 2.5 / p) {
                        ratio -= 2.25 / p;
                        l = s * Math.pow(ratio, 2) + 0.9375;
                    } else {
                        ratio -= 2.625 / p;
                        l = s * Math.pow(ratio, 2) + 0.984375;
                    }
                }
            }
            return l;
        };

        Transitions.easeInOutBounce = function (ratio) {
            return Transitions.easeCombined(Transitions.easeInBounce, Transitions.easeOutBounce, ratio);
        };

        Transitions.easeOutInBounce = function (ratio) {
            return Transitions.easeCombined(Transitions.easeOutBounce, Transitions.easeInBounce, ratio);
        };

        Transitions.easeCombined = function (startFunc, endFunc, ratio) {
            if (ratio < 0.5)
                return 0.5 * startFunc(ratio * 2.0);
else
                return 0.5 * endFunc((ratio - 0.5) * 2.0) + 0.5;
        };
        Transitions.LINEAR = "linear";
        Transitions.EASE_IN = "easeIn";
        Transitions.EASE_OUT = "easeOut";
        Transitions.EASE_IN_OUT = "easeInOut";
        Transitions.EASE_OUT_IN = "easeOutIn";
        Transitions.EASE_IN_BACK = "easeInBack";
        Transitions.EASE_OUT_BACK = "easeOutBack";
        Transitions.EASE_IN_OUT_BACK = "easeInOutBack";
        Transitions.EASE_OUT_IN_BACK = "easeOutInBack";
        Transitions.EASE_IN_ELASTIC = "easeInElastic";
        Transitions.EASE_OUT_ELASTIC = "easeOutElastic";
        Transitions.EASE_IN_OUT_ELASTIC = "easeInOutElastic";
        Transitions.EASE_OUT_IN_ELASTIC = "easeOutInElastic";
        Transitions.EASE_IN_BOUNCE = "easeInBounce";
        Transitions.EASE_OUT_BOUNCE = "easeOutBounce";
        Transitions.EASE_IN_OUT_BOUNCE = "easeInOutBounce";
        Transitions.EASE_OUT_IN_BOUNCE = "easeOutInBounce";
        return Transitions;
    })();
    skylark.Transitions = Transitions;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var Tween = (function (_super) {
        __extends(Tween, _super);
        function Tween(target, time, transition) {
            if (typeof transition === "undefined") { transition = "linear"; }
            _super.call(this);
            this.reset(target, time, transition);
        }
        Tween.prototype.reset = function (target, time, transition) {
            if (typeof transition === "undefined") { transition = "linear"; }
            this._target = target;
            this._currentTime = 0;
            this._totalTime = Math.max(0.0001, time);
            this._delay = this._repeatDelay = 0.0;
            this._onStart = this._onUpdate = this._onComplete = null;
            this._onStartArgs = this._onUpdateArgs = this._onCompleteArgs = null;
            this._roundToInt = this._reverse = false;
            this._repeatCount = 1;
            this._currentCycle = -1;

            if (typeof transition === 'string')
                this.transition = transition;
else if (typeof transition === 'function')
                this.transitionFunc = transition;
else
                throw new skylark.ArgumentError("Argument 'transition' must be either a String or a Function");

            if (this._properties)
                this._properties.length = 0;
else
                this._properties = [];
            if (this._startValues)
                this._startValues.length = 0;
else
                this._startValues = [];
            if (this._endValues)
                this._endValues.length = 0;
else
                this._endValues = [];

            return this;
        };

        Tween.prototype.animate = function (property, targetValue) {
            if (this._target == null)
                return;

            this._properties.push(property);
            this._startValues.push(Number.NaN);
            this._endValues.push(targetValue);
        };

        Tween.prototype.scaleTo = function (factor) {
            this.animate("scaleX", factor);
            this.animate("scaleY", factor);
        };

        Tween.prototype.moveTo = function (x, y) {
            this.animate("x", x);
            this.animate("y", y);
        };

        Tween.prototype.fadeTo = function (alpha) {
            this.animate("alpha", alpha);
        };

        Tween.prototype.advanceTime = function (time) {
            if (time == 0 || (this._repeatCount == 1 && this._currentTime == this._totalTime))
                return;

            var i;
            var previousTime = this._currentTime;
            var restTime = this._totalTime - this._currentTime;
            var carryOverTime = time > restTime ? time - restTime : 0.0;

            this._currentTime = Math.min(this._totalTime, this._currentTime + time);

            if (this._currentTime <= 0)
                return;

            if (this._currentCycle < 0 && previousTime <= 0 && this._currentTime > 0) {
                this._currentCycle++;
                if (this._onStart != null)
                    this._onStart.apply(null, this._onStartArgs);
            }

            var ratio = this._currentTime / this._totalTime;
            var reversed = this._reverse && (this._currentCycle % 2 == 1);
            var numProperties = this._startValues.length;

            for (i = 0; i < numProperties; ++i) {
                if (isNaN(this._startValues[i]))
                    this._startValues[i] = this._target[this._properties[i]];

                var startValue = this._startValues[i];
                var endValue = this._endValues[i];
                var delta = endValue - startValue;
                var transitionValue = reversed ? this._transitionFunc(1.0 - ratio) : this._transitionFunc(ratio);

                var currentValue = startValue + transitionValue * delta;
                if (this._roundToInt)
                    currentValue = Math.round(currentValue);
                this._target[this._properties[i]] = currentValue;
            }

            if (this._onUpdate != null)
                this._onUpdate.apply(null, this._onUpdateArgs);

            if (previousTime < this._totalTime && this._currentTime >= this._totalTime) {
                if (this._repeatCount == 0 || this._repeatCount > 1) {
                    this._currentTime = -this._repeatDelay;
                    this._currentCycle++;
                    if (this._repeatCount > 1)
                        this._repeatCount--;
                    if (this._onRepeat != null)
                        this._onRepeat.apply(null, this._onRepeatArgs);
                } else {
                    var onComplete = this._onComplete;
                    var onCompleteArgs = this._onCompleteArgs;

                    this.dispatchEventWith(skylark.Event.REMOVE_FROM_JUGGLER);
                    if (onComplete != null)
                        onComplete.apply(null, onCompleteArgs);
                }
            }

            if (carryOverTime)
                this.advanceTime(carryOverTime);
        };

        Object.defineProperty(Tween.prototype, "isComplete", {
            get: function () {
                return this._currentTime >= this._totalTime && this._repeatCount == 1;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Tween.prototype, "target", {
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Tween.prototype, "transition", {
            get: function () {
                return this._transitionName;
            },
            set: function (value) {
                this._transitionName = value;
                this._transitionFunc = skylark.Transitions.getTransition(value);

                if (this._transitionFunc == null)
                    throw new skylark.ArgumentError("Invalid transiton: " + value);
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "transitionFunc", {
            get: function () {
                return this._transitionFunc;
            },
            set: function (value) {
                this._transitionName = "custom";
                this._transitionFunc = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "totalTime", {
            get: function () {
                return this._totalTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Tween.prototype, "currentTime", {
            get: function () {
                return this._currentTime;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Tween.prototype, "delay", {
            get: function () {
                return this._delay;
            },
            set: function (value) {
                this._currentTime = this._currentTime + this._delay - value;
                this._delay = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "repeatCount", {
            get: function () {
                return this._repeatCount;
            },
            set: function (value) {
                this._repeatCount = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "repeatDelay", {
            get: function () {
                return this._repeatDelay;
            },
            set: function (value) {
                this._repeatDelay = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "reverse", {
            get: function () {
                return this._reverse;
            },
            set: function (value) {
                this._reverse = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "roundToInt", {
            get: function () {
                return this._roundToInt;
            },
            set: function (value) {
                this._roundToInt = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onStart", {
            get: function () {
                return this._onStart;
            },
            set: function (value) {
                this._onStart = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onUpdate", {
            get: function () {
                return this._onUpdate;
            },
            set: function (value) {
                this._onUpdate = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onRepeat", {
            get: function () {
                return this._onRepeat;
            },
            set: function (value) {
                this._onRepeat = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onComplete", {
            get: function () {
                return this._onComplete;
            },
            set: function (value) {
                this._onComplete = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onStartArgs", {
            get: function () {
                return this._onStartArgs;
            },
            set: function (value) {
                this._onStartArgs = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onUpdateArgs", {
            get: function () {
                return this._onUpdateArgs;
            },
            set: function (value) {
                this._onUpdateArgs = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onRepeatArgs", {
            get: function () {
                return this._onRepeatArgs;
            },
            set: function (value) {
                this._onRepeatArgs = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "onCompleteArgs", {
            get: function () {
                return this._onCompleteArgs;
            },
            set: function (value) {
                this._onCompleteArgs = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Tween.prototype, "nextTween", {
            get: function () {
                return this._nextTween;
            },
            set: function (value) {
                this._nextTween = value;
            },
            enumerable: true,
            configurable: true
        });


        Tween.fromPool = function (target, time, transition) {
            if (typeof transition === "undefined") { transition = "linear"; }
            if (Tween._tweenPool.length)
                return Tween._tweenPool.pop().reset(target, time, transition);
else
                return new Tween(target, time, transition);
        };

        Tween.toPool = function (tween) {
            tween._onStart = tween._onUpdate = tween._onRepeat = tween._onComplete = null;
            tween._onStartArgs = tween._onUpdateArgs = tween._onRepeatArgs = tween._onCompleteArgs = null;
            tween._target = null;
            tween._transitionFunc = null;
            tween.removeEventListeners();
            Tween._tweenPool.push(tween);
        };
        Tween._tweenPool = [];
        return Tween;
    })(skylark.EventDispatcher);
    skylark.Tween = Tween;
})(skylark || (skylark = {}));
(function (m) {
    m['ErrorImpl'] = Error;
})(skylark);
var skylark;
(function (skylark) {
    var DefaultError = (function (_super) {
        __extends(DefaultError, _super);
        function DefaultError(msg) {
            _super.call(this, msg);

            if (this.name == null)
                this.name = 'DefaultError';
            this.message = msg;
            this.stack = (new Error('[' + this.name + '] ' + msg))['stack'];
        }
        return DefaultError;
    })(skylark.ErrorImpl);
    skylark.DefaultError = DefaultError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var AbstractClassError = (function (_super) {
        __extends(AbstractClassError, _super);
        function AbstractClassError(msg) {
            if (typeof msg === "undefined") { msg = null; }
            _super.call(this, msg);
        }
        return AbstractClassError;
    })(skylark.DefaultError);
    skylark.AbstractClassError = AbstractClassError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var AbstractMethodError = (function (_super) {
        __extends(AbstractMethodError, _super);
        function AbstractMethodError(msg) {
            _super.call(this, msg || 'ABSTRACT METHOD ERROR: Method must be implemented in a sub-class.');
        }
        return AbstractMethodError;
    })(skylark.DefaultError);
    skylark.AbstractMethodError = AbstractMethodError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var ArgumentError = (function (_super) {
        __extends(ArgumentError, _super);
        function ArgumentError(msg) {
            this.name = 'ArgumentError';
            _super.call(this, msg);
        }
        return ArgumentError;
    })(skylark.DefaultError);
    skylark.ArgumentError = ArgumentError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var IllegalOperationError = (function (_super) {
        __extends(IllegalOperationError, _super);
        function IllegalOperationError(msg) {
            _super.call(this, msg);
        }
        return IllegalOperationError;
    })(skylark.DefaultError);
    skylark.IllegalOperationError = IllegalOperationError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var IllegalSystemStateError = (function (_super) {
        __extends(IllegalSystemStateError, _super);
        function IllegalSystemStateError(msg) {
            _super.call(this, msg);
        }
        return IllegalSystemStateError;
    })(skylark.DefaultError);
    skylark.IllegalSystemStateError = IllegalSystemStateError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var MissingContextError = (function (_super) {
        __extends(MissingContextError, _super);
        function MissingContextError(msg) {
            if (typeof msg === "undefined") { msg = null; }
            _super.call(this, msg);
        }
        return MissingContextError;
    })(skylark.DefaultError);
    skylark.MissingContextError = MissingContextError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var InvalidXmlError = (function (_super) {
        __extends(InvalidXmlError, _super);
        function InvalidXmlError(msg, xml, errors) {
            if (typeof msg === "undefined") { msg = null; }
            if (typeof xml === "undefined") { xml = null; }
            if (typeof errors === "undefined") { errors = null; }
            _super.call(this, msg);
            this.name = 'InvalidXmlError';
            this._xml = xml;
            this._parserErrors = errors;
        }
        InvalidXmlError.prototype.toString = function () {
            return this.message + ' | ' + this._parserErrors[0].textContent;
        };
        return InvalidXmlError;
    })(skylark.DefaultError);
    skylark.InvalidXmlError = InvalidXmlError;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var _Bitmap = skylark.Bitmap;

    var Texture = (function () {
        function Texture() {
            this._repeat = false;
        }
        Texture.prototype.dispose = function () {
        };

        Texture.createBitmap = function (width, height, color) {
            var rows = [];

            var pixel = [
                skylark.Color.getRed(color),
                skylark.Color.getGreen(color),
                skylark.Color.getBlue(color)
            ];

            var row = [];
            for (var j = 0; j < width; j++)
                row.push(pixel);

            for (var i = 0; i < height; i++)
                rows.push(row);

            var image = new NativeImage();
            image.src = _Bitmap.create(rows, 1.0);
            return image;
        };

        Texture.empty = function (width, height, premultipliedAlpha, mipMapping, optimizeForRenderToTexture, scale) {
            if (typeof premultipliedAlpha === "undefined") { premultipliedAlpha = true; }
            if (typeof mipMapping === "undefined") { mipMapping = true; }
            if (typeof optimizeForRenderToTexture === "undefined") { optimizeForRenderToTexture = false; }
            if (typeof scale === "undefined") { scale = -1; }
            if (scale <= 0)
                scale = skylark.Skylark.contentScaleFactor;

            var origWidth = width * scale;
            var origHeight = height * scale;
            var potWidth = skylark.MathUtil.getNextPowerOfTwo(origWidth);
            var potHeight = skylark.MathUtil.getNextPowerOfTwo(origHeight);
            var isPot = (origWidth == potWidth && origHeight == potHeight);

            var image = Texture.createBitmap(potWidth, potHeight, 0xFFFFFF);
            var concreteTexture = new skylark.ConcreteTexture(image);

            return new skylark.SubTexture(concreteTexture, new skylark.Rectangle(0, 0, width, height), true);
        };

        Texture.fromTexture = function (texture, region, frame) {
            if (typeof region === "undefined") { region = null; }
            if (typeof frame === "undefined") { frame = null; }
            var subTexture = new skylark.SubTexture(texture, region);
            subTexture._frame = frame;
            return subTexture;
        };

        Texture.fromCanvas = function (canvas, generateMipMaps, scale) {
            if (typeof generateMipMaps === "undefined") { generateMipMaps = true; }
            if (typeof scale === "undefined") { scale = 1; }
            var image = new NativeImage();
            image.src = canvas.toDataURL();
            return new skylark.ConcreteTexture(image, scale);
        };

        Texture.fromColor = function (width, height, color, optimizeForRenderToTexture, scale) {
            if (typeof color === "undefined") { color = 0xffffffff; }
            if (typeof optimizeForRenderToTexture === "undefined") { optimizeForRenderToTexture = false; }
            if (typeof scale === "undefined") { scale = -1; }
            if (scale <= 0)
                scale = skylark.Skylark.contentScaleFactor;

            var bitmapData = new skylark.BitmapData(width * scale, height * scale, true, color);
            var texture = Texture.fromBitmapData(bitmapData, false, optimizeForRenderToTexture, scale);

            return texture;
        };

        Texture.fromEmbedded = function (base64String) {
            var image = new NativeImage();
            image.src = base64String;
            return new skylark.ConcreteTexture(image);
        };

        Texture.fromBitmapData = function (data, generateMipMaps, optimizeForRenderToTexture, scale) {
            if (typeof generateMipMaps === "undefined") { generateMipMaps = true; }
            if (typeof optimizeForRenderToTexture === "undefined") { optimizeForRenderToTexture = false; }
            if (typeof scale === "undefined") { scale = 1; }
            var origWidth = data.width;
            var origHeight = data.height;
            var legalWidth = skylark.MathUtil.getNextPowerOfTwo(origWidth);
            var legalHeight = skylark.MathUtil.getNextPowerOfTwo(origHeight);

            var canvas = skylark.Skylark.getHelperCanvas(legalWidth, legalHeight);
            var context = canvas.getContext('2d');

            var image = new NativeImage();
            image.src = data.asUrl();
            var concreteTexture = new skylark.ConcreteTexture(image);

            if (origWidth == legalWidth && origHeight == legalHeight)
                return concreteTexture;
else
                return new skylark.SubTexture(concreteTexture, new skylark.Rectangle(0, 0, origWidth / scale, origHeight / scale), true);
        };

        Texture.prototype.adjustVertexData = function (vertexData, vertexID, count) {
            var frame = this._frame;
            if (frame) {
                if (count != 4)
                    throw new skylark.ArgumentError("Textures with a frame can only be used on quads");

                var deltaRight = frame.width + frame.x - this.width;
                var deltaBottom = frame.height + frame.y - this.height;

                vertexData.translateVertex(vertexID, -frame.x, -frame.y);
                vertexData.translateVertex(vertexID + 1, -deltaRight, -frame.y);
                vertexData.translateVertex(vertexID + 2, -frame.x, -deltaBottom);
                vertexData.translateVertex(vertexID + 3, -deltaRight, -deltaBottom);
            }
        };

        Object.defineProperty(Texture.prototype, "frame", {
            get: function () {
                return this._frame ? this._frame.clone() : new skylark.Rectangle(0, 0, this.width, this.height);
            },
            enumerable: true,
            configurable: true
        });

        Texture.prototype.hasFrame = function () {
            return this._frame !== null;
        };

        Object.defineProperty(Texture.prototype, "repeat", {
            get: function () {
                return this._repeat;
            },
            set: function (value) {
                this._repeat = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Texture.prototype, "width", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "height", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "nativeWidth", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "nativeHeight", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "scale", {
            get: function () {
                return 1.0;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "base", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "root", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Texture.prototype, "premultipliedAlpha", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Texture._origin = new skylark.Point();
        return Texture;
    })();
    skylark.Texture = Texture;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var ConcreteTexture = (function (_super) {
        __extends(ConcreteTexture, _super);
        function ConcreteTexture(a, b, c) {
            _super.call(this);
            var scale = 1;
            var base;

            if (typeof a === 'object') {
                if (skylark.ClassUtil.isCanvasImageSource(a)) {
                    base = new skylark.DefaultImageSource(a);
                } else {
                    base = a;
                }

                scale = b != null ? b : scale;

                this._width = base.width;
                this._height = base.height;
            } else {
                scale = c != null ? c : scale;
                this._width = a;
                this._height = b;
                skylark.Arguments.number(a, b, scale);
            }

            this._base = base;
            this._scale = scale <= 0 ? 1.0 : scale;
        }
        ConcreteTexture.prototype.dispose = function () {
            if (this._base)
                this._base.dispose();
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(ConcreteTexture.prototype, "base", {
            get: function () {
                return this._base;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "root", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "width", {
            get: function () {
                return this._width / this._scale;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "height", {
            get: function () {
                return this._height / this._scale;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "nativeWidth", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "nativeHeight", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "mipMapping", {
            get: function () {
                return this._mipMapping;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ConcreteTexture.prototype, "premultipliedAlpha", {
            get: function () {
                return this._premultipliedAlpha;
            },
            enumerable: true,
            configurable: true
        });

        ConcreteTexture.prototype.clear = function (color, alpha) {
            if (typeof color === "undefined") { color = 0x0; }
            if (typeof alpha === "undefined") { alpha = 0.0; }
            var canvas = skylark.Skylark.getHelperCanvas(this.width, this.height);
            var context = canvas.getContext('2d');

            var Color = Color;
            if (this._premultipliedAlpha && alpha < 1.0)
                color = Color.rgb(Color.getRed(color) * alpha, Color.getGreen(color) * alpha, Color.getBlue(color) * alpha);

            var base = this._base;

            skylark.RenderSupport.clear(context, color, alpha);
        };

        ConcreteTexture.prototype.render = function (support, context) {
            context.drawImage(this.base.image, 0, 0);
        };
        return ConcreteTexture;
    })(skylark.Texture);
    skylark.ConcreteTexture = ConcreteTexture;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var SubTexture = (function (_super) {
        __extends(SubTexture, _super);
        function SubTexture(parentTexture, region, ownsParent) {
            if (typeof ownsParent === "undefined") { ownsParent = false; }
            _super.call(this);
            this._parent = parentTexture;
            this._ownsParent = ownsParent;

            if (region == null)
                this.setClipping(new skylark.Rectangle(0, 0, 1, 1));
else
                this.setClipping(new skylark.Rectangle(region.x / parentTexture.width, region.y / parentTexture.height, region.width / parentTexture.width, region.height / parentTexture.height));
        }
        SubTexture.prototype.dispose = function () {
            if (this._ownsParent)
                this._parent.dispose();
            _super.prototype.dispose.call(this);
        };

        SubTexture.prototype.setClipping = function (value) {
            this._clipping = value;
            this._rootClipping = value.clone();

            var parentTexture = this._parent;

            while (parentTexture && parentTexture instanceof SubTexture) {
                var parentClipping = parentTexture._clipping;
                this._rootClipping.x = parentClipping.x + this._rootClipping.x * parentClipping.width;
                this._rootClipping.y = parentClipping.y + this._rootClipping.y * parentClipping.height;
                this._rootClipping.width *= parentClipping.width;
                this._rootClipping.height *= parentClipping.height;
                parentTexture = parentTexture._parent;
            }
        };

        SubTexture.prototype.adjustVertexData = function (vertexData, vertexID, count) {
            _super.prototype.adjustVertexData.call(this, vertexData, vertexID, count);

            var _rootClipping = this._rootClipping;
            var clipX = _rootClipping.x;
            var clipY = _rootClipping.y;
            var clipWidth = _rootClipping.width;
            var clipHeight = _rootClipping.height;
            var endIndex = vertexID + count;

            for (var i = vertexID; i < endIndex; ++i) {
                vertexData.getTexCoords(i, SubTexture._texCoords);
                vertexData.setTexCoords(i, clipX + SubTexture._texCoords.x * clipWidth, clipY + SubTexture._texCoords.y * clipHeight);
            }
        };

        Object.defineProperty(SubTexture.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "ownsParent", {
            get: function () {
                return this._ownsParent;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "clipping", {
            get: function () {
                return this._clipping.clone();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "base", {
            get: function () {
                return this._parent.base;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "root", {
            get: function () {
                return this._parent.root;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "width", {
            get: function () {
                return this._parent.width * this._clipping.width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "height", {
            get: function () {
                return this._parent.height * this._clipping.height;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "nativeWidth", {
            get: function () {
                return this._parent.nativeWidth * this._clipping.width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "nativeHeight", {
            get: function () {
                return this._parent.nativeHeight * this._clipping.height;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "premultipliedAlpha", {
            get: function () {
                return this._parent.premultipliedAlpha;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SubTexture.prototype, "scale", {
            get: function () {
                return this._parent.scale;
            },
            enumerable: true,
            configurable: true
        });
        SubTexture._texCoords = new skylark.Point();
        return SubTexture;
    })(skylark.Texture);
    skylark.SubTexture = SubTexture;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TextureSmoothing = (function () {
        function TextureSmoothing() {
            throw new skylark.AbstractClassError();
        }
        TextureSmoothing.isValid = function (smoothing) {
            return smoothing == TextureSmoothing.NONE || smoothing == TextureSmoothing.BILINEAR || smoothing == TextureSmoothing.TRILINEAR;
        };
        TextureSmoothing.NONE = "none";

        TextureSmoothing.BILINEAR = "bilinear";

        TextureSmoothing.TRILINEAR = "trilinear";
        return TextureSmoothing;
    })();
    skylark.TextureSmoothing = TextureSmoothing;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TextureAtlas = (function () {
        function TextureAtlas(texture, atlasXml) {
            if (typeof atlasXml === "undefined") { atlasXml = null; }
            this._names = [];
            this._textureRegions = {};
            this._textureFrames = {};
            this._atlasTexture = texture;

            if (typeof atlasXml === 'string')
                atlasXml = (skylark.StringUtil).parseXml(atlasXml);

            if (atlasXml != null)
                this.parseAtlasXml(atlasXml);
        }
        TextureAtlas.prototype.dispose = function () {
            this._atlasTexture.dispose();
        };

        TextureAtlas.prototype.parseAtlasXml = function (xml) {
            var scale = this._atlasTexture.scale;

            function getFirstChild(node, tagName) {
                var children = node.childNodes;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (child.nodeName === tagName)
                        return child;
                }
            }

            var textures = xml.getElementsByTagName('SubTexture');
            for (var i = 0; i < textures.length; i++) {
                var subTexture = textures[i];

                var name = subTexture.getAttribute("name");
                var x = parseFloat(subTexture.getAttribute("x")) / scale;
                var y = parseFloat(subTexture.getAttribute("y")) / scale;
                var width = parseFloat(subTexture.getAttribute("width")) / scale;
                var height = parseFloat(subTexture.getAttribute("height")) / scale;
                var frameX = parseFloat(subTexture.getAttribute("frameX")) / scale;
                var frameY = parseFloat(subTexture.getAttribute("frameY")) / scale;
                var frameWidth = parseFloat(subTexture.getAttribute("frameWidth")) / scale;
                var frameHeight = parseFloat(subTexture.getAttribute("frameHeight")) / scale;

                var region = new skylark.Rectangle(x, y, width, height);
                var frame = frameWidth > 0 && frameHeight > 0 ? new skylark.Rectangle(frameX, frameY, frameWidth, frameHeight) : null;

                this.addRegion(name, region, frame);
            }
        };

        TextureAtlas.prototype.getTexture = function (name) {
            var region = this._textureRegions[name];

            if (region == null)
                return null;
else
                return (skylark.Texture).fromTexture(this._atlasTexture, region, this._textureFrames[name]);
        };

        TextureAtlas.prototype.getTextures = function (prefix, result) {
            if (typeof prefix === "undefined") { prefix = ""; }
            if (typeof result === "undefined") { result = null; }
            if (result == null)
                result = [];

            var names = this.getNames(prefix, this._names);
            for (var i = 0; i < names.length; i++)
                result.push(this.getTexture(names[i]));

            this._names.length = 0;
            return result;
        };

        TextureAtlas.prototype.getNames = function (prefix, result) {
            if (typeof prefix === "undefined") { prefix = ""; }
            if (typeof result === "undefined") { result = null; }
            if (result == null)
                result = [];

            for (var name in this._textureRegions)
                if (name.indexOf(prefix) === 0)
                    result.push(name);

            (skylark.StringUtil).sortArray(result);

            return result;
        };

        TextureAtlas.prototype.getRegion = function (name) {
            return this._textureRegions[name];
        };

        TextureAtlas.prototype.getFrame = function (name) {
            return this._textureFrames[name];
        };

        TextureAtlas.prototype.addRegion = function (name, region, frame) {
            if (typeof frame === "undefined") { frame = null; }
            this._textureRegions[name] = region;
            this._textureFrames[name] = frame;
        };

        TextureAtlas.prototype.removeRegion = function (name) {
            delete this._textureRegions[name];
            delete this._textureFrames[name];
        };
        return TextureAtlas;
    })();
    skylark.TextureAtlas = TextureAtlas;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TextFieldAutoSize = (function () {
        function TextFieldAutoSize() {
            throw new skylark.AbstractClassError();
        }
        TextFieldAutoSize.NONE = "none";

        TextFieldAutoSize.HORIZONTAL = "horizontal";

        TextFieldAutoSize.VERTICAL = "vertical";

        TextFieldAutoSize.BOTH_DIRECTIONS = "bothDirections";
        return TextFieldAutoSize;
    })();
    skylark.TextFieldAutoSize = TextFieldAutoSize;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var TextField = (function (_super) {
        __extends(TextField, _super);
        function TextField(width, height, txt, fontName, fontSize, color, bold) {
            if (typeof fontName === "undefined") { fontName = "Verdana"; }
            if (typeof fontSize === "undefined") { fontSize = 12; }
            if (typeof color === "undefined") { color = 0x0; }
            if (typeof bold === "undefined") { bold = false; }
            _super.call(this);
            this._text = txt ? txt : "";
            this._fontSize = fontSize;
            this._color = color;
            this.mHAlign = skylark.HAlign.CENTER;
            this.mVAlign = skylark.VAlign.CENTER;
            this._border = null;
            this._kerning = true;
            this._bold = bold;
            this._autoSize = skylark.TextFieldAutoSize.NONE;
            this.fontName = fontName;

            this._hitArea = new skylark.Quad(width, height);
            this._hitArea.alpha = 0.0;
            this.addChild(this._hitArea);

            this.addEventListener(skylark.Event.FLATTEN, this.onFlatten, this);
        }
        TextField.prototype.dispose = function () {
            this.removeEventListener(skylark.Event.FLATTEN, this.onFlatten, this);
            if (this._image)
                this._image.texture.dispose();
            if (this._quadBatch)
                this._quadBatch.dispose();
            _super.prototype.dispose.call(this);
        };

        TextField.prototype.onFlatten = function () {
            if (this._requiresRedraw)
                this.redraw();
        };

        TextField.prototype.render = function (support) {
            if (this._requiresRedraw)
                this.redraw();
            _super.prototype.render.call(this, support);
        };

        TextField.prototype.redraw = function () {
            if (this._requiresRedraw) {
                if (this._isRenderedText)
                    this.createRenderedContents();
else
                    this.createComposedContents();

                this.updateBorder();
                this._requiresRedraw = false;
            }
        };

        TextField.prototype.createRenderedContents = function () {
            if (this._quadBatch) {
                this._quadBatch.removeFromParent(true);
                this._quadBatch = null;
            }

            if (this._textBounds == null)
                this._textBounds = new skylark.Rectangle();

            var scale = skylark.Skylark.contentScaleFactor;
            var width = this._hitArea.width * scale;
            var height = this._hitArea.height * scale;

            var imageSource = this.renderText(scale, this._textBounds);

            var texture = new skylark.ConcreteTexture(imageSource, scale);

            if (this._image == null) {
                this._image = new skylark.Image(texture);
                this._image.touchable = false;
                this.addChild(this._image);
            } else {
                this._image.texture.dispose();
                this._image.texture = texture;
                this._image.readjustSize();
            }
        };

        TextField.prototype.renderText = function (scale, resultTextBounds) {
            var _this = this;
            var width = this._hitArea.width * scale;
            var height = this._hitArea.height * scale;
            var hAlign = this.mHAlign;
            var vAlign = this.mVAlign;

            var canvas = skylark.Skylark.getHelperCanvas(width, height);
            var context = canvas.getContext('2d');

            var fontStr = (function () {
                var str = [];
                if (_this._bold)
                    str.push('bold');
                if (_this._italic)
                    str.push('italic');
                str.push(_this._fontSize * scale + 'px');
                str.push(_this._fontName);
                return str.join(' ');
            })();

            context.textAlign = hAlign;

            context.textBaseline = 'top';

            context.font = fontStr;
            context.fillStyle = skylark.Color.toHexString(this._color);

            var textHeight;
            var textWidth;
            var xOffset = 0;
            var yOffset = 0;

            var clipped = false;

            var fontSize = this._fontSize;

            var lineHeight = fontSize * 1.3;

            textWidth = context.measureText(this._text).width;

            if (textWidth > width) {
                var lines = [];
                var text = this._text.split(/\s/g);

                textWidth = 0;
                textHeight = 0;

                var championWidth = -1;
                var candidateWidth;
                var lineWidth;

                var idx = 0;
                var champion = '';
                var candidate;
                var word;

                do {
                    candidate = champion;
                    for (; idx < length; idx++) {
                        candidate += (candidate.length ? ' ' : '') + text[idx];
                        if (text[idx].length > 0)
                            break;
                    }
                    candidateWidth = context.measureText(candidate).width;

                    if (candidateWidth > width) {
                        if (championWidth === -1) {
                            lines.push(candidate);
                            lineWidth = candidateWidth;
                            idx++;
                        } else {
                            lines.push(champion);
                            lineWidth = championWidth;
                        }
                        textHeight += lineHeight;
                        champion = '';
                        championWidth = -1;

                        if (textHeight + fontSize > height)
                            break;
                    } else if (idx === length - 1) {
                        lines.push(candidate);
                        lineWidth = candidateWidth;
                        textHeight += lineHeight;
                        idx++;
                    } else {
                        champion = candidate;
                        championWidth = candidateWidth;
                        idx++;
                    }

                    if (lineWidth > textWidth)
                        textWidth = lineWidth;
                } while(idx < length);

                textHeight -= (lineHeight - fontSize);

                clipped = idx < length;

                var x;
                var y;

                if (hAlign === skylark.HAlign.CENTER)
                    x = width / 2;
else if (hAlign === skylark.HAlign.RIGHT)
                    x = width;
else
                    x = 0;

                if (vAlign === skylark.VAlign.TOP)
                    y = 0;
else if (vAlign === skylark.VAlign.CENTER)
                    y = (height - textHeight) / 2;
else if (vAlign === skylark.VAlign.BOTTOM)
                    y = height - (lines.length * lineHeight);

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    context.fillText(line, x, y);
                    y += lineHeight;
                }
            } else {
                textHeight = lineHeight;

                var x;
                var y;

                context.textAlign = hAlign;
                context.textBaseline = vAlign;

                if (hAlign === skylark.HAlign.CENTER)
                    x = width / 2;
else if (hAlign === skylark.HAlign.RIGHT)
                    x = width;
else
                    x = 0;

                if (vAlign === skylark.VAlign.TOP)
                    y = 0;
else if (vAlign === skylark.VAlign.CENTER)
                    y = height / 2;
else if (vAlign === skylark.VAlign.BOTTOM)
                    y = height;

                context.fillText(this._text, x, y);
            }

            resultTextBounds.setTo(xOffset / scale, yOffset / scale, textWidth / scale, textHeight / scale);

            var image = new NativeImage();
            image.src = canvas.toDataURL();

            return image;
        };

        TextField.prototype.createComposedContents = function () {
            if (this._image) {
                this._image.removeFromParent(true);
                this._image = null;
            }

            var bitmapFont = TextField.bitmapFonts[this._fontName];
            if (bitmapFont == null)
                throw new Error("Bitmap font not registered: " + this._fontName);

            var width = this._hitArea.width;
            var height = this._hitArea.height;
            var hAlign = this.mHAlign;
            var vAlign = this.mVAlign;

            if (this.isHorizontalAutoSize) {
                width = Number.MAX_VALUE;
                hAlign = skylark.HAlign.LEFT;
            }
            if (this.isVerticalAutoSize) {
                height = Number.MAX_VALUE;
                vAlign = skylark.VAlign.TOP;
            }

            if (this._quadBatch == null) {
                this._quadBatch = bitmapFont.createSprite(width, height, this._text, this._fontSize, this._color, hAlign, vAlign, this._autoScale, this._kerning);

                this._quadBatch.touchable = false;
                this.addChild(this._quadBatch);
            }

            if (this._autoSize != skylark.TextFieldAutoSize.NONE) {
                this._textBounds = this._quadBatch.getBounds(this._quadBatch, this._textBounds);

                if (this.isHorizontalAutoSize)
                    this._hitArea.width = this._textBounds.x + this._textBounds.width;
                if (this.isVerticalAutoSize)
                    this._hitArea.height = this._textBounds.y + this._textBounds.height;
            } else {
                this._textBounds = null;
            }
        };

        TextField.prototype.updateBorder = function () {
            if (this._border == null)
                return;

            var width = this._hitArea.width;
            var height = this._hitArea.height;

            var topLine = this._border.getChildAt(0);
            var rightLine = this._border.getChildAt(1);
            var bottomLine = this._border.getChildAt(2);
            var leftLine = this._border.getChildAt(3);

            topLine.width = width;
            topLine.height = 1;
            bottomLine.width = width;
            bottomLine.height = 1;
            leftLine.width = 1;
            leftLine.height = height;
            rightLine.width = 1;
            rightLine.height = height;
            rightLine.x = width - 1;
            bottomLine.y = height - 1;
            topLine.color = rightLine.color = bottomLine.color = leftLine.color = this._color;
        };

        Object.defineProperty(TextField.prototype, "isHorizontalAutoSize", {
            get: function () {
                return this._autoSize == skylark.TextFieldAutoSize.HORIZONTAL || this._autoSize == skylark.TextFieldAutoSize.BOTH_DIRECTIONS;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextField.prototype, "isVerticalAutoSize", {
            get: function () {
                return this._autoSize == skylark.TextFieldAutoSize.VERTICAL || this._autoSize == skylark.TextFieldAutoSize.BOTH_DIRECTIONS;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextField.prototype, "textBounds", {
            get: function () {
                if (this._requiresRedraw)
                    this.redraw();
                if (this._textBounds == null)
                    this._textBounds = this._quadBatch.getBounds(this._quadBatch);
                return this._textBounds.clone();
            },
            enumerable: true,
            configurable: true
        });

        TextField.prototype.getBounds = function (targetSpace, resultRect) {
            if (typeof resultRect === "undefined") { resultRect = null; }
            if (this._requiresRedraw)
                this.redraw();
            return this._hitArea.getBounds(targetSpace, resultRect);
        };

        Object.defineProperty(TextField.prototype, "width", {
            set: function (value) {
                this._hitArea.width = value;
                this._requiresRedraw = true;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextField.prototype, "height", {
            set: function (value) {
                this._hitArea.height = value;
                this._requiresRedraw = true;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextField.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (value) {
                if (value == null)
                    value = "";
                if (this._text != value) {
                    this._text = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "fontName", {
            get: function () {
                return this._fontName;
            },
            set: function (value) {
                if (this._fontName != value) {
                    if (value == skylark.BitmapFont.MINI && TextField.bitmapFonts[value] == null)
                        TextField.registerBitmapFont(new skylark.MiniBitmapFont());

                    this._fontName = value;
                    this._requiresRedraw = true;
                    this._isRenderedText = TextField.bitmapFonts[value] == undefined;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "fontSize", {
            get: function () {
                return this._fontSize;
            },
            set: function (value) {
                if (this._fontSize != value) {
                    this._fontSize = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (value) {
                if (this._color != value) {
                    this._color = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "hAlign", {
            get: function () {
                return this.mHAlign;
            },
            set: function (value) {
                if (!skylark.HAlign.isValid(value))
                    throw new skylark.ArgumentError("Invalid horizontal align: " + value);

                if (this.mHAlign != value) {
                    this.mHAlign = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "vAlign", {
            get: function () {
                return this.mVAlign;
            },
            set: function (value) {
                if (!skylark.VAlign.isValid(value))
                    throw new skylark.ArgumentError("Invalid vertical align: " + value);

                if (this.mVAlign != value) {
                    this.mVAlign = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "border", {
            get: function () {
                return this._border != null;
            },
            set: function (value) {
                if (value && this._border == null) {
                    this._border = new skylark.Sprite();
                    this.addChild(this._border);

                    for (var i = 0; i < 4; ++i)
                        this._border.addChild(new skylark.Quad(1.0, 1.0));

                    this.updateBorder();
                } else if (!value && this._border != null) {
                    this._border.removeFromParent(true);
                    this._border = null;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "bold", {
            get: function () {
                return this._bold;
            },
            set: function (value) {
                if (this._bold != value) {
                    this._bold = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "italic", {
            get: function () {
                return this._italic;
            },
            set: function (value) {
                if (this._italic != value) {
                    this._italic = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "underline", {
            get: function () {
                return this._underline;
            },
            set: function (value) {
                if (this._underline != value) {
                    this._underline = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "kerning", {
            get: function () {
                return this._kerning;
            },
            set: function (value) {
                if (this._kerning != value) {
                    this._kerning = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "autoScale", {
            get: function () {
                return this._autoScale;
            },
            set: function (value) {
                if (this._autoScale != value) {
                    this._autoScale = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "autoSize", {
            get: function () {
                return this._autoSize;
            },
            set: function (value) {
                if (this._autoSize != value) {
                    this._autoSize = value;
                    this._requiresRedraw = true;
                }
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "batchable", {
            get: function () {
                return this._batchable;
            },
            set: function (value) {
                this._batchable = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TextField.prototype, "nativeFilters", {
            get: function () {
                return this._nativeFilters;
            },
            set: function (value) {
                if (!this._isRenderedText)
                    throw (new Error("The TextField.nativeFilters property cannot be used on Bitmap fonts."));

                this._nativeFilters = value.concat();
                this._requiresRedraw = true;
            },
            enumerable: true,
            configurable: true
        });


        TextField.registerBitmapFont = function (bitmapFont, name) {
            if (typeof name === "undefined") { name = null; }
            if (name == null)
                name = bitmapFont.name;
            TextField.bitmapFonts[name] = bitmapFont;
            return name;
        };

        TextField.unregisterBitmapFont = function (name, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            if (dispose && TextField.bitmapFonts[name] != undefined)
                TextField.bitmapFonts[name].dispose();

            delete TextField.bitmapFonts[name];
        };

        TextField.getBitmapFont = function (name) {
            return TextField.bitmapFonts[name];
        };

        Object.defineProperty(TextField, "bitmapFonts", {
            get: function () {
                var fonts = TextField._fonts;

                if (fonts == null) {
                    fonts = TextField._fonts = {};
                }

                return fonts;
            },
            enumerable: true,
            configurable: true
        });
        TextField.BITMAP_FONT_DATA_NAME = "skylark.TextField.BitmapFonts";
        return TextField;
    })(skylark.DisplayObjectContainer);
    skylark.TextField = TextField;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var BitmapChar = (function () {
        function BitmapChar(id, texture, xOffset, yOffset, xAdvance) {
            this._charID = id;
            this._texture = texture;
            this.mXOffset = xOffset;
            this.mYOffset = yOffset;
            this.mXAdvance = xAdvance;
            this._kernings = null;
        }
        BitmapChar.prototype.addKerning = function (charID, amount) {
            if (this._kernings == null)
                this._kernings = [];

            this._kernings[charID] = amount;
        };

        BitmapChar.prototype.getKerning = function (charID) {
            if (this._kernings == null || this._kernings[charID] == undefined)
                return 0.0;
else
                return this._kernings[charID];
        };

        BitmapChar.prototype.createImage = function () {
            return new skylark.Image(this._texture);
        };

        Object.defineProperty(BitmapChar.prototype, "charID", {
            get: function () {
                return this._charID;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapChar.prototype, "xOffset", {
            get: function () {
                return this.mXOffset;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapChar.prototype, "yOffset", {
            get: function () {
                return this.mYOffset;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapChar.prototype, "xAdvance", {
            get: function () {
                return this.mXAdvance;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapChar.prototype, "texture", {
            get: function () {
                return this._texture;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapChar.prototype, "width", {
            get: function () {
                return this._texture.width;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapChar.prototype, "height", {
            get: function () {
                return this._texture.height;
            },
            enumerable: true,
            configurable: true
        });
        return BitmapChar;
    })();
    skylark.BitmapChar = BitmapChar;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var BitmapFont = (function () {
        function BitmapFont(texture, fontXml) {
            if (typeof texture === "undefined") { texture = null; }
            if (typeof fontXml === "undefined") { fontXml = null; }
            if (texture == null && fontXml == null) {
                texture = skylark.MiniBitmapFont.texture;
                fontXml = skylark.MiniBitmapFont.xml;
            }

            this._name = "unknown";
            this._lineHeight = this._size = this._baseline = 14;
            this._texture = texture;
            this._chars = {};
            this._helperImage = new skylark.Image(texture);
            this._charLocationPool = [];

            if (fontXml)
                this.parseFontXml(fontXml);
        }
        BitmapFont.prototype.dispose = function () {
            if (this._texture)
                this._texture.dispose();
        };

        BitmapFont.prototype.parseFontXml = function (a) {
            var fontXmlData;
            var fontXml;
            if (typeof a === 'string')
                fontXmlData = skylark.StringUtil.parseXml(a);
else
                fontXmlData = a;
            fontXmlData = skylark.StringUtil.xmlToJson(fontXmlData, false);

            fontXml = fontXmlData.font;

            var scale = this._texture.scale;
            var frame = this._texture.frame;

            this._name = fontXml.info.attribute("face");
            this._size = parseFloat(fontXml.info.attribute("size")) / scale;
            this._lineHeight = parseFloat(fontXml.common.attribute("lineHeight")) / scale;
            this._baseline = parseFloat(fontXml.common.attribute("base")) / scale;

            if (fontXml.info.attribute("smooth").toString() == "0")
                this.smoothing = skylark.TextureSmoothing.NONE;

            if (this._size <= 0) {
                console.log("[Skylark] Warning: invalid font size in '" + this._name + "' font.");
                this._size = (this._size == 0.0 ? 16.0 : this._size * -1.0);
            }

            var chars = fontXml.chars.char;
            for (var i = 0; i < chars.length; i++) {
                var charElement = chars[i];
                var id = parseInt(charElement.attribute("id"));
                var xOffset = parseFloat(charElement.attribute("xoffset")) / scale;
                var yOffset = parseFloat(charElement.attribute("yoffset")) / scale;
                var xAdvance = parseFloat(charElement.attribute("xadvance")) / scale;

                var region = new skylark.Rectangle();
                region.x = parseFloat(charElement.attribute("x")) / scale + frame.x;
                region.y = parseFloat(charElement.attribute("y")) / scale + frame.y;
                region.width = parseFloat(charElement.attribute("width")) / scale;
                region.height = parseFloat(charElement.attribute("height")) / scale;

                var texture = skylark.Texture.fromTexture(this._texture, region);
                var bitmapChar = new skylark.BitmapChar(id, texture, xOffset, yOffset, xAdvance);
                this.addChar(id, bitmapChar);
            }

            if (fontXml.kernings) {
                var kernings = fontXml.kernings.kerning;
                for (var i = 0; i < kernings.length; i++) {
                    var kerningElement = kernings[i];

                    var first = parseInt(kerningElement.attribute("first"));
                    var second = parseInt(kerningElement.attribute("second"));
                    var amount = parseFloat(kerningElement.attribute("amount")) / scale;
                    if (second in this._chars)
                        this.getChar(second).addKerning(first, amount);
                }
            }
        };

        BitmapFont.prototype.getChar = function (charID) {
            return this._chars[charID];
        };

        BitmapFont.prototype.addChar = function (charID, bitmapChar) {
            this._chars[charID] = bitmapChar;
        };

        BitmapFont.prototype.createSprite = function (width, height, text, fontSize, color, hAlign, vAlign, autoScale, kerning) {
            if (typeof fontSize === "undefined") { fontSize = -1; }
            if (typeof color === "undefined") { color = 0xffffff; }
            if (typeof hAlign === "undefined") { hAlign = skylark.HAlign.CENTER; }
            if (typeof vAlign === "undefined") { vAlign = skylark.VAlign.MIDDLE; }
            if (typeof autoScale === "undefined") { autoScale = true; }
            if (typeof kerning === "undefined") { kerning = true; }
            var charLocations = this.arrangeChars(width, height, text, fontSize, hAlign, vAlign, autoScale, kerning);
            var numChars = charLocations.length;
            var sprite = new skylark.Sprite();

            for (var i = 0; i < numChars; ++i) {
                var charLocation = charLocations[i];
                var char = charLocation.char.createImage();
                char.x = charLocation.x;
                char.y = charLocation.y;
                char.scaleX = char.scaleY = charLocation.scale;

                sprite.addChild(char);
            }

            return sprite;
        };

        BitmapFont.prototype.fillQuadBatch = function (quadBatch, width, height, text, fontSize, color, hAlign, vAlign, autoScale, kerning) {
            if (typeof fontSize === "undefined") { fontSize = -1; }
            if (typeof color === "undefined") { color = 0xffffff; }
            if (typeof hAlign === "undefined") { hAlign = skylark.HAlign.CENTER; }
            if (typeof vAlign === "undefined") { vAlign = skylark.VAlign.MIDDLE; }
            if (typeof autoScale === "undefined") { autoScale = true; }
            if (typeof kerning === "undefined") { kerning = true; }
            var charLocations = this.arrangeChars(width, height, text, fontSize, hAlign, vAlign, autoScale, kerning);
            var numChars = charLocations.length;
            this._helperImage.color = color;

            if (numChars > 8192)
                throw new skylark.ArgumentError("Bitmap Font text is limited to 8192 characters.");

            for (var i = 0; i < numChars; ++i) {
                var charLocation = charLocations[i];
                this._helperImage.texture = charLocation.char.texture;
                this._helperImage.readjustSize();
                this._helperImage.x = charLocation.x;
                this._helperImage.y = charLocation.y;
                this._helperImage.scaleX = this._helperImage.scaleY = charLocation.scale;
                quadBatch.addImage(this._helperImage);
            }
        };

        BitmapFont.prototype.arrangeChars = function (width, height, txt, fontSize, hAlign, vAlign, autoScale, kerning) {
            if (typeof fontSize === "undefined") { fontSize = -1; }
            if (typeof hAlign === "undefined") { hAlign = skylark.HAlign.CENTER; }
            if (typeof vAlign === "undefined") { vAlign = skylark.VAlign.MIDDLE; }
            if (typeof autoScale === "undefined") { autoScale = true; }
            if (typeof kerning === "undefined") { kerning = true; }
            if (txt == null || txt.length == 0)
                return [];
            if (fontSize < 0)
                fontSize *= -this._size;

            var lines;
            var finished = false;
            var charLocation;
            var numChars;
            var containerWidth;
            var containerHeight;
            var scale;

            while (!finished) {
                scale = fontSize / this._size;
                containerWidth = width / scale;
                containerHeight = height / scale;

                lines = [];

                if (this._lineHeight <= containerHeight) {
                    var lastWhiteSpace = -1;
                    var lastCharID = -1;
                    var currentX = 0;
                    var currentY = 0;
                    var currentLine = [];

                    numChars = txt.length;
                    for (var i = 0; i < numChars; ++i) {
                        var lineFull = false;
                        var charID = txt.charCodeAt(i);
                        var char = this.getChar(charID);

                        if (charID == BitmapFont.CHAR_NEWLINE || charID == BitmapFont.CHAR_CARRIAGE_RETURN) {
                            lineFull = true;
                        } else if (char == null) {
                            console.log("[Skylark] Missing character: " + charID);
                        } else {
                            if (charID == BitmapFont.CHAR_SPACE || charID == BitmapFont.CHAR_TAB)
                                lastWhiteSpace = i;

                            if (kerning)
                                currentX += char.getKerning(lastCharID);

                            charLocation = this._charLocationPool.length ? this._charLocationPool.pop() : new CharLocation(char);

                            charLocation.char = char;
                            charLocation.x = currentX + char.xOffset;
                            charLocation.y = currentY + char.yOffset;
                            currentLine.push(charLocation);

                            currentX += char.xAdvance;
                            lastCharID = charID;

                            if (charLocation.x + char.width > containerWidth) {
                                var numCharsToRemove = lastWhiteSpace == -1 ? 1 : i - lastWhiteSpace;
                                var removeIndex = currentLine.length - numCharsToRemove;

                                currentLine.splice(removeIndex, numCharsToRemove);

                                if (currentLine.length == 0)
                                    break;

                                i -= numCharsToRemove;
                                lineFull = true;
                            }
                        }

                        if (i == numChars - 1) {
                            lines.push(currentLine);
                            finished = true;
                        } else if (lineFull) {
                            lines.push(currentLine);

                            if (lastWhiteSpace == i)
                                currentLine.pop();

                            if (currentY + 2 * this._lineHeight <= containerHeight) {
                                currentLine = [];
                                currentX = 0;
                                currentY += this._lineHeight;
                                lastWhiteSpace = -1;
                                lastCharID = -1;
                            } else {
                                break;
                            }
                        }
                    }
                }

                if (autoScale && !finished) {
                    fontSize -= 1;
                    lines.length = 0;
                } else {
                    finished = true;
                }
            }

            var finalLocations = [];
            var numLines = lines.length;
            var bottom = currentY + this._lineHeight;
            var yOffset = 0;

            if (vAlign == skylark.VAlign.BOTTOM)
                yOffset = containerHeight - bottom;
else if (vAlign == skylark.VAlign.CENTER)
                yOffset = (containerHeight - bottom) / 2;

            for (var lineID = 0; lineID < numLines; ++lineID) {
                var line = lines[lineID];
                numChars = line.length;

                if (numChars == 0)
                    continue;

                var xOffset = 0;
                var lastLocation = line[line.length - 1];
                var right = lastLocation.x - lastLocation.char.xOffset + lastLocation.char.xAdvance;

                if (hAlign == skylark.HAlign.RIGHT)
                    xOffset = containerWidth - right;
else if (hAlign == skylark.HAlign.CENTER)
                    xOffset = (containerWidth - right) / 2;

                for (var c = 0; c < numChars; ++c) {
                    charLocation = line[c];
                    charLocation.x = scale * (charLocation.x + xOffset);
                    charLocation.y = scale * (charLocation.y + yOffset);
                    charLocation.scale = scale;

                    if (charLocation.char.width > 0 && charLocation.char.height > 0)
                        finalLocations.push(charLocation);

                    this._charLocationPool.push(charLocation);
                }
            }

            return finalLocations;
        };

        Object.defineProperty(BitmapFont.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapFont.prototype, "size", {
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BitmapFont.prototype, "lineHeight", {
            get: function () {
                return this._lineHeight;
            },
            set: function (value) {
                this._lineHeight = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(BitmapFont.prototype, "smoothing", {
            get: function () {
                return this._helperImage.smoothing;
            },
            set: function (value) {
                this._helperImage.smoothing = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(BitmapFont.prototype, "baseline", {
            get: function () {
                return this._baseline;
            },
            enumerable: true,
            configurable: true
        });
        BitmapFont.NATIVE_SIZE = -1;

        BitmapFont.MINI = "mini";

        BitmapFont.CHAR_SPACE = 32;
        BitmapFont.CHAR_TAB = 9;
        BitmapFont.CHAR_NEWLINE = 10;
        BitmapFont.CHAR_CARRIAGE_RETURN = 13;
        return BitmapFont;
    })();
    skylark.BitmapFont = BitmapFont;

    var CharLocation = (function () {
        function CharLocation(char) {
            this.char = char;
        }
        return CharLocation;
    })();
    skylark.CharLocation = CharLocation;
})(skylark || (skylark = {}));
var skylark;
(function (skylark) {
    var MiniBitmapFont = (function (_super) {
        __extends(MiniBitmapFont, _super);
        function MiniBitmapFont() {
            _super.call(this, MiniBitmapFont.texture, MiniBitmapFont.xml);
        }
        Object.defineProperty(MiniBitmapFont, "texture", {
            get: function () {
                var img = new NativeImage();
                img.src = MiniBitmapFont.IMAGE_DATA;

                return new skylark.ConcreteTexture(img);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(MiniBitmapFont, "xml", {
            get: function () {
                return MiniBitmapFont.XML_DATA;
            },
            enumerable: true,
            configurable: true
        });
        MiniBitmapFont.IMAGE_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABABAMAAAAg+GJMAAAAJFBMVEUAAAD///////////////////////////////////////////+0CY3pAAAAC3RSTlMAAgQGCg4QFNn5/aulndcAAANHSURBVFhH7ZYxrhtHEESf4J+9RLGu4NCRoHQBBZv5EEp8AAVMfAQf4R+hAgIK6nIOenZJSt+GjW/IiRrN4XA4XV1dPcshvNrevFkubyFAELybfzshRATg3bvl4dkjNHw5YV6eKAkAz8/LH23Q/41JIs3ptuO3FTydHAwakUYS3fabsyjfrZzROQHcdieQxDOrrc3yu8QLQG4ArbpI9HHjXzO4B0Cp2w75KtM3Gtz8a4ARD0eV721zMhpyOoSix+wtJIKY20wgQAsjyw1SJMkxe9YpmtzPwCFAI4xaD0h/b3b2NkeD8NNv4qg5Q+y0926NOGfmadqAK/d5YrZc9xk+5nqZgXNtywEwDCYOEfzlwyPAzjUzvAQw9a/gLA3GF/G7EsithHNtuvBakxFFqYlluh8xFut8yog69Mk6MECmb7OS6xan03JUTSzw5XIjrfNakUc0SYjQ5gEg0Dl7lh45l+mHO4DrlgZCs9pfmuCW605z1W2V8DIDi2tpkRRiB0BeBDgkCQmkpU1Yz4sUVm8zJVjiocGh2OrCgH5fa1szNDLVBwsWm3mjx9imjV01g7/+DFQGYCTjy+cFuRNy3ZKnhBk5PKNR22CSSJL8npCVvdltJiuBPI3EpGnTALKORyKReThXaxaDI/c9g5wMcKGbeZ+WreKDJeReg8CdBq82UZykU6/tLC4/LznWb9fNEUyNbruMjyzKdDWwNorO7PPFz5d1meEYHgxyA1j7oaU5qTBEZ8Ps7XGbZ+U/0wvBqRXBSQ+67eRBg5k3yMkDOe7YMN/euSPja+3IjRynwyNHhwqrGJyKmgYJdELDVGo7MOv/xK5bYQEUa8kpSyNhXTATnQyGVkurF9sBeMpVSQJzSWRffYWQA0No3Hb3ol53wHuAOtUcDBh5uWkw39GgS4PSTglLI6EJyn9ggxMy/MZqJFJ7XIYNJwdJKzFgCfHiBcTDM6/tenFL8GOiW8oUUQjlWiCCDEyOB+MGkAHYiW5hqTBi053pQKYYmXAX/dD1GNEJmxOc+xJGg+OILAlOgb6HqTHaEm2dmvLTHyRJiM7T2Kr9hp5BOmcrjHwXwvv3ujr2dcijOSoMA1BCXLL+E5M5NT/sh/2v9idsZLc1sYX4WAAAAABJRU5ErkJggg==";

        MiniBitmapFont.BITMAP_WIDTH = 128;
        MiniBitmapFont.BITMAP_HEIGHT = 64;

        MiniBitmapFont.XML_DATA = '<?xml version="1.0" encoding="UTF-8"?>\
<font>\
    <info face="mini" size="8" bold="0" italic="0" smooth="0" />\
    <common lineHeight="8" base="7" scaleW="128" scaleH="64" pages="1" packed="0" />\
    <chars count="191">\
        <char id="195" x="1" y="1" width="5" height="9" xoffset="0" yoffset="-2" xadvance="6" />\
        <char id="209" x="7" y="1" width="5" height="9" xoffset="0" yoffset="-2" xadvance="6" />\
        <char id="213" x="13" y="1" width="5" height="9" xoffset="0" yoffset="-2" xadvance="6" />\
        <char id="253" x="19" y="1" width="4" height="9" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="255" x="24" y="1" width="4" height="9" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="192" x="29" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="193" x="35" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="194" x="41" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="197" x="47" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="200" x="53" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="201" x="59" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="202" x="65" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="210" x="71" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="211" x="77" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="212" x="83" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="217" x="89" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="218" x="95" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="219" x="101" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="221" x="107" y="1" width="5" height="8" xoffset="0" yoffset="-1" xadvance="6" />\
        <char id="206" x="113" y="1" width="3" height="8" xoffset="-1" yoffset="-1" xadvance="2" />\
        <char id="204" x="117" y="1" width="2" height="8" xoffset="-1" yoffset="-1" xadvance="2" />\
        <char id="205" x="120" y="1" width="2" height="8" xoffset="0" yoffset="-1" xadvance="2" />\
        <char id="36" x="1" y="11" width="5" height="7" xoffset="0" yoffset="1" xadvance="6" />\
        <char id="196" x="7" y="11" width="5" height="7" xoffset="0" yoffset="0" xadvance="6" />\
        <char id="199" x="13" y="11" width="5" height="7" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="203" x="19" y="11" width="5" height="7" xoffset="0" yoffset="0" xadvance="6" />\
        <char id="214" x="25" y="11" width="5" height="7" xoffset="0" yoffset="0" xadvance="6" />\
        <char id="220" x="31" y="11" width="5" height="7" xoffset="0" yoffset="0" xadvance="6" />\
        <char id="224" x="37" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="225" x="42" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="226" x="47" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="227" x="52" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="232" x="57" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="233" x="62" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="234" x="67" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="235" x="72" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="241" x="77" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="242" x="82" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="243" x="87" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="244" x="92" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="245" x="97" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="249" x="102" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="250" x="107" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="251" x="112" y="11" width="4" height="7" xoffset="0" yoffset="0" xadvance="5" />\
        <char id="254" x="117" y="11" width="4" height="7" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="123" x="122" y="11" width="3" height="7" xoffset="0" yoffset="1" xadvance="4" />\
        <char id="125" x="1" y="19" width="3" height="7" xoffset="0" yoffset="1" xadvance="4" />\
        <char id="167" x="5" y="19" width="3" height="7" xoffset="0" yoffset="1" xadvance="4" />\
        <char id="207" x="9" y="19" width="3" height="7" xoffset="-1" yoffset="0" xadvance="2" />\
        <char id="106" x="13" y="19" width="2" height="7" xoffset="0" yoffset="2" xadvance="3" />\
        <char id="40" x="16" y="19" width="2" height="7" xoffset="0" yoffset="1" xadvance="3" />\
        <char id="41" x="19" y="19" width="2" height="7" xoffset="0" yoffset="1" xadvance="3" />\
        <char id="91" x="22" y="19" width="2" height="7" xoffset="0" yoffset="1" xadvance="3" />\
        <char id="93" x="25" y="19" width="2" height="7" xoffset="0" yoffset="1" xadvance="3" />\
        <char id="124" x="28" y="19" width="1" height="7" xoffset="1" yoffset="1" xadvance="4" />\
        <char id="81" x="30" y="19" width="5" height="6" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="163" x="36" y="19" width="5" height="6" xoffset="0" yoffset="1" xadvance="6" />\
        <char id="177" x="42" y="19" width="5" height="6" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="181" x="48" y="19" width="5" height="6" xoffset="0" yoffset="3" xadvance="6" />\
        <char id="103" x="54" y="19" width="4" height="6" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="112" x="59" y="19" width="4" height="6" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="113" x="64" y="19" width="4" height="6" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="121" x="69" y="19" width="4" height="6" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="162" x="74" y="19" width="4" height="6" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="228" x="79" y="19" width="4" height="6" xoffset="0" yoffset="1" xadvance="5" />\
        <char id="229" x="84" y="19" width="4" height="6" xoffset="0" yoffset="1" xadvance="5" />\
        <char id="231" x="89" y="19" width="4" height="6" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="240" x="94" y="19" width="4" height="6" xoffset="0" yoffset="1" xadvance="5" />\
        <char id="246" x="99" y="19" width="4" height="6" xoffset="0" yoffset="1" xadvance="5" />\
        <char id="252" x="104" y="19" width="4" height="6" xoffset="0" yoffset="1" xadvance="5" />\
        <char id="238" x="109" y="19" width="3" height="6" xoffset="-1" yoffset="1" xadvance="2" />\
        <char id="59" x="113" y="19" width="2" height="6" xoffset="0" yoffset="3" xadvance="4" />\
        <char id="236" x="116" y="19" width="2" height="6" xoffset="-1" yoffset="1" xadvance="2" />\
        <char id="237" x="119" y="19" width="2" height="6" xoffset="0" yoffset="1" xadvance="2" />\
        <char id="198" x="1" y="27" width="9" height="5" xoffset="0" yoffset="2" xadvance="10" />\
        <char id="190" x="11" y="27" width="8" height="5" xoffset="0" yoffset="2" xadvance="9" />\
        <char id="87" x="20" y="27" width="7" height="5" xoffset="0" yoffset="2" xadvance="8" />\
        <char id="188" x="28" y="27" width="7" height="5" xoffset="0" yoffset="2" xadvance="8" />\
        <char id="189" x="36" y="27" width="7" height="5" xoffset="0" yoffset="2" xadvance="8" />\
        <char id="38" x="44" y="27" width="6" height="5" xoffset="0" yoffset="2" xadvance="7" />\
        <char id="164" x="51" y="27" width="6" height="5" xoffset="0" yoffset="2" xadvance="7" />\
        <char id="208" x="58" y="27" width="6" height="5" xoffset="0" yoffset="2" xadvance="7" />\
        <char id="8364" x="65" y="27" width="6" height="5" xoffset="0" yoffset="2" xadvance="7" />\
        <char id="65" x="72" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="66" x="78" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="67" x="84" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="68" x="90" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="69" x="96" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="70" x="102" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="71" x="108" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="72" x="114" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="75" x="120" y="27" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="77" x="1" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="78" x="7" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="79" x="13" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="80" x="19" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="82" x="25" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="83" x="31" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="84" x="37" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="85" x="43" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="86" x="49" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="88" x="55" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="89" x="61" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="90" x="67" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="50" x="73" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="51" x="79" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="52" x="85" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="53" x="91" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="54" x="97" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="56" x="103" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="57" x="109" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="48" x="115" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="47" x="121" y="33" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="64" x="1" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="92" x="7" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="37" x="13" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="43" x="19" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="35" x="25" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="42" x="31" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="165" x="37" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="169" x="43" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="174" x="49" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="182" x="55" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="216" x="61" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="247" x="67" y="39" width="5" height="5" xoffset="0" yoffset="2" xadvance="6" />\
        <char id="74" x="73" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="76" x="78" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="98" x="83" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="100" x="88" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="104" x="93" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="107" x="98" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="55" x="103" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="63" x="108" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="191" x="113" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="222" x="118" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="223" x="123" y="39" width="4" height="5" xoffset="0" yoffset="2" xadvance="5" />\
        <char id="116" x="1" y="45" width="3" height="5" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="60" x="5" y="45" width="3" height="5" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="62" x="9" y="45" width="3" height="5" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="170" x="13" y="45" width="3" height="5" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="186" x="17" y="45" width="3" height="5" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="239" x="21" y="45" width="3" height="5" xoffset="-1" yoffset="2" xadvance="2" />\
        <char id="102" x="25" y="45" width="2" height="5" xoffset="0" yoffset="2" xadvance="3" />\
        <char id="49" x="28" y="45" width="2" height="5" xoffset="0" yoffset="2" xadvance="3" />\
        <char id="73" x="31" y="45" width="1" height="5" xoffset="0" yoffset="2" xadvance="2" />\
        <char id="105" x="33" y="45" width="1" height="5" xoffset="0" yoffset="2" xadvance="2" />\
        <char id="108" x="35" y="45" width="1" height="5" xoffset="0" yoffset="2" xadvance="2" />\
        <char id="33" x="37" y="45" width="1" height="5" xoffset="1" yoffset="2" xadvance="3" />\
        <char id="161" x="39" y="45" width="1" height="5" xoffset="0" yoffset="2" xadvance="3" />\
        <char id="166" x="41" y="45" width="1" height="5" xoffset="0" yoffset="2" xadvance="2" />\
        <char id="109" x="43" y="45" width="7" height="4" xoffset="0" yoffset="3" xadvance="8" />\
        <char id="119" x="51" y="45" width="7" height="4" xoffset="0" yoffset="3" xadvance="8" />\
        <char id="230" x="59" y="45" width="7" height="4" xoffset="0" yoffset="3" xadvance="8" />\
        <char id="97" x="67" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="99" x="72" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="101" x="77" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="110" x="82" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="111" x="87" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="115" x="92" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="117" x="97" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="118" x="102" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="120" x="107" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="122" x="112" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="215" x="117" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="248" x="122" y="45" width="4" height="4" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="114" x="1" y="51" width="3" height="4" xoffset="0" yoffset="3" xadvance="4" />\
        <char id="178" x="5" y="51" width="3" height="4" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="179" x="9" y="51" width="3" height="4" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="185" x="13" y="51" width="1" height="4" xoffset="0" yoffset="2" xadvance="2" />\
        <char id="61" x="15" y="51" width="5" height="3" xoffset="0" yoffset="3" xadvance="6" />\
        <char id="171" x="21" y="51" width="5" height="3" xoffset="0" yoffset="3" xadvance="6" />\
        <char id="172" x="27" y="51" width="5" height="3" xoffset="0" yoffset="4" xadvance="6" />\
        <char id="187" x="33" y="51" width="5" height="3" xoffset="0" yoffset="3" xadvance="6" />\
        <char id="176" x="39" y="51" width="3" height="3" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="44" x="43" y="51" width="2" height="3" xoffset="0" yoffset="6" xadvance="3" />\
        <char id="58" x="46" y="51" width="1" height="3" xoffset="1" yoffset="3" xadvance="4" />\
        <char id="94" x="48" y="51" width="4" height="2" xoffset="-1" yoffset="2" xadvance="4" />\
        <char id="126" x="53" y="51" width="4" height="2" xoffset="0" yoffset="3" xadvance="5" />\
        <char id="34" x="58" y="51" width="3" height="2" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="96" x="62" y="51" width="2" height="2" xoffset="0" yoffset="2" xadvance="3" />\
        <char id="180" x="65" y="51" width="2" height="2" xoffset="0" yoffset="2" xadvance="3" />\
        <char id="184" x="68" y="51" width="2" height="2" xoffset="0" yoffset="7" xadvance="3" />\
        <char id="39" x="71" y="51" width="1" height="2" xoffset="0" yoffset="2" xadvance="2" />\
        <char id="95" x="73" y="51" width="5" height="1" xoffset="0" yoffset="7" xadvance="6" />\
        <char id="45" x="79" y="51" width="4" height="1" xoffset="0" yoffset="4" xadvance="5" />\
        <char id="173" x="84" y="51" width="4" height="1" xoffset="0" yoffset="4" xadvance="5" />\
        <char id="168" x="89" y="51" width="3" height="1" xoffset="1" yoffset="2" xadvance="5" />\
        <char id="175" x="93" y="51" width="3" height="1" xoffset="0" yoffset="2" xadvance="4" />\
        <char id="46" x="97" y="51" width="1" height="1" xoffset="0" yoffset="6" xadvance="2" />\
        <char id="183" x="99" y="51" width="1" height="1" xoffset="0" yoffset="4" xadvance="2" />\
        <char id="32" x="6" y="56" width="0" height="0" xoffset="0" yoffset="127" xadvance="3" />\
    </chars>\
</font>';
        return MiniBitmapFont;
    })(skylark.BitmapFont);
    skylark.MiniBitmapFont = MiniBitmapFont;
})(skylark || (skylark = {}));
(function (root, modules) {
    if (typeof exports === 'object') {
        module.exports = modules;
    } else if (typeof define === 'function' && (define).amd) {
        define(modules);
    } else {
        root.returnExports = modules;
    }
})(this, skylark);
//# sourceMappingURL=skylark.js.map
