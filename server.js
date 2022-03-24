require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/timestamp', function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get('/headerparser', function (req, res) {
  res.sendFile(__dirname + '/views/headerparser.html');
});

app.get('/urlshortener', function (req, res) {
  res.sendFile(__dirname + '/views/urlshortener.html');
});
app.get('/exercisetracker', function (req, res) {
  res.sendFile(__dirname + '/views/exercise.html');
});
app.get('/upload', function (req, res) {
  res.sendFile(__dirname + '/views/upload.html');
});

// API end points

// FILE METADATA MICROSERVICE
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const file = req.file;
  if (!file) return res.send('Please select a file to upload.');
  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
});

//EXERCISE TRACKER
const userControllers = require('./controllers/user.controllers');
app.get('/api/users', userControllers.getUsers);
app.get('/api/users/:_id/logs', userControllers.getLogs);
app.post('/api/users', userControllers.createUser);
app.post('/api/users/:_id/exercises', userControllers.addExercise);

// URL SHORTENER
const urlControllers = require('./controllers/url.controllers');

app.post('/api/shorturl', urlControllers.createShortUrl);
app.get('/api/shorturl/:shortUrl', urlControllers.redirectToUrl);

// REQUEST HEADER PARSER
app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.ip,
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  });
});

//TIMESTAMP MICROSERVICE
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
