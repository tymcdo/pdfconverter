'use strict';
const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const serverRender = require('node-http-server');

serverRender.deploy({
    port: process.env.PORTRender || 8080,
    contentType: {
      html: 'text/html',
      css: 'text/css',
      js: 'text/javascript',
      json: 'application/json',
      txt: 'text/plain',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      ico: 'image/x-icon',
      appcache: 'text/cache-manifest',
      hbs: 'text/x-handlebars-template'
    }
  },
  console.log('SERVER READY TO RENDER')
);
server.listen(port);