var request = require('request');
var https = require('https');

const logger = require('./logger.js');

const opts = {
  host: 'outlook.office365.com',
  port: 443,
  followAllRedirects: false,
  headers: {
    'User-Agent': 'Microsoft Office/16.0 (Windows NT 10.0; Microsoft Outlook 16.0.12026; Pro)',
    'Accept': 'application/json'
  }
}


module.exports = {
  checkDomain: function(domain, callback) {
    logger.trace('get: looking up: ' + domain);

    opts.path = '/autodiscover/autodiscover.json/v1.0/thistotallydoesntexistasdfweroaer@' + domain + '?Protocol=Autodiscoverv1';
    var body = '';
    const request = https.get(opts, (response) => {

      response.on('data', (data) => {
        body += data;
      });

      response.on('error', (error) => {
        logger.error('** get: error >> ' + error);
        return callback(error);
      });
      response.on('end', () => {
        var exists = false;
        if(body.indexOf('outlook.office365.com') !== -1) {
          exists = true;
        }
        callback(null, exists);
      });
    }).end();
  },
  checkEmail: function(email, callback) {
    logger.trace('get: looking up: ' + email);

    var body = '';
    const request = https.get(opts, (response) => {

      response.on('data', (data) => {
        body += data;
      });

      response.on('error', (error) => {
        logger.error('** get: error >> ' + error);
        return callback(error);
      });
      response.on('end', () => {
        var valid = false;
        if(response.statusCode === 200) {
          valid = true;
        } else if(response.statusCode === 302) {
          if(body.indexOf('outlook.office365.com') !== -1) {
            valid = true;
          }
        }
        callback(null, valid);
      });
    }).end();
  }
};