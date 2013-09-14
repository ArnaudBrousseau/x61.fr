## Who's This Book For?
"Secrets of the JavaScript Ninja" is designed for intermediate to advanced
JavaScript programmers. It expects you to have a firm understanding of
JavaScript and a working knowledge of HTML/CSS.  
The strength of this book lies in its ability to force you to
revisit concepts most JS programmers (including myself) always take for
granted. It puts the focus on functions as objects, function invoking, closures,
cross-browsers strategies, etc.

Resig sets the tone pretty early on. After a short introduction, in a chapter
titled "Arming With Testing And Debugging", he tells us about the importance of
testing and goes on to explain how we can create a very simple JS `assert`
method and its associated test runner. Usually those subjects are mentioned
briefly towards the end of a textbook. Not this time.

Reasons I'm writing about reading "Secrets of the JavaScript Ninja":

1. Writing about a something helps you remember it better
2. I'm adding some reference and extra information here and there.
3. Hopefully this is useful to you, the reader, to a) get a sense of what's in
   this book and/or b) get better at JavaScript!

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
The difference between

    function blah() { console.log('called'); }

and

    var blah = function() { console.log('called'); };
    sdfsd

In both cases, the function can be called via `blah()`. However, there's a
crucial difference: in the first case, the function is **named** `blah` which
means the function will be assigned a property `name` with the value `blah`.  
In the second case, we're assigning an **anonymous** function to the variable
`blah`. The function's `name` property in this case will be `''`.

### Arguments and Invocation
`this` and `arguments` are implicit parameters passed to every function. They
are just that. Parameters. The difference between `this`, `arguments` and
standard function parameters is that they are _implicit_. You won't see them in
 function signatures but they'll be available from within function bodies.

#### Arguments
`arguments` represent a list of all arguments passed to a function. It has
array-like accessors (`arguments[i]`) and `length` (`arguments.length`) but
**is not an array** (`arguments.slice(1)` will fail for instance).  
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

### Refencing Functions
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

One nifty trick for all browsers and IE > 9: timer functions actually take
arguments in their signature: `window.setInterval(myfunction, 100, arg1, arg2)`

There's a difference between `window.setInterval(fn, 10)` and
`window.setTimeout(function fn() { window.setTimeout(fn, 10)}, 10)`. Second
version is guaranteed to run every 10ms or more. First version will try to
execute every 10ms regardless of what happened before.

Cutting expensive computation into manageable chunks is an interesting
application of timers. Instead of doing a 100% of the work in a big chunk you
can choose to schedule manageable chunk via `setTimeout` thus enabling the
browser to do some work after each chunk finishes and before the next one
begins. Say a click event happened during a computation: the browser would get
a chance to execute the associated handler right after the current chunk is
done as opposed to waiting until  the end of the whole computation.

Timers are also super useful to build async test suites and centralized timers.
The idea is to have a single timer handle a queue (of tests to run of
animations/functions to execute) so that the browser is not overwhelmed by
multiple timers. This centralized timer technique also gives us a guarantee
about order of execution that we wouldn't get otherwise.
