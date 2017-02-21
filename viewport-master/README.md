# Viewport

The missing viewport for JavaScript. This cross browser class requires no
outside dependencies and gives you an easy way to interact with and interrogate
the browser viewport.

## Features

- Custom events so you can easily respond when the user stops scrolling, stops
  resizing the browser window, or the viewport orientation changes.
- Several properties give you information about the current viewport:
  - top
  - left
  - width
  - height
  - right
  - bottom
- Handy shortcut properties are available so you don't have to reference global
  variables when dealing with a viewport object:
  - window
  - screen
  - document
  - orientation
- Easily determine if a DOM node is inside the viewport by calling the
  `contains` method.

## Browser Compatibility

- Internet Explorer 9+
- Firefox
- Safari
- Chrome
- Opera

## Downloading Viewport

There are two ways to get this. Either download or clone this from
[GitHub][download], or install via Bower:

    $ bower install browser-viewport

Or in bower.json:

```javascript
{
    ...

    "depenencies": {
        "browser-viewport": "~1.0.0"
    }
}
```

## Getting Started

Just reference `dist/browser-viewport.min.js` in your web page, then instantiate
a new `Viewport` object:

```javascript
var viewport = new Viewport(window);
```

## Viewport Events

There are five events you can subscribe to:

- `scroll:complete`: The user is done scrolling
- `resize:complete`: The user is done resizing the browser window
- `orientation:change`: The orientation of the screen has changed
- `orientation:portrait`: Orientation has changed to portrait mode
- `orientation:landscape`: Orientation has changed to landscape mode

__Note:__ Orientation events are usefull for mobile devices. If the browser does
not support orientation change events, no error will get thrown subscribing to
the event, and the event will never be triggered.

```javascript
viewport.addEventListener("scroll:complete", function(viewport) {
    // scrolling is done
});

viewport.addEventListener("resize:complete", function(viewport) {
    // user is done resizing the browser window
});

viewport.addEventListener("orientation:change", function(viewport) {
    if (viewport.orientation === 90) {
        // landscape mode
    }
    else {
        // portrait mode
    }
});

viewport.addEventListener("orientation:portrait", function(viewport) {
    // portrait mode
});

viewport.addEventListener("orientation:landscape", function(viewport) {
    // landscape mode
});
```

## HTML Elements in the Viewport

Three methods are available for dealing with elements in the viewport. The first
one determines whether or not an element is inside the viewport, and the other
two allow you to retrieve elements in the viewport based on CSS selectors.

### Determining if an Element is Inside the Viewport

The `Viewport#contains(...)` method returns true if the element has at least one
pixel inside the viewport.

```javascript
var element = document.getElementById("foo");

if (viewport.contains(element)) {
    // element is inside the viewport
}
```

### Querying for Elements Inside the Viewport

The `Viewport#querySelector(...)` and `Viewport#querySelectorAll(...)` methods
allow you to search for elements visible in the viewport. They work just like
the `document.querySelector` and `document.querySelectorAll` methods.

The Viewport methods come with several overloads:

1. `Viewport#querySelectorAll(selector) -> Array<HTMLElement>`: Pass in a CSS
   selector and get back an Array of DOM nodes with at least one pixel inside
   the viewport.
2. `Viewport#querySelectorAll(selector, callback) -> Array<HTMLElement>`: Find
   all elements inside the viewport matching the selector, and execute the
   `callback` on each match. This prevents you from double looping over matched
   elements (once inside `Viewport#querySelectorAll` and the second time in the
   code that processes the results).
3. `Viewport#querySelectorAll(selector, callback, context) -> Array<HTMLElement>`:
   Just like the previous overload, but use `context` as the value of `this`
   inside the callback.
4. `Viewport#querySelector(selector) -> HTMLElement | null`: Find the first
   matching element inside the viewport

Example:

```javascript
function ImageLoader(viewport) {
    this.viewport = viewport || null;
    this.handleScrollComplete = this.handleScrollComplete.bind(this);
}
ImageLoader.prototype = {

    fullsizeAttr: "data-fullsize-url",

    selector: "img[data-fullsize-url]",

    thumbnailAttr: "data-thumbnail-url",

    viewport: null,

    constructor: ImageLoader,

    init: function() {
        this.viewport.addEventListener("scroll:complete", this.handleScrollComplete);

        return this;
    },

    handleScrollComplete: function(viewport) {
        viewport.querySelectorAll(this.selector, function(image, index, thisViewport) {
            image.setAttribute(this.thumbnailAttr, image.src);
            image.src = image.getAttribute(this.fullsizeAttr);
            image.removeAttribute(this.fullsizeAttr);
        }, this);
    }

};

var viewport = new Viewport(window),
    imageLoader = new ImageLoader(viewport).init();
```

#### Performance Considerations for querySelector and querySelectorAll

Every call to `querySelector` or `querySelectorAll` is delegated to
`document.querySelectorAll`. Because of this, you'll want to make your CSS
selectors as specific as possible. The results of `document.querySelectorAll`
are looped over, and each element is passed in to `Viewport.contains(...)`
before pushing the matched element onto an Array. Whenever possible, take
advantage of the `Viewport#querySelectorAll` overrides allowing you to pass in
a callback function, as the matched elements are only looped over once.

## Viewport Properties

The viewport object comes with many handy properties allowing you to interrogate
the current state of the viewport, access native browser objects related to the
viewport, and to configure the viewport object itself.

### Viewport Dimension Related Properties

