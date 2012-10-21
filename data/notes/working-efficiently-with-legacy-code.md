This is my summary of the book "Working Effectively with Legacy Code" by
Michael C. Feathers.

Gist of the book
----------------
Legacy code is untested code.  
Bad code is untested code.  
Good code with no test is no good code.  
Write tests. Write code. Write more tests. Write more code. Write more tests.
Did you say TDD?

Yes, this book is about tests. It introduces some vocabulary to talk about tests, then actually talk about tests by looking at specific use cases. It specifically looks at legacy use cases, where putting a piece of code under test can lead to a lot of stress.

Introduction to new concepts
----------------------------
If you're new to TDD, and if you're never written tests before you probably
have some catchup to do on vocabulary. This book introduces those potentially
new concept pretty well.

### Test harness ###
A test harness is a piece of code written to exercice some piece of software.

### Sensing ###
Getting access to internals of a piece of software. Think about loop indexes
fot instance. Or internal state of an object. Things that you usually have to
print out in order to debug your program.

### Fake and mock objects ###
A fake object is an object to enable test harness. It basically exists in place
of a real object, for instance a DB connection.  
A mock object is a fake object containing assertions.

### Seams ###
A place where a program's behavior can be changed without editing it.  
For instance:
- preprocessing seam
- link seam
- object seam
Every seam has an enabling point (classpath, call to a method, etc).

### Pinch points ###
A pinch point is a point where tests can detect change in meny methods at the
same time.

### Characterization tests ###
Tests that describe the behavior of the piece of software in its harness.

Sprouts
---------
Sprouting refers to a technique aiming at extracting new behavior to a new
method ("sprout method") or class ("sprout class").

Wraps
-----
Wrapping a method ("Wrap method") or a class ("Wrap class") refers to the
process of encapsulation or decoration to add new behavior to legacy code.

In the case of the Wrap Method, the new behavior is implemented in a `new`
method, and the old function calls the new one, so that new behavior will be
called by `old(new())`.  
The Wrap Class is really similar: the new class inherits from the old one and
adds the new behavior required.

Dependency inversion principle
------------------------------
Code should depend on interface, not implementation.

How should you develop a new feature?
-------------------------------------
TDD + programming by difference (subclass and override behavior).  
Gotcha: "Liskov Substitution Principle" — avoid overiding concrete methods. The
ideal hierarchy is a hierarchy where no class overides one of its parents'
methods. You can achieve that via abstract classes and ingeritance from
interfaces instead.

I can't get this class into a test harness
------------------------------------------
Extract interface and subclass into a test. That's how you can get around
annoying params.

I can't run this method into a test harness
-------------------------------------------
First, ask yourself if you should run this method to begin with. You should
avoid testing private methods. Test public interfaces or make a private method
public if you really need to test it.  
Cheap solution to test a private methos: make it protected and subclass.

Command/Query separation principle
----------------------------------
A "query" method is a method that has no side effect and returns a value.  
A "command" method is a method that has side effect and returns no value.  

The "Command/Query separation principle" simply dictates that a method
shouldn't be a query and a command at the same time.

Finding test points
-------------------
Learning to reason about effects, draw effect stucture and find pinch points.
Make sure to incluse subclasses and other callers in the system to have a full
picture.

I don't know what tests to write
--------------------------------
If you're working with legacy code, write characterization tests:
- aim for piece of logic, don't hesitate to make use of sensing variables
- think about the responsabilities of your code and cber what can go wrong
- test extreme values of inputs
- try to look for and expose invariant

Misc
----
A "slow" test is a test that takes 0.1s to run or more.



