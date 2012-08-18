// Marked is a markdown parser
var marked = require('marked'), 
    // Fs, to open files
    fs = require('fs');

var renderer = {};
renderer.render = function(slug, cb) {  
  marked.setOptions({
     gfm: true,
     pedantic: false,
     sanitize: true
   });
 
   fs.readFile(__dirname + '/notes/' + slug + '.md', 'utf-8', function(err,note) {
     if(err) {
       cb("404", null);
     } else {
       // Grab the metadata
       fs.readFile(__dirname + '/notes/' + slug + '.json', 'utf-8', function(err, metas) {
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
  fs.readFile(__dirname + '/templates/' + templateName, 'utf-8', function(err,template) {
    if (err) {
      cb(err, null);
    } else {
      var renderedTemplate = template.replace("{{note}}", marked(note));
      var metadata = JSON.parse(metas);
      for (var key in metadata) {
        if (metadata.hasOwnProperty(key)) {
          console.log(key);
          console.log(metadata[key]);
          renderedTemplate = renderedTemplate.replace("{{" + key + "}}", metadata[key]);
        }
      }
      cb(null, renderedTemplate);
    }
  });
};
module.exports = renderer;