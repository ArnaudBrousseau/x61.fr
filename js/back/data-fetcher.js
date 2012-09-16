/**
 * This guy is reponsible for fetching our data folder. 
 * Sorta DB interface? Mayyybe.
 */
var dataFetcher = {};
dataFetcher.folder = __dirname + '/../../data/';

// Marked is a markdown parser.
var marked = require('marked');
marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true
});

// Fs, required to open files with node.
var fs = require('fs');

/**
 * This function can fetch data for a single JSON file, or fetch a Markdown file,
 * or index an entire directory:
 * - dataFetcher.get("my-file", "json", cb) | Will return the dict contained in "my-file"
 * - dataFetcher.get("my-dir", "dir", cb) | will fetch all json file in "my-dir"
 */
dataFetcher.get = function(name, type, callback) {
  if (type === 'dir') {
    // We need to find all JSON files in this directory
    this.getAllJSON(this.folder + name + '/', callback);
    
  } else if (type === 'md') {
    // We need to fetch a file and render it
    this.getMarkdown(this.folder + name + '.' + type, callback);
    
  } else if (type === 'json') {
    // Eaaaaasy case
    this.getJSON(this.folder + name + '.' + type, callback);
  }
};

dataFetcher.getJSON = function(filename, callback) {
  fs.readFile(filename, 'utf-8', function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(data));
    }
  });
};

dataFetcher.getMarkdown = function(filename, callback) {
  fs.readFile(filename, 'utf-8', function(err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, marked(data));
    }
  });  
};

dataFetcher.getAllJSON = function(dirname, callback) {
  var jsonData = [];
  var fileList = fs.readdirSync(dirname);
  var numJsonFilesToProcess = 0;

  for (var i = 0; i < fileList.length; i++) {
    // Find all JSON files in this directory.
    if (fileList[i].match(/^[A-Za-z0-9_-]{1,}\.json/)) {
      numJsonFilesToProcess += 1;
      fs.readFile(dirname + fileList[i], 'utf-8', function(err, data) {
        if (err) {
          callback(err);
        } else {
          jsonData.push(JSON.parse(data));
          numJsonFilesToProcess -= 1;
          
          // Call our callback if we're done.
          if (numJsonFilesToProcess === 0) { 
            callback(null, jsonData);
          }
        }
      });
    }
  }
};

// And we're done.
module.exports = dataFetcher;