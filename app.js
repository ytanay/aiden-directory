var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var app = express();
var nodes = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  return res.send('Welcome to erans-directory, a component of ERANS, on ' + require('os').hostname())
})

app.get('/nodes', function(req, res){
  return res.send(`
    <pre>${JSON.stringify(nodes, null, 4)}</pre>
    <script>setTimeout(function(){location.reload()}, 500);</script>
  `);
})

app.post('/join', function(req, res){
  if(!req.body.port)
    throw 'Missing port'
  
  var address = '[' + req.ip + ']:' + req.body.port;
  console.log('Welcoming new node', address, req.body);

  res.json({
    self: address,
    nodes: nodes
  });
  
  nodes[address] = {
    
    key: req.body.publicKey
  };

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

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      error: true,
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: true,
    message: err.message,
    error: {}
  });
});

var PORT = process.env['PORT'] || 9000;
app.listen(PORT, function(){
  console.log('erans-directory: Bound succesfully to port', PORT);
})

module.exports = app;
