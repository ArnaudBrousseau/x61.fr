## Who's This Book For?
"Secrets of the JavaScript Ninja" is designed for intermediate to advanced
JavaScript programmers. It expects that you already have a firm understanding
of JavaScript and a working knowledge of HTML/CSS.  
The strength of this book lies in its ability to force you to
revisit concepts most JS programmers (including myself) always take for
granted. It puts the focus on functions as objects, function invoking, closures,
cross-browsers strategies, etc.

Resig sets the tone pretty early on. After a short introduction in a chapter
titled "Arming With Testing And Debugging" he tells us about the importance of
testing and goes on to explain how we can create a very simple JavaScript
`assert` method and its associated test runner. Considerations like this
are usually briefly mentioned towards the end of a textbook. Not this time.

Reasons I'm writing about reading "Secrets of the JavaScript Ninja":

1. Writing about something helps you remember it better
2. I'm adding some reference and extra information here and there.
3. Hopefully this is useful to you, the reader, to a) get a sense of what's in
   this book and b) get better at JavaScript!

## Functions

Created via the `Function` constructor, functions are special objects with
one superpower: they can be **invoked**. Besides that, functions are object and
nothing but objects:

- they're created via literals `function <optionalName> (<optionalArguments) {<functionBody>}`
- can be assigned to variables or properties
- can be passed as function parameters and returned as function results
- can have properties and method (for instance, each function has a `name`
  property and a `call` and `apply` method)

### Function Declaration
Two main ways to declare a function:

    // option 1
    function blah() { console.log('called'); }
    // option 2
    var blah = function() { console.log('called'); };

In both cases the function can be called via `blah()` after its declaration.
However there's a crucial difference: in the first case the function is
**named** `blah` which means the function will be assigned a property `name`
with the value `blah`.  
In the second case, we're assigning an **anonymous** function to the variable
`blah`. The function's `name` property in this case will be `''`.

### Arguments and Invocation
`this` and `arguments` are implicit parameters passed to every function. They
are just that. Parameters. The difference between `this`, `arguments` and
standard function parameters is that they are *implicit*. You won't see them in
 function signatures but they'll be available from within function bodies.

#### Arguments
`arguments` represent a list of all arguments passed to a function. It has
array-like accessors (`arguments[i]`) and properties (`arguments.length`) but
**is not an array** (`arguments.slice(1)` fails for instance).  
How can you get around that?

    Object.prototype.toString.call
    Array.prototype.slice.call
    etc

#### Invoking a function, and `this`
`this` is defined as the **function context**. Available within a function body,
`this` should really be referred to as  **invocation context**, because its value
varies based on the way a function is invoked:

- as a function, `this` refers to the global context `window`
- as a method, `this` refers to the object owning it
- as a constructor, `this` refers to the newly created object
- via `call` or `apply`, `this` is passed in and can be what we want

### Referencing Functions
Referencing functions from within themselves is necessary to achieve recursion.
Resig enumerates four ways.

First option: through a named function. Nothing out of the ordinary.

    function fact(x) {
        if (x !== 1) {
            return x * fact(x - 1);
        } else {
            return 1;
        }
    };

Second option: through a method name. Note the danger: if we decide to change
that method's name to `newfact`, we'll have to remember to change the inner
reference to `this.newfact`.

    var math = {
        'fact': function (x) {
            if (x !== 1) {
                return x * this.fact(x - 1);
            } else {
                return 1;
            }
        }
    };

Third option: through inline name. This addresses the shortcoming of the
previous solution.

    var math = {
        'fact': function myfact(x) {
            if (x !== 1) {
                return x * myfact(x - 1);
            } else {
                return 1;
            }
        }
    };

Last option: `callee` (going to go away in later versions of JS, use sparingly).

    var math = {
        'fact': function (x) {
            if (x !== 1) {
                return x * arguments.callee(x - 1);
            } else {
                return 1;
            }
        }
    };

### Auto-Memoizing Functions
Memoizing by using the object nature of functions:

    function getElements(name) {
        if (!getElements.cache) { getElements.cache = {}; }
        return getElements.cache[name] =
            getElements.cache[name] ||
            document.getElementsByTagName(name);
    };

