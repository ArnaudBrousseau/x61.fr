/*
 * This is a script to update the app and relauch it.
 * No more SSHing to Amazon's EC2.
 */
var connect = require('connect'),
    exec = require('child_process').exec;

var executeCommand = function(command, res) {
  exec(command, function(error, stdout, stderr) {
    if (error !== null) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('exec error: ' + error);
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.body = stdout;
      if (stderr) {
        res.body += '\nstderr \n'
        res.body += '------\n'
        res.body += stderr;
      }
      res.end(res.body);
    }
  });
};
// start the server
var server = connect.createServer(
  connect.logger(":date -!- :remote-addr - :method :url :status -!- :user-agent"),

  // We don't want everyone to have deploy rights. Right?
  connect.basicAuth(function(user, pass, cb){
    exec('~/bin/auth.sh ' + user + ' ' + pass, function(error, stdout, stderr) {
      if (stdout === "Access granted\n") {
        cb(null, "x61");
      } else {
        cb("Wanna deploy? Try again.");
      }
    });
  }, "Please enter deploy credentials."),

  connect.router(function(app) {

    // That will output the status (list of scripts running on the server + git version)
    app.get('/', function(req, res, next) {
      executeCommand('~/bin/x61_status.sh', res)
    });

    // This is our deploy script hook.
    app.get('/deploy', function(req, res, next) {
      executeCommand('~/bin/x61_deploy.sh', res);
    });

  })
);

// We're good
console.log('deploy service is up and running!');

// Maybe we'll fail. Log that and keep on loopin'
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});

// Deploying shit is scary. Devil's port.
server.listen(666);