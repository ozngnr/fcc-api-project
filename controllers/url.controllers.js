const validUrl = require('valid-url');
const shortid = require('shortid');
const URL = require('../models/url');

const createShortUrl = (req, res) => {
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
};

const redirectToUrl = (req, res) => {
  try {
    const shortUrl = req.params.shortUrl;
    // find short url in the database
    URL.findOne({ short_url: shortUrl }, (err, url) => {
      if (err) console.error(err);
      res.redirect(url.original_url);
    });
  } catch (error) {
    res.status(500).send('server error');
  }
};

module.exports = {
  createShortUrl,
  redirectToUrl,
};