You can easily guess how useful these techniques are in a library like
jQuery (actually, probably more in Sizzle, jQuery's DOM access library).

### Function Overloading
Functions have a `length` property, which corresponds to the number of
arguments declared in their signature. By comparing `fn.length` and
`arguments.length`, function overloading can be implemented in a cool way:

    function addMethod(object, name, fn) {
        var old = object[name];
        object[name] = function() {
            if (fn.length == arguments.length) {
                return fn.apply(this, arguments);
            } else if (typeof old === 'function') {
            return old.apply(this, arguments);
            }
        };
    };

    // Overloading then becomes a piece of cake. Pretty neat right?
    var obj = {};
    addMethod(obj, 'method', function() { /* do something */ });
    addMethod(obj, 'method', function(a) { /* do something with a */ });
    addMethod(obj, 'method', function(a, b) { /* do something with a and b */ });

## Closures
Closures are probably one of the most confusing concepts when someone with a
classical object-oriented background comes to JavaScript. Resig's definition of
it: **closures allow a function to access all the variables, as well as other
functions, that are in scope when the function itself is declared.**  
Later in the chapter: **That's what closures are all about. They create a
"safety bubble," if you will, of the function and the variables that are in
scope at the point of the function's declaration [...] This "bubble,"
containing the function and its variables, stays around as long as the function
itself does.**

Let's look at some code samples to go over the main use cases for closures.

### Private variables
    function Counter() {
        var count = 0; // visibility limited to Counter's inner scope
        this.increment = function() { count++; }
        this.getCount = function() { return count; }
    };
    // Can't view/modify count from here. You have to go through Counter.getCount()

### Callbacks and timers
TODO

### Binding function contexts
TODO

### Partially applying functions (Currying)
TODO

### Function wrapping
TODO

### Immediate functions
TODO

## Prototypes
TODO

## Timers
JavaScript is _single-threaded_. That's really important to understand. Once
you grasp the fact that the browser has no choice but to queue handlers when
events are firing at the same time, understanding why timers cannot be reliable
is easy.

Browser APIs are well known: `window.setTimeout` and `window.setInterval` to
create timers, `window.clearTimeout` and `window.clearInterval` to clear them.

Nifty trick for all browsers and IE > 9: timer functions can take arguments!
Like so: `window.setInterval(myfunction, 100, arg1, arg2)`

There's a difference between:

    # Executes `fn` every 10ms by calling setInterval once
    window.setInterval(fn, 10);

and:

    # Executes `fn` every 10ms by calling setTimeout over and over
    window.setTimeout(function fn() {
        window.setTimeout(fn, 10)
    }, 10);

Second version is guaranteed to run every 10ms or more.  
First version will try to execute every 10ms regardless of what happened before.

Cutting expensive computation into manageable chunks is an interesting
application of timers. Instead of doing a 100% of the work in a big chunk you
can choose to schedule manageable chunk via `setTimeout` thus enabling the
browser to do some work after each chunk finishes and before the next one
begins. Say a click event happens during a computation: the browser would get
a chance to execute the associated handler right after the current chunk is
done as opposed to waiting until the end of the whole computation.

Timers are also super useful to build asynchronous test suites and centralized
timers.  
The idea is to have a single timer handling a queue (of tests to run or of
animations/functions to execute) so that the browser is not overwhelmed by
multiple timers. This centralized timer technique guarantees order of
execution. That's a perk we don't get when we use multiple timers.

## With Statement
There is a whole chapter about JavaScript's `with` statement. I honestly don't
think it deserved a whole chapter in this book.

There are two pieces of information I got from it.  
First one is that `with` is going away in ES5 strict mode. It's considered
harmful mainly because you can read from and write to the global scope
inadvertently.  
Second thing is that Firebug (and probably other devtools too) uses `with` in a
beautiful fashion to create the web console's execution context ♥

    eval("with(__scope__.vars) {" +
        "with(__scope__.api) {" + 
            "with(__scope__.userVars) {" +
                "with(window) {" +
                    someUserCode +
                "}}}}");

## Cross Browser Strategies
Authoring cross-browser JavaScript is hard. Resig names 5 major concerns:

- Browser bugs
- Browser bug fixes
- Missing browser features
- External code
- Browser regressions

Some strategies/advices to deal with browser bugs/differences:

- encapsulate your code into its own closure/unit, expose it as little as possible
- degrade gracefully when features aren't available and/or bugs arise
- "Safe cross-browser fixes": no feature detection, no side effects. Example:
  ignoring negative width/height value: `if ((key == 'width' || key ==
  'height') && parseFloat(value) < 0) { value = undefined; }`. This makes the
  buggy browser's API comply with the standard. It's a Good Thing ®
- "Object detection": feature detection by inspecting a property/value of an
  object. Example: bind event with W3C's `addEventListener` vs Microsoft's
  `attachEvent`.
- "Feature simulation": create and execute a reduced test case to isolate the
  buggy behavior. That creates a toggle to work around the bug in our code.
  Very often that feature simulation is executed once at load time to minimize
  performance impact.

Interestingly enough Resig gives a list of "untestable" browser issues:

- Event handler bindings (no way to determine if a handler has been bound or not)
- Event firing (no way to check if an event has been or will fire)
- CSS property effects (does it affect appearance)
- Browser crashes (if a feature makes the browser crash, feature simulation will too)
- API performance (prohibitively expensive to test)
- AJAX issues (tricky and expensive to test)

## DOM Attributes and Properties
There is an incredible amount of quirks involved in getting/setting DOM
attributes and properties. Ways to get properties/attributes of DOM nodes:

- `elem.propertyName`
- `elem.getAttribute('attributeName')`
- `elem.getAttributeNode('attributeName').nodeValue` (recommanded way to get
  the unaltered value)

Note that attribute and property names aren't always the same. For instance
`class` is a valid attribute name but the associated property is `className`
The other ones are `for`, `readonly`, `maxlength`, `cellspacing`, `rowspan`,
`colspan`, `tabindex` which match respectively to the property names `htmlFor`,
`readOnly`, `maxLength`, `cellSpacing`, `rowSpan`, `colSpan`, `tabIndex`.)

