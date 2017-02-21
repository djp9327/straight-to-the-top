function Viewport(_window) {
	if (!_window) {
		throw new Error("Missing required argument: window");
	}

	// Private Properties

	var self = this,
	    _events = {
	    	"resize:complete": {
	    		type: "resize",
	    		handle: null,
	    		useCapture: false,
	    		bound: false,
	    		listeners: [],
	    		element: _window
	    	},
	    	"scroll:complete": {
	    		type: "scroll",
	    		handle: null,
	    		useCapture: false,
	    		bound: false,
	    		listeners: [],
	    		element: _window.document
	    	}
	    },
	    _eventListenerDelay = 20,
	    _orientation = _window.orientation || this.height > this.width ? 0 : 90;
	    _orientationEvent = {
	    	mql: _window.matchMedia ? _window.matchMedia("(orientation: portrait)") : null,
	    	regex: /^orientation:\w+$/i,
	    	listeners: {
	    		count: 0,
		    	"orientation:change": [],
		    	"orientation:portrait": [],
		    	"orientation:landscape": []
		    },
	    	test: function(type) {
	    		return this.regex.test(type)
	    		    && !!this.listeners[type];
	    	}
	    },
	    _resizeTimer = null,
	    _resizeTimeout = 300,
	    _scrollTimer = null,
	    _scrollTimeout = 300,
	    createAccessor = function(name, get, set) {
	    	Object.defineProperty(self, name, {
	    		enumerable: true,
	    		get: get,
	    		set: set
	    	});
	    },
	    createGetter = function(name, get) {
	    	Object.defineProperty(self, name, {
	    		enumerable: true,
	    		get: get
	    	});
	    };

	// Public Properties

	createGetter("bottom", function() {
		return _window.pageYOffset + _window.innerHeight;
	});

	createGetter("document", function() {
		return _window.document;
	});

	createAccessor("eventListenerDelay",
		function() {
			return _eventListenerDelay;
		},
		function(value) {
			_eventListenerDelay = value;
		}
	);

	createGetter("height", function() {
		return _window.innerHeight;
	});

	createGetter("left", function() {
		return _window.pageXOffset;
	});

	createGetter("location", function() {
		return _window.location;
	});

	createGetter("orientation", function() {
		return _orientation;
	});

	createAccessor("resizeTimeout",
		function() {
			return _resizeTimeout;
		},
		function(value) {
			_resizeTimeout = value;
		}
	);

	createGetter("right", function() {
		return _window.pageXOffset + _window.innerWidth;
	});

	createGetter("screen", function() {
		return _window.screen;
	});

	createAccessor("scrollTimeout",
		function() {
			return _scrollTimeout;
		},
		function(value) {
			_scrollTimeout = value;
		}
	);

	createGetter("top", function() {
		return _window.pageYOffset;
	});

	createGetter("width", function() {
		return _window.innerWidth;
	});

	createGetter("window", function() {
		return _window;
	});

	// Public Methods

	this.destructor = function() {
		if (_resizeTimer) {
			_window.clearTimeout(_resizeTimer);
			_resizeTimer = null;
		}

		if (_scrollTimer) {
			_window.clearTimeout(_scrollTimer);
			_scrollTimer = null;
		}

		removeSpecialEvent(_events["resize:complete"]);
		removeSpecialEvent(_events["scroll:complete"]);

		self = _events = _window = null;
	};

	this.addEventListener = function(type, listener) {
		type = type.toLowerCase();

		var event, listeners;

		if (_orientationEvent.test(type)) {
			listeners = _orientationEvent.listeners;

			if (!listeners.count && _orientationEvent.mql) {
				_orientationEvent.mql.addListener(handleOrientationChangeEvent);
			}

			listeners[type].push(listener);
			listeners.count++;
		}
		else if (event = _events[type]) {
			addSpecialEvent(event);
			event.listeners.push(listener);
		}
	};

	this.removeEventListener = function(type, listener) {
		type = type.toLowerCase();

		var event, index, listeners;

		if (_orientationEvent.test(type)) {
			listeners = _orientationEvent.listeners[type];
			index = listeners.indexOf(listener);

			if (index > -1) {
				listeners.splice(index, 1);

				if (--listeners.count === 0 && _orientationEvent.mql) {
					_orientationEvent.mql.removeListener(handleOrientationChangeEvent);
				}
			}
		}
		else if (_events[type]) {
			event = _events[type];
			index = event.listeners.indexOf(listener);

			if (index > -1) {
				event.listeners.splice(index, 1);

				if (!event.listeners.length) {
					removeSpecialEvent(event);
				}
			}
		}
	};

	// Private Methods

	var addSpecialEvent = function(event) {
		if (event.bound) {
			return;
		}

		event.element.addEventListener(event.type, event.handle, event.useCapture);
		event.bound = true;
	},
	fireResizedEvent = function() {
		fireEvent(_events["resize:complete"].listeners);
	},
	fireScrollCompleteEvent = function() {
		fireEvent(_events["scroll:complete"].listeners);
	},
	fireEvent = function(listeners) {
		if (!listeners.length) {
			return;
		}

		var callback = function() {
			if (++i === listeners.length || listeners[i](self) === false) {
				return;
			}

			_window.setTimeout(callback, _eventListenerDelay);
		}, i = -1;

		callback();
	},
	handleOrientationChangeEvent = function(m) {
		_orientation = m.matches ? 0 : _window.orientation || 90;

		fireEvent(_orientationEvent.listeners["orientation:change"]);

		if (m.matches) {
			fireEvent(_orientationEvent.listeners["orientation:portrait"]);
		}
		else {
			fireEvent(_orientationEvent.listeners["orientation:landscape"]);
		}
	},
	handleResizeEvent = function(event) {
		if (_resizeTimer) {
			_window.clearTimeout(_resizeTimer);
			_resizeTimer = null;
		}

		_resizeTimer = _window.setTimeout(fireResizedEvent, _resizeTimeout);
	},
	handleScrollEvent = function(event) {
		if (_scrollTimer) {
			_window.clearTimeout(_scrollTimer);
			_scrollTimer = null;
		}

		_scrollTimer = _window.setTimeout(fireScrollCompleteEvent, _scrollTimeout);
	},
	removeSpecialEvent = function(event) {
		if (!event.bound) {
			return;
		}

		event.element.removeEventListener(event.type, event.handle, event.useCapture);
		event.bound = false;
	};

	_events["resize:complete"].handle = handleResizeEvent;
	_events["scroll:complete"].handle = handleScrollEvent;
}

