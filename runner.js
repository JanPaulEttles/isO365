const fs = require('fs');
const path = require('path');

const request = require('./request.js');
const logger = require('./logger.js');

const csv = require('fast-csv');
const yargs = require('yargs');
const async = require('async');

/*
 *  Parse the arguements
 */
const argv = yargs
  .usage('Iterate over a file of emails to determine whether is is a valid O365 address.\n\n')
  .version('version').alias('version', 'v')
  .help('help').alias('help', 'h')
  .options({
    input: {
      alias: 'i',
      description: "<filename> Input file name",
      requiresArg: true,
      required: true
    }
  }).argv;


fs.createReadStream(argv.input)
  .pipe(csv.parse())
  .on('error', error => logger.error(error))
  .on('data', row => process(row))
  .on('end', rowCount => logger.trace('done'));

function process(data) {

  async.waterfall([
      function(callback) {
        logger.trace('** process domain: ' + data[0]);

        var domain = data[0].split("@")[1];

        request.checkDomain(domain, function(err, precheck) {
          if(err) { logger.error('** request.get: error >> ' + err); return callback(err); }
          logger.trace(`precheck: ${precheck}`);
          callback(null, precheck);
        });
      },

      function(precheck, callback) {
        logger.trace('** process email: ' + data[0]);

        request.checkEmail(precheck, data[0], function(err, valid) {
          if(err) { logger.error('** request.get: error >> ' + err); return callback(err); }
          logger.trace(`valid: ${valid}`);
          callback(null, valid);
        });
      }

    ],
    function(err, result) {
      logger.info(`${result} :: ${data[0]}`);
    });
}