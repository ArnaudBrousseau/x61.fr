// Custom renderer
var renderer = require('./renderer.js');

var routes = function (app) {
   // Routing. Routing. Routing.
   // Docs: http://senchalabs.github.com/connect/middleware-router.html

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

      // protect hidden files (.whatever)
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

      // control cross domain. Let's not allow anyone there for the moment
      var hostAddress = "*.0x61.fr",
         reqHost = req.headers.host;

      // disallow other domains than localhost and ar.no.de for Cross-domain
      if (reqHost && reqHost.indexOf(hostAddress) === -1 && reqHost.indexOf('localhost') === -1)
         res.end("Cross-domain is not allowed. Sorry.");

      //Let's grab the markdown file and render that
      var slug = req.params.slug;
      var notesDirectory = __dirname + '/../../notes/'

      renderer.render(slug, notesDirectory, function(err, renderedNote) {
        if (err === "404") {
          res.end("Woo, 404. Lucky you. Please ping @arnaudbrousseau on Twitter to claim your exclusive badge.");
        } else if (err === "500") {
          res.end("Noes, 500. Bad luck, something on 0x61.fr has gone awry. Please ping @arnaudbrousseau on Twitter if you're a good citizen.");
        } else {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(renderedNote);
        }
      });
  });
}

module.exports = routes