Major quirks that Resig talks about:

- Form input's `id`/`name` attributes are transferred on the form DOM node as
  properties.  For instance if you have an input element with an `id`/`name`
  attribute set to `foo`, `myForm.foo` will yield a reference this input.  Now
  let's say you have an input with its `name`/`id` attribute set to `action`.
  See the problem? Form element's original `action` property will be lost :/
- `href`, `src` or `action` perform URL normalization (you get a full canonical
  URL when you might expect a relative URL)
- input `type` attribute can't be changed after DOM node is inserted (IE only)
- more problems around the `style` attribute: measuring width/height, getting
  color, opacity or pixel measures. One interesting API: `getComputedStyle` (or IE's `currentStyle`) gives you the active CSS
  property/value pairs for an element.

## Events
In a big chapter about DOM events and their quirks Resig basically goes through
the process of implementing jQuery's event system, including custom events.
While being extremely interesting I wish Resig was more upfront about what this
chapter is about. Another good title for it could be "Understanding jQuery's
events system".  
That being said I learned a lot about events while reading this chapter and it
crystallized several important concepts.

### Understanding Event Propagation
The order in which events are triggered throughout the DOM tree is not
consistent across browser.

Netscape implements event propagation "outside-in". An event propagates
from the root of the DOM tree all the way through its target (a button on which
you clicked for instance). This event propagation model is referred to as
**capturing**.

IE implements it in the exact opposite way: "inside-out". An event
propagates from the target element up to the DOM tree's root. This event
propagation model is referred to as **bubbling**

When the W3C had to choose, they didn't. Instead W3C's model lets you register
handlers for capturing or bubbling phase.  
Concretely, compliant browsers will do the following when an event is triggered:

1. start at DOM tree's root node. See if there are handlers set for **capturing phase** for our event type. If yes, call them.
2. go down one level in the tree, do the same (check and call potential handlers set for capturing)
3. go down one more level, do the same
4. ...etc... (do the same and go down until we reach our event's target)
5. on the event's target (i.e.,the button we clicked) check and call potential handlers set for capturing
6. on the event's target, see if there are handlers set for **bubbling phase** for out event type. If yes, call them.
7. go up one level in the tree, do the same (check and call potential handlers set for bubbling)
8. go up one more level, do the same
9. ...etc... (do the same and go up until we reach the DOM tree's root)
10. on DOM tree's root node, check and call potential handlers set for bubbling

The standard API `elem.addEventListener(type, handler, useCapture)` has 3
params. First one is the type of event to listen to ('click', 'focus', etc),
second is the handler we want to trigger when the type of event we're listening
to happens. The third parameter `useCapture` is the propagation phase we're interested in.

- if set to `false`, your handler will be called during the bubbling phase (step 6 through 10)
- if set to `true`, your handler will be called during the capturing phase (step 1 through 5)
- `useCapture` defaults to `false`

Another important thing to consider: browsers have hooks to stop event
propagation at any point. Inside a handler, `e.stopPropagation()` and
`e.cancelBubble = true;` (in IE) will do just that.

That was a lengthy explanation but I think it describes what happens fairly
accurately. I hope that it will help you understand a few things. Namely:

- `addEventListener('click', handler)` will have consistent behavior in IE and
  modern browsers out-of-the-box (remember, IE's model only supports bubbling
  phase). **That's why jQuery won't let you set register handlers for capturing
  phase**. Letting you doing do wouldn't be cross-browser compatible. jQuery
  supports bubbling in a cross browser fashion by emulating bubbling. In
  browsers that don't support it, the library manually walks the DOM tree up to
  call registered handlers. That's also how jQuery goes about supporting custom
  events (`someJqueryElem.bind('my-custom-event', handler)`).
- `document.addEventListener(type, handler)` is a catch-all that will run
  **after** every handler for this type in the path Root-Target has executed.
- `document.addEventListener(type, handler, true)` is a catch-all that will run
  **before** every handler for this type of event in the path Root-Target
  executes.
- use `stopPropagation` and `cancelBubble = true` with **extreme caution**.
  When you do that you're effectively preventing other handlers scheduled
  to run after you from doing so.
- when registering multiple handlers on the same element for the same event
  type, order **is not guaranteed**.

A good page to help you understand that if the explanation above didn't stick:
[Quirksmode On Events](http://www.quirksmode.org/js/events_order.html)

### jQuery's Event System
At its core, jQuery's event system doesn't rely much on the browser to work.
There are so many quirks that jQuery had to came up with a solution to
implement event binding, unbinding and triggering in a consistent manner. A few
key things:

- the only handler actually registered by jQuery is a dispatcher. There is one
  dispatcher per event type.
- to keep track of individual handlers, each DOM element is given a `data`
  property. Concretely it's a mapping of event type to an array of handler for
  that type.
- a dispatcher is responsible for looking at a DOM's data store and calling
  handlers if it finds handlers registered for its type (remember, there is one
  dispatcher per event type).
- thus registering/unregistering a handler becomes equivalent to "add/remove a
  function to a DOM's data store"

This is really clever because it enables inventory of handlers at any point in
time and programmatic triggering of registered handler.

If you're interested in the nitty-gritty details head to [jQuery's
source](https://github.com/jquery/jquery/blob/master/src/event.js)

### Concept Of Event Delegation
jQuery's `.delegate(type, selector, handler)` (or `.on(type, selector,
handler)` in later versions) can appear really magic if you don't understand
the basic concept of event delegation.

To put it in simple terms: event delegation is the process of registering a
handler high up in the DOM tree to handle events happening lower. Event
delegation is made possible by 2 things:

- event bubbling
- ability to inspect event object's `target` property in handlers

Concretely, instead of just doing some work, a delegated handler will **check
the target first** and **then** do some work:

    var doWork = function() { console.log('did some work'); }
    var button = document.findElementsByClassName('a-button')[0];

    // NON-DELEGATED version (the handler is bound directly)
    button.addEventListener('click', doWork, false); // use bubbling

    // DELEGATED version (we're checking the target first)
    document.addEventListener('click', function(e) {
        if (e.target.className === 'a-button') { // <== "Target check"
            doWork();
        }
    }, false); // use bubbling too

The delegated version above has several advantages:

- a button with class 'a-button' can be inserted in the DOM **after** we
  perform event binding. It's crucial if you're inserting content after an XHR
  request for instance
- multiple buttons with a class 'a-button' could be on the page, things will
  just work. This is awesome if you have behavior that you want to attach to a
  big number of elements. Say you want to have JS behavior for all cells of a
  HUGE table. Instead of looping through all the elements to bind a handler to
  each and every one of those cells you can use delegation to bind a single
  handler to a common container (the containing `<table>` element for instance)
- hey we're not bound to just buttons anymore! Every element on page that
  satisfies our target check gets to trigger `doWork` when clicked on.

Of course jQuery is more sophisticated and lets you delegate your handler on a
container by specifying a *jQuery selector*. Under the hoods jQuery will check
if the event target matches this jQuery selector. If it does, your handler will
be called. Not so magic right?

## DOM Manipulation
Is next up for reading.
