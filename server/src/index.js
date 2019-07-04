const app = require('./app');
const http = require('http');

var port = 7540;

http.createServer(app).listen(port, function(){ // https를 위해 7540 포트를 오픈함. 
  console.log("Https server listening on port " + port);
});

