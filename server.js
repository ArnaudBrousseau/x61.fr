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
 
// make sure you install Connect (npm install connect)
// find the docs here: http://senchalabs.github.com/connect/
var connect = require('connect'),
   // Inspect tool, I use it all the time.
   inspect = require('util').inspect,
   // Marked is a markdown parser
   marked = require('marked'),
   // Fs, to open files
   fs = require('fs'), 
   // And my custom renderer
   renderer = require('./renderer.js');

var routes = function (app) {
   // your routes go here
   // you can use app.get, app.post, ...
   // the docs are here: http://senchalabs.github.com/connect/middleware-router.html

   // this must be the last route, it's an addition to the static provider
   app.get('/notes/:slug', function (req, res, next) {
      
      var reqPath = req.url; // connect populates this
       
      // use this header for html files, or add it as a meta tag
      // to save header bytes serve it only to IE
      // user agent is not always there
      var userAgent = req.headers['user-agent'];
      if (userAgent && userAgent.indexOf('MSIE') && 
         reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

      // control cross domain if you want
      // req.header.host will be the host of the incoming request
      var hostAddress = "ar.no.de",
         reqHost = req.headers.host;

      // disallow other domains than localhost and ar.no.de for Cross-domain
      if (reqHost && reqHost.indexOf(hostAddress) === -1 && reqHost.indexOf('localhost') === -1)
         res.end("Cross-domain is not allowed. Sorry.");

      //Let's grab the markdown file and render that
      var slug = req.params.slug;
      renderer.render(slug, function(err, renderedNote) {
        if (err === "404") {
          res.end("Woo, 404. Lucky you. Please ping @arnaudbrousseau on Twitter to claim your exclusive badge.");
        } else if (err === "500") {
          res.end("Noes, 500. Bad luck, something on ar.no.de has gone awry. Please ping @arnaudbrousseau on Twitter if you're a good citizen.");
        } else {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(renderedNote);
        }
      });
  });
}

// set you cache maximum age, in milisecconds.
// if you don't use cache break use a smaller value
var oneWeek = 1000 * 60 * 60 * 24 * 7;

// start the server
var server = connect.createServer(
   // good ol'apache like logging
   connect.logger(":date -!- :remote-addr - :method :url :status -!- :user-agent"),

   // call to trigger routes
   connect.router(routes),

  // serve static files
   connect.static(__dirname, {maxAge: oneWeek})
);

// bind the server to a port, choose your port:
server.listen(80); // 80 is the default web port and 443 for TLS

// Aaaand we're live :-)
console.log('AR.NO.DE is running!');

// this is a failsafe, it will catch the error silently and logged it the console
// while this works, you should really try to catch the errors with a try/catch block
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});

