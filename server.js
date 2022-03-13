// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/timestamp', function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get('/headerparser', function (req, res) {
  res.sendFile(__dirname + '/views/headerparser.html');
});

// API end points
app.get('/api/whoami', (req, res) => {
  console.log(req.headers);
  res.json({
    ip: req.ip,
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  });
});

app.get('/api/:date?', (req, res) => {
  let date;
  // set response to error by default
  let response = { error: 'Invalid Date' };
  let passedInValue = req.params.date;

  if (passedInValue) {
    if (isNaN(+passedInValue)) {
      date = new Date(passedInValue);
    } else {
      date = new Date(+passedInValue);
    }
  } else {
    date = new Date();
  }
  if (!isNaN(date)) {
    const unix = date.getTime();
    const utc = date.toUTCString();
    response = { unix, utc };
  }
  return res.json(response);
});

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
