// Custom renderer
var renderer = require('./renderer.js');
var exec = require('child_process').exec;

var routes = function (app) {

  // Routing. Routing. Routing.
  app.get('/', function(req, res, next) {
    prepareResponse(req, res);
    renderer.render('home', res);
  });
  app.get('/update', function(req, res, next) {
    exec('start && stop',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.error('stderr: ' + stderr);
        if (error !== null) {
          console.error('exec error: ' + error);
        }
    });
  });
  app.get('/notes', function(req, res, next) {
    prepareResponse(req, res);
    renderer.renderIndex('notes', res);
  });
  app.get('/labs', function(req, res, next) {
    prepareResponse(req, res);
    renderer.renderIndex('labs', res);
  });
  
  // This must be the last route, it's an addition to the static provider
  app.get('/notes/:slug', function (req, res, next) {
    prepareResponse(req, res);
    var slug = req.params.slug;
      
    // Render the note
    renderer.renderNote(slug, res);
  });
  
  /**
   * Check the basics (IE, cross-domain control and hidden file access).
   */
  var prepareResponse = function(req, res) {
    var reqPath = req.url; // connect populates this

    // IE my dear friend.
    var userAgent = req.headers['user-agent'];
    if (userAgent && userAgent.indexOf('MSIE') && 
       reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
       res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

    // protect hidden files (.whatever)
    if (reqPath.match(/(^|\/)\./))
       res.end("Not allowed");

    // control cross domain. Let's not allow anyone there for the moment
    var hostAddress = "0x61.fr",
       reqHost = req.headers.host;

    // disallow other domains than localhost and ar.no.de for Cross-domain
    if (reqHost && reqHost.indexOf(hostAddress) === -1 && reqHost.indexOf('localhost') === -1)
       res.end("Cross-domain is not allowed. Sorry.");
  };
  
}

module.exports = routes