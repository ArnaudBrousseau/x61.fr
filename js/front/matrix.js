/**
 * Okay, here's a polyfill for requestAnimationFrame
 * See http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
      timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());


/***********************************
 * Here we go, matrix effect. Ready?
 ***********************************/

var matrix = {};

matrix.createAndAnimate = function(elem) {
  matrix.container = elem;

  matrix.screen = matrix.init();
  console.log("Taking the red pill...");
  matrix.animate();
};

/**
 * This initializes our matrix with 0s.
 * Returns a screen matrix.
 */
matrix.init = function() {
  var screenSize = matrix.countAvailableCharsOnScreen();
  matrix.numRows = screenSize.rows;
  matrix.numCols = screenSize.cols;

  // Allocate the matrix
  var screen = new Array(screenSize.rows);
  for (var i = 0; i < screenSize.rows; i++) {
    screen[i] = new Array(screenSize.cols);
    // Fill it with 0s
    for (var j = 0; j < screenSize.cols; j++) {
      screen[i][j] = matrix.randomChar();
    }
  }
  return screen;
};

/**
 * Just returns a random character.
 */
matrix.randomChar = function() {
  var charCode =  32 + Math.floor(Math.random() * (126 - 32));
  if (charCode === 97 || charCode === 65) {
    return '<b>&#' + charCode + ';</b>';
  }
  return '&#' + charCode + ';'
};

/*
 * This computes how many chars we have available on the screen
 */
matrix.countAvailableCharsOnScreen = function() {
  var maxWidth = window.innerWidth;
  var maxHeight = window.innerHeight;

  // Insert a char in our div and retrieve its dimension.
  // That shoud be enough to guess how many rows/cols we have
  matrix.container.innerHTML = '0';
  var numAvailableCols = Math.floor(maxWidth/matrix.container.offsetWidth);
  var numAvailableRows = Math.floor(maxHeight/matrix.container.offsetHeight);

  return {
    rows: numAvailableRows,
    cols: numAvailableCols
  };
};

/**
 * Uses the RequestAnimationFrame polyfill to animate the screen
 * (colums will be shifted a bit)
 */
matrix.animate = function() {
  window.requestAnimationFrame(matrix.animate);
  matrix.display();
  matrix.modifyColums();
  matrix.modifyColums();
  matrix.modifyColums();
};

/**
 * Shift columns a bit, to give that matrix effect
 */
matrix.modifyColums = function() {
  var shiftedCol = Math.floor(Math.random() * matrix.numCols);

  for (var i = matrix.numRows-1; i > 0; i--) {
    matrix.screen[i][shiftedCol] = matrix.screen[i-1][shiftedCol];
  }
  matrix.screen[0][shiftedCol] = matrix.randomChar();
};

/**
 * Simply display the content of the screen on the screen.
 * Straightforward, right?
 */
 matrix.display = function() {
   var stringToDisplay = '';
   for (var i = 0; i < matrix.screen.length; i++) {
     stringToDisplay += matrix.screen[i].join('') + ' ';
   }
   matrix.container.innerHTML = stringToDisplay;
 };

// Fire this whole thing once the page has loaded
window.addEventListener(
  'load',
  function() {
    matrix.createAndAnimate(
      document.getElementById("matrix")
    );
  },
  false
);
