var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var nodes = {};

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  return res.sendFile(__dirname + '/views/index.html');
})

app.get('/nodes', function(req, res){
  return res.json(nodes);
})

app.post('/event/:name', function(req, res){
  io.emit(req.params.name, req.body);
  nodes[req.body.source][req.body.increment]++;
  return res.send();
});

app.post('/join', function(req, res){
  if(!req.body.port)
    throw 'Missing port'

  var address = '[' + req.body.ip + ']:' + req.body.port;
  console.log('Welcoming new node', address, req.body);

  res.json({
    self: address,
    nodes: nodes
  });

  var nodeState = {
    key: req.body.publicKey,
    requests: 0,
    carries: 0,
    errors: 0
  }

  nodes[address] = nodeState;

  io.emit('node join', {
    address: address,
    state: nodeState
  });

})

app.get('/list', function(req, res){
  return res.json({
    nodes: nodes
  })
});

app['delete']('/node/:address', function(req, res){
  console.log('Removing node', req.params.address)
  delete nodes[req.params.address]
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: true,
    message: err.message,
    error: err
  });
});

var PORT = process.env['PORT'] || 9000;
http.listen(PORT, function(){
  console.log('erans-directory: Bound succesfully to port', PORT);
})

module.exports = app;
