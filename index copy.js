#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./app');
// var app = require('../dist/app');
var debug = require('debug')('nodeservice:server');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');

/**
 * Create HTTP server.
 */
var HTTPsever = http.createServer(function (req,res) {
  if (res.redirect) {
    res.redirect('https://www.ushance.com/');
  }
  res.writeHead(301,{'Location':'https://www.ushance.com/'});
  res.end();
});

HTTPsever.listen(80);

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '443');
app.set('port', port);

/**
 * Create HTTPS server.
 */
var privateKey  = fs.readFileSync(path.resolve(__dirname,"./ssl/3704951_www.ushance.com.key"), 'utf8');
var certificate = fs.readFileSync(path.resolve(__dirname,"./ssl/3704951_www.ushance.com.crt"), 'utf8');
// var certificate = fs.readFileSync('/ssl/2883636_www.ushance.com.crt', 'utf8')should
var options = {
  key: privateKey,
  cert: certificate,
}
var server = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
