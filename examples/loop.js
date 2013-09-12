var rsa = require('RedisShardAPI');
var async = require('async');

var servers = [
  {'name':'node1','host':'127.0.0.1','port':6379,'db':0},
  {'name':'node2','host':'127.0.0.1','port':6380,'db':0},
  {'name':'node3','host':'127.0.0.1','port':6381,'db':0},
  {'name':'node4','host':'127.0.0.1','port':6382,'db':0}
];

var redis = new rsa(servers);


//referenced from http://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range
function range(start, stop, step){
  if( typeof stop ==='undefined'){
    stop = start;
    start = 0;
  }
  var step = step || 1;

  if ((step > 0 && start>=stop) || (step<0 && staart <= stop)){
    return [];
  }
  var result = [];
  for(var i=start; (step > 0) ? i < stop: i > stop;i+=step){
    result.push(i);
  }
  return result;
}

var arr = range(100);


async.each(arr,
  function(x, callback){
    redis.set("test" + x, "1234" + x, callback);
  }, function(err){
    async.each(arr, function(y, callback){
        redis.get("test" +y, function(err, result){
          console.log(result);
          callback();
        });
      },
      function(err){
        console.log("done?!");
        process.exit(0);
      });
  }
);