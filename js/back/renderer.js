/**
 * This is our site controller. Its responsabilities are:
 * - know where the data is for each page (labs, notes, home, etc)
 * - call the data fetcher
 * - render the (error) page
 */
var renderer = {};
renderer.data = {};
renderer.templatesFolder = __dirname + '/../../templates/';
renderer.dataFolder = __dirname + '/../../data/';

// Our data fetcher.
var dataFetcher = require('./data-fetcher.js');

// Fs, because we need to read files.
var fs = require('fs');

// A famous facial hair attribute. Also a templating kinda thing.
var mustache = require('mustache');

/**
 * Renders a basic page (e.g., home).
 * We have to:
 *  1. Fetch the page data
 *  2. Fetch the page content
 *  3. Display errors or page
 */
renderer.render = function(pageName, res) {  

  dataFetcher.get(pageName, 'json', function (err, data) {
    if (err) {
      renderer.endResponse(err);
    } else {
      renderer.addData(data);
      fs.readFile(renderer.templatesFolder + pageName + '.html', 'utf-8', function(err, file) {
        if (err) {
          renderer.endResponse(err);
        } else {
          renderer.pageContent = file;
          renderer.displayPage(res);
        }
      });
    }
  });
  
};

/**
 * Renders an index page (e.g., notes, labs).
 * We have to:
 *  1. Fetch the page data
 *  2. Fetch all the JSON files in the relavant directory
 *  3. Generate the content list
 *  3. Call the generic render method.
 */
renderer.renderIndex = function(indexName, res) {
  dataFetcher.get(indexName, 'dir', function (err, data) {
    if (err) {
      renderer.endResponse(err);
    } else {
      renderer.addData(data);
      fs.readFile(renderer.templatesFolder + '_content_item.html', 'utf-8', function(err, tmpl) {
        if (err) {
          renderer.endResponse(err);
        } else {
          // Builds the content index
          var contentList = "";

          // First, sort the data by content item id
          data.sort(function(a, b) {
            return b.id - a.id;
          });

          for (var i = 0; i < data.length; i++) {
            contentList += renderer._mustacholate(tmpl, data[i]) + "\n";
          }
          renderer.addData({contentList: contentList});
          renderer.render(indexName, res);
        }
      });
    }
  });
};

/**
 * Renders a note.
 * We have to:
 *  1. Fetch the note Markdown file
 *  2. Parse it and render the content
 *  3. Fetch JSON file for page info and render it.
 */
renderer.renderNote = function(slug, res) {
  dataFetcher.get('notes/' + slug, 'md', function (err, note) {
    if (err) {
      renderer.endResponse(err);
    } else {
      renderer.addData({note: note});
      dataFetcher.get('notes/' + slug, 'json', function(err, data) {
        if (err) {
          renderer.endResponse(err);
        } else {
          renderer.addData(data);
          renderer.render('note', res);
        }
      });
    }
  });
};

/**
 * This function fetches the header, footer and interpolates the result
 * with page data.
 */
renderer.displayPage = function(res) {
  var header = fs.readFileSync(renderer.templatesFolder + '_header.html', 'utf-8');
  var footer = fs.readFileSync(renderer.templatesFolder + '_footer.html', 'utf-8');
  var html = header + renderer.pageContent + footer;
  
  res.body = renderer._mustacholate(html, renderer.data);
  renderer.endResponse(null, res);
};

/**
 * Adds data to the global data dict used to render the page
 * Arg: a dict containing key/values
 * Careful: this will override existing values.
 */
renderer.addData = function(data) {
  for (key in data) {
    if (data.hasOwnProperty(key)) {
      renderer.data[key] = data[key];
    }
  }
};

/**
 * Responsability: interp*olate*s string and data using *Mustach*e
 * Please don't tell me you don't like the name. I'd be sad.
 */ 
renderer._mustacholate = function(string, data) {
  return mustache.render(string, data);
};


/**
 * Once we have our page content (HTML String or error), let's
 * build the headers and spit out the response.
 */
renderer.endResponse = function(error, res) {
  if (error) {
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.end("Whoopsy, error (" + error + "). Bad luck, something on x61.fr has gone awry. " + 
    "Please ping @arnaudbrousseau on Twitter if you're a good citizen.");
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(res.body);
  }
};

module.exports = renderer;
