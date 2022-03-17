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
  shortUrl: String,
  longUrl: String,
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
app.post('/api/shorturl', async (req, res) => {
  const longUrl = req.body.url;
  console.log(req.body);
  let result = { error: 'invalid url' };
  // check if its a valid url
  if (validUrl.isWebUri(longUrl)) {
    // check if url already stored in mongo
    const url = await URL.findOne({ longUrl }).exec();
    //if so update result
    if (url) {
      result = {
        original_url: url.longUrl,
        short_url: url.shortUrl,
      };
    } else {
      // if url isn't in the database, create one
      const shortUrl = shortid.generate();
      URL.create(
        {
          shortUrl,
          longUrl,
        },
        (err, url) => {
          if (err) console.error(err);
          result = {
            original_url: url.longUrl,
            short_url: url.shortUrl,
          };
        }
      );
    }
  }

  res.json(result);
});

app.get('/api/shorturl/:shortUrl', async (req, res) => {
  const urlParam = req.params.shortUrl;
  // find short url in the database
  await URL.findOne({ shortUrl: urlParam }, (err, url) => {
    if (err) console.error(err);
    res.redirect(url.longUrl);
  });
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
