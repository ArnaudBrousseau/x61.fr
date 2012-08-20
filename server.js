// add some mime-types
var mime = require('mime');

// define early so that connect sees them
mime.define({
    'application/x-font-woff': ['woff'],
    'image/vnd.microsoft.icon': ['ico'],
    'image/webp': ['webp'],
    'text/cache-manifest': ['manifest'],
    'text/x-component': ['htc'],
    'application/x-chrome-extension': ['crx'],
    'image/svg+xml': ['svg', 'svgz']
});

var connect = require('connect'),
   // Inspect tool, I use it all the time.
   inspect = require('util').inspect,
   // Marked is a markdown parser
   marked = require('marked'),
   // Fs, to open files
   fs = require('fs'),
   // The site routes
   routes = require('./js/back/routes')

// set you cache maximum age, in milisecconds.
// if you don't use cache break use a smaller value
var oneDay = 1000 * 60 * 60 * 24;

// start the server
var server = connect.createServer(
   // good ol'apache like logging
   connect.logger(":date -!- :remote-addr - :method :url :status -!- :user-agent"),

   // call to trigger routes
   connect.router(routes),

  // serve static files
   connect.static(__dirname, {maxAge: oneDay})
);

// bind the server to a port, choose your port:
server.listen(80); // 80 is the default web port and 443 for TLS

// Aaaand we're live :-)
console.log('0x61.fr is up and running!');

// this is a failsafe, it will catch the error silently and logged it the console
// while this works, you should really try to catch the errors with a try/catch block
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});

