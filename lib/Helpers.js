var util = require('util');

/**
 * There's three config formats
 *
 * - list
 *
 * servers = [
 * {'name':'node1','host':'127.0.0.1','port':10000,'db':0},
 * {'name':'node2','host':'127.0.0.1','port':11000,'db':0},
 * {'name':'node3','host':'127.0.0.1','port':12000,'db':0},
 * ]
 *
 * - dict
 *
 * servers =
 * { 'node1': {'host':'127.0.0.1','port':10000,'db':0},
 *      'node2': {'host':'127.0.0.1','port':11000,'db':0},
 *      'node3': {'host':'127.0.0.1','port':12000,'db':0},
 * }
 *
 * - url_schema
 *
 * servers = ['redis://127.0.0.1:10000/0?name=node1',
 * 'redis://127.0.0.1:11000/0?name=node2',
 * 'redis://127.0.0.1:12000/0?name=node3'
 * ]
 * - list
 * @param settings
 *
 * TODO more test
 */


/**
 * I get this type check source from
 * http://stackoverflow.com/questions/8834126/how-to-efficiently-check-if-variable-is-array-or-object-in-nodejs-v8
 * @type {*}
 */
var type =  Function.prototype.call.bind(Object.prototype.toString);

exports.format_config = function (settings) {
  var configs = [];

  if (util.isArray(settings)) {
    var _type = type(settings[0]);
    if (_type === '[object Object]') {
      return settings;
    } else if (__type === '[object String]') {
      for(config in settings){
        config.push(parse_url(config));
      }
    } else{
      throw new Error("invalid server config");
    }
  } else if (type(settings) === '[object Object]') {
    for(config in settings){
      var conf = settings[config];
      configs.push({name:config, host:conf.host, port:conf.port, db:conf.db});
    }
  }
  return configs;
};

// url, querystring is best tool for parsing url & parameters with nodejs!
function parse_url(config){
  var conf = url.parse(config);
  var query = querystring.parse(conf);
  return {host:conf.hostname, port:conf.port, query:query}
}