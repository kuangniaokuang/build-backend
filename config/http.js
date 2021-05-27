/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    passportInit: require('passport').initialize(),
    passportSession: require('passport').session(),
    order: [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'logRoute',
      'poweredBy',
      'requireHttps',
      'router',
      'www',
      'passportInit',
      'passportSession',
      'favicon'
    ],

    requireHttps: function (req, res, next) {
      // if (process.env.NODE_ENV !== 'local' && !req.secure) {
      //   return res.redirect('https://' + req.get('host') + req.url);
      // } else if (process.env.NODE_ENV !== 'local' && req.headers['x-forwarded-proto'] !== undefined && req.headers['x-forwarded-proto'] == 'http') {
      //   return res.redirect('https://' + req.get('host') + req.url);
      // } else {
      return next()
      // }
    },

    logRoute: (function () {
      return function (req, res, next) {
        if (req.path.match(/favicon/) === null && req.method !== 'OPTIONS') {
          console.log('HTTP: ' + req.method + ' ' + req.path)
        }
        return next()
      }
    })()
  }
}
