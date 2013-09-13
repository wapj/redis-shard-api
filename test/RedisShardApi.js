/**
 * Created with JetBrains WebStorm.
 * User: andy
 * Date: 13. 9. 3.
 * Time: 오후 4:57
 * For F4Alien
 * Podotree. All rights reserved.
 */

var async = require('async');

var RedisShard = require('../lib/RedisShardApi');

var servers = [
   {'name':'node1','host':'127.0.0.1','port':6379,'db':0},
   {'name':'node2','host':'127.0.0.1','port':6380,'db':0},
   {'name':'node3','host':'127.0.0.1','port':6381,'db':0},
   {'name':'node4','host':'127.0.0.1','port':6382,'db':0}
];

var redis = new RedisShard(servers);

var cnt = [];
for(var n=0;n< 10; n ++){
  cnt.push(n);
}
var arr = [];

async.each(cnt, function(n, callback){
  redis.get("test" + n, function(err, result){
    console.log(result);
    arr.push(result);
    callback();
  });
}, function(err, results){
  arr.sort(function(a,b){return a-b});
  console.log(arr);
  console.log(arr.length);
  process.exit(0);
});