These properties are read-only and provide you with basic information about the
current state of the viewport:

- `width (Number)`: Width of the viewport in CSS pixels
- `height (Number)`: Height of the viewport in CSS pixels
- `top (Number)`: How far down the user has scrolled in CSS pixels
- `left (Number)`: How far down the user has scrolled sideways in CSS pixels
- `bottom (Number)`: How far down in CSS pixels is the bottom of the viewport
- `right (Number)`: How far right in CSS pixels is the right edge of the viewport
- `orientation (Number)`: The current orientation of the viewport. This is a
  pass-through property to `window.orientation` in browsers that support this
  property. The `Viewport` makes an intelligent guess based on the width and
  height for non compliant browsers
  (source: [Detect Orientation Change on Mobile Devices][orientation-change])
  - `0`: Portrait mode
  - `90`: Landscape mode, rotated to the left
  - `-90`: Landscape mode, rotated to the right

### Viewport Object Accessor Properties

These properties are handy accessors for native browser objects that you might
want to interact with when dealing with the viewport. These properties are
read-only:

- `window`: The window object tied to this viewport
- `document`: The document object for this viewport
- `screen`: The screen object for this viewport
- `location`: The location object for this viewport.

### Viewport Configuration Properties

Use these configuration properties to affect the behavior of the viewport
object. You may get and set these values.

- `eventListenerDelay (Number)`: The number of milliseconds that should elapse
  before notifying the next event listener. Since you could be querying the
  viewport for visible elements, and this operation could be processor
  intensive, the `eventListenerDelay` is used to allow the browser some
  processing time in between listeners. This helps prevent the browser UI from
  freezing. Default: 20
- `resizeTimeout (Number)`: The number of milliseconds to wait before triggering
  the "resize:complete" event. Default: 300
- `scrollTimeout (Number)`: The number of milliseconds to wait before triggering
  the "scroll:complete" event. Default: 300

#### Notes About `resize:complete` and `scroll:complete` Events

In order to trigger the "resize:complete" or "scroll:complete"
events, a polling mechanism is necessary. The resize and scroll events in
browsers fire upwards of 50 times per second, so we wait X number of
milliseconds after the last scroll or resize event. This allows us to know that
the user has stopped scrolling or stopped resizing the browser window.

The `resizeTimeout` and `scrollTimeout` properties allow you to tweak the
performance of these polling mechanisms.

## Other Viewport Methods

There are several utility methods on viewport objects.

- `contains(element) -> Boolean`: Determines if a DOM node is visible in the
  viewport. If only one pixel is visible, the node is considered visible in the
  viewport.
- `getElementPosition(element) -> Object`: Gets the absolute CSS pixel
  coordinates of any DOM node. It returns an object with the following
  properties:
  - `left`
  - `top`
  - `width`
  - `height`
  - `right`
  - `bottom`
  - `left`
- `getPosition() -> Object`: Gets the absolute CSS pixel coordinates of the
  viewport. It returns an object with the following properties:
  - `left`
  - `top`
  - `width`
  - `height`
  - `right`
  - `bottom`
  - `left`
- `is(x) -> Boolean`: Determines if an object is "equivalent" to the viewport.
  You may pass in an instance of Viewport, a window object, screen object or
  document object:

        var viewport = new Viewport(window);

        viewport.is(viewport) // true
        viewport.is(window)   // true
        viewport.is(document) // true
        viewport.is(screen)   // true

- `matchMedia(cssSelector) -> MediaQueryList | Object`: A pass-through to
  the native `window.matchMedia` function. If the browser does not support this,
  then an Object with a `matches` property is returned:

        // Non compliant browsers:
        viewport.matchMedia("screen and (max-width: 320px)") -> { matches: false }

        // Compliant browsers:
        viewport.matchMedia("screen and (max-width: 320px)") -> [object MediaQueryList]

  A call to `viewport.matchMedia(...)` will always be safe, and the `matches`
  property will always be false for non complaint browsers:

        if (viewport.matchMedia(...).matches) {
            // Viewport matches the media selector
        }
        else {
            // Viewport does not match the media selector, or the browser
            // does not support this feature.
        }

## Bug Reports and Feature Requests

Bug reports and Feature Requests are handled at [GitHub][issues].

## Contributing

If you find a bug, or want to contribute a new feature, just open up an
[Issue][issues] or [Pull Request][pulls] on GitHub:

1. [Fork this repository][fork]
2. Create a branch for your bug fix or feature
3. Commit your work, but __do not commit changes to the `dist/*` files!__ Your
   pull request will be rejected if you include those files in your commits. The
   distribution files will be built and committed just before an official
   release.
4. Include relevant Jasmine specs
5. Once your bug fix or feature is ready for review,
   [open a pull request][pulls].

In order to start developing, you will need the following tools:

- [Jasmine][jasmine]
- [Node.js][node]
- [Grunt][grunt]

## Change Log

- Version 1.0.0 ([download][download-v1.0.0]): Initial release!

[issues]: https://github.com/gburghardt/viewport/issues/
[pulls]: https://github.com/gburghardt/viewport/pulls/
[fork]: https://github.com/gburghardt/viewport/fork/
[download]: https://github.com/gburghardt/viewport/archive/master.zip
[download-v1.0.0]: https://github.com/gburghardt/viewport/archive/v1.0.0.zip
[orientation-change]: http://davidwalsh.name/orientation-change/
[jasmine]: https://github.com/pivotal/jasmine/
[node]: http://nodejs.org/
[grunt]: http://gruntjs.com/
