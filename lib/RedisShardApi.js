/** 
 * referenced from https://github.com/LifeWanted/node-redis-shard 
 */ 
var assert = require('assert');

var redis = require('redis'),
  format_config = require('../lib/Helpers').format_config,
  HashRing = require('../lib/HashRing'),
  Pipeline = require('../lib/Pipeline'),
  async = require('async');

// Shardable commands have the exact same interface as their vanilla redis counterparts.
function RedisShardApi(settings){

  const SHARDABLE_COMMANDS = [
    "append",           "bitcount",         "blpop",            "brpop",
    "debug object",     "decr",             "decrby",           "del",
    "dump",             "exists",           "expire",           "expireat",
    "get",              "getbit",           "getrange",         "getset",
    "hdel",             "hexists",          "hget",             "hgetall",
    "hincrby",          "hincrbyfloat",     "hkeys",            "hlen",
    "hmget",            "hmset",            "hset",             "hsetnx",
    "hvals",            "incr",             "incrby",           "incrbyfloat",
    "lindex",           "linsert",          "llen",             "lpop",
    "lpush",            "lpushx",           "lrange",           "lrem",
    "lset",             "ltrim",            "mget",             "move",
    "persist",          "pexpire",          "pexpireat",        "psetex",
    "pttl",             "rename",           "renamenx",         "restore",
    "rpop",             "rpush",            "rpushx",           "sadd",
    "scard",            "sdiff",            "set",              "setbit",
    "setex",            "setnx",            "setrange",         "sinter",
    "sismember",        "smembers",         "sort",             "spop",
    "srandmember",      "srem",             "strlen",           "sunion",
    "ttl",              "type",             "watch",            "zadd",
    "zcard",            "zcount",           "zincrby",          "zrange",
    "zrangebyscore",    "zrank",            "zrem",             "zremrangebyrank",
    "zremrangebyscore", "zrevrange",        "zrevrangebyscore", "zrevrank",
    "zscore"
  ];

  const SPLIT_SHARDABLE_COMMANDS = [
    "auth",             "select"
  ];

  const UNSHARDABLE_COMMANDS = [
    "bgrewriteaof",     "bgsave",           "bitop",            "brpoplpush",
    "client kill",      "client list",      "client getname",   "client setname",
    "config get",       "config set",       "config resetstat", "dbsize",
    "debug segfault",   "discard",          "echo",             "eval",
    "evalsha",          "exec",             "flushall",         "flushdb",
    "info",             "keys",             "lastsave",         "migrate",
    "monitor",          "mset",             "msetnx",           "multi",
    "object",           "ping",             "psubscribe",       "publish",
    "punsubscribe",     "quit",             "randomkey",        "rpoplpush",
    "save",             "script exists",    "script flush",     "script kill",
    "script load",      "sdiffstore",       "shutdown",         "sinterstore",
    "slaveof",          "slowlog",          "smove",            "subscribe",
    "sunionstore",      "sync",             "time",             "unsubscribe",
    "unwatch",          "zinterstore",      "zunionstore"
  ];

  this.nodes = [];
  this.connections = {};
  var settings = format_config(settings);

  for (var n =0; n < settings.length; n++){
    var conf = settings[n];
    var name = conf.name;
    var conn = redis.createClient(conf.port, conf.host);

    if (this.connections[name])
      assert("server's name config must be unique");
    this.connections[name] = conn;
    this.nodes.push(name);
  }

  this.ring = new HashRing(this.nodes);

  function makeShardableMethod(command){
    return function(key){
      var client = this.getServer(key);
      return client[command].apply(client, arguments);
    }
  }

  function makeSplitShardableMethod(command){
    return function(){
      var i, conn;
      var args = Array.prototype.slice.call(arguments);
      var callback = args.pop();
      var calls = {};
      if (Array.isArray(args[0]) && Array.isArray( args[0][0]) ){
        for (i = 0; i < this.nodes.length; ++i ){
          conn = this.connections[this.nodes[i]];
          calls[ this.nodes[i] ] = conn[ command ].bind( conn, args[i] );
        }
      } else {
        for (i =0; i < this.nodes.length;i++){
          conn = this.connections[ this.nodes[i] ];
          calls[ this.nodes[i] ] = conn[ command ].bind( conn, args )
        }
      }
      async.parallel(calls, callback);
    };
  }

  function makeUnshadableMethod( command ){
    return function(){
      throw new Error( command + " is not a shardable command.");
    };
  }


  for (var i in SHARDABLE_COMMANDS){
    var command = SHARDABLE_COMMANDS[i];
    RedisShardProto[command] = makeShardableMethod(command);
  }

  for (var i in SPLIT_SHARDABLE_COMMANDS){
    var command = SPLIT_SHARDABLE_COMMANDS[i];
    RedisShardProto[command] = makeSplitShardableMethod(command);
  }

  for (var i in UNSHARDABLE_COMMANDS){
    var command = UNSHARDABLE_COMMANDS[i];
    RedisShardProto[command] = makeUnshadableMethod(command);
  }
  return this;
}
module.exports = RedisShardApi;
var _findhash = new RegExp(".*\\{(.*)\\}.*");
var RedisShardProto = RedisShardApi.prototype;


RedisShardProto.getServerName = function(key){
  var regexGroup = _findhash.exec(key);
  if(regexGroup && regexGroup[1]) key = regexGroup[1];
  return this.ring.getNode(key);
};


RedisShardProto.getServer = function(key){
  var name = this.getServerName(key);
  return this.connections[name];
};


RedisShardProto.getConnectionByName = function(name){
  return this.connections[name];
};

RedisShardProto.pipline = function(){
  return new Pipeline(this);
};