Viewport.prototype = {

	constructor: Viewport,

	contains: function(element) {
		var their = this.getElementPosition(element),
		    my = this.getPosition();

		if (their.left < my.right
			&& their.right > my.left
			&& their.top < my.bottom
			&& their.bottom > my.top) {
			return true;
		}
		else {
			return false;
		}
	},

	getElementPosition: function(element) {
		var pos = {
			left:   element.offsetLeft,
			top:    element.offsetTop,
			width:  element.offsetWidth,
			height: element.offsetHeight
		};

		while (element = element.offsetParent) {
			pos.left += element.offsetLeft;
			pos.top += element.offsetTop;
		}

		pos.right = pos.left + pos.width;
		pos.bottom = pos.top + pos.height;

		return pos;
	},

	getPosition: function() {
		return {
			left:   this.left,
			top:    this.top,
			width:  this.width,
			height: this.height,
			right:  this.right,
			bottom: this.bottom
		};
	},

	is: function(x) {
		return this === x
		    || this.window === x
		    || this.screen === x
		    || this.document === x;
	},

	matchMedia: function(query) {
		return this.window.matchMedia
		     ? this.window.matchMedia(query)
		     : { matches: false };
	},

	querySelector: function(selector, callback, context) {
		var element = null;

		this.querySelectorAll(selector, function(el) {
			element = el;
			return false;
		});

		return element;
	},

	querySelectorAll: function(selector, callback, context) {
		callback = callback || function() {};
		context = context || this;

		var elements = this.document.body.querySelectorAll(selector),
		    i = 0, result, matches = [], element, index = 0;

		for (i; i < elements.length; i++) {
			element = elements[i];

			if (this.contains(element)) {
				index = matches.push(element) - 1;

				if (result !== false) {
					result = callback.call(context, element, index, this);
				}
			}
		}

		return matches;
	},

	toString: function() {
		return "[object Viewport: " + this.location + "]";
	}

};
