// Marked is a markdown parser
var marked = require('marked'), 
    // Fs, to open files
    fs = require('fs');
    mustache = require('mustache')

var renderer = {};
renderer.render = function(slug, dirname, cb) {  
  marked.setOptions({
     gfm: true,
     pedantic: false,
     sanitize: true
   });
 
   fs.readFile(dirname + slug + '.md', 'utf-8', function(err,note) {
     if(err) {
       cb("404", null);
     } else {
       // Grab the metadata
       fs.readFile(dirname + slug + '.json', 'utf-8', function(err, metas) {
          if (err) {
            cb("500", null);
          } else {
            renderer.renderTemplate('note.html', note, metas, function(err, renderedNote) {
              if (err) {
                cb("500", null);
              } else {
                cb(null, renderedNote);
              }
            });
          }
       });
       
     }
   });
};

renderer.renderTemplate = function(templateName, note, metas, cb) {
  fs.readFile(__dirname + '/../../templates/' + templateName, 'utf-8', function(err,template) {
    if (err) {
      cb(err, null);
    } else {
      var metadata = JSON.parse(metas);
      metadata['note'] = marked(note);
      var renderedTemplate = mustache.render(template, metadata)
      cb(null, renderedTemplate);
    }
  });
};
module.exports = renderer;