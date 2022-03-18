require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const app = express();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { Schema } = mongoose;
// url schema to create url objects for mongo database
const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

// Create a URL Constructor
const URL = mongoose.model('URL', urlSchema);

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

// API end points

// URL SHORTENER
app.post('/api/shorturl', (req, res) => {
  try {
    const requestedUrl = req.body.url;
    const shortUrl = shortid.generate();

    if (validUrl.isWebUri(requestedUrl)) {
      URL.create(
        { original_url: requestedUrl, short_url: shortUrl },
        (err, data) => {
          if (err) console.error(err);
          res.json({
            original_url: data.original_url,
            short_url: data.short_url,
          });
        }
      );
    } else {
      res.json({ error: 'invalid url' });
    }
  } catch (error) {
    res.status(500).send('server error');
  }
});

app.get('/api/shorturl/:shortUrl', async (req, res) => {
  try {
    const shortUrl = req.params.shortUrl;
    // find short url in the database
    await URL.findOne({ short_url: shortUrl }, (err, url) => {
      if (err) console.error(err);
      res.redirect(url.original_url);
    });
  } catch (error) {
    res.status(500).send('server error');
  }
});
// REQUEST HEADER PARSER
app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.ip,
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  });
});

//TIMESTAMP MICROSERVICE
app.get('/api', (req, res) => {
  let date = new Date();
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString(),
  });
});

app.get('/api/:date', (req, res) => {
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
